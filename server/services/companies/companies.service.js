const bcrypt = require("bcryptjs");

function createCompaniesService({ companiesRepository, nowIso }) {
    return {
        getMyCompany(userId) {
            const company = companiesRepository.findByUserId(userId);

            if (!company) {
                const err = new Error("Perfil de empresa no encontrado");
                err.status = 404;
                err.code = "COMPANY_PROFILE_NOT_FOUND";
                throw err;
            }

            return company;
        },

        updateMyCompany(userId, payload) {
            const existing = companiesRepository.findByUserId(userId);
            const timestamp = nowIso();

            if (!existing) {
                companiesRepository.createForUser({
                    userId,
                    companyName: payload.company_name,
                    sector: payload.sector,
                    city: payload.city,
                    description: payload.description,
                    contactEmail: payload.contact_email,
                    contactPhone: payload.contact_phone,
                    contactPerson: payload.contact_person,
                    isActive: true,
                    createdAt: timestamp,
                    updatedAt: timestamp,
                });
            } else {
                companiesRepository.updateByUserId({
                    userId,
                    companyName: payload.company_name,
                    sector: payload.sector,
                    city: payload.city,
                    description: payload.description,
                    contactEmail: payload.contact_email,
                    contactPhone: payload.contact_phone,
                    contactPerson: payload.contact_person,
                    updatedAt: timestamp,
                });
            }

            return companiesRepository.findByUserId(userId);
        },

        listAdmin(query) {
            const page = Number(query.page || 1);
            const perPage = Number(query.perPage || 10);
            const sortField = query.sortField || "id";
            const sortOrder = (query.sortOrder || "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC";

            let filter = {};
            try {
                filter = query.filter ? JSON.parse(query.filter) : {};
            } catch (_error) {
                filter = {};
            }

            const result = companiesRepository.listAdmin({
                page: page > 0 ? page : 1,
                perPage: perPage > 0 ? perPage : 10,
                sortField,
                sortOrder,
                filter,
            });

            return {
                data: result.rows,
                meta: { total: result.total },
            };
        },

        getById(id) {
            const company = companiesRepository.findById(id);

            if (!company) {
                const err = new Error("Empresa no encontrada");
                err.status = 404;
                err.code = "COMPANY_NOT_FOUND";
                throw err;
            }

            return company;
        },

        getPortalDetail(id) {
            const company = companiesRepository.findById(id);

            if (!company) {
                const err = new Error("Empresa no encontrada");
                err.status = 404;
                err.code = "COMPANY_NOT_FOUND";
                throw err;
            }

            const internships = companiesRepository.listInternshipsByCompanyId(id);

            return {
                ...company,
                internships,
            };
        },

        createAdmin(payload) {
            const shouldApprove = typeof payload.is_verified === "boolean" ? payload.is_verified : true;
            const note = String(payload.validation_note || "").trim();

            if (!shouldApprove && !note) {
                const err = new Error("Debes indicar un motivo al crear una empresa no verificada");
                err.status = 400;
                err.code = "VALIDATION_NOTE_REQUIRED";
                throw err;
            }

            const normalizedPayload = {
                ...payload,
                is_verified: shouldApprove,
                verification_status: shouldApprove ? "approved" : "rejected",
                verification_note: note || null,
                verified_by_user_id: null,
                verified_at: shouldApprove ? nowIso() : null,
            };

            const safeEmail = payload.email || `empresa_${Date.now()}@nextstep.local`;
            const emailExists = companiesRepository.findUserByEmail(safeEmail);
            if (emailExists) {
                const err = new Error("El email de acceso ya existe");
                err.status = 409;
                err.code = "COMPANY_USER_EMAIL_EXISTS";
                throw err;
            }

            const createdAt = nowIso();
            const userId = companiesRepository.createCompanyUser({
                name: payload.company_name,
                email: safeEmail,
                passwordHash: bcrypt.hashSync("Demo1234!", 10),
                createdAt,
            });

            if (!userId) {
                const err = new Error("No se pudo crear el usuario de empresa");
                err.status = 500;
                err.code = "COMPANY_USER_CREATE_FAILED";
                throw err;
            }

            const companyId = companiesRepository.createAdmin({
                userId,
                payload: normalizedPayload,
                createdAt,
            });

            return companiesRepository.findById(companyId);
        },

        updateAdmin(id, payload, actorUserId) {
            const existing = companiesRepository.findById(id);
            if (!existing) {
                const err = new Error("Empresa no encontrada");
                err.status = 404;
                err.code = "COMPANY_NOT_FOUND";
                throw err;
            }

            const previousStatus = existing.verification_status || (existing.is_verified ? "approved" : "pending");
            const shouldApprove = typeof payload.is_verified === "boolean" ? payload.is_verified : !!existing.is_verified;
            const note = String(payload.validation_note || "").trim();

            if (!shouldApprove && !note) {
                const err = new Error("Debes indicar un motivo al rechazar o desactivar una empresa");
                err.status = 400;
                err.code = "VALIDATION_NOTE_REQUIRED";
                throw err;
            }

            const nextStatus = shouldApprove ? "approved" : "rejected";
            const now = nowIso();

            const normalizedPayload = {
                ...payload,
                is_verified: shouldApprove,
                verification_status: nextStatus,
                verification_note: note || null,
                verified_by_user_id: actorUserId,
                verified_at: now,
            };

            if (payload.email) {
                const duplicateUser = companiesRepository.findUserByEmail(payload.email);
                if (duplicateUser && duplicateUser.id !== existing.user_id) {
                    const err = new Error("El email de acceso ya existe");
                    err.status = 409;
                    err.code = "COMPANY_USER_EMAIL_EXISTS";
                    throw err;
                }
            }

            companiesRepository.updateAdmin({
                id,
                payload: normalizedPayload,
                updatedAt: now,
            });

            if (previousStatus !== nextStatus || normalizedPayload.verification_note) {
                companiesRepository.createVerificationAudit({
                    entityId: id,
                    previousStatus,
                    newStatus: nextStatus,
                    note: normalizedPayload.verification_note,
                    validatedByUserId: actorUserId,
                    createdAt: now,
                });
            }

            companiesRepository.updateCompanyUser({
                userId: existing.user_id,
                name: payload.company_name,
                email: payload.email || existing.email,
            });

            return companiesRepository.findById(id);
        },

        removeAdmin(id) {
            const existing = companiesRepository.findById(id);
            if (!existing) {
                const err = new Error("Empresa no encontrada");
                err.status = 404;
                err.code = "COMPANY_NOT_FOUND";
                throw err;
            }

            companiesRepository.deleteAdmin(id);
            companiesRepository.deleteUser(existing.user_id);

            return { id };
        },
    };
}

module.exports = { createCompaniesService };
