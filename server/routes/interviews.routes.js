const express = require("express");
const { authRequired, roleRequired } = require("../middlewares/auth");

function createInterviewsRoutes({ interviewsController }) {
    const router = express.Router();

    // POST /api/interviews: Para programar
    router.post(
        "/",
        authRequired,
        roleRequired("empresa", "centro", "admin"),
        interviewsController.schedule
    );

    // GET /api/interviews: Para el listado de la agenda
    router.get(
        "/", 
        authRequired, 
        interviewsController.agenda
    );

    // PATCH /api/interviews/:id/status: Para confirmar, cancelar o marcar como realizada
    router.patch(
        "/:id/status",
        authRequired,
        interviewsController.updateStatus
    );

    return router;
}

module.exports = { createInterviewsRoutes };