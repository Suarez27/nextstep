import { Outlet, useNavigate } from "react-router";

function MainLayout() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="app-shell">
            <header className="app-header">
                <div>
                    <h1>NextStep</h1>
                    <p>Gestión de prácticas educativas</p>
                </div>

                <div className="header-actions">
                    <span>
                        {user?.name} ({user?.role})
                    </span>
                    <button onClick={handleLogout}>Cerrar sesión</button>
                </div>
            </header>

            <main className="app-content">
                <Outlet />
            </main>
        </div>
    );
}

export default MainLayout;