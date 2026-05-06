function createVerificationAuditsRepository({ get, all }) {
    return {
        listAdmin({ page, perPage, sortField, sortOrder, filter }) {
            const where = [];
            const params = {};

            const q = String(filter.q || "").trim().toLowerCase();
            if (q) {
                where.push(`(
                    LOWER(COALESCE(v.entity_type, '')) LIKE :q
                    OR LOWER(COALESCE(v.previous_status, '')) LIKE :q
                    OR LOWER(COALESCE(v.new_status, '')) LIKE :q
                    OR LOWER(COALESCE(v.note, '')) LIKE :q
                    OR LOWER(COALESCE(u.email, '')) LIKE :q
                )`);
                params[":q"] = `%${q}%`;
            }

            if (filter.entity_type) {
                where.push("v.entity_type = :entity_type");
                params[":entity_type"] = String(filter.entity_type);
            }

            if (filter.new_status) {
                where.push("v.new_status = :new_status");
                params[":new_status"] = String(filter.new_status);
            }

            const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
            const sortMap = {
                id: "v.id",
                entity_type: "v.entity_type",
                entity_id: "v.entity_id",
                previous_status: "v.previous_status",
                new_status: "v.new_status",
                created_at: "v.created_at",
                validated_by_email: "u.email",
            };
            const safeSortField = sortMap[sortField] || "v.id";
            const safeSortOrder = sortOrder === "ASC" ? "ASC" : "DESC";
            const offset = (page - 1) * perPage;

            const totalRow = get(
                `SELECT COUNT(*) AS total
                 FROM verification_audits v
                 LEFT JOIN users u ON u.id = v.validated_by_user_id
                 ${whereSql}`,
                params
            );

            const rows = all(
                `SELECT
                    v.id,
                    v.entity_type,
                    v.entity_id,
                    v.previous_status,
                    v.new_status,
                    v.note,
                    v.validated_by_user_id,
                    u.email AS validated_by_email,
                    v.created_at
                 FROM verification_audits v
                 LEFT JOIN users u ON u.id = v.validated_by_user_id
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

        findById(id) {
            return get(
                `SELECT
                    v.id,
                    v.entity_type,
                    v.entity_id,
                    v.previous_status,
                    v.new_status,
                    v.note,
                    v.validated_by_user_id,
                    u.email AS validated_by_email,
                    v.created_at
                 FROM verification_audits v
                 LEFT JOIN users u ON u.id = v.validated_by_user_id
                 WHERE v.id = :id`,
                { ":id": id }
            );
        },
    };
}

module.exports = { createVerificationAuditsRepository };
