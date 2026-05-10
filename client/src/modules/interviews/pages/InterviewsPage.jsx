import { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import {
    NsButton,
    NsBadge,
    NsCard,
    NsAlert,
    LoadingState,
    EmptyState,
    PageHeader
} from '../../../shared/components/ui';

export default function InterviewsPage() {
    const { user } = useAuth();
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    const loadInterviews = async () => {
        setLoading(true);
        try {
            const data = await api.getInterviews();
            setInterviews(data);
        } catch (err) {
            setAlert({ type: 'error', message: 'No se pudieron cargar las entrevistas.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInterviews();
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.updateInterviewStatus(id, newStatus);
            setAlert({ type: 'success', message: `Estado actualizado a ${newStatus} correctamente.` });
            loadInterviews();
        } catch (err) {
            setAlert({ type: 'error', message: err.message });
        }
    };

    const getStatusProps = (status) => {
        switch (status) {
            case 'programada': return { label: 'Programada', variant: 'info' };
            case 'confirmada': return { label: 'Confirmada', variant: 'success' };
            case 'realizada': return { label: 'Realizada', variant: 'brand' };
            case 'cancelada': return { label: 'Cancelada', variant: 'error' };
            case 'no_asistio': return { label: 'No asistió', variant: 'warning' };
            default: return { label: status, variant: 'default' };
        }
    };

    if (loading) return <div className="p-10"><LoadingState /></div>;

    return (
        <div className="p-6 max-w-7xl mx-auto font-sans">
            <PageHeader
                title="Agenda de Entrevistas"
                subtitle="Gestiona tus citas y procesos de selección en curso."
            />

            {alert && (
                <div className="mb-6">
                    <NsAlert type={alert.type} onClose={() => setAlert(null)}>
                        {alert.message}
                    </NsAlert>
                </div>
            )}

            {interviews.length === 0 ? (
                <EmptyState icon="📅" message="No tienes entrevistas programadas actualmente." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {interviews.map((item) => {
                        const date = new Date(item.interview_at);
                        const status = getStatusProps(item.status);
                        const isCancelled = item.status === 'cancelada';

                        return (
                            <NsCard
                                key={item.id}
                                className={`flex flex-col h-full border-l-4 transition-all duration-300 ${isCancelled
                                    ? 'border-l-gray-400 bg-gray-50 opacity-60 grayscale'
                                    : 'border-l-brand-500'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                                            {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </p>
                                        <h3 className={`text-lg font-bold leading-tight ${isCancelled ? 'text-gray-600' : 'text-gray-800'}`}>
                                            {item.internship_title || 'Entrevista de Prácticas'}
                                        </h3>
                                    </div>
                                    {/* CORRECCIÓN: Usamos "type" en lugar de "variant" */}
                                    <NsBadge type={status.variant}>{status.label}</NsBadge>
                                </div>

                                <div className="space-y-2 mb-6 flex-grow text-sm">
                                    <div className="flex items-center text-gray-600">
                                        <span className="font-semibold w-24">Alumno:</span>
                                        <span>{item.student_name}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <span className="font-semibold w-24">Hora:</span>
                                        <span>{date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}h</span>
                                    </div>
                                    <div className="flex items-start text-gray-600">
                                        <span className="font-semibold w-24">Lugar/Link:</span>
                                        <span className="flex-1 italic">{item.location_text || 'No especificado'}</span>
                                    </div>
                                </div>

                                {/* Acciones según Rol */}
                                <div className="flex gap-2 pt-4 border-t border-gray-50">
                                    {user.role === 'alumno' && item.status === 'programada' && (
                                        <NsButton size="sm" className="w-full" onClick={() => handleStatusUpdate(item.id, 'confirmada')}>
                                            Confirmar Asistencia
                                        </NsButton>
                                    )}

                                    {(user.role === 'empresa' || user.role === 'centro') && item.status === 'confirmada' && (
                                        <NsButton variant="brand" size="sm" className="w-full" onClick={() => handleStatusUpdate(item.id, 'realizada')}>
                                            Marcar Realizada
                                        </NsButton>
                                    )}

                                    {!isCancelled && item.status !== 'realizada' && (
                                        <NsButton variant="ghost" size="sm" onClick={() => handleStatusUpdate(item.id, 'cancelada')}>
                                            Cancelar
                                        </NsButton>
                                    )}
                                </div>
                            </NsCard>
                        );
                    })}
                </div>
            )}
        </div>
    );
}