const STATUS_STYLES = {
    pendiente: 'badge badge-amber',
    aceptada: 'badge badge-green',
    rechazada: 'badge badge-red',
    validado: 'badge badge-green',
    invalidado: 'badge badge-red',
    firmado: 'badge badge-green',
    proxima: 'badge badge-green',
    realizada: 'badge badge-gray',
};

const STATUS_LABELS = {
    pendiente: 'Pendiente',
    aceptada: 'Aceptada',
    rechazada: 'Rechazada',
    validado: 'Validado',
    invalidado: 'Invalidado',
    firmado: 'Firmado',
    proxima: 'Próxima',
    realizada: 'Realizada',
};

export default function StatusBadge({
    status,
    label,
    className = '',
}) {
    const normalized = String(status || '').toLowerCase();
    const badgeClass = STATUS_STYLES[normalized] || 'badge badge-gray';
    const text = label || STATUS_LABELS[normalized] || status || 'Sin estado';

    return <span className={`${badgeClass} ${className}`.trim()}>{text}</span>;
}