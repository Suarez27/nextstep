function createStudentsRepository({ get, all, run, lastInsertId }) {
    return {
        findProfileByUserId(userId) {
            return get(
                `SELECT s.id, s.center_id, s.cv_text, s.cv_pdf_url, s.skills, s.validated, u.name, u.email
         FROM students s
         JOIN users u ON u.id = s.user_id
         WHERE s.user_id = :uid`,
                { ":uid": userId }
            );
        },

        findStudentByUserId(userId) {
            return get(
                `SELECT id, user_id, center_id, cv_pdf_url, validated
         FROM students
         WHERE user_id = :uid`,
                { ":uid": userId }
            );
        },

        updateProfileByUserId({ userId, cvText, skills }) {
            run(
                `UPDATE students
         SET cv_text = :cv_text,
             skills = :skills,
             validated = 0
         WHERE user_id = :uid`,
                {
                    ":cv_text": cvText,
                    ":skills": skills,
                    ":uid": userId,
                }
            );
        },

        updateCvPdfByUserId({ userId, cvPdfUrl }) {
            run(
                `UPDATE students
         SET cv_pdf_url = :cv_pdf_url,
             validated = 0
         WHERE user_id = :uid`,
                {
                    ":cv_pdf_url": cvPdfUrl,
                    ":uid": userId,
                }
            );
        },

        findValidatedByCenterId(centerId) {
            return all(
                `SELECT s.id, s.center_id, s.cv_text, s.cv_pdf_url, s.skills, u.name, u.email
         FROM students s
         JOIN users u ON u.id = s.user_id
         WHERE s.validated = 1 AND s.center_id = :cid
         ORDER BY u.name ASC`,
                { ":cid": centerId }
            );
        },

        findValidatedAll() {
            return all(
                `SELECT s.id, s.center_id, s.cv_text, s.cv_pdf_url, s.skills, u.name, u.email, c.center_name
         FROM students s
         JOIN users u ON u.id = s.user_id
         LEFT JOIN centers c ON c.id = s.center_id
         WHERE s.validated = 1
         ORDER BY u.name ASC`
            );
        },

        findAllByCenterId(centerId) {
            return all(
                `SELECT s.id, s.center_id, s.cv_text, s.cv_pdf_url, s.skills, s.validated, u.name, u.email
         FROM students s
         JOIN users u ON u.id = s.user_id
         WHERE s.center_id = :cid
         ORDER BY s.validated ASC, u.name ASC`,
                { ":cid": centerId }
            );
        },

        findAllDetailed() {
            return all(
                `SELECT s.id, s.center_id, s.cv_text, s.cv_pdf_url, s.skills, s.validated, u.name, u.email, c.center_name
         FROM students s
         JOIN users u ON u.id = s.user_id
         LEFT JOIN centers c ON c.id = s.center_id
         ORDER BY s.validated ASC, u.name ASC`
            );
        },

        emailExists(email) {
            return get("SELECT id FROM users WHERE email = :email", {
                ":email": email.toLowerCase(),
            });
        },

        centerExists(centerId) {
            return get("SELECT id FROM centers WHERE id = :id", {
                ":id": centerId,
            });
        },

        createStudentUser({ name, email, passwordHash, createdAt }) {
            const safeEmail = email.toLowerCase();

            run(
                `INSERT INTO users (name, email, password_hash, role, created_at)
     VALUES (:name, :email, :password_hash, 'alumno', :created_at)`,
                {
                    ":name": name,
                    ":email": safeEmail,
                    ":password_hash": passwordHash,
                    ":created_at": createdAt,
                }
            );

            const createdUser = get(
                "SELECT id FROM users WHERE email = :email",
                { ":email": safeEmail }
            );

            return createdUser ? createdUser.id : null;
        },

        createStudentRecord({ userId, centerId, createdAt }) {
            run(
                `INSERT INTO students (user_id, center_id, cv_text, skills, validated, created_at)
         VALUES (:user_id, :center_id, '', '', 0, :created_at)`,
                {
                    ":user_id": userId,
                    ":center_id": centerId,
                    ":created_at": createdAt,
                }
            );
        },

        findCreatedSummaryByUserId(userId) {
            return get(
                `SELECT s.id, s.center_id, s.validated, u.name, u.email
         FROM students s
         JOIN users u ON u.id = s.user_id
         WHERE s.user_id = :uid`,
                { ":uid": userId }
            );
        },

        findStudentById(studentId) {
            return get(
                `SELECT id, user_id, center_id, validated
         FROM students
         WHERE id = :id`,
                { ":id": studentId }
            );
        },

        validateStudent(studentId) {
            run("UPDATE students SET validated = 1 WHERE id = :id", {
                ":id": studentId,
            });
        },

        findValidationResult(studentId) {
            return get(
                "SELECT id, validated FROM students WHERE id = :id",
                { ":id": studentId }
            );
        },

        updateUserPassword({ userId, passwordHash }) {
            run(
                "UPDATE users SET password_hash = :hash WHERE id = :uid",
                {
                    ":hash": passwordHash,
                    ":uid": userId,
                }
            );
        },
    };
}

module.exports = { createStudentsRepository };