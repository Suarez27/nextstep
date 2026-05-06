import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../../../services/api';
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
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);
    const [centers, setCenters] = useState([]);
    const [loadingCenters, setLoadingCenters] = useState(false);

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'centro',
        center_id: '',
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
        setInfo('');
        setMode(nextMode);
        setSearchParams(nextMode === 'register' ? { mode: 'register' } : {}, { replace: true });
    }

    useEffect(() => {
        if (mode !== 'register' || form.role !== 'alumno') return;

        let ignore = false;
        setLoadingCenters(true);
        api.getApprovedCenters()
            .then((data) => {
                if (!ignore) setCenters(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                if (!ignore) setCenters([]);
            })
            .finally(() => {
                if (!ignore) setLoadingCenters(false);
            });

        return () => {
            ignore = true;
        };
    }, [mode, form.role]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((f) => {
            if (name === 'role') {
                return { ...f, role: value, center_id: value === 'alumno' ? f.center_id : '' };
            }
            return { ...f, [name]: value };
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setInfo('');
        setLoading(true);
        try {
            if (mode === 'login') {
                await login(form.email, form.password);
                navigate('/dashboard');
            } else {
                const payload = {
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    role: form.role,
                    ...(form.role === 'alumno' ? { center_id: Number(form.center_id) } : {}),
                };

                const result = await register(payload);

                if (result?.token && result?.user) {
                    navigate('/dashboard');
                    return;
                }

                setInfo(result?.message || 'Registro enviado. Tu cuenta queda pendiente de validacion.');
                setMode('login');
                setSearchParams({}, { replace: true });
                setForm((f) => ({
                    ...f,
                    password: '',
                    center_id: '',
                }));
            }
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
                                hint="Centros y empresas requieren validacion admin. Alumnos requieren validacion del centro."
                            >
                                <select id="role" name="role" value={form.role} onChange={handleChange}>
                                    <option value="empresa">Empresa</option>
                                    <option value="centro">Centro Educativo</option>
                                    <option value="alumno">Alumno</option>
                                </select>
                            </FormField>
                        )}

                        {mode === 'register' && form.role === 'alumno' && (
                            <FormField
                                label="Centro educativo"
                                htmlFor="center_id"
                                hint="Solo aparecen centros aprobados por administracion"
                            >
                                <select
                                    id="center_id"
                                    name="center_id"
                                    value={form.center_id}
                                    onChange={handleChange}
                                    required
                                    disabled={loadingCenters}
                                >
                                    <option value="">{loadingCenters ? 'Cargando centros...' : 'Selecciona tu centro'}</option>
                                    {centers.map((center) => (
                                        <option key={center.id} value={center.id}>
                                            {center.center_name}{center.city ? ` - ${center.city}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </FormField>
                        )}

                        {info && <Alert variant="success">{info}</Alert>}

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
