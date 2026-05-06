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
        "/company",
        authRequired,
        permissionRequired("applicationsReview"),
        roleRequired("empresa", "admin"),
        applicationsController.company
    );

    router.get(
        "/center",
        authRequired,
        permissionRequired("applicationsReview"),
        roleRequired("centro", "admin"),
        applicationsController.center
    );

    router.get(
        "/internship/:id",
        authRequired,
        permissionRequired("applicationsReview"),
        roleRequired("empresa", "centro", "admin"),
        applicationsController.byInternship
    );

    router.get(
        "/:id/events",
        authRequired,
        permissionRequired("applications"),
        applicationsController.events
    );

    router.get(
        "/:id",
        authRequired,
        permissionRequired("applications"),
        applicationsController.detail
    );

    router.post(
        "/:id/status",
        authRequired,
        permissionRequired("applicationsStatusUpdate"),
        roleRequired("empresa"),
        validate(applicationStatusSchema),
        applicationsController.updateStatus
    );

    return router;
}

module.exports = { createApplicationsRoutes };
