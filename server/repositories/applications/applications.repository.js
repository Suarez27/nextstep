const APPLICATION_LIST_SELECT = `
    SELECT
        c.id,
        c.practica_id AS internship_id,
        i.title AS internship_title,
        i.title AS title,
        i.status AS internship_status,
        i.is_active AS internship_is_active,
        i.company_id,
        i.company_name,
        s.id AS student_id,
        s.user_id AS student_user_id,
        u.name AS student_name,
        u.email AS student_email,
        s.center_id,
        ce.center_name,
        s.cv_text,
        s.cv_pdf_url,
        s.skills,
        s.validated AS student_validated,
        c.estado AS status,
        c.notas_internas AS internal_notes,
        c.creado_en AS created_at,
        c.actualizado_en AS updated_at,
        pm.estado_matching AS match_status
    FROM candidaturas c
    JOIN internships i ON i.id = c.practica_id
    JOIN students s ON s.id = c.alumno_id
    JOIN users u ON u.id = s.user_id
    LEFT JOIN centers ce ON ce.id = s.center_id
    LEFT JOIN recomendaciones_practica pm ON pm.practica_id = c.practica_id AND pm.alumno_id = c.alumno_id`;

const APPLICATION_DETAIL_SELECT = `
    SELECT
        c.id,
        c.practica_id AS internship_id,
        i.title AS internship_title,
        i.title AS title,
        i.status AS internship_status,
        i.is_active AS internship_is_active,
        i.company_id,
        i.company_name,
        s.id AS student_id,
        s.user_id AS student_user_id,
        u.name AS student_name,
        u.email AS student_email,
        s.center_id,
        ce.center_name,
        s.cv_text,
        s.cv_pdf_url,
        s.skills,
        s.validated AS student_validated,
        c.estado AS status,
        c.notas_internas AS internal_notes,
        c.creado_en AS created_at,
        c.actualizado_en AS updated_at,
        i.description AS internship_description,
        i.hours_total,
        i.schedule,
        i.slots,
        i.available_slots,
        i.requirements,
        i.start_date,
        i.end_date,
        i.application_deadline,
        pm.estado_matching AS match_status
    FROM candidaturas c
    JOIN internships i ON i.id = c.practica_id
    JOIN students s ON s.id = c.alumno_id
    JOIN users u ON u.id = s.user_id
    LEFT JOIN centers ce ON ce.id = s.center_id
    LEFT JOIN recomendaciones_practica pm ON pm.practica_id = c.practica_id AND pm.alumno_id = c.alumno_id`;

function createApplicationsRepository({ get, all, run, lastInsertId }) {
    return {
        findStudentByUserId(userId) {
            return get("SELECT id, user_id, center_id FROM students WHERE user_id = :uid", {
                ":uid": userId,
            });
        },

        findInternshipById(id) {
            return get("SELECT id, company_id, status, is_active, available_slots FROM internships WHERE id = :id", {
                ":id": id,
            });
        },

        findCompanyByUserId(userId) {
            return get("SELECT id FROM companies WHERE user_id = :uid", {
                ":uid": userId,
            });
        },

        findCenterByUserId(userId) {
            return get("SELECT id FROM centers WHERE user_id = :uid", {
                ":uid": userId,
            });
        },

        findExistingApplication(internshipId, studentId) {
            return get(
                "SELECT id FROM candidaturas WHERE practica_id = :iid AND alumno_id = :sid",
                { ":iid": internshipId, ":sid": studentId }
            );
        },

        createApplication({ internshipId, studentId, createdAt }) {
            run(
                `INSERT INTO candidaturas (
                    practica_id,
                    alumno_id,
                    estado,
                    creado_en,
                    actualizado_en
                )
                 VALUES (
                    :internship_id,
                    :student_id,
                    'enviada',
                    :created_at,
                    :updated_at
                )`,
                {
                    ":internship_id": internshipId,
                    ":student_id": studentId,
                    ":created_at": createdAt,
                    ":updated_at": createdAt,
                }
            );

            // En MySQL, LAST_INSERT_ID() no es fiable aquí porque cada consulta
            // se ejecuta en un proceso/conexión distinto.
            const created = get(
                `SELECT id
                 FROM candidaturas
                 WHERE practica_id = :internship_id
                   AND alumno_id = :student_id
                 ORDER BY id DESC
                 LIMIT 1`,
                {
                    ":internship_id": internshipId,
                    ":student_id": studentId,
                }
            );

            return created ? created.id : lastInsertId();
        },

        listMyApplications(studentId) {
            return all(
                `${APPLICATION_LIST_SELECT}
                 WHERE c.alumno_id = :sid
                 ORDER BY c.creado_en DESC, c.id DESC`,
                { ":sid": studentId }
            );
        },

        listAllApplications() {
            return all(
                `${APPLICATION_LIST_SELECT}
                 ORDER BY c.creado_en DESC, c.id DESC`
            );
        },

        listByCompanyId(companyId) {
            return all(
                `${APPLICATION_LIST_SELECT}
                 WHERE i.company_id = :company_id
                 ORDER BY c.creado_en DESC, c.id DESC`,
                { ":company_id": companyId }
            );
        },

        listByCenterId(centerId) {
            return all(
                `${APPLICATION_LIST_SELECT}
                 WHERE s.center_id = :center_id
                 ORDER BY c.creado_en DESC, c.id DESC`,
                { ":center_id": centerId }
            );
        },

        listByInternshipId(internshipId, scope = {}) {
            const where = ["c.practica_id = :iid"];
            const params = { ":iid": internshipId };

            if (scope.centerId) {
                where.push("s.center_id = :center_id");
                params[":center_id"] = scope.centerId;
            }

            return all(
                `${APPLICATION_LIST_SELECT}
                 WHERE ${where.join(" AND ")}
                 ORDER BY c.creado_en DESC, c.id DESC`,
                params
            );
        },

        findApplicationDetailById(applicationId) {
            return get(
                `${APPLICATION_DETAIL_SELECT}
                 WHERE c.id = :id`,
                { ":id": applicationId }
            );
        },

        updateStatus({ applicationId, status, internalNotes, updatedAt }) {
            const hasInternalNotes = typeof internalNotes !== "undefined";

            run(
                `UPDATE candidaturas
                 SET estado = :status,
                     notas_internas = CASE
                        WHEN :has_internal_notes = 1 THEN :internal_notes
                        ELSE notas_internas
                     END,
                     actualizado_en = :updated_at
                 WHERE id = :id`,
                {
                    ":status": status,
                    ":has_internal_notes": hasInternalNotes ? 1 : 0,
                    ":internal_notes": hasInternalNotes ? internalNotes : null,
                    ":updated_at": updatedAt,
                    ":id": applicationId,
                }
            );
        },

        createEvent({
            applicationId,
            eventType,
            fromStatus,
            toStatus,
            actorUserId,
            notes,
            createdAt,
        }) {
            run(
                `INSERT INTO eventos_candidatura (
                    candidatura_id,
                    event_type,
                    from_status,
                    to_status,
                    actor_user_id,
                    notes,
                    creado_en
                )
                 VALUES (
                    :application_id,
                    :event_type,
                    :from_status,
                    :to_status,
                    :actor_user_id,
                    :notes,
                    :created_at
                )`,
                {
                    ":application_id": applicationId,
                    ":event_type": eventType,
                    ":from_status": fromStatus,
                    ":to_status": toStatus,
                    ":actor_user_id": actorUserId,
                    ":notes": notes,
                    ":created_at": createdAt,
                }
            );
        },

        listEventsByApplicationId(applicationId) {
            return all(
                `SELECT
                    id,
                    application_id,
                    event_type,
                    from_status,
                    to_status,
                    actor_user_id,
                    actor_name,
                    notes,
                    created_at
                 FROM application_events
                 WHERE application_id = :application_id
                 ORDER BY created_at ASC, id ASC`,
                { ":application_id": applicationId }
            );
        },
    };
}

module.exports = { createApplicationsRepository };
