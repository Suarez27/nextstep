import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { api, resolveFileUrl } from '../../../services/api';
import { useCatalogItems } from '../../../shared/hooks/useCatalogs';
import {
    Alert,
    Button,
    EmptyState,
    FormField,
    LoadingState,
    PageHeader,
    SectionHeader,
    StatCard,
    StatusBadge,
} from '../../../shared/components/ui';

function formatDate(value) {
    if (!value) return 'Sin fecha';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function normalizeStatus(status, hasDocument) {
    if (status) return String(status).toLowerCase();
    return hasDocument ? 'entregado' : 'pendiente';
}

function normalizeStudentStatus(student) {
    const status = String(student?.verification_status || '').toLowerCase();
    if (status) return status;
    return student?.validated ? 'approved' : 'pending';
}

function buildDocumentRows(documentTypes, documents) {
    const byType = new Map();
    documents.forEach((document) => {
        const typeId = String(document.document_type_item_id);
        if (!byType.has(typeId)) byType.set(typeId, document);
    });

    const rows = documentTypes.map((type) => ({
        id: type.id,
        type,
        document: byType.get(String(type.id)) || null,
    }));

    documents.forEach((document) => {
        if (!documentTypes.some((type) => String(type.id) === String(document.document_type_item_id))) {
            rows.push({
                id: `document-${document.id}`,
                type: {
                    id: document.document_type_item_id,
                    value: document.document_type_value,
                    label: document.document_type_label || 'Documento',
                },
                document,
            });
        }
    });

    return rows;
}

export default function Students() {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [selected, setSelected] = useState(null);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [followups, setFollowups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [createdCredentials, setCreatedCredentials] = useState(null);
    const [tab, setTab] = useState('pendientes'); // 'pendientes' | 'rechazados' | 'validados'
    const [creatingStudent, setCreatingStudent] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '' });
    const [followupForm, setFollowupForm] = useState({ content: '', progress: 50 });
    const [reviewNotes, setReviewNotes] = useState({});
    const [reviewingDocumentId, setReviewingDocumentId] = useState(null);
    const { items: documentTypes } = useCatalogItems('document_types');

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
        setSelectedDocuments([]);
        setLoadingDetail(true);
        setError('');
        try {
            const [detail, documents, f] = await Promise.all([
                api.getStudentDetail(s.id),
                api.getStudentDocuments(s.id),
                api.getFollowups(s.id).catch(() => []),
            ]);
            setSelected(detail);
            setSelectedDocuments(documents || []);
            setFollowups(f || []);
        } catch {
            setError('No se pudo cargar el detalle del alumno.');
            setFollowups([]);
            setSelectedDocuments([]);
        } finally {
            setLoadingDetail(false);
        }
    }

    async function reviewDocument(document, status) {
        if (!selected || !document) return;

        const notes = reviewNotes[document.id] || '';
        if (status === 'rechazado' && !notes.trim()) {
            setError('Anade una observacion para rechazar el documento.');
            return;
        }

        setReviewingDocumentId(document.id);
        setMsg('');
        setError('');

        try {
            const updated = status === 'validado'
                ? await api.validateStudentDocument({ studentId: selected.id, documentId: document.id, notes })
                : await api.rejectStudentDocument({ studentId: selected.id, documentId: document.id, notes });

            setSelectedDocuments((current) => current.map((item) => (
                item.id === updated.id ? updated : item
            )));
            setMsg(status === 'validado' ? 'Documento validado correctamente.' : 'Documento rechazado con observacion.');
        } catch (err) {
            setError(err.message);
        } finally {
            setReviewingDocumentId(null);
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

    async function handleReject(s) {
        const reason = window.prompt(`Motivo de rechazo para ${s.name}:`, '');
        if (!reason || !reason.trim()) {
            setError('Debes indicar un motivo para rechazar al alumno.');
            return;
        }

        try {
            await api.rejectStudent(s.id, reason.trim());
            setError('');
            setMsg(`${s.name} rechazado correctamente.`);
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

    const pending = students.filter((s) => !s.validated && normalizeStudentStatus(s) !== 'rejected');
    const rejected = students.filter((s) => normalizeStudentStatus(s) === 'rejected');
    const validated = students.filter((s) => s.validated);
    const listed = tab === 'pendientes' ? pending : tab === 'rechazados' ? rejected : validated;
    const documentRows = useMemo(
        () => buildDocumentRows(documentTypes, selectedDocuments),
        [documentTypes, selectedDocuments]
    );
    const missingDocuments = documentRows.filter((row) => !row.document || normalizeStatus(row.document.status, true) === 'pendiente');
    const rejectedDocuments = documentRows.filter((row) => normalizeStatus(row.document?.status, Boolean(row.document)) === 'rechazado');
    const deliveredDocuments = documentRows.filter((row) => ['entregado', 'validado'].includes(normalizeStatus(row.document?.status, Boolean(row.document))));

    return (
        <div className="page">
            <PageHeader
                title="Alumnos"
                subtitle={`${pending.length} pendiente${pending.length !== 1 ? 's' : ''} de validar | ${validated.length} validado${validated.length !== 1 ? 's' : ''}`}
            />

            {msg && <Alert onClick={() => setMsg('')}>{msg}</Alert>}
            {error && (
                <Alert variant="error" onClick={() => setError('')} className="mb-sm">
                    {error}
                </Alert>
            )}

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
                <button
                    className={`tab-btn${tab === 'rechazados' ? ' active' : ''}`}
                    onClick={() => { setTab('rechazados'); setSelected(null); }}
                >
                    Rechazados
                    {rejected.length > 0 && <span className="tab-badge">{rejected.length}</span>}
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
                        <LoadingState />
                    ) : listed.length === 0 ? (
                        <p className="empty-msg">
                            {tab === 'pendientes'
                                ? 'No hay alumnos pendientes de validar.'
                                : tab === 'rechazados'
                                    ? 'No hay alumnos rechazados.'
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
                                    <StatusBadge
                                        status={normalizeStudentStatus(selected)}
                                        className="ml"
                                        label={
                                            normalizeStudentStatus(selected) === 'approved'
                                                ? 'Perfil validado'
                                                : normalizeStudentStatus(selected) === 'rejected'
                                                    ? 'Perfil rechazado'
                                                    : 'Perfil pendiente'
                                        }
                                    />
                                </span>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {!selected.validated && (
                                        <button
                                            className="btn-primary btn-sm"
                                            onClick={() => handleValidate(selected)}
                                        >
                                            Validar alumno
                                        </button>
                                    )}
                                    <button
                                        className="btn-ghost btn-sm"
                                        onClick={() => handleReject(selected)}
                                    >
                                        Rechazar alumno
                                    </button>
                                </div>
                            </div>

                            {loadingDetail ? (
                                <LoadingState />
                            ) : (
                                <>
                                    <div className="stats-row students-review-stats">
                                        <StatCard icon="&#128196;" label="Entregados" value={deliveredDocuments.length} color="blue" />
                                        <StatCard icon="&#9203;" label="Pendientes" value={missingDocuments.length} color={missingDocuments.length ? 'amber' : 'green'} />
                                        <StatCard icon="&#9888;" label="Rechazados" value={rejectedDocuments.length} color={rejectedDocuments.length ? 'red' : 'green'} />
                                    </div>

                                    {missingDocuments.length > 0 && (
                                        <div className="doc-alert doc-alert-amber">
                                            <strong>Faltan documentos:</strong>{' '}
                                            {missingDocuments.map((row) => row.type.label).join(', ')}.
                                        </div>
                                    )}

                                    {rejectedDocuments.length > 0 && (
                                        <div className="doc-alert doc-alert-red">
                                            <strong>Documentos rechazados:</strong>{' '}
                                            {rejectedDocuments.map((row) => row.type.label).join(', ')}.
                                        </div>
                                    )}

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

                                    {selected.verification_note && (
                                        <div className="detail-section">
                                            <strong>Motivo de validacion:</strong>
                                            <p className="cv-text">{selected.verification_note}</p>
                                        </div>
                                    )}

                                    {selected.cv_text ? (
                                        <div className="detail-section">
                                            <strong>CV texto:</strong>
                                            <p className="cv-text">{selected.cv_text}</p>
                                        </div>
                                    ) : (
                                        <div className="detail-section">
                                            <span className="empty-msg">Sin CV todavia.</span>
                                        </div>
                                    )}

                                    <div className="detail-section">
                                        <SectionHeader title="Expediente documental" />
                                        {documentRows.length === 0 ? (
                                            <EmptyState icon="&#128196;" message="No hay tipos de documento activos para revisar." />
                                        ) : (
                                            <div className="center-documents-list">
                                                {documentRows.map((row) => {
                                                    const document = row.document;
                                                    const status = normalizeStatus(document?.status, Boolean(document));
                                                    const isReviewing = reviewingDocumentId === document?.id;

                                                    return (
                                                        <article key={row.id} className={`center-document-row status-${status}`}>
                                                            <div className="center-document-main">
                                                                <div>
                                                                    <h4>{row.type.label || 'Documento'}</h4>
                                                                    <p>{document?.original_name || 'Sin archivo entregado'}</p>
                                                                    <span>Subido: {formatDate(document?.uploaded_at || document?.created_at)}</span>
                                                                </div>
                                                                <StatusBadge status={status} />
                                                            </div>

                                                            {(!document?.notes || document.notes === 'NULL') ? (
                                                                <div className="document-notes text-sm text-gray-400 italic">
                                                                    Sin observaciones
                                                                </div>
                                                            ) : (
                                                                <div className="document-notes">
                                                                    <span className="block font-semibold text-gray-700 mb-1">Observaciones</span>
                                                                    <p className="text-sm text-gray-600">{document.notes}</p>
                                                                </div>
                                                            )}

                                                            {document?.file_url ? (
                                                                <div className="center-document-actions">
                                                                    <a className="btn-ghost document-open-link" href={resolveFileUrl(document.file_url)} target="_blank" rel="noreferrer">
                                                                        Abrir documento
                                                                    </a>
                                                                    <FormField label="Observacion">
                                                                        <input
                                                                            type="text"
                                                                            maxLength={1000}
                                                                            value={reviewNotes[document.id] || ''}
                                                                            onChange={(e) => setReviewNotes((current) => ({
                                                                                ...current,
                                                                                [document.id]: e.target.value,
                                                                            }))}
                                                                            placeholder="Opcional al validar, obligatoria al rechazar"
                                                                        />
                                                                    </FormField>
                                                                    <div className="center-document-buttons">
                                                                        <Button
                                                                            type="button"
                                                                            disabled={isReviewing}
                                                                            onClick={() => reviewDocument(document, 'validado')}
                                                                        >
                                                                            Validar
                                                                        </Button>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            disabled={isReviewing}
                                                                            onClick={() => reviewDocument(document, 'rechazado')}
                                                                        >
                                                                            Rechazar
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <p className="empty-msg">Pendiente de entrega por el alumno.</p>
                                                            )}
                                                        </article>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
