function createCentersRepository({ get, run }) {
    return {
        findByUserId(userId) {
            return get(
                "SELECT id, user_id, center_name, city, created_at FROM centers WHERE user_id = :uid",
                { ":uid": userId }
            );
        },

        findById(id) {
            return get(
                "SELECT id, user_id, center_name, city, created_at FROM centers WHERE id = :id",
                { ":id": id }
            );
        },

        createForUser({ userId, centerName, city, createdAt }) {
            run(
                `INSERT INTO centers (user_id, center_name, city, created_at)
         VALUES (:user_id, :center_name, :city, :created_at)`,
                {
                    ":user_id": userId,
                    ":center_name": centerName,
                    ":city": city,
                    ":created_at": createdAt,
                }
            );
        },

        updateById({ id, centerName, city }) {
            run(
                `UPDATE centers
         SET center_name = :center_name,
             city = :city
         WHERE id = :id`,
                {
                    ":center_name": centerName,
                    ":city": city,
                    ":id": id,
                }
            );
        },
    };
}

module.exports = { createCentersRepository };