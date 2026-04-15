function createInternshipsRepository({ get, all, run, lastInsertId }) {
    return {
        findCompanyByUserId(userId) {
            return get("SELECT id FROM companies WHERE user_id = :uid", {
                ":uid": userId,
            });
        },

        createInternship({ companyId, payload, createdAt }) {
            run(
                `INSERT INTO internships (company_id, title, description, hours_total, schedule, slots, created_at)
         VALUES (:company_id, :title, :description, :hours_total, :schedule, :slots, :created_at)`,
                {
                    ":company_id": companyId,
                    ":title": payload.title,
                    ":description": payload.description,
                    ":hours_total": payload.hours_total,
                    ":schedule": payload.schedule,
                    ":slots": payload.slots,
                    ":created_at": createdAt,
                }
            );

            return lastInsertId();
        },

        findById(id) {
            return get("SELECT * FROM internships WHERE id = :id", { ":id": id });
        },

        listAll() {
            return all(
                `SELECT i.*, c.company_name
         FROM internships i
         JOIN companies c ON c.id = i.company_id
         ORDER BY i.created_at DESC`
            );
        },
    };
}

module.exports = { createInternshipsRepository };