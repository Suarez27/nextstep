const express = require("express");
const { authRequired, roleRequired, permissionRequired } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const { companyProfileSchema } = require("../validators/companies/companies.schema");

function createCompaniesRoutes({ companiesController }) {
    const router = express.Router();

    router.get(
        "/me",
        authRequired,
        permissionRequired("profile"),
        roleRequired("empresa"),
        companiesController.me
    );

    router.put(
        "/me",
        authRequired,
        permissionRequired("profile"),
        roleRequired("empresa"),
        validate(companyProfileSchema),
        companiesController.updateMe
    );

    return router;
}

module.exports = { createCompaniesRoutes };