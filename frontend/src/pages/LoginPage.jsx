import { useState } from "react";
import { useNavigate } from "react-router";
import { login } from "../services/authService";

function LoginPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await login(form);

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="card login-card">
            <h2>Iniciar sesión</h2>
            <p className="muted">Accede a la plataforma NextStep</p>

            <div className="demo-box">
                <strong>Usuario de prueba</strong>
                <span>Email: admin@nextstep.com</span>
                <span>Contraseña: 1234</span>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
                <label>
                    Correo electrónico
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="admin@nextstep.com"
                    />
                </label>

                <label>
                    Contraseña
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="1234"
                    />
                </label>

                {error ? <p className="error-text">{error}</p> : null}

                <button type="submit" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                </button>
            </form>
        </section>
    );
}

export default LoginPage;