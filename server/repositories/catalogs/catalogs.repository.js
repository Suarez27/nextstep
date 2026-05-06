function normalizeCatalog(row) {
    if (!row) return null;

    return {
        ...row,
        is_active: Boolean(row.is_active),
    };
}

function createCatalogsRepository({ get, all, run, lastInsertId }) {
    return {
        findAllActive() {
            const rows = all(
                `SELECT c.id, c.\`key\`, c.name, c.description, c.is_active, c.created_at, c.updated_at
                 FROM catalogs c
                 WHERE c.is_active = 1
                 ORDER BY c.name ASC, c.id ASC`
            );

            return rows.map(normalizeCatalog);
        },

        findActiveByKey(key) {
            const row = get(
                `SELECT c.id, c.\`key\`, c.name, c.description, c.is_active, c.created_at, c.updated_at
                 FROM catalogs c
                 WHERE c.\`key\` = :key
                   AND c.is_active = 1`,
                { ":key": key }
            );

            return normalizeCatalog(row);
        },

        findActiveItemsByKey(key) {
            const rows = all(
                `SELECT
                    ci.id,
                    ci.catalog_id,
                    ci.value,
                    ci.label,
                    ci.description,
                    ci.sort_order,
                    ci.meta_json,
                    ci.is_active,
                    ci.created_at,
                    ci.updated_at
                 FROM catalog_items ci
                 JOIN catalogs c ON c.id = ci.catalog_id
                 WHERE c.\`key\` = :key
                   AND c.is_active = 1
                   AND ci.is_active = 1
                 ORDER BY ci.sort_order ASC, ci.label ASC, ci.id ASC`,
                { ":key": key }
            );

            return rows.map((row) => ({
                ...row,
                is_active: Boolean(row.is_active),
            }));
        },

        listAdmin({ page, perPage, sortField, sortOrder, filter }) {
            const where = [];
            const params = {};

            const q = String(filter.q || "").trim().toLowerCase();
            if (q) {
                where.push(`(
                    LOWER(c.\`key\`) LIKE :q
                    OR LOWER(c.name) LIKE :q
                    OR LOWER(COALESCE(c.description, '')) LIKE :q
                )`);
                params[":q"] = `%${q}%`;
            }

            if (typeof filter.is_active !== "undefined" && filter.is_active !== "") {
                const isActive = filter.is_active === true || filter.is_active === "true" || filter.is_active === 1 || filter.is_active === "1";
                where.push("c.is_active = :is_active");
                params[":is_active"] = isActive ? 1 : 0;
            }

            const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

            const sortMap = {
                id: "c.id",
                key: "c.`key`",
                name: "c.name",
                description: "c.description",
                is_active: "c.is_active",
                created_at: "c.created_at",
                updated_at: "c.updated_at",
            };

            const safeSortField = sortMap[sortField] || "c.id";
            const safeSortOrder = sortOrder === "DESC" ? "DESC" : "ASC";
            const offset = (page - 1) * perPage;

            const totalRow = get(
                `SELECT COUNT(*) AS total
                 FROM catalogs c
                 ${whereSql}`,
                params
            );

            const rows = all(
                `SELECT c.id, c.\`key\`, c.name, c.description, c.is_active, c.created_at, c.updated_at
                 FROM catalogs c
                 ${whereSql}
                 ORDER BY ${safeSortField} ${safeSortOrder}
                 LIMIT ${perPage} OFFSET ${offset}`,
                params
            );

            return {
                rows: rows.map(normalizeCatalog),
                total: totalRow?.total || 0,
            };
        },

        findById(id) {
            const row = get(
                `SELECT c.id, c.\`key\`, c.name, c.description, c.is_active, c.created_at, c.updated_at
                 FROM catalogs c
                 WHERE c.id = :id`,
                { ":id": id }
            );

            return normalizeCatalog(row);
        },

        findByKey(key) {
            return get("SELECT id FROM catalogos WHERE clave = :key", {
                ":key": key,
            });
        },

        create({ payload, createdAt }) {
            run(
                `INSERT INTO catalogos (clave, nombre, descripcion, activo, creado_en, actualizado_en)
                 VALUES (:key, :name, :description, :is_active, :created_at, :updated_at)`,
                {
                    ":key": payload.key,
                    ":name": payload.name,
                    ":description": payload.description,
                    ":is_active": payload.is_active,
                    ":created_at": createdAt,
                    ":updated_at": createdAt,
                }
            );

            return lastInsertId();
        },

        update({ id, payload, updatedAt }) {
            run(
                `UPDATE catalogos
                 SET clave = :key,
                     nombre = :name,
                     descripcion = :description,
                     activo = :is_active,
                     actualizado_en = :updated_at
                 WHERE id = :id`,
                {
                    ":id": id,
                    ":key": payload.key,
                    ":name": payload.name,
                    ":description": payload.description,
                    ":is_active": payload.is_active,
                    ":updated_at": updatedAt,
                }
            );
        },

        delete(id) {
            run("DELETE FROM catalogos WHERE id = :id", {
                ":id": id,
            });
        },
    };
}

module.exports = { createCatalogsRepository };
