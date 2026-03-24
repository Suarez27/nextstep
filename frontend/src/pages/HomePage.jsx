function HomePage() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return (
        <section>
            <div className="page-heading">
                <h2>Bienvenido, {user.name || "usuario"}</h2>
                <p>
                    Este es un panel inicial hardcodeado para empezar a construir el MVP
                    de NextStep.
                </p>
            </div>

            <div className="dashboard-grid">
                <article className="card">
                    <h3>Alumnos</h3>
                    <p className="big-number">128</p>
                    <p>Perfiles registrados en la plataforma</p>
                </article>

                <article className="card">
                    <h3>Empresas</h3>
                    <p className="big-number">24</p>
                    <p>Entidades colaboradoras activas</p>
                </article>

                <article className="card">
                    <h3>Prácticas activas</h3>
                    <p className="big-number">37</p>
                    <p>Procesos actualmente en seguimiento</p>
                </article>
            </div>
        </section>
    );
}

export default HomePage;