const { APPLICATION_STATUSES } = require("../../validators/applications/applications.schema");

const APPLICATION_CREATED_EVENT = "created";
const APPLICATION_STATUS_CHANGED_EVENT = "status_changed";

function createError(message, status, code) {
    const err = new Error(message);
    err.status = status;
    err.code = code;
    return err;
}

function normalizeBoolean(value) {
    return value === true || value === 1 || value === "1";
}

function hasAvailableSlots(internshipOrApplication) {
    return Number(internshipOrApplication?.available_slots || 0) > 0;
}

function sanitizeApplicationForRole(application, role) {
    if (!application || role === "empresa" || role === "admin") return application;

    const { internal_notes: _internalNotes, ...safeApplication } = application;
    return safeApplication;
}

function sanitizeApplicationsForRole(applications, role) {
    return applications.map((application) => sanitizeApplicationForRole(application, role));
}

function sanitizeEventsForRole(events, role) {
    if (role !== "alumno") return events;

    return events.map(({ notes: _notes, ...event }) => event);
}

function createApplicationsService({ applicationsRepository, nowIso }) {
    function getCompanyForUser(authUser) {
        const company = applicationsRepository.findCompanyByUserId(authUser.id);
        if (!company) {
            throw createError("Perfil de empresa incompleto", 400, "COMPANY_PROFILE_INCOMPLETE");
        }

        return company;
    }

    function getCenterForUser(authUser) {
        const center = applicationsRepository.findCenterByUserId(authUser.id);
        if (!center) {
            throw createError("Perfil de centro incompleto", 400, "CENTER_PROFILE_INCOMPLETE");
        }

        return center;
    }

    function assertCompanyOwnsApplication(authUser, application) {
        const company = getCompanyForUser(authUser);
        if (Number(company.id) !== Number(application.company_id)) {
            throw createError("No puedes gestionar esta candidatura", 403, "APPLICATION_NOT_OWNED");
        }

        return company;
    }

    function assertCanViewApplication(authUser, application) {
        if (!application) {
            throw createError("Candidatura no encontrada", 404, "APPLICATION_NOT_FOUND");
        }

        if (authUser.role === "admin") return;

        if (authUser.role === "alumno") {
            if (Number(application.student_user_id) === Number(authUser.id)) return;
            throw createError("No puedes ver esta candidatura", 403, "APPLICATION_FORBIDDEN");
        }

        if (authUser.role === "empresa") {
            assertCompanyOwnsApplication(authUser, application);
            return;
        }

        if (authUser.role === "centro") {
            const center = getCenterForUser(authUser);
            if (Number(center.id) === Number(application.center_id)) return;
            throw createError("No puedes ver candidaturas de otro centro", 403, "APPLICATION_CENTER_FORBIDDEN");
        }

        throw createError("Sin permisos", 403, "APPLICATION_FORBIDDEN");
    }

    function assertCanListInternshipApplications(authUser, internship) {
        if (!internship) {
            throw createError("Oferta no encontrada", 404, "INTERNSHIP_NOT_FOUND");
        }

        if (authUser.role === "admin" || authUser.role === "centro") return;

        if (authUser.role === "empresa") {
            const company = getCompanyForUser(authUser);
            if (Number(company.id) === Number(internship.company_id)) return;
            throw createError("No puedes revisar candidaturas de esta oferta", 403, "INTERNSHIP_NOT_OWNED");
        }

        throw createError("Sin permisos", 403, "APPLICATIONS_FORBIDDEN");
    }

    function assertValidStatus(status) {
        if (APPLICATION_STATUSES.includes(status)) return;
        throw createError("Estado de candidatura no valido", 400, "APPLICATION_STATUS_INVALID");
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

            const createdAt = nowIso();
            const id = applicationsRepository.createApplication({
                internshipId,
                studentId: student.id,
                createdAt,
            });

            applicationsRepository.createEvent({
                applicationId: id,
                eventType: APPLICATION_CREATED_EVENT,
                fromStatus: null,
                toStatus: "enviada",
                actorUserId: authUser.id,
                notes: null,
                createdAt,
            });

            return applicationsRepository.findApplicationDetailById(id) || { id, status: "enviada" };
        },

        myApplications(authUser) {
            const student = applicationsRepository.findStudentByUserId(authUser.id);
            if (!student) {
                throw createError("Solo cuentas de alumno tienen candidaturas", 403, "STUDENT_ONLY");
            }

            return sanitizeApplicationsForRole(
                applicationsRepository.listMyApplications(student.id),
                authUser.role
            );
        },

        companyApplications(authUser) {
            if (authUser.role === "admin") {
                return applicationsRepository.listAllApplications();
            }

            const company = getCompanyForUser(authUser);
            return applicationsRepository.listByCompanyId(company.id);
        },

        centerApplications(authUser) {
            if (authUser.role === "admin") {
                return applicationsRepository.listAllApplications();
            }

            const center = getCenterForUser(authUser);
            return sanitizeApplicationsForRole(
                applicationsRepository.listByCenterId(center.id),
                authUser.role
            );
        },

        internshipApplications(authUser, internshipId) {
            const internship = applicationsRepository.findInternshipById(internshipId);
            assertCanListInternshipApplications(authUser, internship);

            if (authUser.role === "centro") {
                const center = getCenterForUser(authUser);
                return sanitizeApplicationsForRole(
                    applicationsRepository.listByInternshipId(internshipId, { centerId: center.id }),
                    authUser.role
                );
            }

            return sanitizeApplicationsForRole(
                applicationsRepository.listByInternshipId(internshipId),
                authUser.role
            );
        },

        applicationDetail(authUser, applicationId) {
            const application = applicationsRepository.findApplicationDetailById(applicationId);
            assertCanViewApplication(authUser, application);

            return sanitizeApplicationForRole(application, authUser.role);
        },

        applicationEvents(authUser, applicationId) {
            const application = applicationsRepository.findApplicationDetailById(applicationId);
            assertCanViewApplication(authUser, application);

            return sanitizeEventsForRole(
                applicationsRepository.listEventsByApplicationId(applicationId),
                authUser.role
            );
        },

        updateStatus(authUser, applicationId, payload) {
            const nextStatus = payload.status;
            assertValidStatus(nextStatus);

            const application = applicationsRepository.findApplicationDetailById(applicationId);
            if (!application) {
                throw createError("Candidatura no encontrada", 404, "APPLICATION_NOT_FOUND");
            }

            assertCompanyOwnsApplication(authUser, application);

            if (nextStatus === "aceptada" && application.status !== "aceptada" && !hasAvailableSlots(application)) {
                throw createError("No quedan plazas disponibles para aceptar esta candidatura", 409, "INTERNSHIP_FULL");
            }

            const updatedAt = nowIso();
            applicationsRepository.updateStatus({
                applicationId,
                status: nextStatus,
                internalNotes: payload.internal_notes,
                updatedAt,
            });

            if (application.status !== nextStatus) {
                applicationsRepository.createEvent({
                    applicationId,
                    eventType: APPLICATION_STATUS_CHANGED_EVENT,
                    fromStatus: application.status,
                    toStatus: nextStatus,
                    actorUserId: authUser.id,
                    notes: payload.notes || null,
                    createdAt: updatedAt,
                });
            }

            return applicationsRepository.findApplicationDetailById(applicationId);
        },
    };
}

module.exports = { createApplicationsService };
