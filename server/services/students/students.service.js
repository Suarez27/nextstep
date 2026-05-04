const bcrypt = require("bcryptjs");
const path = require("path");

function createServiceError(message, status, code) {
    const err = new Error(message);
    err.status = status;
    err.code = code;
    return err;
}

function normalizeOptionalText(value) {
    if (typeof value === "undefined" || value === null) return null;
    const normalized = String(value).trim();
    return normalized || null;
}

function isPdfDocument({ fileUrl, mimeType }) {
    const normalizedMimeType = String(mimeType || "").toLowerCase();
    const ext = path.extname(String(fileUrl || "")).toLowerCase();
    return normalizedMimeType === "application/pdf" || ext === ".pdf";
}

function createStudentsService({
    studentsRepository,
    ensureCenterForUser,
    nowIso,
    removeStoredCvPdf,
}) {
    function resolveCurrentStudent(userId, message = "Solo cuentas de alumno pueden acceder a este recurso") {
        const student = studentsRepository.findStudentByUserId(userId);

        if (!student) {
            throw createServiceError(message, 403, "STUDENT_ONLY");
        }

        return student;
    }

    function assertValidId(id, message, code) {
        if (!Number.isInteger(id) || id < 1) {
            throw createServiceError(message, 400, code);
        }
    }

    function assertStudentScope(authUser, studentId) {
        assertValidId(studentId, "Alumno no valido", "INVALID_STUDENT_ID");

        const student = studentsRepository.findStudentDetailById(studentId);

        if (!student) {
            throw createServiceError("Alumno no encontrado", 404, "STUDENT_NOT_FOUND");
        }

        if (authUser.role === "centro") {
            const center = ensureCenterForUser(authUser.id, `Centro de ${authUser.name}`, "");
            if (student.center_id !== center.id) {
                throw createServiceError("No puedes revisar alumnos de otro centro", 403, "CENTER_SCOPE_FORBIDDEN");
            }
        }

        return student;
    }

    function assertValidDocumentType(documentTypeItemId) {
        const id = Number(documentTypeItemId);

        if (!Number.isInteger(id) || id < 1) {
            throw createServiceError("document_type_item_id es obligatorio", 400, "DOCUMENT_TYPE_REQUIRED");
        }

        const documentType = studentsRepository.findDocumentTypeItemById(id);
        if (!documentType) {
            throw createServiceError("Tipo de documento no encontrado", 404, "DOCUMENT_TYPE_NOT_FOUND");
        }

        if (
            documentType.catalog_key !== "document_types"
            || Number(documentType.catalog_is_active) !== 1
            || Number(documentType.is_active) !== 1
        ) {
            throw createServiceError("El tipo de documento no pertenece al catalogo document_types", 400, "INVALID_DOCUMENT_TYPE");
        }

        return documentType;
    }

    function buildDocumentPayload(payload) {
        const fileUrl = normalizeOptionalText(payload.fileUrl);
        const originalName = normalizeOptionalText(payload.originalName) || (fileUrl ? path.basename(fileUrl) : null);
        const mimeType = normalizeOptionalText(payload.mimeType) || "application/pdf";

        if (!fileUrl) {
            throw createServiceError("Debes adjuntar un archivo PDF o indicar file_url", 400, "DOCUMENT_FILE_REQUIRED");
        }

        if (!isPdfDocument({ fileUrl, mimeType })) {
            throw createServiceError("Solo se permiten documentos PDF en esta fase", 400, "PDF_ONLY");
        }

        return {
            fileUrl,
            originalName,
            mimeType,
            notes: normalizeOptionalText(payload.notes),
        };
    }

    function upsertStudentDocument({ student, documentTypeItemId, payload }) {
        const now = nowIso();
        const existing = studentsRepository.findLatestDocumentByStudentAndType({
            studentId: student.id,
            documentTypeItemId,
        });

        if (existing) {
            studentsRepository.updateStudentDocument({
                id: existing.id,
                fileUrl: payload.fileUrl,
                originalName: payload.originalName,
                mimeType: payload.mimeType,
                notes: payload.notes,
                uploadedAt: now,
                updatedAt: now,
            });

            if (existing.file_url && existing.file_url !== payload.fileUrl) {
                removeStoredCvPdf(existing.file_url);
            }

            return studentsRepository.findDocumentById(existing.id);
        }

        studentsRepository.createStudentDocument({
            studentId: student.id,
            documentTypeItemId,
            fileUrl: payload.fileUrl,
            originalName: payload.originalName,
            mimeType: payload.mimeType,
            notes: payload.notes,
            uploadedAt: now,
            createdAt: now,
            updatedAt: now,
            requestedByUserId: null,
            status: "entregado",
        });

        return studentsRepository.findLatestDocumentByStudentAndType({
            studentId: student.id,
            documentTypeItemId,
        });
    }

    return {
        getMyProfile(userId) {
            const profile = studentsRepository.findProfileByUserId(userId);

            if (!profile) {
                const err = new Error("Perfil de alumno no encontrado");
                err.status = 404;
                err.code = "STUDENT_PROFILE_NOT_FOUND";
                throw err;
            }

            return profile;
        },

        updateMyProfile(userId, payload) {
            resolveCurrentStudent(userId, "Solo cuentas de alumno pueden editar este perfil");

            studentsRepository.updateProfileByUserId({
                userId,
                cvText: payload.cv_text,
                skills: payload.skills,
                cvPdfUrl: payload.cv_pdf_url,
                updatedAt: nowIso(),
            });

            return studentsRepository.findProfileByUserId(userId);
        },

        updateMyCvPdf(userId, { cvPdfUrl, originalName, mimeType }) {
            const student = resolveCurrentStudent(userId, "Solo cuentas de alumno pueden subir CV");

            studentsRepository.updateCvPdfByUserId({
                userId,
                cvPdfUrl,
                updatedAt: nowIso(),
            });

            const cvPdfType = studentsRepository.findDocumentTypeItemByValue({
                catalogKey: "document_types",
                value: "cv_pdf",
            });

            if (cvPdfType) {
                upsertStudentDocument({
                    student,
                    documentTypeItemId: cvPdfType.id,
                    payload: buildDocumentPayload({
                        fileUrl: cvPdfUrl,
                        originalName,
                        mimeType,
                    }),
                });
            }

            if (student.cv_pdf_url && student.cv_pdf_url !== cvPdfUrl) {
                removeStoredCvPdf(student.cv_pdf_url);
            }

            return studentsRepository.findProfileByUserId(userId);
        },

        listMyDocuments(userId) {
            const student = resolveCurrentStudent(userId);
            return studentsRepository.findDocumentsByStudentId(student.id);
        },

        upsertMyDocument(userId, payload) {
            const student = resolveCurrentStudent(userId, "Solo cuentas de alumno pueden subir documentos");
            const documentType = assertValidDocumentType(payload.documentTypeItemId);
            const documentPayload = buildDocumentPayload(payload);
            const document = upsertStudentDocument({
                student,
                documentTypeItemId: documentType.id,
                payload: documentPayload,
            });

            if (documentType.value === "cv_pdf") {
                studentsRepository.updateCvPdfByUserId({
                    userId,
                    cvPdfUrl: documentPayload.fileUrl,
                    updatedAt: nowIso(),
                });
            }

            return document;
        },

        listValidated(user) {
            if (user.role === "centro") {
                const center = ensureCenterForUser(user.id, `Centro de ${user.name}`, "");
                return studentsRepository.findValidatedByCenterId(center.id);
            }

            return studentsRepository.findValidatedAll();
        },

        listAll(user) {
            if (user.role === "centro") {
                const center = ensureCenterForUser(user.id, `Centro de ${user.name}`, "");
                return studentsRepository.findAllByCenterId(center.id);
            }

            return studentsRepository.findAllDetailed();
        },

        getStudentDetail(authUser, studentId) {
            return assertStudentScope(authUser, studentId);
        },

        listStudentDocuments(authUser, studentId) {
            const student = assertStudentScope(authUser, studentId);
            return studentsRepository.findDocumentsByStudentId(student.id);
        },

        reviewStudentDocument(authUser, { studentId, documentId, status, notes }) {
            const student = assertStudentScope(authUser, studentId);
            assertValidId(documentId, "Documento no valido", "INVALID_DOCUMENT_ID");

            if (!["validado", "rechazado"].includes(status)) {
                throw createServiceError("Estado documental no valido", 400, "INVALID_DOCUMENT_STATUS");
            }

            const document = studentsRepository.findDocumentById(documentId);

            if (!document || Number(document.student_id) !== Number(student.id)) {
                throw createServiceError("Documento no encontrado para este alumno", 404, "DOCUMENT_NOT_FOUND");
            }

            if (!document.file_url) {
                throw createServiceError("El documento aun no ha sido entregado", 400, "DOCUMENT_NOT_DELIVERED");
            }

            const normalizedNotes = normalizeOptionalText(notes);

            if (status === "rechazado" && !normalizedNotes) {
                throw createServiceError("La observacion es obligatoria al rechazar un documento", 400, "DOCUMENT_REJECTION_NOTES_REQUIRED");
            }

            studentsRepository.updateDocumentReview({
                documentId,
                status,
                notes: normalizedNotes,
                validatedByUserId: authUser.id,
                validatedAt: nowIso(),
                updatedAt: nowIso(),
            });

            return studentsRepository.findDocumentById(documentId);
        },

        createStudent(authUser, payload) {
            const exists = studentsRepository.emailExists(payload.email);
            if (exists) {
                const err = new Error("Email ya registrado");
                err.status = 409;
                err.code = "EMAIL_ALREADY_EXISTS";
                throw err;
            }

            let centerId;
            if (authUser.role === "centro") {
                const center = ensureCenterForUser(authUser.id, `Centro de ${authUser.name}`, "");
                centerId = center.id;
            } else {
                centerId = payload.center_id;
                if (!centerId) {
                    const err = new Error("center_id es obligatorio para admin");
                    err.status = 400;
                    err.code = "CENTER_ID_REQUIRED";
                    throw err;
                }
            }

            const centerExists = studentsRepository.centerExists(centerId);
            if (!centerExists) {
                const err = new Error("Centro no encontrado");
                err.status = 404;
                err.code = "CENTER_NOT_FOUND";
                throw err;
            }

            const createdAt = nowIso();
            const passwordHash = bcrypt.hashSync(payload.password, 10);

            const userId = studentsRepository.createStudentUser({
                name: payload.name,
                email: payload.email,
                passwordHash,
                createdAt,
            });

            if (!userId) {
                const err = new Error("No se pudo crear el usuario del alumno");
                err.status = 500;
                err.code = "STUDENT_USER_CREATE_FAILED";
                throw err;
            }

            studentsRepository.createStudentRecord({
                userId,
                centerId,
                createdAt,
            });

            return studentsRepository.findCreatedSummaryByUserId(userId);
        },

        validateStudent(authUser, studentId) {
            const student = studentsRepository.findStudentById(studentId);

            if (!student) {
                const err = new Error("Alumno no encontrado");
                err.status = 404;
                err.code = "STUDENT_NOT_FOUND";
                throw err;
            }

            if (authUser.role === "centro") {
                const center = ensureCenterForUser(authUser.id, `Centro de ${authUser.name}`, "");
                if (student.center_id !== center.id) {
                    const err = new Error("No puedes validar alumnos de otro centro");
                    err.status = 403;
                    err.code = "CENTER_SCOPE_FORBIDDEN";
                    throw err;
                }
            }

            studentsRepository.validateStudent(studentId);
            return studentsRepository.findValidationResult(studentId);
        },

        resetStudentPassword(authUser, studentId, password) {
            const student = studentsRepository.findStudentById(studentId);

            if (!student) {
                const err = new Error("Alumno no encontrado");
                err.status = 404;
                err.code = "STUDENT_NOT_FOUND";
                throw err;
            }

            if (authUser.role === "centro") {
                const center = ensureCenterForUser(authUser.id, `Centro de ${authUser.name}`, "");
                if (student.center_id !== center.id) {
                    const err = new Error("No puedes cambiar la clave de alumnos de otro centro");
                    err.status = 403;
                    err.code = "CENTER_SCOPE_FORBIDDEN";
                    throw err;
                }
            }

            const passwordHash = bcrypt.hashSync(password, 10);

            studentsRepository.updateUserPassword({
                userId: student.user_id,
                passwordHash,
            });

            return { ok: true };
        },
    };
}

module.exports = { createStudentsService };
