import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../modules/auth/context/AuthContext';
import { getNavigationForRole, ROLE_LABELS } from '../config/navigation';

export default function AppLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const items = getNavigationForRole(user?.role);

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