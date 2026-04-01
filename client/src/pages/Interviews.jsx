import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

function NewInterviewModal({ onClose, onCreated }) {
  const [apps, setApps] = useState([]);
  const [form, setForm] = useState({ application_id: '', interview_at: '', notes: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getInternships()
      .then(async (internships) => {
        const allApps = [];
        for (const i of internships) {
          try {
            const a = await api.internshipApplications(i.id);
            a.forEach((app) => allApps.push({ ...app, internship_title: i.title }));
          } catch {/* */}
        }
        setApps(allApps.filter((a) => a.status === 'aceptada'));
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await api.createInterview({
        application_id: Number(form.application_id),
        interview_at: form.interview_at,
        notes: form.notes,
      });
      onCreated();
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Programar entrevista</h2>
          <button className="modal-close" onClick={onClose}>&#10005;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Candidato (candidatura aceptada)</label>
            <select
              value={form.application_id}
              onChange={(e) => setForm((f) => ({ ...f, application_id: e.target.value }))}
              required
            >
              <option value="">Seleccionar...</option>
              {apps.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.student_name} — {a.internship_title}
                </option>
              ))}
            </select>
            {apps.length === 0 && (
              <span className="field-hint">No hay candidaturas aceptadas disponibles.</span>
            )}
          </div>
          <div className="field">
            <label>Fecha y hora</label>
            <input
              type="datetime-local"
              value={form.interview_at}
              onChange={(e) => setForm((f) => ({ ...f, interview_at: e.target.value }))}
              required
            />
          </div>
          <div className="field">
            <label>Notas (opcional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="Instrucciones, enlace videollamada..."
            />
          </div>
          {err && <div className="form-error">{err}</div>}
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Programando...' : 'Programar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Interviews() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await api.myInterviews();
      setInterviews(data);
    } catch {/* */} finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const canCreate = ['empresa', 'centro', 'admin'].includes(user?.role);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Entrevistas</h1>
          <p className="page-sub">{interviews.length} entrevista{interviews.length !== 1 ? 's' : ''} programada{interviews.length !== 1 ? 's' : ''}</p>
        </div>
        {canCreate && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Programar entrevista
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : interviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">&#128197;</div>
          <p>No hay entrevistas programadas.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {interviews.map((i) => {
            const date = new Date(i.interview_at);
            const isPast = date < new Date();
            return (
              <div key={i.id} className={`offer-card${isPast ? ' past' : ''}`}>
                <div className="offer-card-top">
                  <div className="date-box">
                    <div className="date-day">{date.getDate()}</div>
                    <div className="date-month">{date.toLocaleString('es-ES', { month: 'short' })}</div>
                  </div>
                  <div>
                    <h3 className="offer-title">{i.title}</h3>
                    <div className="offer-company">{i.student_name}</div>
                  </div>
                </div>
                <div className="offer-tags">
                  <span className="tag tag-blue">
                    {date.toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit' })}h
                  </span>
                  <span className={`tag ${isPast ? 'tag-gray' : 'tag-green'}`}>
                    {isPast ? 'Realizada' : 'Próxima'}
                  </span>
                </div>
                {i.notes && <p className="offer-desc">{i.notes}</p>}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <NewInterviewModal onClose={() => setShowModal(false)} onCreated={load} />
      )}
    </div>
  );
}
