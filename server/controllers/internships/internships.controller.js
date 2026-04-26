const { ok, created } = require("../../utils/http/responses");

function createInternshipsController({ internshipsService }) {
    return {
        create(req, res) {
            const result = internshipsService.create(req.user, req.body);
            return created(res, result);
        },

        updateOwned(req, res) {
            const result = internshipsService.updateOwned(req.user, Number(req.params.id), req.body);
            return ok(res, result);
        },

        deactivateOwned(req, res) {
            const result = internshipsService.deactivateOwned(req.user, Number(req.params.id));
            return ok(res, result);
        },

        list(req, res) {
            const result = internshipsService.list(req.user, req.query);
            return ok(res, result);
        },

        get(req, res) {
            const result = internshipsService.getByIdForUser(req.user, Number(req.params.id));
            return ok(res, result);
        },

        listAdmin(req, res) {
            const result = internshipsService.listAdmin(req.query);
            return ok(res, result.data, result.meta);
        },

        getAdmin(req, res) {
            const result = internshipsService.getById(Number(req.params.id));
            return ok(res, result);
        },

        createAdmin(req, res) {
            const result = internshipsService.createAdmin(req.body);
            return created(res, result);
        },

        updateAdmin(req, res) {
            const result = internshipsService.updateAdmin(Number(req.params.id), req.body);
            return ok(res, result);
        },

        deactivateAdmin(req, res) {
            const result = internshipsService.deactivateAdmin(Number(req.params.id));
            return ok(res, result);
        },
    };
}

module.exports = { createInternshipsController };
