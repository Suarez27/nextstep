function createFollowupsRepository({ all, run, lastInsertId }) {
    return {
        create({ studentId, authorUserId, content, progress, createdAt }) {
            run(
                `INSERT INTO followups (student_id, author_user_id, content, progress, created_at)
         VALUES (:student_id, :author_user_id, :content, :progress, :created_at)`,
                {
                    ":student_id": studentId,
                    ":author_user_id": authorUserId,
                    ":content": content,
                    ":progress": progress,
                    ":created_at": createdAt,
                }
            );

            return lastInsertId();
        },

        listByStudentId(studentId) {
            return all(
                `SELECT f.id, f.content, f.progress, f.created_at, u.name AS author_name
         FROM followups f
         JOIN users u ON u.id = f.author_user_id
         WHERE f.student_id = :sid
         ORDER BY f.created_at DESC`,
                { ":sid": studentId }
            );
        },
    };
}

module.exports = { createFollowupsRepository };