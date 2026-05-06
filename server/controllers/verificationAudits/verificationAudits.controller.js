const { ok } = require("../../utils/http/responses");

function createVerificationAuditsController({ verificationAuditsService }) {
    return {
        listAdmin(req, res) {
            const result = verificationAuditsService.listAdmin(req.query);
            return ok(res, result.data, result.meta);
        },

        getAdmin(req, res) {
            const result = verificationAuditsService.getById(Number(req.params.id));
            return ok(res, result);
        },
    };
}

module.exports = { createVerificationAuditsController };
