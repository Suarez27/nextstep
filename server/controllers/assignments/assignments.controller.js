const { ok, created } = require("../../utils/http/responses");

function createAssignmentsController({ assignmentsService }) {
    return {
        async create(req, res, next) {
            try {
                const payload = req.body;
                const result = await assignmentsService.createAssignment({
                    payload,
                    user: req.user
                });
                return created(res, result);
            } catch (error) {
                next(error);
            }
        },

        async list(req, res, next) {
            try {
                const assignments = await assignmentsService.listAssignments(req.user);
                return ok(res, assignments);
            } catch (error) {
                next(error);
            }
        },

        async updateStatus(req, res, next) {
            try {
                const { id } = req.params;
                const { status } = req.body;
                const updated = await assignmentsService.updateAssignmentStatus(id, status);
                return ok(res, updated);
            } catch (error) {
                next(error);
            }
        }
    };
}

module.exports = { createAssignmentsController };
