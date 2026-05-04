const STUDENT_DOCUMENT_SELECT = `SELECT
    id,
    student_id,
    document_type_item_id,
    document_type_value,
    document_type_label,
    file_url,
    original_name,
    mime_type,
    status,
    notes,
    requested_by_user_id,
    requested_by_name,
    validated_by_user_id,
    validated_by_name,
    uploaded_at,
    validated_at,
    expires_at,
    created_at,
    updated_at
 FROM student_documents`;

function createStudentsRepository({ get, all, run, lastInsertId }) {
    return {
        findProfileByUserId(userId) {
            return get(
                `SELECT s.id, s.center_id, s.cv_text, s.cv_pdf_url, s.skills, s.validated, u.name, u.email
         FROM students s
         JOIN users u ON u.id = s.user_id
         WHERE s.user_id = :uid`,
                { ":uid": userId }
            );
        },

        findStudentByUserId(userId) {
            return get(
                `SELECT id, user_id, center_id, cv_pdf_url, validated
         FROM students
         WHERE user_id = :uid`,
                { ":uid": userId }
            );
        },

        updateProfileByUserId({ userId, cvText, skills, cvPdfUrl, updatedAt }) {
            const updates = [];
            const params = {
                ":uid": userId,
                ":updated_at": updatedAt,
            };

            if (typeof cvText !== "undefined") {
                updates.push("texto_cv = :cv_text");
                params[":cv_text"] = cvText;
            }

            if (typeof skills !== "undefined") {
                updates.push("habilidades = :skills");
                params[":skills"] = skills;
            }

            if (typeof cvPdfUrl !== "undefined") {
                updates.push("url_cv_pdf = :cv_pdf_url");
                params[":cv_pdf_url"] = cvPdfUrl;
            }

            if (updates.length === 0) return;

            updates.push("validado = 0");
            updates.push("actualizado_en = :updated_at");

            run(
                `UPDATE alumnos
         SET ${updates.join(", ")}
         WHERE usuario_id = :uid`,
                params
            );
        },

        updateCvPdfByUserId({ userId, cvPdfUrl, updatedAt }) {
            run(
                `UPDATE alumnos
         SET url_cv_pdf = :cv_pdf_url,
             validado = 0,
             actualizado_en = :updated_at
         WHERE usuario_id = :uid`,
                {
                    ":cv_pdf_url": cvPdfUrl,
                    ":updated_at": updatedAt,
                    ":uid": userId,
                }
            );
        },

        findDocumentsByStudentId(studentId) {
            return all(
                `${STUDENT_DOCUMENT_SELECT}
                 WHERE student_id = :student_id
                 ORDER BY uploaded_at DESC, created_at DESC, id DESC`,
                { ":student_id": studentId }
            );
        },

        findDocumentById(id) {
            return get(
                `${STUDENT_DOCUMENT_SELECT}
                 WHERE id = :id`,
                { ":id": id }
            );
        },

        findLatestDocumentByStudentAndType({ studentId, documentTypeItemId }) {
            return get(
                `${STUDENT_DOCUMENT_SELECT}
                 WHERE student_id = :student_id
                   AND document_type_item_id = :document_type_item_id
                 ORDER BY uploaded_at DESC, created_at DESC, id DESC
                 LIMIT 1`,
                {
                    ":student_id": studentId,
                    ":document_type_item_id": documentTypeItemId,
                }
            );
        },

        findDocumentTypeItemById(id) {
            return get(
                `SELECT ci.id, ci.value, ci.label, ci.is_active, c.is_active AS catalog_is_active, c.\`key\` AS catalog_key
                 FROM catalog_items ci
                 JOIN catalogs c ON c.id = ci.catalog_id
                 WHERE ci.id = :id`,
                { ":id": id }
            );
        },

        findDocumentTypeItemByValue({ catalogKey, value }) {
            return get(
                `SELECT ci.id, ci.value, ci.label, ci.is_active, c.is_active AS catalog_is_active, c.\`key\` AS catalog_key
                 FROM catalog_items ci
                 JOIN catalogs c ON c.id = ci.catalog_id
                 WHERE c.\`key\` = :catalog_key
                   AND c.is_active = 1
                   AND ci.value = :value
                   AND ci.is_active = 1
                 LIMIT 1`,
                {
                    ":catalog_key": catalogKey,
                    ":value": value,
                }
            );
        },

        createStudentDocument({
            studentId,
            documentTypeItemId,
            fileUrl,
            originalName,
            mimeType,
            notes,
            uploadedAt,
            createdAt,
            updatedAt,
            requestedByUserId,
            status,
        }) {
            run(
                `INSERT INTO documentos_alumno (
                    alumno_id,
                    document_type_item_id,
                    url_archivo,
                    nombre_original,
                    mime_type,
                    estado,
                    notas,
                    requested_by_user_id,
                    subido_en,
                    creado_en,
                    actualizado_en
                )
                 VALUES (
                    :student_id,
                    :document_type_item_id,
                    :file_url,
                    :original_name,
                    :mime_type,
                    :status,
                    :notes,
                    :requested_by_user_id,
                    :uploaded_at,
                    :created_at,
                    :updated_at
                )`,
                {
                    ":student_id": studentId,
                    ":document_type_item_id": documentTypeItemId,
                    ":file_url": fileUrl,
                    ":original_name": originalName,
                    ":mime_type": mimeType,
                    ":status": status,
                    ":notes": notes,
                    ":requested_by_user_id": requestedByUserId,
                    ":uploaded_at": uploadedAt,
                    ":created_at": createdAt,
                    ":updated_at": updatedAt,
                }
            );
        },

        updateStudentDocument({
            id,
            fileUrl,
            originalName,
            mimeType,
            notes,
            uploadedAt,
            updatedAt,
        }) {
            run(
                `UPDATE documentos_alumno
                 SET url_archivo = :file_url,
                     nombre_original = :original_name,
                     mime_type = :mime_type,
                     estado = 'entregado',
                     notas = :notes,
                     validated_by_user_id = NULL,
                     validado_en = NULL,
                     subido_en = :uploaded_at,
                     actualizado_en = :updated_at
                 WHERE id = :id`,
                {
                    ":id": id,
                    ":file_url": fileUrl,
                    ":original_name": originalName,
                    ":mime_type": mimeType,
                    ":notes": notes,
                    ":uploaded_at": uploadedAt,
                    ":updated_at": updatedAt,
                }
            );
        },

        findValidatedByCenterId(centerId) {
            return all(
                `SELECT s.id, s.center_id, s.cv_text, s.cv_pdf_url, s.skills, u.name, u.email
         FROM students s
         JOIN users u ON u.id = s.user_id
         WHERE s.validated = 1 AND s.center_id = :cid
         ORDER BY u.name ASC`,
                { ":cid": centerId }
            );
        },

        findValidatedAll() {
            return all(
                `SELECT s.id, s.center_id, s.cv_text, s.cv_pdf_url, s.skills, u.name, u.email, c.center_name
         FROM students s
         JOIN users u ON u.id = s.user_id
         LEFT JOIN centers c ON c.id = s.center_id
         WHERE s.validated = 1
         ORDER BY u.name ASC`
            );
        },

        findAllByCenterId(centerId) {
            return all(
                `SELECT s.id, s.center_id, s.cv_text, s.cv_pdf_url, s.skills, s.validated, u.name, u.email
         FROM students s
         JOIN users u ON u.id = s.user_id
         WHERE s.center_id = :cid
         ORDER BY s.validated ASC, u.name ASC`,
                { ":cid": centerId }
            );
        },

        findAllDetailed() {
            return all(
                `SELECT s.id, s.center_id, s.cv_text, s.cv_pdf_url, s.skills, s.validated, u.name, u.email, c.center_name
         FROM students s
         JOIN users u ON u.id = s.user_id
         LEFT JOIN centers c ON c.id = s.center_id
         ORDER BY s.validated ASC, u.name ASC`
            );
        },

        findStudentDetailById(studentId) {
            return get(
                `SELECT
                    s.id,
                    s.user_id,
                    s.center_id,
                    s.cv_text,
                    s.cv_pdf_url,
                    s.skills,
                    s.validated,
                    s.created_at,
                    u.name,
                    u.email,
                    c.center_name
                 FROM students s
                 JOIN users u ON u.id = s.user_id
                 LEFT JOIN centers c ON c.id = s.center_id
                 WHERE s.id = :id`,
                { ":id": studentId }
            );
        },

        updateDocumentReview({
            documentId,
            status,
            notes,
            validatedByUserId,
            validatedAt,
            updatedAt,
        }) {
            run(
                `UPDATE documentos_alumno
                 SET estado = :status,
                     notas = CASE WHEN :notes IS NULL THEN notas ELSE :notes END,
                     validated_by_user_id = :validated_by_user_id,
                     validado_en = :validated_at,
                     actualizado_en = :updated_at
                 WHERE id = :id`,
                {
                    ":id": documentId,
                    ":status": status,
                    ":notes": notes,
                    ":validated_by_user_id": validatedByUserId,
                    ":validated_at": validatedAt,
                    ":updated_at": updatedAt,
                }
            );
        },

        emailExists(email) {
            return get("SELECT id FROM users WHERE email = :email", {
                ":email": email.toLowerCase(),
            });
        },

        centerExists(centerId) {
            return get("SELECT id FROM centers WHERE id = :id", {
                ":id": centerId,
            });
        },

        createStudentUser({ name, email, passwordHash, createdAt }) {
            const safeEmail = email.toLowerCase();

            run(
                `INSERT INTO users (name, email, password_hash, role, created_at)
     VALUES (:name, :email, :password_hash, 'alumno', :created_at)`,
                {
                    ":name": name,
                    ":email": safeEmail,
                    ":password_hash": passwordHash,
                    ":created_at": createdAt,
                }
            );

            const createdUser = get(
                "SELECT id FROM users WHERE email = :email",
                { ":email": safeEmail }
            );

            return createdUser ? createdUser.id : null;
        },

        createStudentRecord({ userId, centerId, createdAt }) {
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

        findCreatedSummaryByUserId(userId) {
            return get(
                `SELECT s.id, s.center_id, s.validated, u.name, u.email
         FROM students s
         JOIN users u ON u.id = s.user_id
         WHERE s.user_id = :uid`,
                { ":uid": userId }
            );
        },

        findStudentById(studentId) {
            return get(
                `SELECT id, user_id, center_id, validated
         FROM students
         WHERE id = :id`,
                { ":id": studentId }
            );
        },

        validateStudent(studentId) {
            run("UPDATE students SET validated = 1 WHERE id = :id", {
                ":id": studentId,
            });
        },

        findValidationResult(studentId) {
            return get(
                "SELECT id, validated FROM students WHERE id = :id",
                { ":id": studentId }
            );
        },

        updateUserPassword({ userId, passwordHash }) {
            run(
                "UPDATE users SET password_hash = :hash WHERE id = :uid",
                {
                    ":hash": passwordHash,
                    ":uid": userId,
                }
            );
        },
    };
}

module.exports = { createStudentsRepository };
