export const STATUS_LABELS = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
};

export function statusLabel(status) {
    const key = String(status || '').toLowerCase();
    return STATUS_LABELS[key] || (status || 'Sin estado');
}

export function statusBadgeClass(status) {
    const key = String(status || '').toLowerCase();
    if (key === 'approved') return 'badge badge-green';
    if (key === 'rejected') return 'badge badge-red';
    if (key === 'pending') return 'badge badge-amber';
    return 'badge badge-gray';
}
