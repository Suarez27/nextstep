# HD1 - Estado actual de BD

No generar scripts SQL. La BD ya fue modificada manualmente en phpMyAdmin.

## Cambios ya aplicados
- Tabla `alumnos`:
  - ya existe `actualizado_en` varchar(40) nullable
  - se mantiene `url_cv_pdf`
  - se mantiene `validado` como validación general del alumno/perfil
- Vista `students`:
  - expone `updated_at`
- Nueva tabla real en español: `documentos_alumno`
  - id
  - alumno_id
  - document_type_item_id
  - url_archivo
  - nombre_original
  - mime_type
  - estado enum('pendiente','entregado','validado','rechazado')
  - notas
  - requested_by_user_id
  - validated_by_user_id
  - subido_en
  - validado_en
  - expira_en
  - creado_en
  - actualizado_en
- Nueva vista API-friendly en inglés: `student_documents`
  - id
  - student_id
  - document_type_item_id
  - document_type_value
  - document_type_label
  - file_url
  - original_name
  - mime_type
  - status
  - notes
  - requested_by_user_id
  - requested_by_name
  - validated_by_user_id
  - validated_by_name
  - uploaded_at
  - validated_at
  - expires_at
  - created_at
  - updated_at

## Catálogos
- `catalogos`: `document_types` tiene id = 3
- `catalogo_items`: `cv_pdf` tiene id = 12

## Compatibilidad importante
- NO eliminar ni renombrar `alumnos.url_cv_pdf`
- NO cambiar el significado de `alumnos.validado`
- Para HD1:
  - usar `students` y `student_documents` para lectura cuando tenga sentido
  - usar `alumnos` y `documentos_alumno` para escritura
- Ya se migraron los CV PDF existentes desde `alumnos.url_cv_pdf` a `documentos_alumno`