const express = require("express");
const { authRequired, roleRequired, permissionRequired } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const { followupSchema } = require("../validators/followups/followups.schema");

function createFollowupsRoutes({ followupsController }) {
    const router = express.Router();

    router.post(
        "/",
        authRequired,
        permissionRequired("followupCreate"),
        roleRequired("centro", "empresa", "admin"),
        validate(followupSchema),
        followupsController.create
    );

    router.get("/:studentId", authRequired, followupsController.list);

    return router;
}

module.exports = { createFollowupsRoutes };