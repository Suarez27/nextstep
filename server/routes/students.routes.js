const express = require("express");
const { authRequired, roleRequired, permissionRequired } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const {
    studentProfileSchema,
    createStudentSchema,
    resetStudentPasswordSchema,
    documentValidationSchema,
    documentRejectionSchema,
} = require("../validators/students/students.schema");

function createStudentsRoutes({ studentsController }) {
    const router = express.Router();

    router.get("/me", authRequired, studentsController.me);
    router.patch("/me", authRequired, validate(studentProfileSchema), studentsController.updateMe);
    router.put("/me", authRequired, validate(studentProfileSchema), studentsController.updateMe);
    router.post("/me/cv-pdf", authRequired, studentsController.uploadMyCvPdf);
    router.get("/me/documents", authRequired, studentsController.listMyDocuments);
    router.post("/me/documents", authRequired, studentsController.uploadMyDocument);

    router.get(
        "/validated",
        authRequired,
        permissionRequired("studentsValidatedView"),
        roleRequired("empresa", "centro", "admin"),
        studentsController.validated
    );

    router.get(
        "/all",
        authRequired,
        permissionRequired("students"),
        roleRequired("centro", "admin"),
        studentsController.all
    );

    router.post(
        "/",
        authRequired,
        permissionRequired("studentCreate"),
        roleRequired("centro", "admin"),
        validate(createStudentSchema),
        studentsController.create
    );

    router.get(
        "/:id",
        authRequired,
        permissionRequired("students"),
        roleRequired("centro", "admin"),
        studentsController.detail
    );

    router.get(
        "/:id/documents",
        authRequired,
        permissionRequired("students"),
        roleRequired("centro", "admin"),
        studentsController.listStudentDocuments
    );

    router.post(
        "/:id/documents/:documentId/validate",
        authRequired,
        permissionRequired("studentValidate"),
        roleRequired("centro", "admin"),
        validate(documentValidationSchema),
        studentsController.validateStudentDocument
    );

    router.post(
        "/:id/documents/:documentId/reject",
        authRequired,
        permissionRequired("studentValidate"),
        roleRequired("centro", "admin"),
        validate(documentRejectionSchema),
        studentsController.rejectStudentDocument
    );

    router.post(
        "/:id/validate",
        authRequired,
        permissionRequired("studentValidate"),
        roleRequired("centro", "admin"),
        studentsController.validate
    );

    router.post(
        "/:id/reset-password",
        authRequired,
        permissionRequired("studentResetPassword"),
        roleRequired("centro", "admin"),
        validate(resetStudentPasswordSchema),
        studentsController.resetPassword
    );

    return router;
}

module.exports = { createStudentsRoutes };
