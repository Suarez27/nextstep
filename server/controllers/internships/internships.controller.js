const { ok, created } = require("../../utils/http/responses");

function createInternshipsController({ internshipsService }) {
    return {
        create(req, res) {
            const result = internshipsService.create(req.user, req.body);
            return created(res, result);
        },

        list(_req, res) {
            const result = internshipsService.list();
            return ok(res, result);
        },
    };
}

module.exports = { createInternshipsController };