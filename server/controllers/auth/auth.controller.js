const { ok, created } = require("../../utils/http/responses");

function createAuthController({ authService, get }) {
    return {
        register(req, res) {
            const result = authService.register(req.body);
            return created(res, result);
        },

        login(req, res) {
            const result = authService.login(req.body);
            return ok(res, result);
        },

        me(req, res) {
            const result = authService.me(req.user.id, get);
            return ok(res, result);
        },
    };
}

module.exports = { createAuthController };