import { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { useCanAccess } from '../../../shared/hooks/useCanAccess';
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
        <Modal
            title="Nuevo convenio"
            onClose={onClose}
            actions={
                <>
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" form="new-agreement-form" disabled={loading}>
                        {loading ? 'Firmando...' : 'Firmar convenio'}
                    </Button>
                </>
            }
        >
            <form id="new-agreement-form" onSubmit={handleSubmit}>
                <FormField label="Oferta de prácticas">
                    <select
                        value={form.internship_id}
                        onChange={(e) => setForm((f) => ({ ...f, internship_id: e.target.value }))}
                        required
                    >
                        <option value="">Seleccionar...</option>
                        {internships.map((i) => (
                            <option key={i.id} value={i.id}>
                                {i.title} — {i.company_name}
                            </option>
                        ))}
                    </select>
                </FormField>

                <FormField label="Alumno">
                    <select
                        value={form.student_id}
                        onChange={(e) => setForm((f) => ({ ...f, student_id: e.target.value }))}
                        required
                    >
                        <option value="">Seleccionar...</option>
                        {students.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name} ({s.email})
                            </option>
                        ))}
                    </select>
                </FormField>

                <FormField label="Observaciones (opcional)">
                    <textarea
                        value={form.notes}
                        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                        rows={3}
                        placeholder="Condiciones especiales, observaciones del centro..."
                    />
                </FormField>

                {err && <Alert variant="error">{err}</Alert>}
            </form>
        </Modal>
    );
}

export default function Agreements() {
    const canCreate = useCanAccess('agreementCreate');
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

    return (
        <div className="page">
            <PageHeader
                title="Convenios"
                subtitle={`${agreements.length} convenio${agreements.length !== 1 ? 's' : ''} firmado${agreements.length !== 1 ? 's' : ''}`}
                actions={
                    canCreate ? (
                        <Button onClick={() => setShowModal(true)}>+ Nuevo convenio</Button>
                    ) : null
                }
            />

            {loading ? (
                <LoadingState />
            ) : agreements.length === 0 ? (
                <EmptyState
                    icon="📋"
                    message="No hay convenios firmados todavía."
                >
                    {canCreate && (
                        <Button onClick={() => setShowModal(true)}>
                            Firmar primer convenio
                        </Button>
                    )}
                </EmptyState>
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
                                    <td><StatusBadge status="firmado" label="Firmado" /></td>
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
