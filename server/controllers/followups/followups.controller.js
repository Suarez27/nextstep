const { ok, created } = require("../../utils/http/responses");

function createFollowupsController({ followupsService }) {
    return {
        create(req, res) {
            const result = followupsService.create(req.user, req.body);
            return created(res, result);
        },

        list(req, res) {
            const result = followupsService.list(Number(req.params.studentId));
            return ok(res, result);
        },
    };
}

module.exports = { createFollowupsController };