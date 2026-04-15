const { ok } = require("../../utils/http/responses");

function createCompaniesController({ companiesService }) {
    return {
        me(req, res) {
            const result = companiesService.getMyCompany(req.user.id);
            return ok(res, result);
        },

        updateMe(req, res) {
            const result = companiesService.updateMyCompany(req.user.id, req.body);
            return ok(res, result);
        },
    };
}

module.exports = { createCompaniesController };