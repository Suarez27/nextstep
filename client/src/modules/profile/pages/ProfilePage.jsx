import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { api, resolveFileUrl } from '../../../services/api';
import { useCatalogDocumentType, useCatalogItems, useCatalogOptions } from '../../../shared/hooks/useCatalogs';
import CompanyDetailPanel from '../../companies/components/CompanyDetailPanel';
import {
  Alert,
  Button,
  EmptyState,
  FormActions,
  FormField,
  FormRow,
  LoadingState,
  PageHeader,
  SectionHeader,
  StatCard,
  StatusBadge,
} from '../../../shared/components/ui';

const PDF_MAX_SIZE = 5 * 1024 * 1024;

function isPdfFile(file) {
  return file?.type === 'application/pdf' || file?.name?.toLowerCase().endsWith('.pdf');
}

function formatDate(value) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function normalizeStatus(status, hasDocument) {
  if (status) return String(status).toLowerCase();
  return hasDocument ? 'entregado' : 'pendiente';
}

function buildDocumentRows(documentTypes, documents) {
  const byType = new Map();
  documents.forEach((document) => {
    const typeId = String(document.document_type_item_id);
    if (!byType.has(typeId)) {
      byType.set(typeId, document);
    }
  });

  const rows = documentTypes.map((type) => ({
    id: type.id,
    type,
    document: byType.get(String(type.id)) || null,
  }));

  documents.forEach((document) => {
    if (!documentTypes.some((type) => String(type.id) === String(document.document_type_item_id))) {
      rows.push({
        id: `document-${document.id}`,
        type: {
          id: document.document_type_item_id,
          value: document.document_type_value,
          label: document.document_type_label || 'Documento',
        },
        document,
      });
    }
  });

  return rows;
}

function StudentProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ cv_text: '', skills: '' });
  const [cvPdfUrl, setCvPdfUrl] = useState('');
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const { item: cvPdfDocumentType, meta: cvPdfMeta } = useCatalogDocumentType('document_types', 'cv_pdf');

  useEffect(() => {
    api.myStudentProfile()
      .then((p) => {
        setForm({ cv_text: p.cv_text || '', skills: p.skills || '' });
        setCvPdfUrl(p.cv_pdf_url || '');
        setValidated(!!p.validated);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  async function handleCvPdfChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setMsg('');
      setErr('El archivo debe ser un PDF.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMsg('');
      setErr('El PDF supera el limite de 5MB.');
      return;
    }

    setUploadingPdf(true);
    setMsg('');
    setErr('');
    try {
      const updated = await api.uploadStudentCvPdf(file);
      setCvPdfUrl(updated.cv_pdf_url || '');
      setValidated(!!updated.validated);
      setMsg('CV en PDF subido correctamente. Pendiente de validacion por el centro.');
    } catch (error) {
      setErr(error.message);
    } finally {
      setUploadingPdf(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(''); setErr('');
    setSaving(true);
    try {
      await api.updateStudentProfile(form);
      setMsg('Perfil guardado. Pendiente de validación por el centro.');
      setValidated(false);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div className="page">
      <PageHeader
        title="Mi Perfil"
        subtitle="Mantén tu perfil actualizado para que las empresas puedan encontrarte"
        actions={
          validated ? (
            <span className="badge badge-green badge-lg">&#9989; Validado</span>
          ) : (
            <span className="badge badge-amber badge-lg">&#9203; Pendiente de validación</span>
          )
        }
      />

      <div className="profile-card">
        <div className="profile-avatar-big">{user?.name?.[0]?.toUpperCase()}</div>
        <div>
          <div className="profile-name">{user?.name}</div>
          <div className="profile-email">{user?.email}</div>
          <div className="profile-role-tag">Alumno FP</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        <FormField
          label="Currículum (CV)"
          hint={`${form.cv_text.length}/6000 caracteres`}
        >
          <textarea
            value={form.cv_text}
            onChange={(e) => setForm((f) => ({ ...f, cv_text: e.target.value }))}
            rows={8}
            placeholder="Describe tu formación, experiencia, proyectos..."
            maxLength={6000}
          />
        </FormField>

        <FormField
          label={cvPdfDocumentType?.label || 'CV en PDF'}
          hint={
            uploadingPdf
              ? 'Subiendo PDF...'
              : cvPdfDocumentType
                ? `${cvPdfDocumentType.label}. Maximo 5MB. Formato permitido: ${cvPdfMeta.accept || 'PDF'}.`
                : 'Maximo 5MB. Formato permitido: PDF.'
          }
        >
          <input
            type="file"
            accept={cvPdfMeta.accept ? `application/pdf,${cvPdfMeta.accept}` : 'application/pdf,.pdf'}
            onChange={handleCvPdfChange}
            disabled={uploadingPdf}
          />
          {cvPdfUrl && (
            <a href={resolveFileUrl(cvPdfUrl)} target="_blank" rel="noreferrer">
              Ver CV PDF actual
            </a>
          )}
        </FormField>

        <FormField
          label="Habilidades"
          hint="Separa las habilidades con comas"
        >
          <input
            type="text"
            value={form.skills}
            onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
            placeholder="JavaScript, React, SQL, Python..."
            maxLength={1500}
          />
        </FormField>

        {form.skills && (
          <div className="skills-preview">
            {form.skills.split(',').map((s) => s.trim()).filter(Boolean).map((s) => (
              <span key={s} className="skill-tag">{s}</span>
            ))}
          </div>
        )}

        {msg && <Alert>{msg}</Alert>}
        {err && <Alert variant="error">{err}</Alert>}

        <FormActions>
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar perfil'}
          </Button>
        </FormActions>
      </form>

    </div>
  );
}

function StudentProfileHd1() {
  const { user } = useAuth();
  const [form, setForm] = useState({ cv_text: '', skills: '' });
  const [cvPdfUrl, setCvPdfUrl] = useState('');
  const [validated, setValidated] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingByType, setUploadingByType] = useState({});
  const [notesByType, setNotesByType] = useState({});
  const { item: cvPdfDocumentType, meta: cvPdfMeta } = useCatalogDocumentType('document_types', 'cv_pdf');
  const {
    items: documentTypes,
    loading: loadingDocumentTypes,
    error: documentTypesError,
  } = useCatalogItems('document_types');

  const loadStudentData = useCallback(async () => {
    setLoading(true);
    try {
      const [profile, studentDocuments] = await Promise.all([
        api.myStudentProfile(),
        api.myStudentDocuments(),
      ]);

      setForm({ cv_text: profile.cv_text || '', skills: profile.skills || '' });
      setCvPdfUrl(profile.cv_pdf_url || '');
      setValidated(!!profile.validated);
      setDocuments(studentDocuments || []);
    } catch (error) {
      setErr(error.message || 'No se pudo cargar tu perfil.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStudentData(); }, [loadStudentData]);

  const documentRows = useMemo(
    () => buildDocumentRows(documentTypes, documents),
    [documentTypes, documents]
  );

  const missingRows = useMemo(
    () => documentRows.filter((row) => !row.document || normalizeStatus(row.document.status, true) === 'pendiente'),
    [documentRows]
  );

  const rejectedRows = useMemo(
    () => documentRows.filter((row) => normalizeStatus(row.document?.status, Boolean(row.document)) === 'rechazado'),
    [documentRows]
  );

  const deliveredCount = useMemo(
    () => documentRows.filter((row) => ['entregado', 'validado'].includes(normalizeStatus(row.document?.status, Boolean(row.document)))).length,
    [documentRows]
  );

  function mergeUploadedDocument(uploadedDocument) {
    setDocuments((current) => [
      uploadedDocument,
      ...current.filter((document) => (
        document.document_type_item_id !== uploadedDocument.document_type_item_id
        && document.id !== uploadedDocument.id
      )),
    ]);

    if (uploadedDocument.document_type_value === 'cv_pdf') {
      setCvPdfUrl(uploadedDocument.file_url || '');
    }
  }

  function validatePdf(file) {
    if (!isPdfFile(file)) {
      setMsg('');
      setErr('El archivo debe ser un PDF.');
      return false;
    }

    if (file.size > PDF_MAX_SIZE) {
      setMsg('');
      setErr('El PDF supera el limite de 5MB.');
      return false;
    }

    return true;
  }

  async function handleCvPdfChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!validatePdf(file)) return;

    setUploadingPdf(true);
    setMsg('');
    setErr('');
    try {
      const updated = await api.uploadStudentCvPdf(file);
      setCvPdfUrl(updated.cv_pdf_url || '');
      setValidated(!!updated.validated);
      const studentDocuments = await api.myStudentDocuments();
      setDocuments(studentDocuments || []);
      setMsg('CV en PDF subido correctamente. Pendiente de validacion por el centro.');
    } catch (error) {
      setErr(error.message);
    } finally {
      setUploadingPdf(false);
    }
  }

  async function handleDocumentChange(row, e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!validatePdf(file)) return;

    const documentTypeItemId = row.type.id;
    setUploadingByType((current) => ({ ...current, [documentTypeItemId]: true }));
    setMsg('');
    setErr('');

    try {
      const uploadedDocument = await api.uploadStudentDocument({
        documentTypeItemId,
        file,
        notes: notesByType[documentTypeItemId],
      });

      mergeUploadedDocument(uploadedDocument);
      setValidated(false);
      setMsg(`${row.document ? 'Documento reemplazado' : 'Documento subido'} correctamente.`);
    } catch (error) {
      setErr(error.message);
    } finally {
      setUploadingByType((current) => ({ ...current, [documentTypeItemId]: false }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(''); setErr('');
    setSaving(true);
    try {
      await api.updateStudentProfile(form);
      setMsg('Perfil guardado. Pendiente de validacion por el centro.');
      setValidated(false);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  const profileStatus = validated ? 'validado' : 'pendiente';

  return (
    <div className="page">
      <PageHeader
        title="Mi perfil profesional"
        subtitle="Actualiza tu CV y expediente documental para que el centro pueda revisarlo"
        actions={
          <StatusBadge
            status={profileStatus}
            className="badge-lg"
            label={validated ? 'Perfil validado' : 'Pendiente de validacion'}
          />
        }
      />

      <div className="stats-row">
        <StatCard icon="&#128100;" label="Perfil general" value={validated ? 'Validado' : 'Pendiente'} color={validated ? 'green' : 'amber'} />
        <StatCard icon="&#128196;" label="Documentos entregados" value={deliveredCount} color="blue" />
        <StatCard icon="&#9203;" label="Documentos pendientes" value={missingRows.length} color={missingRows.length ? 'amber' : 'green'} />
        <StatCard icon="&#9888;" label="Documentos rechazados" value={rejectedRows.length} color={rejectedRows.length ? 'red' : 'green'} />
      </div>

      <div className="profile-card">
        <div className="profile-avatar-big">{user?.name?.[0]?.toUpperCase()}</div>
        <div>
          <div className="profile-name">{user?.name}</div>
          <div className="profile-email">{user?.email}</div>
          <div className="profile-card-tags">
            <div className="profile-role-tag">Alumno FP</div>
            <StatusBadge status={profileStatus} label={validated ? 'Validado' : 'Pendiente de validacion'} />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        <FormField
          label="CV texto"
          hint={`${form.cv_text.length}/6000 caracteres`}
        >
          <textarea
            value={form.cv_text}
            onChange={(e) => setForm((f) => ({ ...f, cv_text: e.target.value }))}
            rows={8}
            placeholder="Describe tu formacion, experiencia, proyectos..."
            maxLength={6000}
          />
        </FormField>

        <FormField
          label={cvPdfDocumentType?.label || 'CV en PDF'}
          hint={
            uploadingPdf
              ? 'Subiendo PDF...'
              : cvPdfDocumentType
                ? `${cvPdfDocumentType.label}. Maximo 5MB. Formato permitido: ${cvPdfMeta.accept || 'PDF'}.`
                : 'Maximo 5MB. Formato permitido: PDF.'
          }
        >
          <input
            type="file"
            accept={cvPdfMeta.accept ? `application/pdf,${cvPdfMeta.accept}` : 'application/pdf,.pdf'}
            onChange={handleCvPdfChange}
            disabled={uploadingPdf}
          />
          {cvPdfUrl && (
            <a className="file-link" href={resolveFileUrl(cvPdfUrl)} target="_blank" rel="noreferrer">
              Ver CV PDF actual
            </a>
          )}
        </FormField>

        <FormField
          label="Habilidades"
          hint="Separa las habilidades con comas"
        >
          <input
            type="text"
            value={form.skills}
            onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
            placeholder="JavaScript, React, SQL, Python..."
            maxLength={1500}
          />
        </FormField>

        {form.skills && (
          <div className="skills-preview">
            {form.skills.split(',').map((s) => s.trim()).filter(Boolean).map((s) => (
              <span key={s} className="skill-tag">{s}</span>
            ))}
          </div>
        )}

        {msg && <Alert>{msg}</Alert>}
        {err && <Alert variant="error">{err}</Alert>}

        <FormActions>
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar perfil'}
          </Button>
        </FormActions>
      </form>

      <section className="form-card student-documents-card">
        <SectionHeader
          title="Mis documentos"
          action={loadingDocumentTypes ? <span className="field-hint">Cargando tipos...</span> : null}
        />

        {documentTypesError && <Alert variant="error">{documentTypesError}</Alert>}

        {rejectedRows.length > 0 && (
          <div className="doc-alert doc-alert-red">
            <strong>Documentos rechazados:</strong>{' '}
            {rejectedRows.map((row) => row.type.label).join(', ')}.
          </div>
        )}

        {missingRows.length > 0 && (
          <div className="doc-alert doc-alert-amber">
            <strong>Documentos pendientes:</strong>{' '}
            {missingRows.map((row) => row.type.label).join(', ')}.
          </div>
        )}

        {!loadingDocumentTypes && documentRows.length === 0 ? (
          <EmptyState
            icon="&#128196;"
            message="No hay tipos de documento activos para mostrar."
          />
        ) : (
          <div className="student-documents-grid">
            {documentRows.map((row) => {
              const document = row.document;
              const status = normalizeStatus(document?.status, Boolean(document));
              const isUploading = Boolean(uploadingByType[row.type.id]);

              return (
                <article key={row.id} className={`student-document-card status-${status}`}>
                  <div className="student-document-head">
                    <div>
                      <h3>{row.type.label || 'Documento'}</h3>
                      <p>{document?.original_name || 'Sin archivo entregado'}</p>
                    </div>
                    <StatusBadge status={status} />
                  </div>

                  <dl className="document-meta">
                    <div>
                      <dt>Subido</dt>
                      <dd>{formatDate(document?.uploaded_at || document?.created_at)}</dd>
                    </div>
                    <div>
                      <dt>Tipo</dt>
                      <dd>{row.type.value || document?.document_type_value || '-'}</dd>
                    </div>
                  </dl>

                  {document?.notes && (
                    <div className="document-notes">
                      <span>Observaciones</span>
                      <p>{document.notes}</p>
                    </div>
                  )}

                  <div className="document-actions">
                    {document?.file_url && (
                      <a className="btn-ghost document-open-link" href={resolveFileUrl(document.file_url)} target="_blank" rel="noreferrer">
                        Abrir documento
                      </a>
                    )}

                    <FormField
                      label={document ? 'Reemplazar PDF' : 'Subir PDF'}
                      hint={isUploading ? 'Subiendo...' : 'Maximo 5MB'}
                    >
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(e) => handleDocumentChange(row, e)}
                        disabled={isUploading}
                      />
                    </FormField>
                  </div>

                  <FormField label="Notas para esta entrega">
                    <input
                      type="text"
                      maxLength={500}
                      value={notesByType[row.type.id] || ''}
                      onChange={(e) => setNotesByType((current) => ({
                        ...current,
                        [row.type.id]: e.target.value,
                      }))}
                      placeholder="Opcional"
                    />
                  </FormField>
                </article>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}

function CompanyProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    company_name: '',
    sector: '',
    city: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    contact_person: '',
  });
  const [company, setCompany] = useState(null);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const { options: sectorOptions, loading: loadingSectors } = useCatalogOptions('sectors');

  const applyCompanyData = useCallback((data) => {
    if (!data) return;

    setCompany(data);
    setForm({
      company_name: data.company_name || '',
      sector: data.sector || '',
      city: data.city || '',
      description: data.description || '',
      contact_email: data.contact_email || '',
      contact_phone: data.contact_phone || '',
      contact_person: data.contact_person || '',
    });
    setInternships(data.internships || []);
  }, []);

  const loadCompanyProfile = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await api.myCompanyProfile();
      if (!profile) return;

      applyCompanyData(profile);
      const detail = await api.getCompanyDetail(profile.id);
      applyCompanyData(detail);
    } catch {
      /* keep the profile page usable even if detail fails */
    } finally {
      setLoading(false);
    }
  }, [applyCompanyData]);

  useEffect(() => { loadCompanyProfile(); }, [loadCompanyProfile]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(''); setErr('');
    setSaving(true);
    try {
      const updated = await api.updateCompanyProfile(form);
      applyCompanyData({
        ...company,
        ...updated,
        internships,
      });
      try {
        if (updated?.id) {
          const detail = await api.getCompanyDetail(updated.id);
          applyCompanyData(detail);
        }
      } catch {
        /* profile was saved; keep the current preview if detail reload fails */
      }
      setMsg('Perfil de empresa actualizado correctamente.');
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  const previewCompany = {
    ...company,
    ...form,
    is_active: company?.is_active,
  };
  const isActive = Boolean(company?.is_active);

  return (
    <div className="page">
      <PageHeader
        title="Perfil de Empresa"
        subtitle="Información visible para alumnos y centros educativos"
        actions={
          <span className={`badge badge-lg ${isActive ? 'badge-green' : 'badge-red'}`}>
            {isActive ? 'Activa' : 'Inactiva'}
          </span>
        }
      />

      <div className="profile-card">
        <div className="profile-avatar-big company">{user?.name?.[0]?.toUpperCase()}</div>
        <div>
          <div className="profile-name">{form.company_name || user?.name}</div>
          <div className="profile-email">{user?.email}</div>
          <div className="profile-role-tag">Empresa</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        <FormField label="Nombre de la empresa">
          <input
            type="text"
            value={form.company_name}
            onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
            required
            maxLength={200}
            placeholder="Nombre de tu empresa"
          />
        </FormField>
        <FormRow>
          <FormField label="Sector" hint={loadingSectors ? 'Cargando catalogo de sectores...' : 'Selecciona un sector activo'}>
            <select
              value={form.sector}
              onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}
              placeholder="Tecnología, Salud, Comercio..."
              disabled={loadingSectors}
            >
              <option value="">Seleccionar...</option>
              {form.sector && !sectorOptions.some((option) => option.value === form.sector) && (
                <option value={form.sector}>{form.sector}</option>
              )}
              {sectorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Ciudad">
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              maxLength={120}
              placeholder="Madrid, Barcelona..."
            />
          </FormField>
        </FormRow>

        <FormField
          label="Descripcion"
          hint={`${form.description.length}/4000 caracteres`}
        >
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={5}
            maxLength={4000}
            placeholder="Presenta la actividad, entorno de practicas y tipo de colaboracion de la empresa."
          />
        </FormField>

        <FormRow>
          <FormField label="Persona de contacto">
            <input
              type="text"
              value={form.contact_person}
              onChange={(e) => setForm((f) => ({ ...f, contact_person: e.target.value }))}
              maxLength={150}
              placeholder="Nombre de la persona de referencia"
            />
          </FormField>

          <FormField label="Telefono de contacto">
            <input
              type="text"
              value={form.contact_phone}
              onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))}
              maxLength={50}
              placeholder="Telefono"
            />
          </FormField>
        </FormRow>

        <FormField label="Email de contacto">
          <input
            type="email"
            value={form.contact_email}
            onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
            maxLength={200}
            placeholder="contacto@empresa.com"
          />
        </FormField>

        {msg && <Alert>{msg}</Alert>}
        {err && <Alert variant="error">{err}</Alert>}

        <FormActions>
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </FormActions>
      </form>

      <div className="form-card company-preview-card">
        <CompanyDetailPanel company={previewCompany} internships={internships} />
      </div>
    </div>
  );
}

function CenterProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ center_name: '', city: '' });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.myCenterProfile()
      .then((p) => {
        if (p) setForm({ center_name: p.center_name || '', city: p.city || '' });
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(''); setErr('');
    setSaving(true);
    try {
      await api.updateCenterProfile(form);
      setMsg('Perfil del centro actualizado correctamente.');
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div className="page">
      <PageHeader
        title="Perfil del Centro"
        subtitle="Datos del centro educativo al que se vinculan tus alumnos"
      />

      <div className="profile-card">
        <div className="profile-avatar-big company">{user?.name?.[0]?.toUpperCase()}</div>
        <div>
          <div className="profile-name">{form.center_name || user?.name}</div>
          <div className="profile-email">{user?.email}</div>
          <div className="profile-role-tag">Centro Educativo</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        <FormField label="Nombre del centro">
          <input
            type="text"
            value={form.center_name}
            onChange={(e) => setForm((f) => ({ ...f, center_name: e.target.value }))}
            required
            maxLength={200}
            placeholder="IES Ejemplo"
          />
        </FormField>

        <FormField label="Ciudad">
          <input
            type="text"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            maxLength={120}
            placeholder="Madrid, Sevilla..."
          />
        </FormField>

        {msg && <Alert>{msg}</Alert>}
        {err && <Alert variant="error">{err}</Alert>}

        <FormActions>
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </FormActions>
      </form>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  if (user?.role === 'alumno') return <StudentProfileHd1 />;
  if (user?.role === 'empresa') return <CompanyProfile />;
  if (user?.role === 'centro') return <CenterProfile />;
  return (
    <div className="page">
      <h1 className="page-title">Perfil</h1>
      <p className="page-sub">Este rol no tiene perfil editable.</p>
    </div>
  );
}
