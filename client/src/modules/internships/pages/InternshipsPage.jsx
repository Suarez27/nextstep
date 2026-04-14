import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { api } from '../../../services/api';
import {
  Button,
  EmptyState,
  FormField,
  FormRow,
  LoadingState,
  Modal,
  PageHeader,
} from '../../../shared/components/ui';

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
    <Modal
      title="Nueva oferta de prácticas"
      onClose={onClose}
      actions={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="new-internship-form" disabled={loading}>
            {loading ? 'Publicando...' : 'Publicar oferta'}
          </Button>
        </>
      }
    >
      <form id="new-internship-form" onSubmit={handleSubmit}>
        <FormField label="Título">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Ej: Prácticas Frontend Junior"
          />
        </FormField>

        <FormField label="Descripción">
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Descripción del puesto, tareas..."
          />
        </FormField>

        <FormRow>
          <FormField label="Horas totales">
            <input
              name="hours_total"
              type="number"
              min={1}
              max={2000}
              value={form.hours_total}
              onChange={handleChange}
              required
            />
          </FormField>

          <FormField label="Plazas">
            <input
              name="slots"
              type="number"
              min={1}
              max={50}
              value={form.slots}
              onChange={handleChange}
              required
            />
          </FormField>
        </FormRow>

        <FormField label="Horario">
          <input
            name="schedule"
            value={form.schedule}
            onChange={handleChange}
            placeholder="Ej: L-V 09:00-14:00"
          />
        </FormField>

        {err && <Alert variant="error">{err}</Alert>}
      </form>
    </Modal>
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
      <PageHeader
        title={user.role === 'empresa' ? 'Mis Prácticas' : 'Ofertas de Prácticas'}
        subtitle={`${internships.length} oferta${internships.length !== 1 ? 's' : ''} disponible${internships.length !== 1 ? 's' : ''}`}
        actions={
          user.role === 'empresa' ? (
            <Button onClick={() => setShowModal(true)}>+ Nueva oferta</Button>
          ) : null
        }
      />

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
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="💼"
          message="No hay ofertas que coincidan con tu búsqueda."
        >
          {user.role === 'empresa' && (
            <Button onClick={() => setShowModal(true)}>
              Publicar primera oferta
            </Button>
          )}
        </EmptyState>
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
                <Button fullWidth className="mt" onClick={() => applyTo(item.id)}>
                  Postularme
                </Button>
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
