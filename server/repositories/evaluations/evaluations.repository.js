function createEvaluationsRepository({ get, run, lastInsertId }) {
    return {
        create({ payload, createdAt, authorUserId }) {
            run(
                `INSERT INTO evaluaciones_finales 
                 (asignacion_id, usuario_autor_id, resultado, calificacion, resumen, detalles, creado_en)
                 VALUES 
                 (:asignacion_id, :usuario_autor_id, :resultado, :calificacion, :resumen, :detalles, :creado_en)`,
                {
                    ":asignacion_id": payload.assignment_id,
                    ":usuario_autor_id": authorUserId,
                    ":resultado": payload.resultado,
                    ":calificacion": payload.calificacion || null,
                    ":resumen": payload.resumen,
                    ":detalles": payload.detalles || null,
                    ":creado_en": createdAt
                }
            );

            return lastInsertId();
        },

        findByAssignmentId(assignmentId) {
            return get(
                `SELECT * FROM final_evaluations WHERE assignment_id = :aid`,
                { ":aid": assignmentId }
            );
        }
    };
}

module.exports = { createEvaluationsRepository };
