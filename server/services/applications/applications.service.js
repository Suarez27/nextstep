function createError(message, status, code) {
    const err = new Error(message);
    err.status = status;
    err.code = code;
    return err;
}

function normalizeBoolean(value) {
    return value === true || value === 1 || value === "1";
}

function hasAvailableSlots(internship) {
    return Number(internship?.available_slots || 0) > 0;
}

function createApplicationsService({ applicationsRepository, nowIso }) {
    function assertManagerCanReview(authUser, internship) {
        if (!internship) {
            throw createError("Oferta no encontrada", 404, "INTERNSHIP_NOT_FOUND");
        }

        if (authUser.role !== "empresa") return;

        const company = applicationsRepository.findCompanyByUserId(authUser.id);
        if (!company || Number(company.id) !== Number(internship.company_id)) {
            throw createError("No puedes revisar candidaturas de esta oferta", 403, "INTERNSHIP_NOT_OWNED");
        }
    }

    return {
        apply(authUser, internshipId) {
            const student = applicationsRepository.findStudentByUserId(authUser.id);
            if (!student) {
                throw createError("Solo cuentas de alumno pueden postular", 403, "STUDENT_ONLY");
            }

            const internship = applicationsRepository.findInternshipById(internshipId);
            if (!internship) {
                throw createError("Oferta no encontrada", 404, "INTERNSHIP_NOT_FOUND");
            }

            if (!normalizeBoolean(internship.is_active) || internship.status !== "publicada") {
                throw createError("La oferta no esta disponible para candidaturas", 409, "INTERNSHIP_NOT_OPEN");
            }

            if (!hasAvailableSlots(internship)) {
                throw createError("La oferta no tiene plazas disponibles", 409, "INTERNSHIP_FULL");
            }

            const exists = applicationsRepository.findExistingApplication(internshipId, student.id);
            if (exists) {
                throw createError("Ya postulaste a esta oferta", 409, "APPLICATION_ALREADY_EXISTS");
            }

            const id = applicationsRepository.createApplication({
                internshipId,
                studentId: student.id,
                createdAt: nowIso(),
            });

            return { id, status: "pendiente" };
        },

        myApplications(authUser) {
            const student = applicationsRepository.findStudentByUserId(authUser.id);
            if (!student) {
                throw createError("Solo cuentas de alumno tienen candidaturas", 403, "STUDENT_ONLY");
            }

            return applicationsRepository.listMyApplications(student.id);
        },

        internshipApplications(authUser, internshipId) {
            const internship = applicationsRepository.findInternshipById(internshipId);
            assertManagerCanReview(authUser, internship);

            return applicationsRepository.listByInternshipId(internshipId);
        },

        updateStatus(authUser, applicationId, status) {
            const application = applicationsRepository.findApplicationById(applicationId);
            if (!application) {
                throw createError("Candidatura no encontrada", 404, "APPLICATION_NOT_FOUND");
            }

            assertManagerCanReview(authUser, {
                id: application.internship_id,
                company_id: application.company_id,
            });

            if (status === "aceptada" && application.status !== "aceptada" && !hasAvailableSlots(application)) {
                throw createError("No quedan plazas disponibles para aceptar esta candidatura", 409, "INTERNSHIP_FULL");
            }

            applicationsRepository.updateStatus(applicationId, status);
            return applicationsRepository.findStatusById(applicationId);
        },
    };
}

module.exports = { createApplicationsService };
