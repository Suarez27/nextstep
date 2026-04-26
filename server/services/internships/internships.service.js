function parseListQuery(query) {
    const page = Number(query.page || 1);
    const perPage = Number(query.perPage || 10);
    const sortField = query.sortField || "created_at";
    const sortOrder = (query.sortOrder || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";

    let filter = {};
    try {
        filter = query.filter ? JSON.parse(query.filter) : {};
    } catch (_error) {
        filter = {};
    }

    return {
        page: page > 0 ? page : 1,
        perPage: perPage > 0 ? perPage : 10,
        sortField,
        sortOrder,
        filter: {
            ...query,
            ...filter,
        },
    };
}

function notFoundError() {
    const err = new Error("Practica no encontrada");
    err.status = 404;
    err.code = "INTERNSHIP_NOT_FOUND";
    return err;
}

function isVisibleAvailableInternship(internship) {
    return Boolean(internship?.is_active) &&
        internship.status === "publicada" &&
        Number(internship.available_slots || 0) > 0;
}

function isVisiblePublishedInternship(internship) {
    return Boolean(internship?.is_active) && internship.status === "publicada";
}

function createInternshipsService({ internshipsRepository, nowIso }) {
    function assertCompanyExists(companyId) {
        const company = internshipsRepository.companyExists(companyId);
        if (!company) {
            const err = new Error("Empresa no valida");
            err.status = 400;
            err.code = "COMPANY_NOT_FOUND";
            throw err;
        }
    }

    function assertAreaItemIsValid(areaItemId) {
        if (!areaItemId) return;

        const areaItem = internshipsRepository.areaItemBelongsToAreas(areaItemId);
        if (!areaItem) {
            const err = new Error("Area no valida");
            err.status = 400;
            err.code = "AREA_ITEM_NOT_VALID";
            throw err;
        }
    }

    function getCompanyForUser(authUser) {
        const company = internshipsRepository.findCompanyByUserId(authUser.id);

        if (!company) {
            const err = new Error("Perfil de empresa incompleto");
            err.status = 400;
            err.code = "COMPANY_PROFILE_INCOMPLETE";
            throw err;
        }

        return company;
    }

    function assertOwnedByCompany(internship, companyId) {
        if (Number(internship.company_id) !== Number(companyId)) {
            const err = new Error("No puedes modificar esta practica");
            err.status = 403;
            err.code = "INTERNSHIP_NOT_OWNED";
            throw err;
        }
    }

    function assertSlotsCoverAccepted(existing, nextSlots) {
        const accepted = Number(existing.accepted_applications_count || 0);
        if (Number(nextSlots) >= accepted) return;

        const err = new Error("Las plazas no pueden ser menores que las candidaturas ya aceptadas");
        err.status = 409;
        err.code = "INTERNSHIP_SLOTS_BELOW_ACCEPTED";
        throw err;
    }

    return {
        create(authUser, payload) {
            const company = getCompanyForUser(authUser);
            assertAreaItemIsValid(payload.area_item_id);

            const id = internshipsRepository.createInternship({
                companyId: company.id,
                payload,
                createdAt: nowIso(),
            });

            return internshipsRepository.findById(id);
        },

        updateOwned(authUser, id, payload) {
            const company = getCompanyForUser(authUser);
            const existing = internshipsRepository.findById(id);

            if (!existing) throw notFoundError();

            assertOwnedByCompany(existing, company.id);
            assertAreaItemIsValid(payload.area_item_id);
            assertSlotsCoverAccepted(existing, payload.slots);

            internshipsRepository.updateInternship({
                id,
                companyId: company.id,
                payload,
                updatedAt: nowIso(),
            });

            return internshipsRepository.findById(id);
        },

        deactivateOwned(authUser, id) {
            const company = getCompanyForUser(authUser);
            const existing = internshipsRepository.findById(id);

            if (!existing) throw notFoundError();

            assertOwnedByCompany(existing, company.id);

            internshipsRepository.deactivateInternship({
                id,
                updatedAt: nowIso(),
            });

            return internshipsRepository.findById(id) || { id };
        },

        getById(id) {
            const internship = internshipsRepository.findById(id);
            if (!internship) throw notFoundError();
            return internship;
        },

        getByIdForUser(authUser, id) {
            const internship = internshipsRepository.findById(id);
            if (!internship) throw notFoundError();

            if (authUser.role === "empresa") {
                const company = getCompanyForUser(authUser);
                assertOwnedByCompany(internship, company.id);
                return internship;
            }

            if (authUser.role === "alumno" && !isVisibleAvailableInternship(internship)) {
                throw notFoundError();
            }

            if (authUser.role === "centro" && !isVisiblePublishedInternship(internship)) {
                throw notFoundError();
            }

            return internship;
        },

        list(authUser, query = {}) {
            const { filter, sortField, sortOrder } = parseListQuery(query);
            const scopedFilter = { ...filter };

            if (authUser.role === "empresa") {
                const company = getCompanyForUser(authUser);
                scopedFilter.company_id = company.id;
            }

            if (authUser.role === "alumno") {
                scopedFilter.available = true;
            }

            if (authUser.role === "centro") {
                scopedFilter.published = true;
                if (typeof scopedFilter.available === "undefined") {
                    scopedFilter.available = true;
                }
            }

            return internshipsRepository.listAll({ filter: scopedFilter, sortField, sortOrder });
        },

        listAdmin(query) {
            const { page, perPage, sortField, sortOrder, filter } = parseListQuery(query);
            const result = internshipsRepository.listAdmin({
                page,
                perPage,
                sortField,
                sortOrder,
                filter,
            });

            return {
                data: result.rows,
                meta: { total: result.total },
            };
        },

        createAdmin(payload) {
            assertCompanyExists(payload.company_id);
            assertAreaItemIsValid(payload.area_item_id);

            const id = internshipsRepository.createInternship({
                companyId: payload.company_id,
                payload,
                createdAt: nowIso(),
            });

            return internshipsRepository.findById(id);
        },

        updateAdmin(id, payload) {
            const existing = internshipsRepository.findById(id);
            if (!existing) throw notFoundError();

            assertCompanyExists(payload.company_id);
            assertAreaItemIsValid(payload.area_item_id);
            assertSlotsCoverAccepted(existing, payload.slots);

            internshipsRepository.updateInternship({
                id,
                companyId: payload.company_id,
                payload,
                updatedAt: nowIso(),
            });

            return internshipsRepository.findById(id);
        },

        deactivateAdmin(id) {
            const existing = internshipsRepository.findById(id);
            if (!existing) throw notFoundError();

            internshipsRepository.deactivateInternship({
                id,
                updatedAt: nowIso(),
            });

            return internshipsRepository.findById(id) || { id };
        },
    };
}

module.exports = { createInternshipsService };
