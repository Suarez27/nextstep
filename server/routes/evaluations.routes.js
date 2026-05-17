const express = require("express");
const { authRequired, roleRequired } = require("../middlewares/auth");

function createEvaluationsRoutes({ evaluationsController }) {
    const router = express.Router();

    router.post(
        "/",
        authRequired,
        roleRequired("centro", "admin"), 
        evaluationsController.create
    );

    router.get(
        "/assignment/:id",
        authRequired,
        evaluationsController.listByAssignment
    );

    return router;
}

module.exports = { createEvaluationsRoutes };
