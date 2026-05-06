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
    };
}

module.exports = { createCentersController };