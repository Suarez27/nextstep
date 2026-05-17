const { ok, created, badRequest } = require("../../utils/http/responses");

function createEvaluationsController({ evaluationsService }) {
    return {
        async create(req, res) {
            try {
                const result = await evaluationsService.createEvaluation(req.user, req.body);
                return created(res, result);
            } catch (err) {
                return badRequest(res, err.message);
            }
        },

        listByAssignment(req, res) {
            const result = evaluationsService.getEvaluation(Number(req.params.id));
            return ok(res, result);
        }
    };
}

module.exports = { createEvaluationsController };
