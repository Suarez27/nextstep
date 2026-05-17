function createAssignmentsService({ assignmentsRepository, applicationsService, nowIso }) {
    return {
        async createAssignment({ payload, user }) {
            const now = nowIso();
            const id = assignmentsRepository.create({
                payload,
                createdAt: now,
                createdBy: user.id
            });

            const candId = payload.candidatura_id || payload.application_id;
            if (candId) {
                // Sincronizar el ciclo de vida de la candidatura
                try {
                    applicationsService.updateStatus(user, candId, { status: "aceptada" });
                } catch (error) {
                    // Si ya estaba aceptada u otro error, se puede capturar aqui
                    console.error("Error al actualizar candidatura tras asignación:", error.message);
                }
            }

            return { id };
        },

        async listAssignments(user) {
            return assignmentsRepository.listByRole(user.role, user.id);
        },

        async updateAssignmentStatus(id, status) {
            const now = nowIso();
            return assignmentsRepository.updateStatus({
                id,
                status,
                updatedAt: now
            });
        }
    };
}

module.exports = { createAssignmentsService };
