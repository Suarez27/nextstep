function createCatalogsService({ catalogsRepository, nowIso }) {
    return {
        listActive() {
            return catalogsRepository.findAllActive();
        },

        getActiveItemsByKey(key) {
            const catalog = catalogsRepository.findActiveByKey(key);

            if (!catalog) {
                const err = new Error("Catalogo no encontrado");
                err.status = 404;
                err.code = "CATALOG_NOT_FOUND";
                throw err;
            }

            return catalogsRepository.findActiveItemsByKey(key);
        },

        getActiveWithItemsByKey(key) {
            const catalog = catalogsRepository.findActiveByKey(key);

            if (!catalog) {
                const err = new Error("Catalogo no encontrado");
                err.status = 404;
                err.code = "CATALOG_NOT_FOUND";
                throw err;
            }

            return {
                ...catalog,
                items: catalogsRepository.findActiveItemsByKey(key),
            };
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

            const result = catalogsRepository.listAdmin({
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
            const catalog = catalogsRepository.findById(id);

            if (!catalog) {
                const err = new Error("Catalogo no encontrado");
                err.status = 404;
                err.code = "CATALOG_NOT_FOUND";
                throw err;
            }

            return catalog;
        },

        create(payload) {
            const existing = catalogsRepository.findByKey(payload.key);
            if (existing) {
                const err = new Error("La clave del catalogo ya existe");
                err.status = 409;
                err.code = "CATALOG_KEY_ALREADY_EXISTS";
                throw err;
            }

            const id = catalogsRepository.create({
                payload,
                createdAt: nowIso(),
            });

            return catalogsRepository.findById(id);
        },

        update(id, payload) {
            const existing = catalogsRepository.findById(id);
            if (!existing) {
                const err = new Error("Catalogo no encontrado");
                err.status = 404;
                err.code = "CATALOG_NOT_FOUND";
                throw err;
            }

            const duplicate = catalogsRepository.findByKey(payload.key);
            if (duplicate && duplicate.id !== id) {
                const err = new Error("La clave del catalogo ya existe");
                err.status = 409;
                err.code = "CATALOG_KEY_ALREADY_EXISTS";
                throw err;
            }

            catalogsRepository.update({
                id,
                payload,
                updatedAt: nowIso(),
            });

            return catalogsRepository.findById(id);
        },

        remove(id) {
            const existing = catalogsRepository.findById(id);
            if (!existing) {
                const err = new Error("Catalogo no encontrado");
                err.status = 404;
                err.code = "CATALOG_NOT_FOUND";
                throw err;
            }

            catalogsRepository.delete(id);
            return { id };
        },
    };
}

module.exports = { createCatalogsService };
