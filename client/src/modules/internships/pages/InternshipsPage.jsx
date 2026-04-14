import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { api } from '../../../services/api';

function NewInternshipModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', hours_total: 300, schedule: '', slots: 1 });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const v = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [e.target.name]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await api.createInternship(form);
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
          <h2>Nueva oferta de prácticas</h2>
          <button className="modal-close" onClick={onClose}>&#10005;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Título</label>
            <input name="title" value={form.title} onChange={handleChange} required placeholder="Ej: Prácticas Frontend Junior" />
          </div>
          <div className="field">
            <label>Descripción</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={4} placeholder="Descripción del puesto, tareas..." />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Horas totales</label>
              <input name="hours_total" type="number" min={1} max={2000} value={form.hours_total} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Plazas</label>
              <input name="slots" type="number" min={1} max={50} value={form.slots} onChange={handleChange} required />
            </div>
          </div>
          <div className="field">
            <label>Horario</label>
            <input name="schedule" value={form.schedule} onChange={handleChange} placeholder="Ej: L-V 09:00-14:00" />
          </div>
          {err && <div className="form-error">{err}</div>}
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Publicando...' : 'Publicar oferta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Internships() {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await api.getInternships();
      setInternships(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function applyTo(id) {
    try {
      await api.applyToInternship(id);
      setMsg('Candidatura enviada correctamente.');
    } catch (e) {
      setMsg(e.message);
    }
  }

  const filtered = internships.filter(
    (i) =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.company_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {user.role === 'empresa' ? 'Mis Prácticas' : 'Ofertas de Prácticas'}
          </h1>
          <p className="page-sub">{internships.length} oferta{internships.length !== 1 ? 's' : ''} disponible{internships.length !== 1 ? 's' : ''}</p>
        </div>
        {user.role === 'empresa' && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Nueva oferta
          </button>
        )}
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por título o empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {msg && <div className="alert-success" onClick={() => setMsg('')}>{msg} (clic para cerrar)</div>}

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">&#128188;</div>
          <p>No hay ofertas que coincidan con tu búsqueda.</p>
          {user.role === 'empresa' && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              Publicar primera oferta
            </button>
          )}
        </div>
      ) : (
        <div className="cards-grid">
          {filtered.map((item) => (
            <div key={item.id} className="offer-card">
              <div className="offer-card-top">
                <div className="offer-icon">&#128188;</div>
                <div>
                  <h3 className="offer-title">{item.title}</h3>
                  <div className="offer-company">{item.company_name}</div>
                </div>
              </div>
              <p className="offer-desc">{item.description}</p>
              <div className="offer-tags">
                <span className="tag tag-blue">{item.hours_total}h</span>
                <span className="tag tag-gray">{item.slots} plaza{item.slots !== 1 ? 's' : ''}</span>
                {item.schedule && <span className="tag tag-gray">{item.schedule}</span>}
              </div>
              {user.role === 'alumno' && (
                <button className="btn-primary btn-full mt" onClick={() => applyTo(item.id)}>
                  Postularme
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <NewInternshipModal onClose={() => setShowModal(false)} onCreated={load} />
      )}
    </div>
  );
}
