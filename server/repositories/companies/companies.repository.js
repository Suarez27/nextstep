function normalizeCompany(row) {
    if (!row) return null;

    return {
        ...row,
        is_active:
            row.is_active === true ||
            row.is_active === 1 ||
            row.is_active === "1",
    };
}

function createCompaniesRepository({ get, all, run, lastInsertId }) {
    return {
        findByUserId(userId) {
            const row = get(
                `SELECT
                    c.id,
                    c.user_id,
                    c.company_name,
                    c.sector,
                    c.city,
                    c.description,
                    c.contact_email,
                    c.contact_phone,
                    c.contact_person,
                    c.is_active,
                    c.created_at,
                    c.updated_at,
                    u.email
                 FROM companies c
                 LEFT JOIN users u ON u.id = c.user_id
                 WHERE c.user_id = :uid`,
                {
                    ":uid": userId,
                }
            );

            return normalizeCompany(row);
        },

        createForUser({
            userId,
            companyName,
            sector,
            city,
            description,
            contactEmail,
            contactPhone,
            contactPerson,
            isActive,
            createdAt,
            updatedAt,
        }) {
            run(
                `INSERT INTO empresas (
                    usuario_id,
                    nombre_empresa,
                    sector,
                    ciudad,
                    descripcion,
                    correo_contacto,
                    telefono_contacto,
                    persona_contacto,
                    activo,
                    creado_en,
                    actualizado_en
                )
                 VALUES (
                    :user_id,
                    :company_name,
                    :sector,
                    :city,
                    :description,
                    :contact_email,
                    :contact_phone,
                    :contact_person,
                    :is_active,
                    :created_at,
                    :updated_at
                )`,
                {
                    ":user_id": userId,
                    ":company_name": companyName,
                    ":sector": sector,
                    ":city": city,
                    ":description": description,
                    ":contact_email": contactEmail,
                    ":contact_phone": contactPhone,
                    ":contact_person": contactPerson,
                    ":is_active": isActive,
                    ":created_at": createdAt,
                    ":updated_at": updatedAt,
                }
            );
        },

        updateByUserId({
            userId,
            companyName,
            sector,
            city,
            description,
            contactEmail,
            contactPhone,
            contactPerson,
            updatedAt,
        }) {
            run(
                `UPDATE empresas
                 SET nombre_empresa = :company_name,
                     sector = :sector,
                     ciudad = :city,
                     descripcion = :description,
                     correo_contacto = :contact_email,
                     telefono_contacto = :contact_phone,
                     persona_contacto = :contact_person,
                     actualizado_en = :updated_at
                 WHERE usuario_id = :uid`,
                {
                    ":company_name": companyName,
                    ":sector": sector,
                    ":city": city,
                    ":description": description,
                    ":contact_email": contactEmail,
                    ":contact_phone": contactPhone,
                    ":contact_person": contactPerson,
                    ":updated_at": updatedAt,
                    ":uid": userId,
                }
            );
        },

        listAdmin({ page, perPage, sortField, sortOrder, filter }) {
            const where = [];
            const params = {};

            const q = String(filter.q || "").trim().toLowerCase();
            if (q) {
                where.push(`(
                    LOWER(c.company_name) LIKE :q
                    OR LOWER(COALESCE(c.sector, '')) LIKE :q
                    OR LOWER(COALESCE(c.city, '')) LIKE :q
                    OR LOWER(COALESCE(c.description, '')) LIKE :q
                    OR LOWER(COALESCE(c.contact_email, '')) LIKE :q
                    OR LOWER(COALESCE(c.contact_phone, '')) LIKE :q
                    OR LOWER(COALESCE(c.contact_person, '')) LIKE :q
                    OR LOWER(COALESCE(u.email, '')) LIKE :q
                )`);
                params[":q"] = `%${q}%`;
            }

            if (typeof filter.is_active !== "undefined" && filter.is_active !== "") {
                const isActive =
                    filter.is_active === true ||
                    filter.is_active === "true" ||
                    filter.is_active === 1 ||
                    filter.is_active === "1";
                where.push("c.is_active = :is_active");
                params[":is_active"] = isActive ? 1 : 0;
            }

            const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
            const sortMap = {
                id: "c.id",
                company_name: "c.company_name",
                sector: "c.sector",
                city: "c.city",
                contact_email: "c.contact_email",
                contact_phone: "c.contact_phone",
                contact_person: "c.contact_person",
                is_active: "c.is_active",
                created_at: "c.created_at",
                updated_at: "c.updated_at",
                email: "u.email",
            };
            const safeSortField = sortMap[sortField] || "c.id";
            const safeSortOrder = sortOrder === "DESC" ? "DESC" : "ASC";
            const offset = (page - 1) * perPage;

            const totalRow = get(
                `SELECT COUNT(*) AS total
                 FROM companies c
                 LEFT JOIN users u ON u.id = c.user_id
                 ${whereSql}`,
                params
            );

            const rows = all(
                `SELECT
                    c.id,
                    c.user_id,
                    c.company_name,
                    c.sector,
                    c.city,
                    c.description,
                    c.contact_email,
                    c.contact_phone,
                    c.contact_person,
                    c.is_active,
                    c.created_at,
                    c.updated_at,
                    u.email
                 FROM companies c
                 LEFT JOIN users u ON u.id = c.user_id
                 ${whereSql}
                 ORDER BY ${safeSortField} ${safeSortOrder}
                 LIMIT ${perPage} OFFSET ${offset}`,
                params
            );

            return {
                rows: rows.map(normalizeCompany),
                total: totalRow?.total || 0,
            };
        },

        findById(id) {
            const row = get(
                `SELECT
                    c.id,
                    c.user_id,
                    c.company_name,
                    c.sector,
                    c.city,
                    c.description,
                    c.contact_email,
                    c.contact_phone,
                    c.contact_person,
                    c.is_active,
                    c.created_at,
                    c.updated_at,
                    u.email
                 FROM companies c
                 LEFT JOIN users u ON u.id = c.user_id
                 WHERE c.id = :id`,
                { ":id": id }
            );

            return normalizeCompany(row);
        },

        listInternshipsByCompanyId(companyId) {
            return all(
                `SELECT
                    i.id,
                    i.company_id,
                    i.title,
                    i.description,
                    i.hours_total,
                    i.schedule,
                    i.slots,
                    i.created_at
                 FROM internships i
                 WHERE i.company_id = :company_id
                 ORDER BY i.created_at DESC, i.id DESC`,
                { ":company_id": companyId }
            );
        },

        findUserByEmail(email) {
            return get("SELECT id FROM users WHERE email = :email", {
                ":email": email.toLowerCase(),
            });
        },

        createCompanyUser({ name, email, passwordHash, createdAt }) {
            const safeEmail = email.toLowerCase();

            run(
                `INSERT INTO users (name, email, password_hash, role, created_at)
                 VALUES (:name, :email, :password_hash, 'empresa', :created_at)`,
                {
                    ":name": name,
                    ":email": safeEmail,
                    ":password_hash": passwordHash,
                    ":created_at": createdAt,
                }
            );

            const createdUser = get("SELECT id FROM users WHERE email = :email", {
                ":email": safeEmail,
            });

            return createdUser?.id || (lastInsertId ? lastInsertId() : null);
        },

        createAdmin({ userId, payload, createdAt }) {
            run(
                `INSERT INTO empresas (
                    usuario_id,
                    nombre_empresa,
                    sector,
                    ciudad,
                    descripcion,
                    correo_contacto,
                    telefono_contacto,
                    persona_contacto,
                    activo,
                    creado_en,
                    actualizado_en
                )
                 VALUES (
                    :user_id,
                    :company_name,
                    :sector,
                    :city,
                    :description,
                    :contact_email,
                    :contact_phone,
                    :contact_person,
                    :is_active,
                    :created_at,
                    :updated_at
                )`,
                {
                    ":user_id": userId,
                    ":company_name": payload.company_name,
                    ":sector": payload.sector,
                    ":city": payload.city,
                    ":description": payload.description,
                    ":contact_email": payload.contact_email,
                    ":contact_phone": payload.contact_phone,
                    ":contact_person": payload.contact_person,
                    ":is_active": payload.is_active,
                    ":created_at": createdAt,
                    ":updated_at": createdAt,
                }
            );

            const createdCompany = get("SELECT id FROM companies WHERE user_id = :user_id", {
                ":user_id": userId,
            });

            return createdCompany?.id || (lastInsertId ? lastInsertId() : null);
        },

        updateAdmin({ id, payload, updatedAt }) {
            run(
                `UPDATE empresas
                 SET nombre_empresa = :company_name,
                     sector = :sector,
                     ciudad = :city,
                     descripcion = :description,
                     correo_contacto = :contact_email,
                     telefono_contacto = :contact_phone,
                     persona_contacto = :contact_person,
                     activo = :is_active,
                     actualizado_en = :updated_at
                 WHERE id = :id`,
                {
                    ":id": id,
                    ":company_name": payload.company_name,
                    ":sector": payload.sector,
                    ":city": payload.city,
                    ":description": payload.description,
                    ":contact_email": payload.contact_email,
                    ":contact_phone": payload.contact_phone,
                    ":contact_person": payload.contact_person,
                    ":is_active": payload.is_active,
                    ":updated_at": updatedAt,
                }
            );
        },

        updateCompanyUser({ userId, name, email }) {
            run(
                `UPDATE users
                 SET name = :name,
                     email = :email
                 WHERE id = :user_id`,
                {
                    ":name": name,
                    ":email": email.toLowerCase(),
                    ":user_id": userId,
                }
            );
        },

        deleteAdmin(id) {
            run("DELETE FROM empresas WHERE id = :id", {
                ":id": id,
            });
        },

        deleteUser(userId) {
            run("DELETE FROM users WHERE id = :id", {
                ":id": userId,
            });
        },
    };
}

module.exports = { createCompaniesRepository };
