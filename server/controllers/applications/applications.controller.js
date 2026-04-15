const { ok, created } = require("../../utils/http/responses");

function createApplicationsController({ applicationsService }) {
    return {
        apply(req, res) {
            const result = applicationsService.apply(req.user, Number(req.params.internshipId));
            return created(res, result);
        },

        my(req, res) {
            const result = applicationsService.myApplications(req.user);
            return ok(res, result);
        },

        byInternship(req, res) {
            const result = applicationsService.internshipApplications(Number(req.params.id));
            return ok(res, result);
        },

        updateStatus(req, res) {
            const result = applicationsService.updateStatus(Number(req.params.id), req.body.status);
            return ok(res, result);
        },
    };
}

module.exports = { createApplicationsController };