const { ok, created } = require("../../utils/http/responses");

function createCatalogsController({ catalogsService }) {
    return {
        listActive(_req, res) {
            const result = catalogsService.listActive();
            return ok(res, result);
        },

        getActiveItemsByKey(req, res) {
            const result = catalogsService.getActiveItemsByKey(req.params.key);
            return ok(res, result);
        },

        getActiveWithItemsByKey(req, res) {
            const result = catalogsService.getActiveWithItemsByKey(req.params.key);
            return ok(res, result);
        },

        listAdmin(req, res) {
            const result = catalogsService.listAdmin(req.query);
            return ok(res, result.data, result.meta);
        },

        getAdmin(req, res) {
            const result = catalogsService.getById(Number(req.params.id));
            return ok(res, result);
        },

        createAdmin(req, res) {
            const result = catalogsService.create(req.body);
            return created(res, result);
        },

        updateAdmin(req, res) {
            const result = catalogsService.update(Number(req.params.id), req.body);
            return ok(res, result);
        },

        deleteAdmin(req, res) {
            const result = catalogsService.remove(Number(req.params.id));
            return ok(res, result);
        },
    };
}

module.exports = { createCatalogsController };
