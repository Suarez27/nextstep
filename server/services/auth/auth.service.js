const bcrypt = require("bcryptjs");

function createAuthService({ authRepository, buildToken, nowIso }) {
    function ensureAccountApproved(user) {
        if (user.role === "admin") return;

        if (user.role === "centro") {
            const center = authRepository.findCenterApprovalByUserId(user.id);
            if (center && center.verification_status === "rejected") {
                const reason = center.verification_note ? ` Motivo: ${center.verification_note}` : "";
                const err = new Error(`Tu cuenta de centro fue rechazada.${reason}`);
                err.status = 403;
                err.code = "CENTER_REJECTED";
                throw err;
            }
            if (!center || Number(center.is_verified) !== 1) {
                const err = new Error("Tu cuenta de centro esta pendiente de validacion por un administrador");
                err.status = 403;
                err.code = "CENTER_PENDING_APPROVAL";
                throw err;
            }
            return;
        }

        if (user.role === "empresa") {
            const company = authRepository.findCompanyApprovalByUserId(user.id);
            if (company && company.verification_status === "rejected") {
                const reason = company.verification_note ? ` Motivo: ${company.verification_note}` : "";
                const err = new Error(`Tu cuenta de empresa fue rechazada.${reason}`);
                err.status = 403;
                err.code = "COMPANY_REJECTED";
                throw err;
            }
            if (!company || Number(company.is_verified) !== 1) {
                const err = new Error("Tu cuenta de empresa esta pendiente de validacion por un administrador");
                err.status = 403;
                err.code = "COMPANY_PENDING_APPROVAL";
                throw err;
            }
            return;
        }

        if (user.role === "alumno") {
            const student = authRepository.findStudentApprovalByUserId(user.id);
            if (student && student.verification_status === "rejected") {
                const reason = student.verification_note ? ` Motivo: ${student.verification_note}` : "";
                const err = new Error(`Tu cuenta de alumno fue rechazada por el centro.${reason}`);
                err.status = 403;
                err.code = "STUDENT_REJECTED";
                throw err;
            }
            if (!student || Number(student.validated) !== 1) {
                const err = new Error("Tu cuenta de alumno esta pendiente de validacion por tu centro educativo");
                err.status = 403;
                err.code = "STUDENT_PENDING_APPROVAL";
                throw err;
            }
        }
    }

    return {
        register({ name, email, password, role, center_id }) {
            const exists = authRepository.findUserByEmail(email);
            if (exists) {
                const err = new Error("Email ya registrado");
                err.status = 409;
                err.code = "EMAIL_ALREADY_EXISTS";
                throw err;
            }

            if (role === "alumno") {
                const center = authRepository.findCenterById(center_id);
                if (!center || Number(center.is_verified) !== 1) {
                    const err = new Error("El centro seleccionado no esta disponible para registro");
                    err.status = 400;
                    err.code = "CENTER_NOT_APPROVED";
                    throw err;
                }
            }

            const createdAt = nowIso();
            const passwordHash = bcrypt.hashSync(password, 10);

            const userId = authRepository.createUser({
                name,
                email,
                passwordHash,
                role,
                createdAt,
            });

            if (role === "empresa") {
                authRepository.createCompanyProfile({
                    userId,
                    companyName: `Empresa de ${name}`,
                    createdAt,
                    isVerified: 0,
                });
            }

            if (role === "centro") {
                authRepository.createCenterProfile({
                    userId,
                    centerName: `Centro de ${name}`,
                    createdAt,
                    isVerified: 0,
                });
            }

            if (role === "alumno") {
                authRepository.createStudentProfile({
                    userId,
                    centerId: center_id,
                    createdAt,
                });
            }

            const user = authRepository.findSafeUserById(userId);

            return {
                user,
                approval_required: user.role !== "admin",
                message:
                    user.role === "alumno"
                        ? "Registro completado. Tu centro debe validar tu cuenta para que puedas iniciar sesion."
                        : "Registro completado. Un administrador debe validar tu cuenta para que puedas iniciar sesion.",
            };
        },

        login({ email, password }) {
            const user = authRepository.findUserByEmail(email);

            if (!user) {
                const err = new Error("Credenciales invalidas");
                err.status = 401;
                err.code = "INVALID_CREDENTIALS";
                throw err;
            }

            const ok = bcrypt.compareSync(password, user.password_hash);
            if (!ok) {
                const err = new Error("Credenciales invalidas");
                err.status = 401;
                err.code = "INVALID_CREDENTIALS";
                throw err;
            }

            ensureAccountApproved(user);

            const safeUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            };

            return {
                token: buildToken(safeUser),
                user: safeUser,
            };
        },

        me(userId, get) {
            const user = get(
                "SELECT id, name, email, role, created_at FROM users WHERE id = :id",
                { ":id": userId }
            );

            if (!user) {
                const err = new Error("Usuario no encontrado");
                err.status = 404;
                err.code = "USER_NOT_FOUND";
                throw err;
            }

            ensureAccountApproved(user);

            return user;
        },
    };
}

module.exports = { createAuthService };