import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { api } from '../../../services/api';
import { useCanAccess } from '../../../shared/hooks/useCanAccess';
import {
    Alert,
    EmptyState,
    PageHeader,
    SectionCard,
    SectionHeader,
    StatCard,
    StatusBadge,
} from '../../../shared/components/ui';

function applicationErrorMessage(error) {
    const message = error?.message || '';
    if (message.includes('Ya postulaste')) return 'Ya existe una candidatura para esta oferta.';
    if (message.includes('no esta disponible')) return 'La oferta ya no esta disponible para candidaturas.';
    if (message.includes('no tiene plazas') || message.includes('No quedan plazas')) return 'La oferta no tiene plazas disponibles.';
    if (message.includes('permisos') || message.includes('Solo cuentas de alumno')) return 'No tienes permisos para postularte a esta oferta.';
    return message || 'No se pudo enviar la candidatura.';
}

function InternshipCard({ item, onApply, alreadyApplied = false }) {
    return (
        <div className="list-card">
            <div className="list-card-header">
                <div>
                    <div className="list-card-title">{item.title}</div>
                    <div className="list-card-sub">{item.company_name}</div>
                </div>
                <span className="badge badge-blue">{item.hours_total}h</span>
            </div>
            <p className="list-card-desc">{item.description}</p>
            <div className="list-card-footer">
                <span className="tag">{item.schedule || 'Sin horario'}</span>
                <span className="tag">{item.slots} plaza{item.slots !== 1 ? 's' : ''}</span>
                {onApply && (
                    <button
                        className="btn-sm btn-primary"
                        onClick={() => onApply(item.id)}
                        disabled={alreadyApplied || Number(item.available_slots || 0) <= 0}
                    >
                        {alreadyApplied ? 'Enviada' : 'Postularme'}
                    </button>
                )}
            </div>
        </div>
    );
}

// ——— ALUMNO ———
function AlumnoDashboard() {
    const [internships, setInternships] = useState([]);
    const [applications, setApplications] = useState([]);
    const [msg, setMsg] = useState('');
    const [msgType, setMsgType] = useState('success');

    useEffect(() => {
        Promise.all([api.getInternships(), api.myApplications()])
            .then(([i, a]) => { setInternships(i.slice(0, 4)); setApplications(a); })
            .catch(() => { });
    }, []);

    async function applyTo(id) {
        try {
            await api.applyToInternship(id);
            setMsgType('success');
            setMsg('Candidatura enviada correctamente.');
            const a = await api.myApplications();
            setApplications(a);
        } catch (err) {
            setMsgType('error');
            setMsg(applicationErrorMessage(err));
        }
    }

    const appliedIds = new Set(applications.map((a) => Number(a.internship_id)));

    return (
        <div className="dashboard">
            <PageHeader title="Mi Panel" />

            <div className="stats-row">
                <StatCard icon="&#128140;" label="Candidaturas enviadas" value={applications.length} color="blue" />
                <StatCard
                    icon="&#9989;"
                    label="Aceptadas"
                    value={applications.filter((a) => a.status === 'aceptada').length}
                    color="green"
                />
                <StatCard
                    icon="&#9203;"
                    label="En revision"
                    value={applications.filter((a) => ['enviada', 'en_revision', 'a_entrevista'].includes(a.status)).length}
                    color="amber"
                />
                <StatCard icon="&#128188;" label="Ofertas disponibles" value={internships.length} color="purple" />
            </div>

            {msg && <Alert variant={msgType}>{msg}</Alert>}

            <div className="dashboard-grid">
                <SectionCard>
                    <SectionHeader
                        title="Últimas ofertas"
                        action={<Link to="/internships" className="link-more">Ver todas</Link>}
                    />
                    {internships.length === 0 ? (
                        <p className="empty-msg">No hay ofertas disponibles.</p>
                    ) : (
                        internships.map((item) => (
                            <InternshipCard
                                key={item.id}
                                item={item}
                                onApply={applyTo}
                                alreadyApplied={appliedIds.has(Number(item.id))}
                            />
                        ))
                    )}
                </SectionCard>

                <SectionCard>
                    <SectionHeader
                        title="Mis candidaturas"
                        action={<Link to="/applications" className="link-more">Ver todas</Link>}
                    />
                    {applications.length === 0 ? (
                        <EmptyState message="Aún no has enviado ninguna candidatura." />
                    ) : (
                        applications.slice(0, 5).map((a) => (
                            <div key={a.id} className="list-card compact">
                                <div className="list-card-header">
                                    <div>
                                        <div className="list-card-title">{a.title}</div>
                                        <div className="list-card-sub">{a.company_name}</div>
                                    </div>
                                    <StatusBadge status={a.status} />
                                </div>
                            </div>
                        ))
                    )}
                </SectionCard>
            </div>
        </div>
    );
}

// ——— EMPRESA ———
function EmpresaDashboard() {
    const [internships, setInternships] = useState([]);

    useEffect(() => {
        api.getInternships().then(setInternships).catch(() => { });
    }, []);

    return (
        <div className="dashboard">
            <PageHeader title="Panel de Empresa" />

            <div className="stats-row">
                <StatCard icon="&#128188;" label="Ofertas publicadas" value={internships.length} color="blue" />
                <StatCard
                    icon="&#128101;"
                    label="Plazas totales"
                    value={internships.reduce((s, i) => s + (i.slots || 0), 0)}
                    color="green"
                />
            </div>

            <SectionCard>
                <SectionHeader
                    title="Mis ofertas de prácticas"
                    action={<Link to="/internships" className="link-more">Gestionar</Link>}
                />
                {internships.length === 0 ? (
                    <p className="empty-msg">Aún no has publicado ninguna oferta.</p>
                ) : (
                    internships.map((item) => <InternshipCard key={item.id} item={item} />)
                )}
            </SectionCard>
        </div>
    );
}

// ——— CENTRO / ADMIN ———
function CentroAdminDashboard() {
    const [internships, setInternships] = useState([]);
    const [students, setStudents] = useState([]);
    const [agreements, setAgreements] = useState([]);
    const [pendingCenters, setPendingCenters] = useState(0);
    const [pendingCompanies, setPendingCompanies] = useState(0);
    const canOpenAdminPanel = useCanAccess('adminPanel');

    useEffect(() => {
        Promise.all([
            api.getInternships(),
            api.validatedStudents(),
            api.getAgreements(),
        ])
            .then(([i, s, ag]) => { setInternships(i); setStudents(s); setAgreements(ag); })
            .catch(() => { });
    }, []);

    useEffect(() => {
        if (!canOpenAdminPanel) return;

        Promise.all([
            api.adminCenters({ page: 1, perPage: 1, sortField: 'id', sortOrder: 'ASC', filter: JSON.stringify({ is_verified: false }) }),
            api.adminCompanies({ page: 1, perPage: 1, sortField: 'id', sortOrder: 'ASC', filter: JSON.stringify({ is_verified: false }) }),
        ])
            .then(([centersRes, companiesRes]) => {
                setPendingCenters(Number(centersRes?.meta?.total || 0));
                setPendingCompanies(Number(companiesRes?.meta?.total || 0));
            })
            .catch(() => {
                setPendingCenters(0);
                setPendingCompanies(0);
            });
    }, [canOpenAdminPanel]);

    return (
        <div className="dashboard">
            <PageHeader
                title="Panel de Gestión"
                actions={
                    canOpenAdminPanel ? (
                        <Link to="/admin" className="btn-primary">
                            Abrir backoffice
                        </Link>
                    ) : null
                }
            />

            <div className="stats-row">
                <StatCard icon="&#128188;" label="Prácticas" value={internships.length} color="blue" />
                <StatCard icon="&#127891;" label="Alumnos validados" value={students.length} color="green" />
                <StatCard icon="&#128203;" label="Convenios firmados" value={agreements.length} color="purple" />
            </div>

            {canOpenAdminPanel && (
                <div className="stats-row">
                    <StatCard icon="&#127979;" label="Centros pendientes" value={pendingCenters} color="amber" />
                    <StatCard icon="&#127970;" label="Empresas pendientes" value={pendingCompanies} color="amber" />
                </div>
            )}

            <div className="dashboard-grid">
                <SectionCard>
                    <SectionHeader
                        title="Prácticas recientes"
                        action={<Link to="/internships" className="link-more">Ver todas</Link>}
                    />
                    {internships.slice(0, 4).map((item) => (
                        <InternshipCard key={item.id} item={item} />
                    ))}
                </SectionCard>

                <SectionCard>
                    {canOpenAdminPanel && (
                        <SectionHeader
                            title="Pendientes de validacion"
                            action={<Link to="/admin" className="link-more">Ir al backoffice</Link>}
                        />
                    )}
                    {canOpenAdminPanel && (
                        <div className="list-card compact">
                            <div className="list-card-header">
                                <div>
                                    <div className="list-card-title">Centros pendientes: {pendingCenters}</div>
                                    <div className="list-card-sub">Empresas pendientes: {pendingCompanies}</div>
                                </div>
                                <Link to="/admin" className="btn-sm btn-primary">Revisar ahora</Link>
                            </div>
                        </div>
                    )}

                    <SectionHeader
                        title="Convenios recientes"
                        action={<Link to="/agreements" className="link-more">Ver todos</Link>}
                    />
                    {agreements.length === 0 ? (
                        <p className="empty-msg">No hay convenios registrados.</p>
                    ) : (
                        agreements.slice(0, 5).map((ag) => (
                            <div key={ag.id} className="list-card compact">
                                <div className="list-card-header">
                                    <div>
                                        <div className="list-card-title">{ag.title}</div>
                                        <div className="list-card-sub">{ag.student_name} · {ag.center_name}</div>
                                    </div>
                                    <span className="badge badge-green">Firmado</span>
                                </div>
                            </div>
                        ))
                    )}
                </SectionCard>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { user } = useAuth();
    if (user?.role === 'alumno') return <AlumnoDashboard />;
    if (user?.role === 'empresa') return <EmpresaDashboard />;
    return <CentroAdminDashboard />;
}
