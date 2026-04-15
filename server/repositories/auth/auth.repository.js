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
            run(
                `INSERT INTO users (name, email, password_hash, role, created_at)
         VALUES (:name, :email, :password_hash, :role, :created_at)`,
                {
                    ":name": name,
                    ":email": email.toLowerCase(),
                    ":password_hash": passwordHash,
                    ":role": role,
                    ":created_at": createdAt,
                }
            );

            return lastInsertId();
        },

        createCompanyProfile({ userId, companyName, createdAt }) {
            run(
                `INSERT INTO companies (user_id, company_name, sector, city, created_at)
         VALUES (:user_id, :company_name, '', '', :created_at)`,
                {
                    ":user_id": userId,
                    ":company_name": companyName,
                    ":created_at": createdAt,
                }
            );
        },

        createCenterProfile({ userId, centerName, createdAt }) {
            run(
                `INSERT INTO centers (user_id, center_name, city, created_at)
         VALUES (:user_id, :center_name, '', :created_at)`,
                {
                    ":user_id": userId,
                    ":center_name": centerName,
                    ":created_at": createdAt,
                }
            );
        },
    };
}

module.exports = { createAuthRepository };