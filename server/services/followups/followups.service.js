function createFollowupsService({ followupsRepository, nowIso }) {
    return {
        create(authUser, payload) {
            return {
                id: followupsRepository.create({
                    assignmentId: payload.assignment_id,
                    studentId: payload.student_id, // opcional
                    authorUserId: authUser.id,
                    content: payload.content,
                    progress: payload.progress,
                    createdAt: nowIso(),
                }),
            };
        },

        list(assignmentId) {
            return followupsRepository.listByAssignmentId(assignmentId);
        },
    };
}

module.exports = { createFollowupsService };