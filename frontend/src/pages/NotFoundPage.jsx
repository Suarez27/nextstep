import { Link } from "react-router";

function NotFoundPage() {
    return (
        <section className="card">
            <h2>Página no encontrada</h2>
            <p>La ruta que intentas abrir no existe.</p>
            <Link to="/">Volver al inicio</Link>
        </section>
    );
}

export default NotFoundPage;