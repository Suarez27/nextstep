const express = require("express");
const { authRequired, roleRequired, permissionRequired } = require("../middlewares/auth");

function createVerificationAuditsRoutes({ verificationAuditsController }) {
    const router = express.Router();

    router.use(authRequired, permissionRequired("adminPanel"), roleRequired("admin"));

    router.get("/", verificationAuditsController.listAdmin);
    router.get("/:id", verificationAuditsController.getAdmin);

    return router;
}

module.exports = { createVerificationAuditsRoutes };
