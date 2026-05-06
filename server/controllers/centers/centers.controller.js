const { ok } = require("../../utils/http/responses");

function createCentersController({ centersService }) {
    return {
        me(req, res) {
            const result = centersService.getMyCenter({
                userId: req.user.id,
                userName: req.user.name,
            });

            return ok(res, result);
        },

        updateMe(req, res) {
            const result = centersService.updateMyCenter({
                userId: req.user.id,
                userName: req.user.name,
                payload: req.body,
            });

            return ok(res, result);
        },

        listApproved(_req, res) {
            const result = centersService.listApproved();
            return ok(res, result);
        },

        listAdmin(req, res) {
            const result = centersService.listAdmin(req.query);
            return ok(res, result.data, result.meta);
        },

        getAdmin(req, res) {
            const result = centersService.getById(Number(req.params.id));
            return ok(res, result);
        },

        updateAdmin(req, res) {
            const result = centersService.updateAdmin(Number(req.params.id), req.body, req.user.id);
            return ok(res, result);
        },
    };
}

module.exports = { createCentersController };