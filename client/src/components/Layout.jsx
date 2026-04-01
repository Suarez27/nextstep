import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = {
  admin: [
    { to: '/dashboard', label: 'Inicio', icon: '&#9962;' },
    { to: '/internships', label: 'Prácticas', icon: '&#128188;' },
    { to: '/students', label: 'Alumnos', icon: '&#127891;' },
    { to: '/agreements', label: 'Convenios', icon: '&#128203;' },
    { to: '/interviews', label: 'Entrevistas', icon: '&#128197;' },
  ],
  centro: [
    { to: '/dashboard', label: 'Inicio', icon: '&#9962;' },
    { to: '/internships', label: 'Prácticas', icon: '&#128188;' },
    { to: '/students', label: 'Alumnos', icon: '&#127891;' },
    { to: '/agreements', label: 'Convenios', icon: '&#128203;' },
    { to: '/interviews', label: 'Entrevistas', icon: '&#128197;' },
    { to: '/profile', label: 'Mi Centro', icon: '&#127979;' },
  ],
  empresa: [
    { to: '/dashboard', label: 'Inicio', icon: '&#9962;' },
    { to: '/internships', label: 'Mis Prácticas', icon: '&#128188;' },
    { to: '/applications', label: 'Candidatos', icon: '&#128101;' },
    { to: '/interviews', label: 'Entrevistas', icon: '&#128197;' },
    { to: '/agreements', label: 'Convenios', icon: '&#128203;' },
    { to: '/profile', label: 'Mi Empresa', icon: '&#127970;' },
  ],
  alumno: [
    { to: '/dashboard', label: 'Inicio', icon: '&#9962;' },
    { to: '/internships', label: 'Ofertas', icon: '&#128188;' },
    { to: '/applications', label: 'Mis Candidaturas', icon: '&#128140;' },
    { to: '/profile', label: 'Mi Perfil', icon: '&#128100;' },
  ],
};

const ROLE_LABELS = {
  admin: 'Administrador',
  centro: 'Centro Educativo',
  empresa: 'Empresa',
  alumno: 'Alumno',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = NAV[user?.role] || [];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">N</div>
          <div>
            <div className="brand-title">NextStep</div>
            <div className="brand-sub">Gestión de Prácticas FP</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              dangerouslySetInnerHTML={undefined}
            >
              <span
                className="nav-icon"
                dangerouslySetInnerHTML={{ __html: item.icon }}
              />
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="user-meta">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{ROLE_LABELS[user?.role]}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
            &#9099;
          </button>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-brand">
            <strong>NextStep</strong> — Gestión de Prácticas FP
          </div>
          <div className="topbar-user">
            Hola, <strong>{user?.name}</strong>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
