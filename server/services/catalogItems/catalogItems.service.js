function createCatalogItemsService({ catalogItemsRepository, nowIso }) {
    return {
        listAdmin(query) {
            const page = Number(query.page || 1);
            const perPage = Number(query.perPage || 10);
            const sortField = query.sortField || "sort_order";
            const sortOrder = (query.sortOrder || "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC";

            let filter = {};
            try {
                filter = query.filter ? JSON.parse(query.filter) : {};
            } catch (_error) {
                filter = {};
            }

            const result = catalogItemsRepository.listAdmin({
                page: page > 0 ? page : 1,
                perPage: perPage > 0 ? perPage : 10,
                sortField,
                sortOrder,
                filter,
                target: query.target,
                targetId: query.id,
            });

            return {
                data: result.rows,
                meta: { total: result.total },
            };
        },

        getById(id) {
            const item = catalogItemsRepository.findById(id);

            if (!item) {
                const err = new Error("Item de catalogo no encontrado");
                err.status = 404;
                err.code = "CATALOG_ITEM_NOT_FOUND";
                throw err;
            }

            return item;
        },

        create(payload) {
            const catalog = catalogItemsRepository.catalogExists(payload.catalog_id);
            if (!catalog) {
                const err = new Error("Catalogo no encontrado");
                err.status = 404;
                err.code = "CATALOG_NOT_FOUND";
                throw err;
            }

            const duplicate = catalogItemsRepository.findDuplicateValue({
                catalogId: payload.catalog_id,
                value: payload.value,
            });
            if (duplicate) {
                const err = new Error("El valor ya existe dentro de este catalogo");
                err.status = 409;
                err.code = "CATALOG_ITEM_VALUE_ALREADY_EXISTS";
                throw err;
            }

            const id = catalogItemsRepository.create({
                payload,
                createdAt: nowIso(),
            });

            return catalogItemsRepository.findById(id);
        },

        update(id, payload) {
            const existing = catalogItemsRepository.findById(id);
            if (!existing) {
                const err = new Error("Item de catalogo no encontrado");
                err.status = 404;
                err.code = "CATALOG_ITEM_NOT_FOUND";
                throw err;
            }

            const catalog = catalogItemsRepository.catalogExists(payload.catalog_id);
            if (!catalog) {
                const err = new Error("Catalogo no encontrado");
                err.status = 404;
                err.code = "CATALOG_NOT_FOUND";
                throw err;
            }

            const duplicate = catalogItemsRepository.findDuplicateValue({
                catalogId: payload.catalog_id,
                value: payload.value,
                excludeId: id,
            });
            if (duplicate) {
                const err = new Error("El valor ya existe dentro de este catalogo");
                err.status = 409;
                err.code = "CATALOG_ITEM_VALUE_ALREADY_EXISTS";
                throw err;
            }

            catalogItemsRepository.update({
                id,
                payload,
                updatedAt: nowIso(),
            });

            return catalogItemsRepository.findById(id);
        },

        remove(id) {
            const existing = catalogItemsRepository.findById(id);
            if (!existing) {
                const err = new Error("Item de catalogo no encontrado");
                err.status = 404;
                err.code = "CATALOG_ITEM_NOT_FOUND";
                throw err;
            }

            catalogItemsRepository.delete(id);
            return { id };
        },
    };
}

module.exports = { createCatalogItemsService };
