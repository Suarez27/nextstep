const bcrypt = require("bcryptjs");

function createAuthService({ authRepository, buildToken, nowIso }) {
    return {
        register({ name, email, password, role }) {
            const exists = authRepository.findUserByEmail(email);
            if (exists) {
                const err = new Error("Email ya registrado");
                err.status = 409;
                err.code = "EMAIL_ALREADY_EXISTS";
                throw err;
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
                });
            }

            if (role === "centro") {
                authRepository.createCenterProfile({
                    userId,
                    centerName: `Centro de ${name}`,
                    createdAt,
                });
            }

            const user = authRepository.findSafeUserById(userId);

            return {
                token: buildToken(user),
                user,
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

            return user;
        },
    };
}

module.exports = { createAuthService };