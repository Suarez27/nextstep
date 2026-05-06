function createCentersRepository({ get, all, run }) {
    return {
        findByUserId(userId) {
            return get(
                "SELECT id, user_id, center_name, city, is_verified, created_at FROM centers WHERE user_id = :uid",
                { ":uid": userId }
            );
        },

        findById(id) {
            return get(
                `SELECT c.id, c.user_id, c.center_name, c.city, c.is_verified, c.created_at, u.email
                 FROM centers c
                 LEFT JOIN users u ON u.id = c.user_id
                 WHERE c.id = :id`,
                { ":id": id }
            );
        },

        createForUser({ userId, centerName, city, createdAt, isVerified = 0 }) {
            run(
                `INSERT INTO centers (user_id, center_name, city, is_verified, created_at)
         VALUES (:user_id, :center_name, :city, :is_verified, :created_at)`,
                {
                    ":user_id": userId,
                    ":center_name": centerName,
                    ":city": city,
                    ":is_verified": isVerified ? 1 : 0,
                    ":created_at": createdAt,
                }
            );
        },

        updateById({ id, centerName, city }) {
            run(
                `UPDATE centers
         SET center_name = :center_name,
             city = :city
         WHERE id = :id`,
                {
                    ":center_name": centerName,
                    ":city": city,
                    ":id": id,
                }
            );
        },

        listApproved() {
            return all(
                `SELECT id, center_name, city
                 FROM centers
                 WHERE is_verified = 1
                 ORDER BY center_name ASC, id ASC`
            );
        },

        listAdmin({ page, perPage, sortField, sortOrder, filter }) {
            const where = [];
            const params = {};

            const q = String(filter.q || "").trim().toLowerCase();
            if (q) {
                where.push(`(
                    LOWER(c.center_name) LIKE :q
                    OR LOWER(COALESCE(c.city, '')) LIKE :q
                    OR LOWER(COALESCE(u.email, '')) LIKE :q
                )`);
                params[":q"] = `%${q}%`;
            }

            if (typeof filter.is_verified !== "undefined" && filter.is_verified !== "") {
                const isVerified =
                    filter.is_verified === true
                    || filter.is_verified === "true"
                    || filter.is_verified === 1
                    || filter.is_verified === "1";
                where.push("c.is_verified = :is_verified");
                params[":is_verified"] = isVerified ? 1 : 0;
            }

            const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
            const sortMap = {
                id: "c.id",
                center_name: "c.center_name",
                city: "c.city",
                is_verified: "c.is_verified",
                created_at: "c.created_at",
                email: "u.email",
            };
            const safeSortField = sortMap[sortField] || "c.id";
            const safeSortOrder = sortOrder === "DESC" ? "DESC" : "ASC";
            const offset = (page - 1) * perPage;

            const totalRow = get(
                `SELECT COUNT(*) AS total
                 FROM centers c
                 LEFT JOIN users u ON u.id = c.user_id
                 ${whereSql}`,
                params
            );

            const rows = all(
                `SELECT
                    c.id,
                    c.user_id,
                    c.center_name,
                    c.city,
                    c.is_verified,
                    c.created_at,
                    u.email
                 FROM centers c
                 LEFT JOIN users u ON u.id = c.user_id
                 ${whereSql}
                 ORDER BY ${safeSortField} ${safeSortOrder}
                 LIMIT ${perPage} OFFSET ${offset}`,
                params
            );

            return {
                rows,
                total: totalRow?.total || 0,
            };
        },

        updateAdmin({ id, payload }) {
            run(
                `UPDATE centers
                 SET center_name = :center_name,
                     city = :city,
                     is_verified = :is_verified
                 WHERE id = :id`,
                {
                    ":id": id,
                    ":center_name": payload.center_name,
                    ":city": payload.city,
                    ":is_verified": payload.is_verified ? 1 : 0,
                }
            );
        },
    };
}

module.exports = { createCentersRepository };