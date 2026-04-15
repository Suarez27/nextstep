function createApplicationsRepository({ get, all, run, lastInsertId }) {
    return {
        findStudentByUserId(userId) {
            return get("SELECT id FROM students WHERE user_id = :uid", {
                ":uid": userId,
            });
        },

        findInternshipById(id) {
            return get("SELECT id FROM internships WHERE id = :id", {
                ":id": id,
            });
        },

        findExistingApplication(internshipId, studentId) {
            return get(
                "SELECT id FROM applications WHERE internship_id = :iid AND student_id = :sid",
                { ":iid": internshipId, ":sid": studentId }
            );
        },

        createApplication({ internshipId, studentId, createdAt }) {
            run(
                `INSERT INTO applications (internship_id, student_id, status, created_at)
         VALUES (:internship_id, :student_id, 'pendiente', :created_at)`,
                {
                    ":internship_id": internshipId,
                    ":student_id": studentId,
                    ":created_at": createdAt,
                }
            );

            return lastInsertId();
        },

        listMyApplications(studentId) {
            return all(
                `SELECT a.id, a.status, a.created_at, i.title, c.company_name
         FROM applications a
         JOIN internships i ON i.id = a.internship_id
         JOIN companies c ON c.id = i.company_id
         WHERE a.student_id = :sid
         ORDER BY a.created_at DESC`,
                { ":sid": studentId }
            );
        },

        listByInternshipId(internshipId) {
            return all(
                `SELECT a.id, a.status, a.created_at, s.id AS student_id, u.name AS student_name, u.email AS student_email
         FROM applications a
         JOIN students s ON s.id = a.student_id
         JOIN users u ON u.id = s.user_id
         WHERE a.internship_id = :iid
         ORDER BY a.created_at DESC`,
                { ":iid": internshipId }
            );
        },

        updateStatus(applicationId, status) {
            run("UPDATE applications SET status = :status WHERE id = :id", {
                ":status": status,
                ":id": applicationId,
            });
        },

        findStatusById(applicationId) {
            return get(
                "SELECT id, status FROM applications WHERE id = :id",
                { ":id": applicationId }
            );
        },
    };
}

module.exports = { createApplicationsRepository };