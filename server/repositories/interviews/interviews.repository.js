function createInterviewsRepository({ get, all, run, lastInsertId }) {
    return {
        create({ payload, createdAt }) {
            run(
                `INSERT INTO entrevistas (candidatura_id, fecha_entrevista, modalidad, ubicacion_enlace, notas, creado_en, estado)
                 VALUES (:candidatura_id, :fecha_entrevista, :modalidad, :ubicacion_enlace, :notas, :creado_en, 'programada')`,
                {
                    ":candidatura_id": payload.application_id,
                    ":fecha_entrevista": payload.interview_at,
                    ":modalidad": payload.mode || "presencial",
                    ":ubicacion_enlace": payload.location_text || "",
                    ":notas": payload.notes || "",
                    ":creado_en": createdAt,
                }
            );

            // Consultamos la entrevista que acabamos de crear basándonos en la candidatura y la fecha
            const created = get(
                `SELECT id FROM entrevistas 
                 WHERE candidatura_id = :candidatura_id 
                   AND fecha_entrevista = :fecha_entrevista 
                   AND creado_en = :creado_en 
                 ORDER BY id DESC LIMIT 1`,
                {
                    ":candidatura_id": payload.application_id,
                    ":fecha_entrevista": payload.interview_at,
                    ":creado_en": createdAt
                }
            );

            return created ? created.id : lastInsertId();
        },

        findById(id) {
            return get(`SELECT * FROM interviews WHERE id = :id`, { ":id": id });
        },

        listByRole(role, userId) {
            let whereClause = "";
            if (role === "alumno") {
                whereClause = `WHERE s.user_id = :uid`;
            } else if (role === "empresa") {
                whereClause = `WHERE intern.company_id = (SELECT id FROM companies WHERE user_id = :uid)`;
            } else if (role === "centro") {
                whereClause = `WHERE s.center_id = (SELECT id FROM centers WHERE user_id = :uid)`;
            } else if (role === "admin") {
                whereClause = ``; // Sin filtros
            }

            const query = `
                SELECT i.*, 
                       u.name AS student_name, 
                       intern.title AS internship_title, 
                       intern.company_name AS company_name,
                       a.status AS application_status
                FROM interviews i
                JOIN applications a ON a.id = i.application_id
                JOIN internships intern ON intern.id = a.internship_id
                JOIN students s ON s.id = a.student_id
                JOIN users u ON u.id = s.user_id
                ${whereClause}
                ORDER BY i.interview_at ASC
            `;
            const params = (role === "admin") ? {} : { ":uid": userId };
            return all(query, params);
        },

        updateStatus({ id, status, updatedAt }) {
            let statusDateField = "";
            if (status === "confirmada") statusDateField = ", confirmado_en = :updated_at";
            else if (status === "realizada") statusDateField = ", completado_en = :updated_at";
            else if (status === "cancelada" || status === "no_asistio") statusDateField = ", cancelado_en = :updated_at";

            run(
                `UPDATE entrevistas
                 SET estado = :estado, actualizado_en = :updated_at ${statusDateField}
                 WHERE id = :id`,
                {
                    ":id": id,
                    ":estado": status,
                    ":updated_at": updatedAt
                }
            );
        }
    };
}

module.exports = { createInterviewsRepository };