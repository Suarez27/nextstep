const express = require("express");
const { authRequired, roleRequired, permissionRequired } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const { interviewSchema } = require("../validators/interviews/interviews.schema");

function createInterviewsRoutes({ interviewsController }) {
    const router = express.Router();

    router.post(
        "/",
        authRequired,
        permissionRequired("interviewCreate"),
        roleRequired("empresa", "centro", "admin"),
        validate(interviewSchema),
        interviewsController.create
    );

    router.get("/my", authRequired, interviewsController.my);

    return router;
}

module.exports = { createInterviewsRoutes };