import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Alert,
    Button,
    FormField,
} from '../../../shared/components/ui';

export default function Login() {
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'centro',
    });

    useEffect(() => {
        const requestedMode = searchParams.get('mode');
        if (requestedMode === 'register') {
            setMode('register');
            return;
        }
        setMode('login');
    }, [searchParams]);

    function changeMode(nextMode) {
        setError('');
        setMode(nextMode);
        setSearchParams(nextMode === 'register' ? { mode: 'register' } : {}, { replace: true });
    }

    function handleChange(e) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (mode === 'login') {
                await login(form.email, form.password);
            } else {
                await register({ name: form.name, email: form.email, password: form.password, role: form.role });
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">
            <div className="login-left">
                <div className="login-hero">
                    <div className="login-logo">N</div>
                    <h1 className="login-title">NextStep</h1>
                    <p className="login-tagline">Plataforma de Gestión de Prácticas de Formación Profesional</p>
                    <div className="login-features">
                        <div className="feature-item">
                            <span className="feature-icon">&#127891;</span>
                            <span>Alumnos conectados con empresas</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">&#128188;</span>
                            <span>Gestión de ofertas de prácticas</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">&#128203;</span>
                            <span>Convenios y seguimiento centralizado</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">&#128197;</span>
                            <span>Entrevistas y candidaturas</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="login-right">
                <div className="login-card">
                    <Link to="/" className="back-home-link">&larr; Volver a la pagina principal</Link>

                    <div className="login-tabs">
                        <button
                            className={`tab-btn${mode === 'login' ? ' active' : ''}`}
                            onClick={() => changeMode('login')}
                        >
                            Iniciar sesión
                        </button>
                        <button
                            className={`tab-btn${mode === 'register' ? ' active' : ''}`}
                            onClick={() => changeMode('register')}
                        >
                            Registrarse
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {mode === 'register' && (
                            <FormField label="Nombre completo" htmlFor="name">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Tu nombre"
                                    required
                                    autoComplete="name"
                                />
                            </FormField>
                        )}

                        <FormField label="Correo electrónico" htmlFor="email">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="correo@ejemplo.com"
                                required
                                autoComplete="email"
                            />
                        </FormField>

                        <FormField label="Contraseña" htmlFor="password">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Mínimo 8 caracteres"
                                required
                                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                            />
                        </FormField>

                        {mode === 'register' && (
                            <FormField
                                label="Tipo de cuenta"
                                htmlFor="role"
                                hint="Los alumnos son creados por su centro educativo."
                            >
                                <select id="role" name="role" value={form.role} onChange={handleChange}>
                                    <option value="empresa">Empresa</option>
                                    <option value="centro">Centro Educativo</option>
                                </select>
                            </FormField>
                        )}

                        {error && <Alert variant="error">{error}</Alert>}

                        <Button type="submit" fullWidth disabled={loading}>
                            {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
                        </Button>
                    </form>

                    <div className="demo-hint">
                        <strong>Cuentas demo:</strong><br />
                        admin@nextstep.local | centro@nextstep.local<br />
                        empresa@nextstep.local | alumno@nextstep.local<br />
                        <em>Contraseña: Demo1234!</em>
                    </div>
                </div>
            </div>
        </div>
    );
}
