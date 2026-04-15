const multer = require("multer");
const { ok, created, fail } = require("../../utils/http/responses");

function createStudentsController({ studentsService, uploadCvPdf }) {
    return {
        me(req, res) {
            const result = studentsService.getMyProfile(req.user.id);
            return ok(res, result);
        },

        updateMe(req, res) {
            const result = studentsService.updateMyProfile(req.user.id, req.body);
            return ok(res, result);
        },

        uploadMyCvPdf(req, res) {
            uploadCvPdf(req, res, (err) => {
                if (err) {
                    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
                        return fail(res, 400, "El PDF supera el limite de 5MB", {
                            code: "PDF_TOO_LARGE",
                        });
                    }

                    return fail(res, 400, err.message || "No se pudo subir el archivo", {
                        code: "UPLOAD_ERROR",
                    });
                }

                if (!req.file) {
                    return fail(res, 400, "Debes adjuntar un archivo PDF", {
                        code: "PDF_REQUIRED",
                    });
                }

                const nextCvPdfUrl = `/uploads/cv/${req.file.filename}`;
                const result = studentsService.updateMyCvPdf(req.user.id, nextCvPdfUrl);
                return ok(res, result);
            });
        },

        validated(req, res) {
            const result = studentsService.listValidated(req.user);
            return ok(res, result);
        },

        all(req, res) {
            const result = studentsService.listAll(req.user);
            return ok(res, result);
        },

        create(req, res) {
            const result = studentsService.createStudent(req.user, req.body);
            return created(res, result);
        },

        validate(req, res) {
            const result = studentsService.validateStudent(req.user, Number(req.params.id));
            return ok(res, result);
        },

        resetPassword(req, res) {
            const result = studentsService.resetStudentPassword(
                req.user,
                Number(req.params.id),
                req.body.password
            );
            return ok(res, result);
        },
    };
}

module.exports = { createStudentsController };