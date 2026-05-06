const { ok, created } = require("../../utils/http/responses");

function createInterviewsController({ interviewsService }) {
    return {
        create(req, res) {
            const result = interviewsService.create(req.body);
            return created(res, result);
        },

        my(_req, res) {
            const result = interviewsService.listMy();
            return ok(res, result);
        },
    };
}

module.exports = { createInterviewsController };