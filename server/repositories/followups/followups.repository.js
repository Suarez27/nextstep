function createFollowupsRepository({ all, run, lastInsertId }) {
    return {
        create({ assignmentId, authorUserId, content, progress, createdAt }) {
            // Buscamos el ID del alumno asociado a la asignación
            const assignment = all(`SELECT alumno_id FROM asignaciones_practica WHERE id = :aid`, { ":aid": assignmentId })[0];
            const realStudentId = assignment ? assignment.alumno_id : 1; // 1 de fallback por si acaso

            run(
                `INSERT INTO seguimientos (asignacion_id, alumno_id, usuario_autor_id, contenido, progreso, creado_en)
                 VALUES (:asignacion_id, :alumno_id, :usuario_autor_id, :contenido, :progreso, :creado_en)`,
                {
                    ":asignacion_id": assignmentId,
                    ":alumno_id": realStudentId,
                    ":usuario_autor_id": authorUserId,
                    ":contenido": content,
                    ":progreso": progress || 0,
                    ":creado_en": createdAt,
                }
            );

            return lastInsertId();
        },

        listByAssignmentId(assignmentId) {
            return all(
                `SELECT f.id, f.content, f.progress, f.created_at, u.name AS author_name
                 FROM followups f
                 JOIN users u ON u.id = f.author_user_id
                 WHERE f.assignment_id = :aid
                 ORDER BY f.created_at DESC`,
                { ":aid": assignmentId }
            );
        },
    };
}

module.exports = { createFollowupsRepository };