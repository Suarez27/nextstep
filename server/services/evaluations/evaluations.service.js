function createEvaluationsService({ evaluationsRepository, assignmentsService, nowIso }) {
    return {
        async createEvaluation(authUser, payload) {
            // Check if it already has an evaluation
            const existing = evaluationsRepository.findByAssignmentId(payload.assignment_id);
            if (existing) {
                throw new Error("Este expediente ya ha sido evaluado.");
            }

            const id = evaluationsRepository.create({
                payload,
                createdAt: nowIso(),
                authorUserId: authUser.id
            });

            // Update assignment status to 'finalizado'
            await assignmentsService.updateAssignmentStatus(payload.assignment_id, 'finalizado');

            return { id };
        },

        getEvaluation(assignmentId) {
            return evaluationsRepository.findByAssignmentId(assignmentId);
        }
    };
}

module.exports = { createEvaluationsService };
