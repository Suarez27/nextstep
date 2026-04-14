import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { api } from '../../../services/api';

export default function Students() {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [selected, setSelected] = useState(null);
    const [followups, setFollowups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [createdCredentials, setCreatedCredentials] = useState(null);
    const [tab, setTab] = useState('pendientes'); // 'pendientes' | 'validados'
    const [creatingStudent, setCreatingStudent] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '' });
    const [followupForm, setFollowupForm] = useState({ content: '', progress: 50 });

    async function load() {
        setLoading(true);
        try {
            const data = await api.allStudents();
            setStudents(data);
        } catch {
            /* ignore */
        } finally {
            setLoading(false);
        }
    }

    async function selectStudent(s) {
        setSelected(s);
        try {
            const f = await api.getFollowups(s.id);
            setFollowups(f);
        } catch {
            setFollowups([]);
        }
    }

    async function handleValidate(s) {
        try {
            await api.validateStudent(s.id);
            setError('');
            setMsg(`${s.name} validado correctamente.`);
            setSelected(null);
            load();
        } catch (e) {
            setError(e.message);
        }
    }

    async function addFollowup(e) {
        e.preventDefault();
        if (!selected) return;
        try {
            await api.createFollowup({ student_id: selected.id, content: followupForm.content, progress: followupForm.progress });
            setError('');
            setMsg('Seguimiento anadido.');
            setFollowupForm({ content: '', progress: 50 });
            const f = await api.getFollowups(selected.id);
            setFollowups(f);
        } catch (err) {
            setError(err.message);
        }
    }

    async function createStudent(e) {
        e.preventDefault();
        setCreatingStudent(true);
        setMsg('');
        setError('');
        try {
            const payload = { ...newStudent };
            await api.createStudent(payload);
            setCreatedCredentials({ email: payload.email, password: payload.password });
            setMsg('Alumno creado correctamente. Comparte estas credenciales con el alumno.');
            setNewStudent({ name: '', email: '', password: '' });
            setTab('pendientes');
            setSelected(null);
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setCreatingStudent(false);
        }
    }

    async function handleResetPassword(student) {
        const newPassword = window.prompt(`Nueva contrasena para ${student.name} (minimo 8 caracteres):`, 'Demo12345!');
        if (!newPassword) return;

        setMsg('');
        setError('');
        try {
            await api.resetStudentPassword(student.id, newPassword);
            setCreatedCredentials({ email: student.email, password: newPassword });
            setMsg(`Contrasena actualizada para ${student.name}.`);
        } catch (e) {
            setError(e.message);
        }
    }

    useEffect(() => { load(); }, []);

    const pending = students.filter((s) => !s.validated);
    const validated = students.filter((s) => s.validated);
    const listed = tab === 'pendientes' ? pending : validated;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Alumnos</h1>
                    <p className="page-sub">{pending.length} pendiente{pending.length !== 1 ? 's' : ''} de validar | {validated.length} validado{validated.length !== 1 ? 's' : ''}</p>
                </div>
            </div>

            {msg && <div className="alert-success" onClick={() => setMsg('')}>{msg}</div>}
            {error && <div className="form-error" onClick={() => setError('')} style={{ marginBottom: 12 }}>{error}</div>}

            {createdCredentials && (
                <div className="form-card" style={{ marginBottom: 12, border: '1px solid #bfdbfe' }}>
                    <h3 style={{ fontSize: 14, marginBottom: 8 }}>Credenciales del alumno</h3>
                    <div className="field-hint">Guardalas y compartelas con el alumno:</div>
                    <div style={{ marginTop: 8, fontSize: 13 }}><strong>Email:</strong> {createdCredentials.email}</div>
                    <div style={{ marginTop: 4, fontSize: 13 }}><strong>Contrasena:</strong> {createdCredentials.password}</div>
                    <button
                        type="button"
                        className="btn-ghost"
                        style={{ marginTop: 10 }}
                        onClick={() => setCreatedCredentials(null)}
                    >
                        Ocultar
                    </button>
                </div>
            )}

            <div className="tab-bar">
                <button
                    className={`tab-btn${tab === 'pendientes' ? ' active' : ''}`}
                    onClick={() => { setTab('pendientes'); setSelected(null); }}
                >
                    Pendientes de validar
                    {pending.length > 0 && <span className="tab-badge">{pending.length}</span>}
                </button>
                <button
                    className={`tab-btn${tab === 'validados' ? ' active' : ''}`}
                    onClick={() => { setTab('validados'); setSelected(null); }}
                >
                    Validados
                </button>
            </div>

            <div className="two-col-layout">
                <div className="col-left">
                    {user?.role === 'centro' && (
                        <form onSubmit={createStudent} className="form-card" style={{ marginBottom: 12, padding: 14 }}>
                            <h3 style={{ fontSize: 14, marginBottom: 10 }}>Crear alumno del centro</h3>
                            <div className="field" style={{ marginBottom: 8 }}>
                                <label>Nombre</label>
                                <input
                                    type="text"
                                    value={newStudent.name}
                                    onChange={(e) => setNewStudent((f) => ({ ...f, name: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="field" style={{ marginBottom: 8 }}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={newStudent.email}
                                    onChange={(e) => setNewStudent((f) => ({ ...f, email: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="field" style={{ marginBottom: 10 }}>
                                <label>Contrasena inicial (min. 8)</label>
                                <input
                                    type="password"
                                    minLength={8}
                                    value={newStudent.password}
                                    onChange={(e) => setNewStudent((f) => ({ ...f, password: e.target.value }))}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-primary btn-full" disabled={creatingStudent}>
                                {creatingStudent ? 'Creando...' : 'Crear alumno'}
                            </button>
                        </form>
                    )}

                    {loading ? (
                        <div className="loading">Cargando...</div>
                    ) : listed.length === 0 ? (
                        <p className="empty-msg">
                            {tab === 'pendientes'
                                ? 'No hay alumnos pendientes de validar.'
                                : 'No hay alumnos validados todavia.'}
                        </p>
                    ) : (
                        listed.map((s) => (
                            <div
                                key={s.id}
                                className={`selectable-row${selected?.id === s.id ? ' selected' : ''}`}
                                onClick={() => selectStudent(s)}
                            >
                                <div className="applicant-info">
                                    <div className="user-avatar sm">{s.name?.[0]?.toUpperCase()}</div>
                                    <div>
                                        <div className="sel-title">{s.name}</div>
                                        <div className="sel-sub">{s.email}{s.center_name ? ` | ${s.center_name}` : ''}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="col-right">
                    {!selected ? (
                        <div className="empty-state" style={{ padding: '32px 0' }}>
                            <div className="empty-icon">&#127891;</div>
                            <p>Selecciona un alumno para ver su detalle.</p>
                        </div>
                    ) : (
                        <>
                            <div className="col-title" style={{ justifyContent: 'space-between' }}>
                                <span>
                                    {selected.name}
                                    {selected.validated
                                        ? <span className="badge badge-green ml">Validado</span>
                                        : <span className="badge badge-amber ml">Pendiente</span>}
                                </span>
                                {!selected.validated && (
                                    <button
                                        className="btn-primary btn-sm"
                                        onClick={() => handleValidate(selected)}
                                    >
                                        Validar alumno
                                    </button>
                                )}
                            </div>

                            {user?.role === 'centro' && (
                                <div style={{ marginBottom: 12 }}>
                                    <button className="btn-ghost" onClick={() => handleResetPassword(selected)}>
                                        Restablecer contrasena
                                    </button>
                                </div>
                            )}

                            {selected.skills ? (
                                <div className="detail-section">
                                    <strong>Habilidades:</strong>
                                    <div className="skills-preview mt-sm">
                                        {selected.skills.split(',').map((s) => s.trim()).filter(Boolean).map((s) => (
                                            <span key={s} className="skill-tag">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="detail-section">
                                    <span className="empty-msg">Sin habilidades registradas.</span>
                                </div>
                            )}

                            {selected.cv_text ? (
                                <div className="detail-section">
                                    <strong>CV:</strong>
                                    <p className="cv-text">{selected.cv_text}</p>
                                </div>
                            ) : (
                                <div className="detail-section">
                                    <span className="empty-msg">Sin CV todavia.</span>
                                </div>
                            )}

                            {selected.validated && (
                                <div className="detail-section">
                                    <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: 10 }}>Seguimiento</h3>
                                    {followups.length === 0 ? (
                                        <p className="empty-msg">Sin seguimientos registrados.</p>
                                    ) : (
                                        followups.map((f) => (
                                            <div key={f.id} className="followup-item">
                                                <div className="followup-header">
                                                    <span className="followup-author">{f.author_name}</span>
                                                    <span className="followup-date">{new Date(f.created_at).toLocaleDateString('es-ES')}</span>
                                                </div>
                                                <p style={{ fontSize: 13 }}>{f.content}</p>
                                                <div className="progress-bar-wrap">
                                                    <div className="progress-bar" style={{ width: `${f.progress}%` }} />
                                                </div>
                                                <span className="progress-label">{f.progress}% completado</span>
                                            </div>
                                        ))
                                    )}

                                    <form onSubmit={addFollowup} className="followup-form">
                                        <textarea
                                            value={followupForm.content}
                                            onChange={(e) => setFollowupForm((f) => ({ ...f, content: e.target.value }))}
                                            placeholder="Anadir nota de seguimiento..."
                                            rows={3}
                                            required
                                        />
                                        <div className="field-row" style={{ marginTop: 8 }}>
                                            <div className="field">
                                                <label>Progreso: {followupForm.progress}%</label>
                                                <input
                                                    type="range"
                                                    min={0}
                                                    max={100}
                                                    value={followupForm.progress}
                                                    onChange={(e) => setFollowupForm((f) => ({ ...f, progress: Number(e.target.value) }))}
                                                />
                                            </div>
                                            <button type="submit" className="btn-sm-v">Anadir nota</button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
