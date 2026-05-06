const express = require("express");
const { authRequired, roleRequired, permissionRequired } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const {
    adminInternshipSchema,
    internshipSchema,
} = require("../validators/internships/internships.schema");

function createInternshipsRoutes({ internshipsController }) {
    const router = express.Router();

    router.get("/", authRequired, internshipsController.list);
    router.get("/:id", authRequired, internshipsController.get);

    router.post(
        "/",
        authRequired,
        permissionRequired("internshipCreate"),
        roleRequired("empresa"),
        validate(internshipSchema),
        internshipsController.create
    );

    router.put(
        "/:id",
        authRequired,
        permissionRequired("internshipCreate"),
        roleRequired("empresa"),
        validate(internshipSchema),
        internshipsController.updateOwned
    );

    router.delete(
        "/:id",
        authRequired,
        permissionRequired("internshipCreate"),
        roleRequired("empresa"),
        internshipsController.deactivateOwned
    );

    return router;
}

function createAdminInternshipsRoutes({ internshipsController }) {
    const router = express.Router();

    router.use(authRequired, permissionRequired("adminPanel"), roleRequired("admin"));

    router.get("/", internshipsController.listAdmin);
    router.get("/:id", internshipsController.getAdmin);
    router.post("/", validate(adminInternshipSchema), internshipsController.createAdmin);
    router.put("/:id", validate(adminInternshipSchema), internshipsController.updateAdmin);
    router.delete("/:id", internshipsController.deactivateAdmin);

    return router;
}

module.exports = {
    createInternshipsRoutes,
    createAdminInternshipsRoutes,
};
