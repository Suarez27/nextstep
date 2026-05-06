function normalizeBoolean(value) {
    return value === true || value === 1 || value === "1";
}

function normalizeNumber(value) {
    if (value === null || typeof value === "undefined" || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : value;
}

function normalizeInternship(row) {
    if (!row) return null;

    return {
        ...row,
        company_id: normalizeNumber(row.company_id),
        area_item_id: normalizeNumber(row.area_item_id),
        hours_total: normalizeNumber(row.hours_total),
        slots: normalizeNumber(row.slots),
        accepted_applications_count: normalizeNumber(row.accepted_applications_count) || 0,
        available_slots: normalizeNumber(row.available_slots),
        company_is_active: normalizeBoolean(row.company_is_active),
        is_active: normalizeBoolean(row.is_active),
    };
}

function parseBoolean(value) {
    if (value === true || value === "true" || value === 1 || value === "1") return true;
    if (value === false || value === "false" || value === 0 || value === "0") return false;
    return null;
}

function hasFilterValue(value) {
    return value !== undefined && value !== null && value !== "";
}

function buildListQuery({ filter = {}, companyId } = {}) {
    const where = [];
    const params = {};
    const q = String(filter.q || filter.search || "").trim().toLowerCase();

    if (q) {
        where.push(`(
            LOWER(i.title) LIKE :q
            OR LOWER(COALESCE(i.description, '')) LIKE :q
            OR LOWER(COALESCE(i.company_name, '')) LIKE :q
        )`);
        params[":q"] = `%${q}%`;
    }

    if (hasFilterValue(companyId)) {
        where.push("i.company_id = :scope_company_id");
        params[":scope_company_id"] = Number(companyId);
    } else if (hasFilterValue(filter.company_id)) {
        where.push("i.company_id = :company_id");
        params[":company_id"] = Number(filter.company_id);
    }

    if (hasFilterValue(filter.status)) {
        where.push("i.status = :status");
        params[":status"] = filter.status;
    }

    if (hasFilterValue(filter.area_item_id)) {
        where.push("i.area_item_id = :area_item_id");
        params[":area_item_id"] = Number(filter.area_item_id);
    }

    const isActive = parseBoolean(filter.is_active);
    if (isActive !== null) {
        where.push("i.is_active = :is_active");
        params[":is_active"] = isActive ? 1 : 0;
    }

    if (parseBoolean(filter.published) === true) {
        where.push("i.status = 'publicada'");
        where.push("i.is_active = 1");
    }

    if (parseBoolean(filter.available) === true) {
        where.push("i.status = 'publicada'");
        where.push("i.is_active = 1");
        where.push("i.available_slots > 0");
    }

    return {
        whereSql: where.length ? `WHERE ${where.join(" AND ")}` : "",
        params,
    };
}

const SORT_MAP = {
    id: "i.id",
    company_id: "i.company_id",
    company_name: "i.company_name",
    area_item_id: "i.area_item_id",
    area_label: "i.area_label",
    title: "i.title",
    hours_total: "i.hours_total",
    schedule: "i.schedule",
    slots: "i.slots",
    accepted_applications_count: "i.accepted_applications_count",
    available_slots: "i.available_slots",
    status: "i.status",
    start_date: "i.start_date",
    end_date: "i.end_date",
    application_deadline: "i.application_deadline",
    is_active: "i.is_active",
    created_at: "i.created_at",
    updated_at: "i.updated_at",
};

function createInternshipsRepository({ get, all, run, lastInsertId }) {
    return {
        findCompanyByUserId(userId) {
            return get("SELECT id FROM companies WHERE user_id = :uid", {
                ":uid": userId,
            });
        },

        companyExists(companyId) {
            return get("SELECT id FROM companies WHERE id = :id", {
                ":id": companyId,
            });
        },

        areaItemBelongsToAreas(areaItemId) {
            if (!areaItemId) return true;

            return get(
                `SELECT ci.id
                 FROM catalog_items ci
                 JOIN catalogs c ON c.id = ci.catalog_id
                 WHERE ci.id = :id
                   AND c.\`key\` = 'areas'
                   AND c.is_active = 1
                   AND ci.is_active = 1`,
                { ":id": areaItemId }
            );
        },

        createInternship({ companyId, payload, createdAt }) {
            run(
                `INSERT INTO practicas (
                    empresa_id,
                    area_item_id,
                    titulo,
                    descripcion,
                    horas_totales,
                    horario,
                    plazas,
                    requisitos,
                    estado,
                    fecha_inicio_estimada,
                    fecha_fin_estimada,
                    fecha_limite_candidatura,
                    activo,
                    creado_en,
                    actualizado_en
                )
                 VALUES (
                    :company_id,
                    :area_item_id,
                    :title,
                    :description,
                    :hours_total,
                    :schedule,
                    :slots,
                    :requirements,
                    :status,
                    :start_date,
                    :end_date,
                    :application_deadline,
                    :is_active,
                    :created_at,
                    :updated_at
                )`,
                {
                    ":company_id": companyId,
                    ":area_item_id": payload.area_item_id,
                    ":title": payload.title,
                    ":description": payload.description,
                    ":hours_total": payload.hours_total,
                    ":schedule": payload.schedule,
                    ":slots": payload.slots,
                    ":requirements": payload.requirements,
                    ":status": payload.status,
                    ":start_date": payload.start_date,
                    ":end_date": payload.end_date,
                    ":application_deadline": payload.application_deadline,
                    ":is_active": payload.is_active ? 1 : 0,
                    ":created_at": createdAt,
                    ":updated_at": createdAt,
                }
            );

            return lastInsertId();
        },

        updateInternship({ id, companyId, payload, updatedAt }) {
            run(
                `UPDATE practicas
                 SET empresa_id = :company_id,
                     area_item_id = :area_item_id,
                     titulo = :title,
                     descripcion = :description,
                     horas_totales = :hours_total,
                     horario = :schedule,
                     plazas = :slots,
                     requisitos = :requirements,
                     estado = :status,
                     fecha_inicio_estimada = :start_date,
                     fecha_fin_estimada = :end_date,
                     fecha_limite_candidatura = :application_deadline,
                     activo = :is_active,
                     actualizado_en = :updated_at
                 WHERE id = :id`,
                {
                    ":id": id,
                    ":company_id": companyId,
                    ":area_item_id": payload.area_item_id,
                    ":title": payload.title,
                    ":description": payload.description,
                    ":hours_total": payload.hours_total,
                    ":schedule": payload.schedule,
                    ":slots": payload.slots,
                    ":requirements": payload.requirements,
                    ":status": payload.status,
                    ":start_date": payload.start_date,
                    ":end_date": payload.end_date,
                    ":application_deadline": payload.application_deadline,
                    ":is_active": payload.is_active ? 1 : 0,
                    ":updated_at": updatedAt,
                }
            );
        },

        deactivateInternship({ id, updatedAt }) {
            run(
                `UPDATE practicas
                 SET activo = 0,
                     estado = CASE
                        WHEN estado = 'publicada' THEN 'cerrada'
                        ELSE estado
                     END,
                     actualizado_en = :updated_at
                 WHERE id = :id`,
                {
                    ":id": id,
                    ":updated_at": updatedAt,
                }
            );
        },

        findById(id) {
            const row = get("SELECT * FROM internships WHERE id = :id", { ":id": id });
            return normalizeInternship(row);
        },

        listAll({ filter = {}, sortField = "created_at", sortOrder = "DESC" } = {}) {
            const { whereSql, params } = buildListQuery({ filter });
            const safeSortField = SORT_MAP[sortField] || "i.created_at";
            const safeSortOrder = sortOrder === "ASC" ? "ASC" : "DESC";

            const rows = all(
                `SELECT i.*
                 FROM internships i
                 ${whereSql}
                 ORDER BY ${safeSortField} ${safeSortOrder}, i.id DESC`,
                params
            );

            return rows.map(normalizeInternship);
        },

        listAdmin({ page, perPage, sortField, sortOrder, filter }) {
            const { whereSql, params } = buildListQuery({ filter });
            const safeSortField = SORT_MAP[sortField] || "i.id";
            const safeSortOrder = sortOrder === "DESC" ? "DESC" : "ASC";
            const offset = (page - 1) * perPage;

            const totalRow = get(
                `SELECT COUNT(*) AS total
                 FROM internships i
                 ${whereSql}`,
                params
            );

            const rows = all(
                `SELECT i.*
                 FROM internships i
                 ${whereSql}
                 ORDER BY ${safeSortField} ${safeSortOrder}, i.id ASC
                 LIMIT ${perPage} OFFSET ${offset}`,
                params
            );

            return {
                rows: rows.map(normalizeInternship),
                total: totalRow?.total || 0,
            };
        },
    };
}

module.exports = { createInternshipsRepository };
