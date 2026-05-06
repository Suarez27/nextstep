const express = require("express");
const { authRequired, roleRequired, permissionRequired } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const { agreementSchema } = require("../validators/agreements/agreements.schema");

function createAgreementsRoutes({ agreementsController }) {
    const router = express.Router();

    router.post(
        "/",
        authRequired,
        permissionRequired("agreementCreate"),
        roleRequired("centro", "admin"),
        validate(agreementSchema),
        agreementsController.create
    );

    router.get(
        "/",
        authRequired,
        roleRequired("centro", "empresa", "admin"),
        agreementsController.list
    );

    return router;
}

module.exports = { createAgreementsRoutes };