const express = require("express");
const { authRequired, roleRequired, permissionRequired } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const { companyProfileSchema, companyAdminSchema } = require("../validators/companies/companies.schema");

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

    router.get("/:id", authRequired, companiesController.getPortalDetail);

    return router;
}

function createAdminCompaniesRoutes({ companiesController }) {
    const router = express.Router();

    router.use(authRequired, permissionRequired("adminPanel"), roleRequired("admin"));

    router.get("/", companiesController.listAdmin);
    router.get("/:id", companiesController.getAdmin);
    router.post("/", validate(companyAdminSchema), companiesController.createAdmin);
    router.put("/:id", validate(companyAdminSchema), companiesController.updateAdmin);
    router.delete("/:id", companiesController.deleteAdmin);

    return router;
}

module.exports = { createCompaniesRoutes, createAdminCompaniesRoutes };
