function normalizeCatalogItem(row) {
    if (!row) return null;

    return {
        ...row,
        is_active: Boolean(row.is_active),
    };
}

function createCatalogItemsRepository({ get, all, run, lastInsertId }) {
    return {
        listAdmin({ page, perPage, sortField, sortOrder, filter, target, targetId }) {
            const where = [];
            const params = {};

            const q = String(filter.q || "").trim().toLowerCase();
            if (q) {
                where.push(`(
                    LOWER(ci.value) LIKE :q
                    OR LOWER(ci.label) LIKE :q
                    OR LOWER(COALESCE(ci.description, '')) LIKE :q
                    OR LOWER(c.\`key\`) LIKE :q
                    OR LOWER(c.name) LIKE :q
                )`);
                params[":q"] = `%${q}%`;
            }

            const catalogId = target === "catalog_id" ? targetId : filter.catalog_id;
            if (catalogId) {
                where.push("ci.catalog_id = :catalog_id");
                params[":catalog_id"] = Number(catalogId);
            }

            const catalogKey = target === "catalog_key" ? targetId : filter.catalog_key;
            if (catalogKey) {
                where.push("c.`key` = :catalog_key");
                params[":catalog_key"] = catalogKey;
            }

            if (typeof filter.is_active !== "undefined" && filter.is_active !== "") {
                const isActive = filter.is_active === true || filter.is_active === "true" || filter.is_active === 1 || filter.is_active === "1";
                where.push("ci.is_active = :is_active");
                params[":is_active"] = isActive ? 1 : 0;
            }

            const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

            const sortMap = {
                id: "ci.id",
                catalog_id: "ci.catalog_id",
                catalog_name: "c.name",
                catalog_key: "c.`key`",
                value: "ci.value",
                label: "ci.label",
                description: "ci.description",
                sort_order: "ci.sort_order",
                is_active: "ci.is_active",
                created_at: "ci.created_at",
                updated_at: "ci.updated_at",
            };

            const safeSortField = sortMap[sortField] || "ci.sort_order";
            const safeSortOrder = sortOrder === "DESC" ? "DESC" : "ASC";
            const offset = (page - 1) * perPage;

            const totalRow = get(
                `SELECT COUNT(*) AS total
                 FROM catalog_items ci
                 JOIN catalogs c ON c.id = ci.catalog_id
                 ${whereSql}`,
                params
            );

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
                    ci.updated_at,
                    c.\`key\` AS catalog_key,
                    c.name AS catalog_name
                 FROM catalog_items ci
                 JOIN catalogs c ON c.id = ci.catalog_id
                 ${whereSql}
                 ORDER BY ${safeSortField} ${safeSortOrder}, ci.id ASC
                 LIMIT ${perPage} OFFSET ${offset}`,
                params
            );

            return {
                rows: rows.map(normalizeCatalogItem),
                total: totalRow?.total || 0,
            };
        },

        findById(id) {
            const row = get(
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
                    ci.updated_at,
                    c.\`key\` AS catalog_key,
                    c.name AS catalog_name
                 FROM catalog_items ci
                 JOIN catalogs c ON c.id = ci.catalog_id
                 WHERE ci.id = :id`,
                { ":id": id }
            );

            return normalizeCatalogItem(row);
        },

        catalogExists(catalogId) {
            return get("SELECT id FROM catalogos WHERE id = :id", {
                ":id": catalogId,
            });
        },

        findDuplicateValue({ catalogId, value, excludeId }) {
            const params = {
                ":catalog_id": catalogId,
                ":value": value,
            };

            let sql = "SELECT id FROM catalogo_items WHERE catalogo_id = :catalog_id AND valor = :value";

            if (excludeId) {
                sql += " AND id <> :exclude_id";
                params[":exclude_id"] = excludeId;
            }

            return get(sql, params);
        },

        create({ payload, createdAt }) {
            run(
                `INSERT INTO catalogo_items (catalogo_id, valor, etiqueta, descripcion, orden, meta_json, activo, creado_en, actualizado_en)
                 VALUES (:catalog_id, :value, :label, :description, :sort_order, :meta_json, :is_active, :created_at, :updated_at)`,
                {
                    ":catalog_id": payload.catalog_id,
                    ":value": payload.value,
                    ":label": payload.label,
                    ":description": payload.description,
                    ":sort_order": payload.sort_order,
                    ":meta_json": payload.meta_json,
                    ":is_active": payload.is_active,
                    ":created_at": createdAt,
                    ":updated_at": createdAt,
                }
            );

            return lastInsertId();
        },

        update({ id, payload, updatedAt }) {
            run(
                `UPDATE catalogo_items
                 SET catalogo_id = :catalog_id,
                     valor = :value,
                     etiqueta = :label,
                     descripcion = :description,
                     orden = :sort_order,
                     meta_json = :meta_json,
                     activo = :is_active,
                     actualizado_en = :updated_at
                 WHERE id = :id`,
                {
                    ":id": id,
                    ":catalog_id": payload.catalog_id,
                    ":value": payload.value,
                    ":label": payload.label,
                    ":description": payload.description,
                    ":sort_order": payload.sort_order,
                    ":meta_json": payload.meta_json,
                    ":is_active": payload.is_active,
                    ":updated_at": updatedAt,
                }
            );
        },

        delete(id) {
            run("DELETE FROM catalogo_items WHERE id = :id", {
                ":id": id,
            });
        },
    };
}

module.exports = { createCatalogItemsRepository };
