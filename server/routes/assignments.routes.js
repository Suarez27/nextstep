const { Router } = require("express");
const { authRequired } = require("../middlewares/auth");

function createAssignmentsRoutes({ assignmentsController }) {
    const router = Router();
    router.use(authRequired);

    router.post("/", assignmentsController.create);
    router.get("/", assignmentsController.list);
    router.patch("/:id/status", assignmentsController.updateStatus);

    return router;
}

module.exports = { createAssignmentsRoutes };
