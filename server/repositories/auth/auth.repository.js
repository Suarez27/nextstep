function createAuthRepository({ get, run, lastInsertId }) {
    return {
        findUserByEmail(email) {
            return get("SELECT * FROM users WHERE email = :email", {
                ":email": email.toLowerCase(),
            });
        },

        findSafeUserById(id) {
            return get("SELECT id, name, email, role FROM users WHERE id = :id", {
                ":id": id,
            });
        },

        createUser({ name, email, passwordHash, role, createdAt }) {
            const safeEmail = email.toLowerCase();

            run(
                `INSERT INTO users (name, email, password_hash, role, created_at)
         VALUES (:name, :email, :password_hash, :role, :created_at)`,
                {
                    ":name": name,
                    ":email": safeEmail,
                    ":password_hash": passwordHash,
                    ":role": role,
                    ":created_at": createdAt,
                }
            );

            const createdUser = get("SELECT id FROM users WHERE email = :email", {
                ":email": safeEmail,
            });

            return createdUser?.id || lastInsertId();
        },

        createCompanyProfile({ userId, companyName, createdAt, isVerified = 0 }) {
            run(
                `INSERT INTO empresas (
                    usuario_id,
                    nombre_empresa,
                    sector,
                    ciudad,
                    descripcion,
                    correo_contacto,
                    telefono_contacto,
                    persona_contacto,
                    activo,
                    verificado_admin,
                    creado_en,
                    actualizado_en
                )
                 VALUES (
                    :user_id,
                    :company_name,
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    1,
                    :is_verified,
                    :created_at,
                    :created_at
                )`,
                {
                    ":user_id": userId,
                    ":company_name": companyName,
                    ":is_verified": isVerified ? 1 : 0,
                    ":created_at": createdAt,
                }
            );
        },

        createCenterProfile({ userId, centerName, createdAt, isVerified = 0 }) {
            run(
                `INSERT INTO centers (user_id, center_name, city, is_verified, created_at)
         VALUES (:user_id, :center_name, '', :is_verified, :created_at)`,
                {
                    ":user_id": userId,
                    ":center_name": centerName,
                    ":is_verified": isVerified ? 1 : 0,
                    ":created_at": createdAt,
                }
            );
        },

        createStudentProfile({ userId, centerId, createdAt }) {
            run(
                `INSERT INTO students (user_id, center_id, cv_text, skills, validated, created_at)
                 VALUES (:user_id, :center_id, '', '', 0, :created_at)`,
                {
                    ":user_id": userId,
                    ":center_id": centerId,
                    ":created_at": createdAt,
                }
            );
        },

        findCenterById(id) {
            return get("SELECT id, is_verified FROM centers WHERE id = :id", {
                ":id": id,
            });
        },

        findCenterApprovalByUserId(userId) {
            return get("SELECT id, is_verified FROM centers WHERE user_id = :user_id", {
                ":user_id": userId,
            });
        },

        findCompanyApprovalByUserId(userId) {
            return get("SELECT id, is_verified FROM companies WHERE user_id = :user_id", {
                ":user_id": userId,
            });
        },

        findStudentApprovalByUserId(userId) {
            return get("SELECT id, validated FROM students WHERE user_id = :user_id", {
                ":user_id": userId,
            });
        },
    };
}

module.exports = { createAuthRepository };
