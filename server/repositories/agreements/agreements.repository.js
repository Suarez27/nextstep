function createAgreementsRepository({ get, all, run, lastInsertId }) {
    return {
        findCenterByUserId(userId) {
            return get("SELECT id FROM centers WHERE user_id = :uid", { ":uid": userId });
        },

        create({ internshipId, studentId, centerId, notes, signedAt, createdAt }) {
            run(
                `INSERT INTO agreements (internship_id, student_id, center_id, signed_at, notes, created_at)
         VALUES (:internship_id, :student_id, :center_id, :signed_at, :notes, :created_at)`,
                {
                    ":internship_id": internshipId,
                    ":student_id": studentId,
                    ":center_id": centerId,
                    ":signed_at": signedAt,
                    ":notes": notes,
                    ":created_at": createdAt,
                }
            );

            return lastInsertId();
        },

        listAll() {
            return all(
                `SELECT ag.id, ag.signed_at, ag.notes, inr.title, u.name AS student_name, c.center_name
         FROM agreements ag
         JOIN internships inr ON inr.id = ag.internship_id
         JOIN students s ON s.id = ag.student_id
         JOIN users u ON u.id = s.user_id
         JOIN centers c ON c.id = ag.center_id
         ORDER BY ag.created_at DESC`
            );
        },
    };
}

module.exports = { createAgreementsRepository };