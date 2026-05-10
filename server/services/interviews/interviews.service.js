function createError(message, status, code) {
    const err = new Error(message);
    err.status = status;
    err.code = code;
    return err;
}

function createInterviewsService({ interviewsRepository, applicationsService, nowIso }) {
    return {
        scheduleInterview(authUser, payload) {
            const application = applicationsService.applicationDetail(authUser, payload.application_id);
            
            if (authUser.role === "alumno") {
                throw createError("Los alumnos no pueden programar entrevistas", 403, "FORBIDDEN");
            }

            const createdAt = nowIso();
            const id = interviewsRepository.create({ payload, createdAt });

            try {
                applicationsService.updateStatus(authUser, payload.application_id, {
                    status: "a_entrevista",
                    notes: "Entrevista programada automáticamente",
                    internal_notes: application.internal_notes || ""
                });
            } catch (error) {
                console.error("Aviso: No se pudo actualizar el estado de la candidatura a a_entrevista", error.message);
            }

            return this.getInterviewById(authUser, id);
        },

        getInterviewById(authUser, id) {
            const interview = interviewsRepository.findById(id);
            if (!interview) {
                throw createError("Entrevista no encontrada", 404, "NOT_FOUND");
            }
            return interview;
        },

        listAgenda(authUser) {
            return interviewsRepository.listByRole(authUser.role, authUser.id);
        },

        updateStatus(authUser, id, payload) {
            const interview = this.getInterviewById(authUser, id);
            
            const validStatuses = ['confirmada', 'realizada', 'cancelada', 'no_asistio'];
            if (!validStatuses.includes(payload.status)) {
                throw createError("Estado de entrevista no válido", 400, "INVALID_STATUS");
            }

            const updatedAt = nowIso();
            interviewsRepository.updateStatus({
                id,
                status: payload.status,
                updatedAt
            });

            return this.getInterviewById(authUser, id);
        }
    };
}

module.exports = { createInterviewsService };