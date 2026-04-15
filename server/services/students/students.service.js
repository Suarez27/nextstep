const bcrypt = require("bcryptjs");

function createStudentsService({
    studentsRepository,
    ensureCenterForUser,
    nowIso,
    removeStoredCvPdf,
}) {
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
            const student = studentsRepository.findStudentByUserId(userId);

            if (!student) {
                const err = new Error("Solo cuentas de alumno pueden editar este perfil");
                err.status = 403;
                err.code = "STUDENT_ONLY";
                throw err;
            }

            studentsRepository.updateProfileByUserId({
                userId,
                cvText: payload.cv_text,
                skills: payload.skills,
            });

            return studentsRepository.findProfileByUserId(userId);
        },

        updateMyCvPdf(userId, nextCvPdfUrl) {
            const student = studentsRepository.findStudentByUserId(userId);

            if (!student) {
                const err = new Error("Solo cuentas de alumno pueden subir CV");
                err.status = 403;
                err.code = "STUDENT_ONLY";
                throw err;
            }

            studentsRepository.updateCvPdfByUserId({
                userId,
                cvPdfUrl: nextCvPdfUrl,
            });

            if (student.cv_pdf_url && student.cv_pdf_url !== nextCvPdfUrl) {
                removeStoredCvPdf(student.cv_pdf_url);
            }

            return studentsRepository.findProfileByUserId(userId);
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