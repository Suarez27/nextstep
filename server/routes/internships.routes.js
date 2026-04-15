const express = require("express");
const { authRequired, roleRequired, permissionRequired } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const { internshipSchema } = require("../validators/internships/internships.schema");

function createInternshipsRoutes({ internshipsController }) {
    const router = express.Router();

    router.post(
        "/",
        authRequired,
        permissionRequired("internshipCreate"),
        roleRequired("empresa"),
        validate(internshipSchema),
        internshipsController.create
    );

    router.get("/", authRequired, internshipsController.list);

    return router;
}

module.exports = { createInternshipsRoutes };