function createPracticeMatchesRepository({ get, all, run, lastInsertId }) {
    return {
        getMatchesByInternship: (internshipId, centerId) => {
            const sql = `
                SELECT 
                    s.id as student_id,
                    u.name as student_name,
                    u.email as student_email,
                    s.skills,
                    pm.id as match_id,
                    pm.match_status,
                    pm.score,
                    pm.notes
                FROM students s
                JOIN users u ON s.user_id = u.id
                LEFT JOIN practice_matches pm ON s.id = pm.student_id AND pm.internship_id = :internship_id
                WHERE s.center_id = :center_id
            `;
            return all(sql, { ":internship_id": internshipId, ":center_id": centerId });
        },

        upsertMatch: (data) => {
            const { internshipId, studentId, centerId, matchStatus, score, notes, createdByUserId, createdAt, updatedAt } = data;
            
            const existing = get(
                `SELECT id FROM recomendaciones_practica 
                 WHERE practica_id = :internship_id 
                 AND alumno_id = :student_id 
                 AND centro_id = :center_id`,
                {
                    ":internship_id": internshipId,
                    ":student_id": studentId,
                    ":center_id": centerId
                }
            );

            if (existing) {
                run(
                    `UPDATE recomendaciones_practica 
                     SET estado_matching = :status, 
                         puntuacion = :score, 
                         notas = :notes, 
                         actualizado_en = :updated_at
                     WHERE id = :id`,
                    {
                        ":id": existing.id,
                        ":status": matchStatus,
                        ":score": score || null,
                        ":notes": notes || null,
                        ":updated_at": updatedAt
                    }
                );
                return existing.id;
            } else {
                run(
                    `INSERT INTO recomendaciones_practica (
                        practica_id, alumno_id, centro_id, estado_matching, 
                        puntuacion, notas, creado_por_usuario_id, creado_en, actualizado_en
                     ) VALUES (
                        :internship_id, :student_id, :center_id, :status, 
                        :score, :notes, :created_by, :created_at, :updated_at
                     )`,
                    {
                        ":internship_id": internshipId,
                        ":student_id": studentId,
                        ":center_id": centerId,
                        ":status": matchStatus,
                        ":score": score || null,
                        ":notes": notes || null,
                        ":created_by": createdByUserId,
                        ":created_at": createdAt,
                        ":updated_at": updatedAt
                    }
                );
                return lastInsertId();
            }
        }
    };
}

module.exports = { createPracticeMatchesRepository };
