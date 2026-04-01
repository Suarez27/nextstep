import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

function StatusBadge({ status }) {
  const map = { pendiente: 'badge-amber', aceptada: 'badge-green', rechazada: 'badge-red' };
  const labels = { pendiente: 'Pendiente', aceptada: 'Aceptada', rechazada: 'Rechazada' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{labels[status] || status}</span>;
}

// Vista del alumno
function AlumnoApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.myApplications()
      .then(setApps)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis Candidaturas</h1>
          <p className="page-sub">{apps.length} candidatura{apps.length !== 1 ? 's' : ''} enviada{apps.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {apps.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">&#128140;</div>
          <p>No has enviado ninguna candidatura todavía.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Oferta</th>
                <th>Empresa</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id}>
                  <td><strong>{a.title}</strong></td>
                  <td>{a.company_name}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>{new Date(a.created_at).toLocaleDateString('es-ES')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Vista empresa / centro / admin: ver candidatos por oferta
function ManagerApplications() {
  const [internships, setInternships] = useState([]);
  const [selected, setSelected] = useState(null);
  const [apps, setApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.getInternships().then(setInternships).catch(() => {});
  }, []);

  async function loadApps(internshipId) {
    setSelected(internshipId);
    setLoadingApps(true);
    try {
      const data = await api.internshipApplications(internshipId);
      setApps(data);
    } catch {
      setApps([]);
    } finally {
      setLoadingApps(false);
    }
  }

  async function changeStatus(appId, status) {
    try {
      await api.setApplicationStatus(appId, status);
      setMsg(`Estado actualizado a "${status}".`);
      loadApps(selected);
    } catch (e) {
      setMsg(e.message);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Candidatos</h1>
          <p className="page-sub">Selecciona una oferta para ver sus candidatos</p>
        </div>
      </div>

      {msg && <div className="alert-success" onClick={() => setMsg('')}>{msg}</div>}

      <div className="two-col-layout">
        <div className="col-left">
          <h2 className="col-title">Ofertas</h2>
          {internships.length === 0 ? (
            <p className="empty-msg">No hay ofertas.</p>
          ) : (
            internships.map((i) => (
              <div
                key={i.id}
                className={`selectable-row${selected === i.id ? ' selected' : ''}`}
                onClick={() => loadApps(i.id)}
              >
                <div className="sel-title">{i.title}</div>
                <div className="sel-sub">{i.company_name}</div>
              </div>
            ))
          )}
        </div>

        <div className="col-right">
          <h2 className="col-title">Candidaturas</h2>
          {!selected ? (
            <p className="empty-msg">Selecciona una oferta a la izquierda.</p>
          ) : loadingApps ? (
            <div className="loading">Cargando...</div>
          ) : apps.length === 0 ? (
            <p className="empty-msg">Esta oferta no tiene candidatos todavía.</p>
          ) : (
            apps.map((a) => (
              <div key={a.id} className="applicant-card">
                <div className="applicant-info">
                  <div className="applicant-avatar">{a.student_name?.[0]?.toUpperCase()}</div>
                  <div>
                    <div className="applicant-name">{a.student_name}</div>
                    <div className="applicant-email">{a.student_email}</div>
                  </div>
                </div>
                <div className="applicant-actions">
                  <StatusBadge status={a.status} />
                  {a.status === 'pendiente' && (
                    <>
                      <button className="btn-sm btn-success" onClick={() => changeStatus(a.id, 'aceptada')}>Aceptar</button>
                      <button className="btn-sm btn-danger" onClick={() => changeStatus(a.id, 'rechazada')}>Rechazar</button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function Applications() {
  const { user } = useAuth();
  return user.role === 'alumno' ? <AlumnoApplications /> : <ManagerApplications />;
}
