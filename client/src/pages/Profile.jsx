import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

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

  useEffect(() => {
    api.myStudentProfile()
      .then((p) => {
        setForm({ cv_text: p.cv_text || '', skills: p.skills || '' });
        setCvPdfUrl(p.cv_pdf_url || '');
        setValidated(!!p.validated);
      })
      .catch(() => {})
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

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mi Perfil</h1>
          <p className="page-sub">Mantén tu perfil actualizado para que las empresas puedan encontrarte</p>
        </div>
        {validated ? (
          <span className="badge badge-green badge-lg">&#9989; Validado</span>
        ) : (
          <span className="badge badge-amber badge-lg">&#9203; Pendiente de validación</span>
        )}
      </div>

      <div className="profile-card">
        <div className="profile-avatar-big">{user?.name?.[0]?.toUpperCase()}</div>
        <div>
          <div className="profile-name">{user?.name}</div>
          <div className="profile-email">{user?.email}</div>
          <div className="profile-role-tag">Alumno FP</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="field">
          <label>Currículum (CV)</label>
          <textarea
            value={form.cv_text}
            onChange={(e) => setForm((f) => ({ ...f, cv_text: e.target.value }))}
            rows={8}
            placeholder="Describe tu formación, experiencia, proyectos..."
            maxLength={6000}
          />
          <span className="field-hint">{form.cv_text.length}/6000 caracteres</span>
        </div>

        <div className="field">
          <label>CV en PDF</label>
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleCvPdfChange}
            disabled={uploadingPdf}
          />
          <span className="field-hint">Maximo 5MB. Formato permitido: PDF.</span>
          {uploadingPdf && <span className="field-hint">Subiendo PDF...</span>}
          {cvPdfUrl && (
            <a href={cvPdfUrl} target="_blank" rel="noreferrer">
              Ver CV PDF actual
            </a>
          )}
        </div>

        <div className="field">
          <label>Habilidades</label>
          <input
            type="text"
            value={form.skills}
            onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
            placeholder="JavaScript, React, SQL, Python..."
            maxLength={1500}
          />
          <span className="field-hint">Separa las habilidades con comas</span>
        </div>

        {form.skills && (
          <div className="skills-preview">
            {form.skills.split(',').map((s) => s.trim()).filter(Boolean).map((s) => (
              <span key={s} className="skill-tag">{s}</span>
            ))}
          </div>
        )}

        {msg && <div className="alert-success">{msg}</div>}
        {err && <div className="form-error">{err}</div>}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar perfil'}
          </button>
        </div>
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

  useEffect(() => {
    api.myCompanyProfile()
      .then((p) => {
        if (p) setForm({ company_name: p.company_name || '', sector: p.sector || '', city: p.city || '' });
      })
      .catch(() => {})
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

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Perfil de Empresa</h1>
          <p className="page-sub">Información visible para alumnos y centros educativos</p>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-big company">{user?.name?.[0]?.toUpperCase()}</div>
        <div>
          <div className="profile-name">{form.company_name || user?.name}</div>
          <div className="profile-email">{user?.email}</div>
          <div className="profile-role-tag">Empresa</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="field">
          <label>Nombre de la empresa</label>
          <input
            type="text"
            value={form.company_name}
            onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
            required
            maxLength={200}
            placeholder="Nombre de tu empresa"
          />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Sector</label>
            <input
              type="text"
              value={form.sector}
              onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}
              maxLength={120}
              placeholder="Tecnología, Salud, Comercio..."
            />
          </div>
          <div className="field">
            <label>Ciudad</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              maxLength={120}
              placeholder="Madrid, Barcelona..."
            />
          </div>
        </div>

        {msg && <div className="alert-success">{msg}</div>}
        {err && <div className="form-error">{err}</div>}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
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
      .catch(() => {})
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

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Perfil del Centro</h1>
          <p className="page-sub">Datos del centro educativo al que se vinculan tus alumnos</p>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-big company">{user?.name?.[0]?.toUpperCase()}</div>
        <div>
          <div className="profile-name">{form.center_name || user?.name}</div>
          <div className="profile-email">{user?.email}</div>
          <div className="profile-role-tag">Centro Educativo</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="field">
          <label>Nombre del centro</label>
          <input
            type="text"
            value={form.center_name}
            onChange={(e) => setForm((f) => ({ ...f, center_name: e.target.value }))}
            required
            maxLength={200}
            placeholder="IES Ejemplo"
          />
        </div>

        <div className="field">
          <label>Ciudad</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            maxLength={120}
            placeholder="Madrid, Sevilla..."
          />
        </div>

        {msg && <div className="alert-success">{msg}</div>}
        {err && <div className="form-error">{err}</div>}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
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
