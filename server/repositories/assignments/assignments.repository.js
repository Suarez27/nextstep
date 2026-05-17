function createAssignmentsRepository({ get, all, run, lastInsertId }) {
    return {
        create({ payload, createdAt, createdBy }) {
            run(
                `INSERT INTO asignaciones_practica
                 (practica_id, alumno_id, empresa_id, centro_id, candidatura_id, estado, fecha_asignacion, creado_por_usuario_id)
                 VALUES
                 (:practica_id, :alumno_id, :empresa_id, :centro_id, :candidatura_id, :estado, :fecha_asignacion, :creado_por_usuario_id)`,
                {
                    ":practica_id": payload.practica_id,
                    ":alumno_id": payload.alumno_id,
                    ":empresa_id": payload.empresa_id,
                    ":centro_id": payload.centro_id || null,
                    ":candidatura_id": payload.candidatura_id || null,
                    ":estado": payload.estado || "pendiente_documentacion",
                    ":fecha_asignacion": createdAt,
                    ":creado_por_usuario_id": createdBy
                }
            );

            // Obtener el ID insertado
            const id = lastInsertId();
            if (!id) return null;

            // Hacer un SELECT final para asegurar y devolver el ID correcto
            const row = get(`SELECT id FROM asignaciones_practica WHERE id = :id`, { ":id": id });
            return row ? row.id : null;
        },

        listByRole(role, userId) {
            let whereClause = "";
            if (role === "alumno") {
                whereClause = `WHERE a.student_id = (SELECT id FROM students WHERE user_id = :uid)`;
            } else if (role === "empresa") {
                whereClause = `WHERE a.company_id = (SELECT id FROM companies WHERE user_id = :uid)`;
            } else if (role === "centro") {
                whereClause = `WHERE a.center_id = (SELECT id FROM centers WHERE user_id = :uid)`;
            } else if (role === "admin") {
                whereClause = ``; // Admin ve todo
            }

            const query = `
                SELECT a.*, 
                       u.name AS student_name, 
                       i.title AS internship_title, 
                       c.company_name AS company_name
                FROM practice_assignments a
                JOIN students s ON s.id = a.student_id
                JOIN users u ON u.id = s.user_id
                JOIN internships i ON i.id = a.internship_id
                JOIN companies c ON c.id = a.company_id
                ${whereClause}
                ORDER BY a.assigned_at DESC
            `;
            const params = (role === "admin") ? {} : { ":uid": userId };
            return all(query, params);
        },

        updateStatus({ id, status, updatedAt }) {
            run(
                `UPDATE asignaciones_practica
                 SET estado = :status,
                     actualizado_en = :updatedAt
                 WHERE id = :id`,
                {
                    ":id": id,
                    ":status": status,
                    ":updatedAt": updatedAt
                }
            );

            return get(`SELECT * FROM practice_assignments WHERE id = :id`, { ":id": id });
        }
    };
}

module.exports = { createAssignmentsRepository };
