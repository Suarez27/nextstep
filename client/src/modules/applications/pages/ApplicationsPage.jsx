import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { api, resolveFileUrl } from '../../../services/api';
import { useCanAccess } from '../../../shared/hooks/useCanAccess';
import {
    Alert,
    Button,
    EmptyState,
    FormField,
    FormRow,
    LoadingState,
    Modal,
    PageHeader,
    StatusBadge,
} from '../../../shared/components/ui';

const STATUS_OPTIONS = [
    { value: 'enviada', label: 'Enviada' },
    { value: 'en_revision', label: 'En revision' },
    { value: 'aceptada', label: 'Aceptada' },
    { value: 'rechazada', label: 'Rechazada' },
    { value: 'a_entrevista', label: 'A entrevista' },
];

function formatDate(value) {
    if (!value) return 'Sin fecha';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('es-ES');
}

function displayInternshipTitle(application) {
    return application?.internship_title || application?.title || 'Oferta sin titulo';
}

function splitSkills(skills) {
    if (!skills) return [];
    return String(skills)
        .split(/[,;\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function cvUrl(value) {
    return resolveFileUrl(value);
}

function eventLabel(event) {
    if (event?.event_type === 'created') return 'Creacion de candidatura';
    if (event?.event_type === 'status_changed') return 'Cambio de estado';
    return event?.event_type || 'Evento';
}

function ApplicationDetailModal({
    application,
    loading,
    error,
    events = [],
    eventsLoading = false,
    canChangeStatus,
    statusDraft,
    notesDraft,
    internalNotesDraft,
    saving,
    onStatusDraftChange,
    onNotesDraftChange,
    onInternalNotesDraftChange,
    onSaveStatus,
    onClose,
    showMatchBadge = false,
}) {
    const skills = splitSkills(application?.skills);
    const resolvedCvUrl = cvUrl(application?.cv_pdf_url);

    return (
        <Modal
            title="Detalle de candidatura"
            onClose={onClose}
            actions={
                <Button type="button" variant="ghost" onClick={onClose}>
                    Cerrar
                </Button>
            }
        >
            {loading ? (
                <LoadingState />
            ) : error ? (
                <Alert variant="error">{error}</Alert>
            ) : !application ? (
                <EmptyState message="No se pudo cargar la candidatura." />
            ) : (
                <>
                    <div className="applicant-detail-header">
                        <div className="applicant-avatar large">
                            {application.student_name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div>
                            <h3>{application.student_name || 'Alumno sin nombre'}</h3>
                            <p>{application.student_email}</p>
                            <div className="offer-tags">
                                <StatusBadge status={application.status} />
                                {application.center_name && <span className="tag tag-gray">{application.center_name}</span>}
                                {showMatchBadge && ['recomendado', 'preseleccionado'].includes(application?.match_status) && (
                                    <span className="tag tag-blue">Recomendado por el centro</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="application-detail-grid">
                        <div>
                            <span>Oferta</span>
                            <strong>{displayInternshipTitle(application)}</strong>
                        </div>
                        <div>
                            <span>Empresa</span>
                            <strong>{application.company_name || 'Sin empresa'}</strong>
                        </div>
                        <div>
                            <span>Fecha candidatura</span>
                            <strong>{formatDate(application.created_at)}</strong>
                        </div>
                        <div>
                            <span>Centro educativo</span>
                            <strong>{application.center_name || 'Sin centro asignado'}</strong>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h4>Habilidades</h4>
                        {skills.length ? (
                            <div className="skills-preview">
                                {skills.map((skill) => (
                                    <span key={skill} className="skill-tag">{skill}</span>
                                ))}
                            </div>
                        ) : (
                            <p className="empty-msg">Sin habilidades informadas.</p>
                        )}
                    </div>

                    <div className="detail-section">
                        <h4>CV texto</h4>
                        <p className="cv-text">{application.cv_text || 'Sin CV de texto informado.'}</p>
                    </div>

                    <div className="detail-section">
                        <h4>CV PDF</h4>
                        {resolvedCvUrl ? (
                            <a className="btn-ghost inline-action" href={resolvedCvUrl} target="_blank" rel="noreferrer">
                                Abrir CV PDF
                            </a>
                        ) : (
                            <p className="empty-msg">Sin CV PDF subido.</p>
                        )}
                    </div>

                    <div className="detail-section">
                        <h4>Historial</h4>
                        {eventsLoading ? (
                            <p className="empty-msg">Cargando historial...</p>
                        ) : events.length === 0 ? (
                            <p className="empty-msg">Sin eventos registrados.</p>
                        ) : (
                            <div className="application-events-list">
                                {events.map((event) => (
                                    <div key={event.id} className="application-event-item">
                                        <div>
                                            <strong>{eventLabel(event)}</strong>
                                            <span>{event.actor_name || 'Sistema'} - {formatDate(event.created_at)}</span>
                                        </div>
                                        <div className="applicant-actions">
                                            {event.from_status && <StatusBadge status={event.from_status} />}
                                            {event.from_status && <span className="event-arrow">-&gt;</span>}
                                            {event.to_status && <StatusBadge status={event.to_status} />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {canChangeStatus && (
                        <form className="application-status-form" onSubmit={onSaveStatus}>
                            <FormRow>
                                <FormField label="Estado">
                                    <select value={statusDraft} onChange={(e) => onStatusDraftChange(e.target.value)}>
                                        {STATUS_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </FormField>
                            </FormRow>

                            <FormField label="Observaciones internas">
                                <textarea
                                    value={internalNotesDraft}
                                    onChange={(e) => onInternalNotesDraftChange(e.target.value)}
                                    rows={3}
                                    maxLength={2000}
                                    placeholder="Notas visibles solo para la gestion interna de la empresa"
                                />
                            </FormField>

                            <FormField label="Nota del cambio">
                                <textarea
                                    value={notesDraft}
                                    onChange={(e) => onNotesDraftChange(e.target.value)}
                                    rows={2}
                                    maxLength={1000}
                                    placeholder="Motivo breve para registrar en eventos"
                                />
                            </FormField>

                            <Button type="submit" disabled={saving}>
                                {saving ? 'Guardando...' : 'Guardar estado'}
                            </Button>
                        </form>
                    )}
                </>
            )}
        </Modal>
    );
}

function AlumnoApplications() {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [detail, setDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState('');
    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(false);

    useEffect(() => {
        api.myApplications()
            .then(setApps)
            .catch((error) => setMsg(error.message))
            .finally(() => setLoading(false));
    }, []);

    async function openDetail(id) {
        setSelectedId(id);
        setDetail(null);
        setEvents([]);
        setDetailError('');
        setDetailLoading(true);
        setEventsLoading(true);
        try {
            const [data, eventData] = await Promise.all([
                api.getApplication(id),
                api.applicationEvents(id),
            ]);
            setDetail(data);
            setEvents(eventData);
        } catch (error) {
            setDetailError(error.message);
        } finally {
            setDetailLoading(false);
            setEventsLoading(false);
        }
    }

    function closeDetail() {
        setSelectedId(null);
        setDetail(null);
        setEvents([]);
        setDetailError('');
    }

    if (loading) return <LoadingState />;

    return (
        <div className="page">
            <PageHeader
                title="Mis Candidaturas"
                subtitle={`${apps.length} candidatura${apps.length !== 1 ? 's' : ''} enviada${apps.length !== 1 ? 's' : ''}`}
            />

            {msg && <Alert variant="error" onClick={() => setMsg('')}>{msg}</Alert>}

            {apps.length === 0 ? (
                <EmptyState
                    icon="NS"
                    message="No has enviado ninguna candidatura todavia."
                />
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Oferta</th>
                                <th>Empresa</th>
                                <th>Estado</th>
                                <th>Fecha</th>
                                <th>Detalle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apps.map((application) => (
                                <tr key={application.id}>
                                    <td><strong>{displayInternshipTitle(application)}</strong></td>
                                    <td>{application.company_name}</td>
                                    <td><StatusBadge status={application.status} /></td>
                                    <td>{formatDate(application.created_at)}</td>
                                    <td>
                                        <button className="btn-sm btn-primary" type="button" onClick={() => openDetail(application.id)}>
                                            Ver
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedId && (
                <ApplicationDetailModal
                    application={detail}
                    loading={detailLoading}
                    error={detailError}
                    events={events}
                    eventsLoading={eventsLoading}
                    canChangeStatus={false}
                    onClose={closeDetail}
                    showMatchBadge={false}
                />
            )}
        </div>
    );
}

function ManagerApplications() {
    const { user } = useAuth();
    const isCompany = user?.role === 'empresa';
    const [internships, setInternships] = useState([]);
    const [selectedInternshipId, setSelectedInternshipId] = useState(null);
    const [apps, setApps] = useState([]);
    const [loadingApps, setLoadingApps] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [detail, setDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState('');
    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [statusDraft, setStatusDraft] = useState('enviada');
    const [notesDraft, setNotesDraft] = useState('');
    const [internalNotesDraft, setInternalNotesDraft] = useState('');
    const [savingStatus, setSavingStatus] = useState(false);

    useEffect(() => {
        api.getInternships()
            .then((data) => {
                setInternships(data);
                if (data[0]?.id) {
                    loadApps(data[0].id);
                }
            })
            .catch((error) => setMsg(error.message))
            .finally(() => setPageLoading(false));
    }, []);

    async function loadApps(internshipId) {
        setSelectedInternshipId(internshipId);
        setLoadingApps(true);
        try {
            const data = await api.internshipApplications(internshipId);
            setApps(data);
        } catch (error) {
            setMsg(error.message);
            setApps([]);
        } finally {
            setLoadingApps(false);
        }
    }

    async function openDetail(id) {
        setSelectedId(id);
        setDetail(null);
        setEvents([]);
        setDetailError('');
        setDetailLoading(true);
        setEventsLoading(true);
        setNotesDraft('');
        try {
            const [data, eventData] = await Promise.all([
                api.getApplication(id),
                api.applicationEvents(id),
            ]);
            setDetail(data);
            setEvents(eventData);
            setStatusDraft(data.status || 'enviada');
            setInternalNotesDraft(data.internal_notes || '');
        } catch (error) {
            setDetailError(error.message);
        } finally {
            setDetailLoading(false);
            setEventsLoading(false);
        }
    }

    function closeDetail() {
        setSelectedId(null);
        setDetail(null);
        setEvents([]);
        setDetailError('');
        setNotesDraft('');
        setInternalNotesDraft('');
    }

    async function saveStatus(e) {
        e.preventDefault();
        if (!detail?.id) return;

        setSavingStatus(true);
        try {
            const updated = await api.setApplicationStatus(detail.id, statusDraft, {
                notes: notesDraft,
                internal_notes: internalNotesDraft,
            });
            setDetail(updated);
            setStatusDraft(updated.status || statusDraft);
            setInternalNotesDraft(updated.internal_notes || '');
            setNotesDraft('');
            const eventData = await api.applicationEvents(detail.id);
            setEvents(eventData);
            setMsg('Estado de candidatura actualizado.');
            if (selectedInternshipId) await loadApps(selectedInternshipId);
        } catch (error) {
            setDetailError(error.message);
        } finally {
            setSavingStatus(false);
        }
    }

    const selectedInternship = useMemo(
        () => internships.find((item) => Number(item.id) === Number(selectedInternshipId)),
        [internships, selectedInternshipId]
    );

    if (pageLoading) return <LoadingState />;

    return (
        <div className="page">
            <PageHeader
                title={isCompany ? 'Candidatos' : 'Candidaturas'}
                subtitle="Selecciona una oferta para ver sus candidaturas"
            />

            {msg && <Alert onClick={() => setMsg('')}>{msg}</Alert>}

            <div className="two-col-layout">
                <div className="col-left">
                    <h2 className="col-title">Ofertas</h2>
                    {internships.length === 0 ? (
                        <p className="empty-msg">No hay ofertas.</p>
                    ) : (
                        internships.map((internship) => (
                            <button
                                key={internship.id}
                                type="button"
                                className={`selectable-row as-button${selectedInternshipId === internship.id ? ' selected' : ''}`}
                                onClick={() => loadApps(internship.id)}
                            >
                                <div className="sel-title">{internship.title}</div>
                                <div className="sel-sub">{internship.company_name}</div>
                                <div className="offer-tags mt-sm">
                                    <StatusBadge status={internship.status} />
                                    <span className="tag tag-green">{internship.available_slots} plazas</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <div className="col-right">
                    <h2 className="col-title">
                        {selectedInternship ? selectedInternship.title : 'Candidaturas'}
                    </h2>
                    {!selectedInternshipId ? (
                        <p className="empty-msg">Selecciona una oferta a la izquierda.</p>
                    ) : loadingApps ? (
                        <LoadingState />
                    ) : apps.length === 0 ? (
                        <p className="empty-msg">Esta oferta no tiene candidatos todavia.</p>
                    ) : (
                        apps.map((application) => (
                            <div key={application.id} className="applicant-card">
                                <div className="applicant-info">
                                    <div className="applicant-avatar">{application.student_name?.[0]?.toUpperCase() || 'A'}</div>
                                    <div>
                                        <div className="applicant-name">{application.student_name}</div>
                                        <div className="applicant-email">{application.student_email}</div>
                                        <div className="applicant-email">{application.center_name || 'Sin centro asignado'}</div>
                                        {['recomendado', 'preseleccionado'].includes(application.match_status) && (
                                            <div className="mt-1">
                                                <span className="tag tag-blue">Recomendado por el centro</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="applicant-actions">
                                    <StatusBadge status={application.status} />
                                    <button className="btn-sm btn-primary" type="button" onClick={() => openDetail(application.id)}>
                                        Ver detalle
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {selectedId && (
                <ApplicationDetailModal
                    application={detail}
                    loading={detailLoading}
                    error={detailError}
                    events={events}
                    eventsLoading={eventsLoading}
                    canChangeStatus={isCompany}
                    statusDraft={statusDraft}
                    notesDraft={notesDraft}
                    internalNotesDraft={internalNotesDraft}
                    saving={savingStatus}
                    onStatusDraftChange={setStatusDraft}
                    onNotesDraftChange={setNotesDraft}
                    onInternalNotesDraftChange={setInternalNotesDraft}
                    onSaveStatus={saveStatus}
                    onClose={closeDetail}
                    showMatchBadge={true}
                />
            )}
        </div>
    );
}

function CenterApplications() {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [detail, setDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState('');
    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(false);

    async function loadCenterApplications() {
        setLoading(true);
        try {
            const data = await api.centerApplications();
            setApps(data);
        } catch (error) {
            setMsg(error.message);
            setApps([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCenterApplications();
    }, []);

    async function openDetail(id) {
        setSelectedId(id);
        setDetail(null);
        setEvents([]);
        setDetailError('');
        setDetailLoading(true);
        setEventsLoading(true);
        try {
            const [data, eventData] = await Promise.all([
                api.getApplication(id),
                api.applicationEvents(id),
            ]);
            setDetail(data);
            setEvents(eventData);
        } catch (error) {
            setDetailError(error.message);
        } finally {
            setDetailLoading(false);
            setEventsLoading(false);
        }
    }

    function closeDetail() {
        setSelectedId(null);
        setDetail(null);
        setEvents([]);
        setDetailError('');
    }

    if (loading) return <LoadingState />;

    return (
        <div className="page">
            <PageHeader
                title="Candidaturas de alumnos"
                subtitle={`${apps.length} candidatura${apps.length !== 1 ? 's' : ''} de tu centro`}
            />

            {msg && <Alert variant="error" onClick={() => setMsg('')}>{msg}</Alert>}

            {apps.length === 0 ? (
                <EmptyState
                    icon="NS"
                    message="No hay candidaturas de alumnos de tu centro."
                />
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Alumno</th>
                                <th>Oferta</th>
                                <th>Empresa</th>
                                <th>Estado</th>
                                <th>Fecha</th>
                                <th>Detalle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apps.map((application) => (
                                <tr key={application.id}>
                                    <td>
                                        <strong>{application.student_name || 'Alumno sin nombre'}</strong>
                                        <div className="applicant-email">{application.student_email}</div>
                                        {['recomendado', 'preseleccionado'].includes(application.match_status) && (
                                            <div className="mt-1">
                                                <span className="tag tag-blue">Recomendado por el centro</span>
                                            </div>
                                        )}
                                    </td>
                                    <td>{displayInternshipTitle(application)}</td>
                                    <td>{application.company_name || 'Sin empresa'}</td>
                                    <td><StatusBadge status={application.status} /></td>
                                    <td>{formatDate(application.created_at)}</td>
                                    <td>
                                        <button className="btn-sm btn-primary" type="button" onClick={() => openDetail(application.id)}>
                                            Ver
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedId && (
                <ApplicationDetailModal
                    application={detail}
                    loading={detailLoading}
                    error={detailError}
                    events={events}
                    eventsLoading={eventsLoading}
                    canChangeStatus={false}
                    onClose={closeDetail}
                    showMatchBadge={true}
                />
            )}
        </div>
    );
}

export default function ApplicationsPage() {
    const { user } = useAuth();
    const canReviewApplications = useCanAccess('applicationsReview');
    if (user?.role === 'centro') return <CenterApplications />;
    return canReviewApplications ? <ManagerApplications /> : <AlumnoApplications />;
}
