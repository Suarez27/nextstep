function createFollowupsService({ followupsRepository, nowIso }) {
    return {
        create(authUser, payload) {
            return {
                id: followupsRepository.create({
                    studentId: payload.student_id,
                    authorUserId: authUser.id,
                    content: payload.content,
                    progress: payload.progress,
                    createdAt: nowIso(),
                }),
            };
        },

        list(studentId) {
            return followupsRepository.listByStudentId(studentId);
        },
    };
}

module.exports = { createFollowupsService };