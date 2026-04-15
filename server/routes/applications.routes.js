const express = require("express");
const { authRequired, roleRequired, permissionRequired } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const { applicationStatusSchema } = require("../validators/applications/applications.schema");

function createApplicationsRoutes({ applicationsController }) {
    const router = express.Router();

    router.post(
        "/:internshipId",
        authRequired,
        permissionRequired("internshipApply"),
        applicationsController.apply
    );

    router.get(
        "/my",
        authRequired,
        permissionRequired("applicationsOwn"),
        applicationsController.my
    );

    router.get(
        "/internship/:id",
        authRequired,
        permissionRequired("applicationsReview"),
        roleRequired("empresa", "centro", "admin"),
        applicationsController.byInternship
    );

    router.post(
        "/:id/status",
        authRequired,
        permissionRequired("applicationsStatusUpdate"),
        roleRequired("empresa", "centro", "admin"),
        validate(applicationStatusSchema),
        applicationsController.updateStatus
    );

    return router;
}

module.exports = { createApplicationsRoutes };