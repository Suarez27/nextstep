import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { api } from '../../../services/api';
import { useCatalogDocumentType, useCatalogOptions } from '../../../shared/hooks/useCatalogs';
import {
  Alert,
  Button,
  FormActions,
  FormField,
  FormRow,
  LoadingState,
  PageHeader,
} from '../../../shared/components/ui';

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
            <a href={cvPdfUrl} target="_blank" rel="noreferrer">
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

function CompanyProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ company_name: '', sector: '', city: '' });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const { options: sectorOptions, loading: loadingSectors } = useCatalogOptions('sectors');

  useEffect(() => {
    api.myCompanyProfile()
      .then((p) => {
        if (p) setForm({ company_name: p.company_name || '', sector: p.sector || '', city: p.city || '' });
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(''); setErr('');
    setSaving(true);
    try {
      await api.updateCompanyProfile(form);
      setMsg('Perfil de empresa actualizado correctamente.');
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
        title="Perfil de Empresa"
        subtitle="Información visible para alumnos y centros educativos"
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
  if (user?.role === 'alumno') return <StudentProfile />;
  if (user?.role === 'empresa') return <CompanyProfile />;
  if (user?.role === 'centro') return <CenterProfile />;
  return (
    <div className="page">
      <h1 className="page-title">Perfil</h1>
      <p className="page-sub">Este rol no tiene perfil editable.</p>
    </div>
  );
}
