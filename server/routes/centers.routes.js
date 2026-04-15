const express = require("express");
const { authRequired, roleRequired } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const { centerProfileSchema } = require("../validators/centers/centers.schema");

function createCentersRoutes({ centersController }) {
    const router = express.Router();

    router.get(
        "/me",
        authRequired,
        roleRequired("centro"),
        centersController.me
    );

    router.put(
        "/me",
        authRequired,
        roleRequired("centro"),
        validate(centerProfileSchema),
        centersController.updateMe
    );

    return router;
}

module.exports = { createCentersRoutes };