export const INTERNSHIP_STATUSES = [
    'borrador',
    'publicada',
    'pausada',
    'cerrada',
    'cancelada',
];

export const INTERNSHIP_STATUS_OPTIONS = [
    { value: 'borrador', label: 'Borrador' },
    { value: 'publicada', label: 'Publicada' },
    { value: 'pausada', label: 'Pausada' },
    { value: 'cerrada', label: 'Cerrada' },
    { value: 'cancelada', label: 'Cancelada' },
];

export const INTERNSHIP_STATUS_CHOICES = INTERNSHIP_STATUS_OPTIONS.map((option) => ({
    id: option.value,
    name: option.label,
}));

export const DEFAULT_ADMIN_INTERNSHIP_STATUS = 'borrador';
export const DEFAULT_COMPANY_INTERNSHIP_STATUS = 'publicada';
