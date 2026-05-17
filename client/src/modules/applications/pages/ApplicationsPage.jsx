import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { api, resolveFileUrl } from '../../../services/api';
import { useCanAccess } from '../../../shared/hooks/useCanAccess';
import {
    NsAlert,
    NsButton,
    EmptyState,
    FormField,
    FormRow,
    LoadingState,
    Modal,
    PageHeader,
    NsBadge,
    NsCard
} from '../../../shared/components/ui';
import { Search as SearchIcon } from '@mui/icons-material';

const STATUS_OPTIONS = [
    { value: 'enviada', label: 'Enviada' },
    { value: 'en_revision', label: 'En revisión' },
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
    return application?.internship_title || application?.title || 'Oferta sin título';
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
    if (event?.event_type === 'created') return 'Creación de candidatura';
    if (event?.event_type === 'status_changed') return 'Cambio de estado';
    return event?.event_type || 'Evento';
}

function getStatusBadgeType(status) {
    switch (status) {
        case 'enviada': return 'info';
        case 'en_revision': return 'warning';
        case 'aceptada': return 'success';
        case 'rechazada': return 'error';
        case 'a_entrevista': return 'brand';
        default: return 'default';
    }
}

function getStatusLabel(status) {
    return STATUS_OPTIONS.find(o => o.value === status)?.label || status;
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
    onRefresh // <-- Nueva prop para recargar tras programar
}) {
    const { user } = useAuth(); // <-- Para saber si es empresa/centro
    const skills = splitSkills(application?.skills);
    const resolvedCvUrl = cvUrl(application?.cv_pdf_url);

    // Estados para el formulario de entrevistas
    const [showInterviewForm, setShowInterviewForm] = useState(false);
    const [interviewForm, setInterviewForm] = useState({
        interview_at: '',
        mode: 'presencial',
        location_text: '',
        notes: ''
    });
    const [scheduling, setScheduling] = useState(false);
    const [scheduleMsg, setScheduleMsg] = useState(null);

    // Estados para Formalizar Asignación (HD5)
    const [formalizing, setFormalizing] = useState(false);
    const [formalizeMsg, setFormalizeMsg] = useState(null);

    const handleFormalize = async () => {
        setFormalizing(true);
        setFormalizeMsg(null);
        try {
            await api.createAssignment({
                practica_id: application.internship_id || application.practica_id, // ensure fallback if property name differs
                alumno_id: application.student_id || application.alumno_id,
                empresa_id: application.company_id || application.empresa_id,
                centro_id: application.center_id,
                candidatura_id: application.id
            });
            setFormalizeMsg({ type: 'success', message: 'Asignación formalizada con éxito. Ahora puedes gestionarla en Expedientes.' });
            if (onRefresh) onRefresh();
        } catch (err) {
            setFormalizeMsg({ type: 'error', message: err.message || 'Error al formalizar la asignación' });
        } finally {
            setFormalizing(false);
        }
    };

    const handleScheduleInterview = async (e) => {
        e.preventDefault();
        setScheduling(true);
        setScheduleMsg(null);
        try {
            await api.scheduleInterview({
                application_id: application.id,
                ...interviewForm
            });
            setScheduleMsg({ type: 'success', message: 'Entrevista programada con éxito.' });
            setShowInterviewForm(false);
            if (onRefresh) onRefresh(); // Recarga la info de la candidatura
        } catch (err) {
            setScheduleMsg({ type: 'error', message: err.message });
        } finally {
            setScheduling(false);
        }
    };

    return (
        <Modal
            title="Detalle de candidatura"
            onClose={onClose}
            actions={
                <NsButton variant="ghost" onClick={onClose}>
                    Cerrar
                </NsButton>
            }
        >
            {loading ? (
                <LoadingState />
            ) : error ? (
                <NsAlert type="error">{error}</NsAlert>
            ) : !application ? (
                <EmptyState message="No se pudo cargar la candidatura." />
            ) : (
                <div className="space-y-6 max-w-7xl mx-auto">
                    {/* Cabecera del Alumno */}
                    <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                        <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                            {application?.student_name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-xl font-bold text-gray-900 truncate" title={application?.student_name}>{application?.student_name || 'Alumno sin nombre'}</h3>
                            <p className="text-sm text-gray-500 truncate" title={application?.student_email}>{application?.student_email}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <NsBadge type={getStatusBadgeType(application?.status)}>
                                    {getStatusLabel(application?.status)}
                                </NsBadge>
                                {application?.center_name && <NsBadge type="default">{application?.center_name}</NsBadge>}
                                {showMatchBadge && ['recomendado', 'preseleccionado'].includes(application?.match_status) && (
                                    <NsBadge type="brand">★ Recomendado por el centro</NsBadge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tarjetas de Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <NsCard padding="p-4">
                            <span className="text-xs font-semibold text-gray-500 uppercase">Oferta</span>
                            <div className="mt-1 font-medium text-gray-900">{displayInternshipTitle(application)}</div>
                        </NsCard>
                        <NsCard padding="p-4">
                            <span className="text-xs font-semibold text-gray-500 uppercase">Empresa</span>
                            <div className="mt-1 font-medium text-gray-900">{application?.company_name || 'Sin empresa'}</div>
                        </NsCard>
                        <NsCard padding="p-4">
                            <span className="text-xs font-semibold text-gray-500 uppercase">Fecha candidatura</span>
                            <div className="mt-1 font-medium text-gray-900">{formatDate(application?.created_at)}</div>
                        </NsCard>
                        <NsCard padding="p-4">
                            <span className="text-xs font-semibold text-gray-500 uppercase">Centro educativo</span>
                            <div className="mt-1 font-medium text-gray-900">{application?.center_name || 'Sin centro asignado'}</div>
                        </NsCard>
                    </div>

                    {/* Habilidades y CV */}
                    <NsCard padding="p-5">
                        <h4 className="font-bold text-gray-900 mb-3">Habilidades</h4>
                        {skills.length ? (
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill) => (
                                    <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">Sin habilidades informadas.</p>
                        )}
                    </NsCard>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <NsCard padding="p-5">
                            <h4 className="font-bold text-gray-900 mb-3">CV Texto</h4>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                {application?.cv_text || 'Sin CV de texto informado.'}
                            </p>
                        </NsCard>
                        <NsCard padding="p-5">
                            <h4 className="font-bold text-gray-900 mb-3">CV PDF</h4>
                            {resolvedCvUrl ? (
                                <a href={resolvedCvUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-800 font-medium text-sm transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    Descargar CV PDF
                                </a>
                            ) : (
                                <p className="text-gray-500 text-sm">Sin CV PDF subido.</p>
                            )}
                        </NsCard>
                    </div>

                    {/* NUEVO: Módulo de Entrevistas (HD4) */}
                    {(user?.role === 'empresa' || user?.role === 'centro') && application?.status !== 'rechazada' && application?.status !== 'cancelada' && (
                        <NsCard padding="p-6" className="border-t-4 border-t-brand-500 bg-brand-50/30">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-gray-900">Gestión de Entrevistas</h4>
                                {!showInterviewForm && (
                                    <NsButton size="sm" onClick={() => setShowInterviewForm(true)}>
                                        + Programar Entrevista
                                    </NsButton>
                                )}
                            </div>

                            {scheduleMsg && (
                                <div className="mb-4">
                                    <NsAlert type={scheduleMsg.type} onClose={() => setScheduleMsg(null)}>{scheduleMsg.message}</NsAlert>
                                </div>
                            )}

                            {showInterviewForm && (
                                <form onSubmit={handleScheduleInterview} className="space-y-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y Hora</label>
                                            <input
                                                type="datetime-local"
                                                required
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2 border"
                                                value={interviewForm.interview_at}
                                                onChange={e => setInterviewForm({ ...interviewForm, interview_at: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
                                            <select
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2 border"
                                                value={interviewForm.mode}
                                                onChange={e => setInterviewForm({ ...interviewForm, mode: e.target.value })}
                                            >
                                                <option value="presencial">Presencial</option>
                                                <option value="virtual">Virtual</option>
                                                <option value="telefonica">Telefónica</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación o Enlace</label>
                                        <input
                                            type="text"
                                            placeholder={interviewForm.mode === 'virtual' ? 'https://meet.google.com/...' : 'Dirección de la oficina...'}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2 border"
                                            value={interviewForm.location_text}
                                            onChange={e => setInterviewForm({ ...interviewForm, location_text: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Notas / Instrucciones</label>
                                        <textarea
                                            rows={2}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2 border"
                                            value={interviewForm.notes}
                                            onChange={e => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex gap-2 justify-end mt-4">
                                        <NsButton type="button" variant="ghost" size="sm" onClick={() => setShowInterviewForm(false)}>Cancelar</NsButton>
                                        <NsButton type="submit" size="sm" loading={scheduling}>Programar</NsButton>
                                    </div>
                                </form>
                            )}
                        </NsCard>
                    )}

                    {/* NUEVO: Módulo de Asignación Formal (HD5) */}
                    {(user?.role === 'empresa' || user?.role === 'centro') && application?.status === 'aceptada' && (
                        <NsCard padding="p-6" className="border-t-4 border-t-indigo-500 bg-indigo-50/30">
                            <h4 className="font-bold text-gray-900 mb-2">Formalizar Asignación</h4>
                            <p className="text-sm text-gray-600 mb-4">
                                Esta candidatura ha sido aceptada. El siguiente paso es formalizar el expediente para hacer el seguimiento documental y administrativo.
                            </p>
                            
                            {formalizeMsg && (
                                <div className="mb-4">
                                    <NsAlert type={formalizeMsg.type} onClose={() => setFormalizeMsg(null)}>{formalizeMsg.message}</NsAlert>
                                </div>
                            )}

                            <NsButton size="sm" onClick={handleFormalize} loading={formalizing}>
                                Formalizar Asignación
                            </NsButton>
                        </NsCard>
                    )}

                    {/* Actualizar Estado General */}
                    {canChangeStatus && (
                        <NsCard padding="p-6">
                            <h4 className="font-bold text-gray-900 mb-4">Actualizar estado de Candidatura</h4>
                            <form onSubmit={onSaveStatus} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2 border"
                                        value={statusDraft}
                                        onChange={(e) => onStatusDraftChange(e.target.value)}
                                    >
                                        {STATUS_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones internas</label>
                                    <textarea
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2 border"
                                        value={internalNotesDraft}
                                        onChange={(e) => onInternalNotesDraftChange(e.target.value)}
                                        rows={2}
                                    />
                                </div>
                                <NsButton type="submit" loading={saving} className="w-full sm:w-auto mt-2">
                                    {saving ? 'Guardando...' : 'Guardar estado'}
                                </NsButton>
                            </form>
                        </NsCard>
                    )}

                    {/* Historial de eventos */}
                    <NsCard padding="p-5">
                        <h4 className="font-bold text-gray-900 mb-4">Historial de eventos</h4>
                        {eventsLoading ? (
                            <p className="text-gray-500 text-sm">Cargando historial...</p>
                        ) : !events || events.length === 0 ? (
                            <p className="text-gray-500 text-sm">Sin eventos registrados.</p>
                        ) : (
                            <div className="space-y-4">
                                {events?.map((event) => (
                                    <div key={event.id} className="flex gap-4 items-start">
                                        <div className="mt-1.5 w-2 h-2 rounded-full bg-brand-400 flex-shrink-0"></div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="font-semibold text-sm text-gray-900">{eventLabel(event)}</div>
                                                <div className="text-xs text-gray-500">{formatDate(event.created_at)}</div>
                                            </div>
                                            <div className="text-xs text-gray-500 mb-2">{event.actor_name || 'Sistema'}</div>
                                            <div className="flex items-center gap-2 mt-2">
                                                {event.from_status && <NsBadge type={getStatusBadgeType(event.from_status)}>{getStatusLabel(event.from_status)}</NsBadge>}
                                                {event.from_status && <span className="text-gray-400">→</span>}
                                                {event.to_status && <NsBadge type={getStatusBadgeType(event.to_status)}>{getStatusLabel(event.to_status)}</NsBadge>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </NsCard>
                </div>
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
        <div className="max-w-7xl mx-auto space-y-6">
            <PageHeader
                title="Mis Candidaturas"
                subtitle={`${apps?.length || 0} candidatura${apps?.length !== 1 ? 's' : ''} enviada${apps?.length !== 1 ? 's' : ''}`}
            />

            {msg && <NsAlert type="error" onClose={() => setMsg('')}>{msg}</NsAlert>}

            {!apps || apps.length === 0 ? (
                <EmptyState
                    icon="NS"
                    message="No has enviado ninguna candidatura todavía."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {apps?.map((application) => (
                        <NsCard key={application.id} className="flex flex-col">
                            <div className="mb-4">
                                <NsBadge type={getStatusBadgeType(application.status)} className="mb-3">
                                    {getStatusLabel(application.status)}
                                </NsBadge>
                                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{displayInternshipTitle(application)}</h3>
                                <div className="text-sm text-gray-500">{application.company_name}</div>
                            </div>
                            <div className="text-xs text-gray-400 mb-4 mt-auto">
                                Enviada el {formatDate(application.created_at)}
                            </div>
                            <NsButton variant="secondary" size="sm" onClick={() => openDetail(application.id)} className="w-full">
                                Ver detalle
                            </NsButton>
                        </NsCard>
                    ))}
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
    const [studentSearch, setStudentSearch] = useState('');

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
        setStudentSearch('');
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
            setStatusDraft(data?.status || 'enviada');
            setInternalNotesDraft(data?.internal_notes || '');
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

    const filteredApps = useMemo(() => {
        if (!apps) return [];
        if (!studentSearch.trim()) return apps;
        const lower = studentSearch.toLowerCase();
        return apps.filter(app =>
            (app.student_name || '').toLowerCase().includes(lower) ||
            (app.student_email || '').toLowerCase().includes(lower)
        );
    }, [apps, studentSearch]);

    if (pageLoading) return <LoadingState />;

    return (
        <div className="max-w-[1400px] mx-auto space-y-6">
            <PageHeader
                title={isCompany ? 'Candidatos' : 'Candidaturas'}
                subtitle="Selecciona una oferta para ver sus candidaturas"
            />

            {msg && <NsAlert type="success" onClose={() => setMsg('')}>{msg}</NsAlert>}

            <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-1/3 flex-shrink-0 md:sticky md:top-6 md:self-start md:max-h-[calc(100vh-3rem)] overflow-y-auto overflow-x-hidden">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Ofertas</h2>
                    {!internships || internships.length === 0 ? (
                        <p className="text-gray-500 text-sm">No hay ofertas.</p>
                    ) : (
                        <div className="space-y-3 pb-4 p-2">
                            {internships?.map((internship) => {
                                const isSelected = selectedInternshipId === internship.id;
                                return (
                                    <button
                                        key={internship.id}
                                        type="button"
                                        className={`w-full text-left p-4 rounded-xl border transition-all relative ${isSelected ? 'ring-2 ring-brand-500 bg-brand-50/50 shadow-md border-transparent' : 'border-gray-200 bg-white hover:border-brand-300 hover:shadow-sm'}`}
                                        onClick={() => loadApps(internship.id)}
                                    >
                                        <div className={`font-semibold text-sm pr-4 ${isSelected ? 'text-brand-900' : 'text-gray-900'}`}>{internship.title}</div>
                                        <div className="text-xs text-gray-500 mt-1">{internship.company_name}</div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <NsBadge type={internship.status === 'publicada' ? 'success' : 'default'}>{internship.status}</NsBadge>
                                            <NsBadge type="info">{internship.available_slots} plazas</NsBadge>
                                        </div>
                                        {isSelected && (
                                            <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 bg-brand-500 text-white rounded-full items-center justify-center shadow-md z-10">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="w-full flex-1 min-w-0">
                    {!selectedInternshipId ? (
                        <div className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-xl shadow-sm border border-gray-100 h-full min-h-[400px]">
                            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center text-3xl mb-4">
                                👈
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Ninguna oferta seleccionada</h3>
                            <p className="text-gray-500 text-center max-w-sm">Selecciona una oferta de la lista izquierda para visualizar y gestionar a los candidatos asociados.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                        {selectedInternship?.title}
                                        <NsBadge type="info">{apps?.length || 0} candidato{(apps?.length !== 1) ? 's' : ''}</NsBadge>
                                    </h2>
                                </div>
                                <div className="relative w-full sm:w-64 shrink-0">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-gray-400">
                                        <SearchIcon className="h-4 w-4" />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm py-2.5 pr-2.5 pl-[3.5rem]"
                                        placeholder="Buscar por nombre o email..."
                                        value={studentSearch}
                                        onChange={(e) => setStudentSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            {loadingApps ? (
                                <LoadingState />
                            ) : !apps || apps.length === 0 ? (
                                <NsCard><p className="text-gray-500 py-10 text-center">Esta oferta no tiene candidatos todavía.</p></NsCard>
                            ) : !filteredApps || filteredApps.length === 0 ? (
                                <NsCard><p className="text-gray-500 py-10 text-center">Ningún candidato coincide con la búsqueda.</p></NsCard>
                            ) : (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                                    {filteredApps?.map((application) => (
                                        <NsCard key={application.id} className="flex items-center gap-4 transition-shadow hover:shadow-md" padding="p-3">
                                            <div className="w-10 h-10 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                                {application.student_name?.[0]?.toUpperCase() || 'A'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <div className="font-bold text-gray-900 text-sm truncate" title={application.student_name}>{application.student_name}</div>
                                                    {['recomendado', 'preseleccionado'].includes(application.match_status) && (
                                                        <NsBadge type="brand" className="text-[10px] px-1.5 py-0 leading-relaxed tracking-wide">★ Recomendado</NsBadge>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 truncate" title={application.student_email}>{application.student_email}</div>
                                                <div className="text-[10px] text-gray-400 truncate mt-0.5" title={application.center_name}>{application.center_name || 'Sin centro asignado'}</div>
                                            </div>
                                            <div className="flex flex-col items-end justify-between gap-2 shrink-0 h-full">
                                                <NsBadge type={getStatusBadgeType(application.status)} className="text-[10px] px-1.5">{getStatusLabel(application.status)}</NsBadge>
                                                <NsButton variant="ghost" size="sm" onClick={() => openDetail(application.id)} className="h-7 text-xs px-2 mt-auto">
                                                    Ver
                                                </NsButton>
                                            </div>
                                        </NsCard>
                                    ))}
                                </div>
                            )}
                        </>
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
                    // NUEVA LÍNEA:
                    onRefresh={() => {
                        openDetail(selectedId);
                        if (selectedInternshipId) loadApps(selectedInternshipId);
                    }}
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
        <div className="max-w-7xl mx-auto space-y-6">
            <PageHeader
                title="Candidaturas de alumnos"
                subtitle={`${apps?.length || 0} candidatura${apps?.length !== 1 ? 's' : ''} de tu centro`}
            />

            {msg && <NsAlert type="error" onClose={() => setMsg('')}>{msg}</NsAlert>}

            {!apps || apps.length === 0 ? (
                <EmptyState
                    icon="NS"
                    message="No hay candidaturas de alumnos de tu centro."
                />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {apps?.map((application) => (
                        <NsCard key={application.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-base font-bold text-gray-900 truncate" title={application.student_name}>{application.student_name || 'Alumno sin nombre'}</h3>
                                    {['recomendado', 'preseleccionado'].includes(application.match_status) && (
                                        <NsBadge type="brand">★ Recomendado</NsBadge>
                                    )}
                                </div>
                                <div className="text-sm text-gray-500 mb-2 truncate" title={application.student_email}>{application.student_email}</div>
                                <div className="text-sm font-medium text-gray-800 mb-1 line-clamp-1" title={displayInternshipTitle(application)}>{displayInternshipTitle(application)}</div>
                                <div className="text-xs text-gray-500">{application.company_name || 'Sin empresa'} • {formatDate(application.created_at)}</div>
                            </div>
                            <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 shrink-0">
                                <NsBadge type={getStatusBadgeType(application.status)}>{getStatusLabel(application.status)}</NsBadge>
                                <NsButton variant="ghost" size="sm" onClick={() => openDetail(application.id)}>
                                    Ver detalle
                                </NsButton>
                            </div>
                        </NsCard>
                    ))}
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
                    // NUEVA LÍNEA:
                    onRefresh={() => {
                        openDetail(selectedId);
                        loadCenterApplications();
                    }}
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
