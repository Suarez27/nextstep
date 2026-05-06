const express = require("express");
const { authRequired, roleRequired, permissionRequired } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const { centerProfileSchema, centerAdminSchema } = require("../validators/centers/centers.schema");

function createCentersRoutes({ centersController }) {
    const router = express.Router();

    router.get(
        "/approved",
        centersController.listApproved
    );

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

function createAdminCentersRoutes({ centersController }) {
    const router = express.Router();

    router.use(authRequired, permissionRequired("adminPanel"), roleRequired("admin"));

    router.get("/", centersController.listAdmin);
    router.get("/:id", centersController.getAdmin);
    router.put("/:id", validate(centerAdminSchema), centersController.updateAdmin);

    return router;
}

module.exports = { createCentersRoutes, createAdminCentersRoutes };