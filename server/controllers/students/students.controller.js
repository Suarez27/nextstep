const multer = require("multer");
const { ok, created, fail } = require("../../utils/http/responses");

function createStudentsController({
    studentsService,
    uploadCvPdf,
    uploadStudentDocument,
    removeStoredStudentDocument = () => {},
}) {
    return {
        me(req, res) {
            const result = studentsService.getMyProfile(req.user.id);
            return ok(res, result);
        },

        updateMe(req, res) {
            const result = studentsService.updateMyProfile(req.user.id, req.body);
            return ok(res, result);
        },

        uploadMyCvPdf(req, res, next) {
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
                try {
                    const result = studentsService.updateMyCvPdf(req.user.id, {
                        cvPdfUrl: nextCvPdfUrl,
                        originalName: req.file.originalname,
                        mimeType: req.file.mimetype,
                    });
                    return ok(res, result);
                } catch (error) {
                    removeStoredStudentDocument(nextCvPdfUrl);
                    return next(error);
                }
            });
        },

        listMyDocuments(req, res) {
            const result = studentsService.listMyDocuments(req.user.id);
            return ok(res, result);
        },

        uploadMyDocument(req, res, next) {
            uploadStudentDocument(req, res, (err) => {
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

                const uploadedFileUrl = req.file ? `/uploads/student-documents/${req.file.filename}` : undefined;

                try {
                    const result = studentsService.upsertMyDocument(req.user.id, {
                        documentTypeItemId: req.body.document_type_item_id,
                        fileUrl: uploadedFileUrl || req.body.file_url,
                        originalName: req.file ? req.file.originalname : req.body.original_name,
                        mimeType: req.file ? req.file.mimetype : req.body.mime_type,
                        notes: req.body.notes,
                    });

                    return created(res, result);
                } catch (error) {
                    if (uploadedFileUrl) {
                        removeStoredStudentDocument(uploadedFileUrl);
                    }
                    return next(error);
                }
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

        detail(req, res) {
            const result = studentsService.getStudentDetail(req.user, Number(req.params.id));
            return ok(res, result);
        },

        listStudentDocuments(req, res) {
            const result = studentsService.listStudentDocuments(req.user, Number(req.params.id));
            return ok(res, result);
        },

        validateStudentDocument(req, res) {
            const result = studentsService.reviewStudentDocument(req.user, {
                studentId: Number(req.params.id),
                documentId: Number(req.params.documentId),
                status: "validado",
                notes: req.body.notes,
            });
            return ok(res, result);
        },

        rejectStudentDocument(req, res) {
            const result = studentsService.reviewStudentDocument(req.user, {
                studentId: Number(req.params.id),
                documentId: Number(req.params.documentId),
                status: "rechazado",
                notes: req.body.notes,
            });
            return ok(res, result);
        },

        validate(req, res) {
            const result = studentsService.validateStudent(req.user, Number(req.params.id));
            return ok(res, result);
        },

        reject(req, res) {
            const result = studentsService.rejectStudent(req.user, Number(req.params.id), req.body.notes);
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
