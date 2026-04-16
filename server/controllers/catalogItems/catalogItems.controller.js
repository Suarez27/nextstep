const { ok, created } = require("../../utils/http/responses");

function createCatalogItemsController({ catalogItemsService }) {
    return {
        listAdmin(req, res) {
            const result = catalogItemsService.listAdmin(req.query);
            return ok(res, result.data, result.meta);
        },

        getAdmin(req, res) {
            const result = catalogItemsService.getById(Number(req.params.id));
            return ok(res, result);
        },

        createAdmin(req, res) {
            const result = catalogItemsService.create(req.body);
            return created(res, result);
        },

        updateAdmin(req, res) {
            const result = catalogItemsService.update(Number(req.params.id), req.body);
            return ok(res, result);
        },

        deleteAdmin(req, res) {
            const result = catalogItemsService.remove(Number(req.params.id));
            return ok(res, result);
        },
    };
}

module.exports = { createCatalogItemsController };
