function createInterviewsRepository({ all, run, lastInsertId }) {
    return {
        create({ payload, createdAt }) {
            run(
                `INSERT INTO interviews (application_id, interview_at, notes, created_at)
         VALUES (:application_id, :interview_at, :notes, :created_at)`,
                {
                    ":application_id": payload.application_id,
                    ":interview_at": payload.interview_at,
                    ":notes": payload.notes,
                    ":created_at": createdAt,
                }
            );
            return lastInsertId();
        },

        listMy() {
            return all(
                `SELECT i.id, i.interview_at, i.notes, a.status, u.name AS student_name, inr.title
         FROM interviews i
         JOIN applications a ON a.id = i.application_id
         JOIN students s ON s.id = a.student_id
         JOIN users u ON u.id = s.user_id
         JOIN internships inr ON inr.id = a.internship_id
         ORDER BY i.interview_at ASC`
            );
        },
    };
}

module.exports = { createInterviewsRepository };