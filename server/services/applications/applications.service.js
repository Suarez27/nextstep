function createApplicationsService({ applicationsRepository, nowIso }) {
    return {
        apply(authUser, internshipId) {
            const student = applicationsRepository.findStudentByUserId(authUser.id);
            if (!student) {
                const err = new Error("Solo cuentas de alumno pueden postular");
                err.status = 403;
                err.code = "STUDENT_ONLY";
                throw err;
            }

            const internship = applicationsRepository.findInternshipById(internshipId);
            if (!internship) {
                const err = new Error("Oferta no encontrada");
                err.status = 404;
                err.code = "INTERNSHIP_NOT_FOUND";
                throw err;
            }

            const exists = applicationsRepository.findExistingApplication(internshipId, student.id);
            if (exists) {
                const err = new Error("Ya postulaste a esta oferta");
                err.status = 409;
                err.code = "APPLICATION_ALREADY_EXISTS";
                throw err;
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
                const err = new Error("Solo cuentas de alumno tienen candidaturas");
                err.status = 403;
                err.code = "STUDENT_ONLY";
                throw err;
            }

            return applicationsRepository.listMyApplications(student.id);
        },

        internshipApplications(internshipId) {
            return applicationsRepository.listByInternshipId(internshipId);
        },

        updateStatus(applicationId, status) {
            applicationsRepository.updateStatus(applicationId, status);
            return applicationsRepository.findStatusById(applicationId);
        },
    };
}

module.exports = { createApplicationsService };