const { ok, created } = require("../../utils/http/responses");

function createInterviewsController({ interviewsService }) {
    return {
        schedule(req, res) {
            const result = interviewsService.scheduleInterview(req.user, req.body);
            return created(res, result);
        },

        agenda(req, res) {
            const result = interviewsService.listAgenda(req.user);
            return ok(res, result);
        },

        updateStatus(req, res) {
            const result = interviewsService.updateStatus(req.user, req.params.id, req.body);
            return ok(res, result);
        }
    };
}

module.exports = { createInterviewsController };