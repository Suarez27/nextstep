import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { api } from '../../../services/api';
import {
    Alert,
    Button,
    EmptyState,
    FormField,
    LoadingState,
    Modal,
    PageHeader,
    StatusBadge,
} from '../../../shared/components/ui';

function NewInterviewModal({ onClose, onCreated }) {
    const [apps, setApps] = useState([]);
    const [form, setForm] = useState({ application_id: '', interview_at: '', notes: '' });
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.getInternships()
            .then(async (internships) => {
                const allApps = [];
                for (const i of internships) {
                    try {
                        const a = await api.internshipApplications(i.id);
                        a.forEach((app) => allApps.push({ ...app, internship_title: i.title }));
                    } catch {/* */ }
                }
                setApps(allApps.filter((a) => a.status === 'aceptada'));
            })
            .catch(() => { });
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setErr('');
        setLoading(true);
        try {
            await api.createInterview({
                application_id: Number(form.application_id),
                interview_at: form.interview_at,
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
        <Modal
            title="Programar entrevista"
            onClose={onClose}
            actions={
                <>
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" form="new-interview-form" disabled={loading}>
                        {loading ? 'Programando...' : 'Programar'}
                    </Button>
                </>
            }
        >
            <form id="new-interview-form" onSubmit={handleSubmit}>
                <FormField
                    label="Candidato (candidatura aceptada)"
                    hint={apps.length === 0 ? 'No hay candidaturas aceptadas disponibles.' : undefined}
                >
                    <select
                        value={form.application_id}
                        onChange={(e) => setForm((f) => ({ ...f, application_id: e.target.value }))}
                        required
                    >
                        <option value="">Seleccionar...</option>
                        {apps.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.student_name} — {a.internship_title}
                            </option>
                        ))}
                    </select>
                </FormField>

                <FormField label="Fecha y hora">
                    <input
                        type="datetime-local"
                        value={form.interview_at}
                        onChange={(e) => setForm((f) => ({ ...f, interview_at: e.target.value }))}
                        required
                    />
                </FormField>

                <FormField label="Notas (opcional)">
                    <textarea
                        value={form.notes}
                        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                        rows={3}
                        placeholder="Instrucciones, enlace videollamada..."
                    />
                </FormField>

                {err && <Alert variant="error">{err}</Alert>}
            </form>
        </Modal>
    );
}

export default function Interviews() {
    const { user } = useAuth();
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    async function load() {
        setLoading(true);
        try {
            const data = await api.myInterviews();
            setInterviews(data);
        } catch {/* */ } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    const canCreate = ['empresa', 'centro', 'admin'].includes(user?.role);

    return (
        <div className="page">
            <PageHeader
                title="Entrevistas"
                subtitle={`${interviews.length} entrevista${interviews.length !== 1 ? 's' : ''} programada${interviews.length !== 1 ? 's' : ''}`}
                actions={
                    canCreate ? (
                        <Button onClick={() => setShowModal(true)}>+ Programar entrevista</Button>
                    ) : null
                }
            />

            {loading ? (
                <LoadingState />
            ) : interviews.length === 0 ? (
                <EmptyState
                    icon="📅"
                    message="No hay entrevistas programadas."
                />
            ) : (
                <div className="cards-grid">
                    {interviews.map((i) => {
                        const date = new Date(i.interview_at);
                        const isPast = date < new Date();
                        return (
                            <div key={i.id} className={`offer-card${isPast ? ' past' : ''}`}>
                                <div className="offer-card-top">
                                    <div className="date-box">
                                        <div className="date-day">{date.getDate()}</div>
                                        <div className="date-month">{date.toLocaleString('es-ES', { month: 'short' })}</div>
                                    </div>
                                    <div>
                                        <h3 className="offer-title">{i.title}</h3>
                                        <div className="offer-company">{i.student_name}</div>
                                    </div>
                                </div>
                                <div className="offer-tags">
                                    <span className="tag tag-blue">
                                        {date.toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit' })}h
                                    </span>
                                    <StatusBadge
                                        status={isPast ? 'realizada' : 'proxima'}
                                        label={isPast ? 'Realizada' : 'Próxima'}
                                    />
                                </div>
                                {i.notes && <p className="offer-desc">{i.notes}</p>}
                            </div>
                        );
                    })}
                </div>
            )}

            {showModal && (
                <NewInterviewModal onClose={() => setShowModal(false)} onCreated={load} />
            )}
        </div>
    );
}
