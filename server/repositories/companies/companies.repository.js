function createCompaniesRepository({ get, run }) {
    return {
        findByUserId(userId) {
            return get("SELECT * FROM companies WHERE user_id = :uid", {
                ":uid": userId,
            });
        },

        createForUser({ userId, companyName, sector, city, createdAt }) {
            run(
                `INSERT INTO companies (user_id, company_name, sector, city, created_at)
         VALUES (:user_id, :company_name, :sector, :city, :created_at)`,
                {
                    ":user_id": userId,
                    ":company_name": companyName,
                    ":sector": sector,
                    ":city": city,
                    ":created_at": createdAt,
                }
            );
        },

        updateByUserId({ userId, companyName, sector, city }) {
            run(
                `UPDATE companies
         SET company_name = :company_name,
             sector = :sector,
             city = :city
         WHERE user_id = :uid`,
                {
                    ":company_name": companyName,
                    ":sector": sector,
                    ":city": city,
                    ":uid": userId,
                }
            );
        },
    };
}

module.exports = { createCompaniesRepository };