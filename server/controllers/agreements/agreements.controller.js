const { ok, created } = require("../../utils/http/responses");

function createAgreementsController({ agreementsService }) {
    return {
        create(req, res) {
            const result = agreementsService.create(req.user, req.body);
            return created(res, result);
        },

        list(_req, res) {
            const result = agreementsService.list();
            return ok(res, result);
        },
    };
}

module.exports = { createAgreementsController };