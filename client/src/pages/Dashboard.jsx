import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon" dangerouslySetInnerHTML={{ __html: icon }} />
      <div className="stat-info">
        <div className="stat-value">{value ?? '—'}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function InternshipCard({ item, onApply }) {
  return (
    <div className="list-card">
      <div className="list-card-header">
        <div>
          <div className="list-card-title">{item.title}</div>
          <div className="list-card-sub">{item.company_name}</div>
        </div>
        <span className="badge badge-blue">{item.hours_total}h</span>
      </div>
      <p className="list-card-desc">{item.description}</p>
      <div className="list-card-footer">
        <span className="tag">{item.schedule || 'Sin horario'}</span>
        <span className="tag">{item.slots} plaza{item.slots !== 1 ? 's' : ''}</span>
        {onApply && (
          <button className="btn-sm btn-primary" onClick={() => onApply(item.id)}>
            Postularme
          </button>
        )}
      </div>
    </div>
  );
}

// ——— ALUMNO ———
function AlumnoDashboard() {
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    Promise.all([api.getInternships(), api.myApplications()])
      .then(([i, a]) => { setInternships(i.slice(0, 4)); setApplications(a); })
      .catch(() => {});
  }, []);

  async function applyTo(id) {
    try {
      await api.applyToInternship(id);
      setMsg('Candidatura enviada correctamente.');
      const a = await api.myApplications();
      setApplications(a);
    } catch (err) {
      setMsg(err.message);
    }
  }

  const appliedIds = new Set(applications.map((a) => a.title));

  return (
    <div className="dashboard">
      <h1 className="page-title">Mi Panel</h1>

      <div className="stats-row">
        <StatCard icon="&#128140;" label="Candidaturas enviadas" value={applications.length} color="blue" />
        <StatCard
          icon="&#9989;"
          label="Aceptadas"
          value={applications.filter((a) => a.status === 'aceptada').length}
          color="green"
        />
        <StatCard
          icon="&#9203;"
          label="Pendientes"
          value={applications.filter((a) => a.status === 'pendiente').length}
          color="amber"
        />
        <StatCard icon="&#128188;" label="Ofertas disponibles" value={internships.length} color="purple" />
      </div>

      {msg && <div className="alert-success">{msg}</div>}

      <div className="dashboard-grid">
        <div className="dash-section">
          <div className="section-header">
            <h2>Últimas ofertas</h2>
            <Link to="/internships" className="link-more">Ver todas</Link>
          </div>
          {internships.length === 0 ? (
            <p className="empty-msg">No hay ofertas disponibles.</p>
          ) : (
            internships.map((item) => (
              <InternshipCard key={item.id} item={item} onApply={applyTo} />
            ))
          )}
        </div>

        <div className="dash-section">
          <div className="section-header">
            <h2>Mis candidaturas</h2>
            <Link to="/applications" className="link-more">Ver todas</Link>
          </div>
          {applications.length === 0 ? (
            <p className="empty-msg">Aún no has enviado ninguna candidatura.</p>
          ) : (
            applications.slice(0, 5).map((a) => (
              <div key={a.id} className="list-card compact">
                <div className="list-card-header">
                  <div>
                    <div className="list-card-title">{a.title}</div>
                    <div className="list-card-sub">{a.company_name}</div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ——— EMPRESA ———
function EmpresaDashboard() {
  const [internships, setInternships] = useState([]);

  useEffect(() => {
    api.getInternships().then(setInternships).catch(() => {});
  }, []);

  return (
    <div className="dashboard">
      <h1 className="page-title">Panel de Empresa</h1>

      <div className="stats-row">
        <StatCard icon="&#128188;" label="Ofertas publicadas" value={internships.length} color="blue" />
        <StatCard
          icon="&#128101;"
          label="Plazas totales"
          value={internships.reduce((s, i) => s + (i.slots || 0), 0)}
          color="green"
        />
      </div>

      <div className="dash-section">
        <div className="section-header">
          <h2>Mis ofertas de prácticas</h2>
          <Link to="/internships" className="link-more">Gestionar</Link>
        </div>
        {internships.length === 0 ? (
          <p className="empty-msg">Aún no has publicado ninguna oferta.</p>
        ) : (
          internships.map((item) => <InternshipCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}

// ——— CENTRO / ADMIN ———
function CentroAdminDashboard() {
  const [internships, setInternships] = useState([]);
  const [students, setStudents] = useState([]);
  const [agreements, setAgreements] = useState([]);

  useEffect(() => {
    Promise.all([
      api.getInternships(),
      api.validatedStudents(),
      api.getAgreements(),
    ])
      .then(([i, s, ag]) => { setInternships(i); setStudents(s); setAgreements(ag); })
      .catch(() => {});
  }, []);

  return (
    <div className="dashboard">
      <h1 className="page-title">Panel de Gestión</h1>

      <div className="stats-row">
        <StatCard icon="&#128188;" label="Prácticas" value={internships.length} color="blue" />
        <StatCard icon="&#127891;" label="Alumnos validados" value={students.length} color="green" />
        <StatCard icon="&#128203;" label="Convenios firmados" value={agreements.length} color="purple" />
      </div>

      <div className="dashboard-grid">
        <div className="dash-section">
          <div className="section-header">
            <h2>Prácticas recientes</h2>
            <Link to="/internships" className="link-more">Ver todas</Link>
          </div>
          {internships.slice(0, 4).map((item) => (
            <InternshipCard key={item.id} item={item} />
          ))}
        </div>

        <div className="dash-section">
          <div className="section-header">
            <h2>Convenios recientes</h2>
            <Link to="/agreements" className="link-more">Ver todos</Link>
          </div>
          {agreements.length === 0 ? (
            <p className="empty-msg">No hay convenios registrados.</p>
          ) : (
            agreements.slice(0, 5).map((ag) => (
              <div key={ag.id} className="list-card compact">
                <div className="list-card-header">
                  <div>
                    <div className="list-card-title">{ag.title}</div>
                    <div className="list-card-sub">{ag.student_name} · {ag.center_name}</div>
                  </div>
                  <span className="badge badge-green">Firmado</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pendiente: 'badge-amber',
    aceptada: 'badge-green',
    rechazada: 'badge-red',
  };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === 'alumno') return <AlumnoDashboard />;
  if (user?.role === 'empresa') return <EmpresaDashboard />;
  return <CentroAdminDashboard />;
}
