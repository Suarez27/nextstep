import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { api } from '../../../services/api';

function NewAgreementModal({ onClose, onCreated }) {
    const [internships, setInternships] = useState([]);
    const [students, setStudents] = useState([]);
    const [form, setForm] = useState({ internship_id: '', student_id: '', notes: '' });
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        Promise.all([api.getInternships(), api.validatedStudents()])
            .then(([i, s]) => { setInternships(i); setStudents(s); })
            .catch(() => { });
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setErr('');
        setLoading(true);
        try {
            await api.createAgreement({
                internship_id: Number(form.internship_id),
                student_id: Number(form.student_id),
                notes: form.notes,
            });
            onCreated();
            onClose();
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Nuevo convenio</h2>
                    <button className="modal-close" onClick={onClose}>&#10005;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="field">
                        <label>Oferta de prácticas</label>
                        <select
                            value={form.internship_id}
                            onChange={(e) => setForm((f) => ({ ...f, internship_id: e.target.value }))}
                            required
                        >
                            <option value="">Seleccionar...</option>
                            {internships.map((i) => (
                                <option key={i.id} value={i.id}>{i.title} — {i.company_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label>Alumno</label>
                        <select
                            value={form.student_id}
                            onChange={(e) => setForm((f) => ({ ...f, student_id: e.target.value }))}
                            required
                        >
                            <option value="">Seleccionar...</option>
                            {students.map((s) => (
                                <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label>Observaciones (opcional)</label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                            rows={3}
                            placeholder="Condiciones especiales, observaciones del centro..."
                        />
                    </div>
                    {err && <div className="form-error">{err}</div>}
                    <div className="modal-actions">
                        <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Firmando...' : 'Firmar convenio'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Agreements() {
    const { user } = useAuth();
    const [agreements, setAgreements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    async function load() {
        setLoading(true);
        try {
            const data = await api.getAgreements();
            setAgreements(data);
        } catch {/* */ } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    const canCreate = ['centro', 'admin'].includes(user?.role);

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Convenios</h1>
                    <p className="page-sub">{agreements.length} convenio{agreements.length !== 1 ? 's' : ''} firmado{agreements.length !== 1 ? 's' : ''}</p>
                </div>
                {canCreate && (
                    <button className="btn-primary" onClick={() => setShowModal(true)}>
                        + Nuevo convenio
                    </button>
                )}
            </div>

            {loading ? (
                <div className="loading">Cargando...</div>
            ) : agreements.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">&#128203;</div>
                    <p>No hay convenios firmados todavía.</p>
                    {canCreate && (
                        <button className="btn-primary" onClick={() => setShowModal(true)}>
                            Firmar primer convenio
                        </button>
                    )}
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Oferta de prácticas</th>
                                <th>Alumno</th>
                                <th>Centro</th>
                                <th>Fecha firma</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {agreements.map((ag) => (
                                <tr key={ag.id}>
                                    <td><strong>{ag.title}</strong></td>
                                    <td>{ag.student_name}</td>
                                    <td>{ag.center_name}</td>
                                    <td>{new Date(ag.signed_at).toLocaleDateString('es-ES')}</td>
                                    <td><span className="badge badge-green">Firmado &#9989;</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <NewAgreementModal onClose={() => setShowModal(false)} onCreated={load} />
            )}
        </div>
    );
}
