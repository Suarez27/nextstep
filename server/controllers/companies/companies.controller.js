const { ok, created } = require("../../utils/http/responses");

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

        listAdmin(req, res) {
            const result = companiesService.listAdmin(req.query);
            return ok(res, result.data, result.meta);
        },

        getAdmin(req, res) {
            const result = companiesService.getById(Number(req.params.id));
            return ok(res, result);
        },

        getPortalDetail(req, res) {
            const result = companiesService.getPortalDetail(Number(req.params.id));
            return ok(res, result);
        },

        createAdmin(req, res) {
            const result = companiesService.createAdmin(req.body);
            return created(res, result);
        },

        updateAdmin(req, res) {
            const result = companiesService.updateAdmin(Number(req.params.id), req.body);
            return ok(res, result);
        },

        deleteAdmin(req, res) {
            const result = companiesService.removeAdmin(Number(req.params.id));
            return ok(res, result);
        },
    };
}

module.exports = { createCompaniesController };
