import { ROLES } from './roles';
import { canAccess } from './permissions';

export const NAV_ITEMS = [
    {
        key: 'dashboard',
        to: '/dashboard',
        label: {
            [ROLES.ADMIN]: 'Inicio',
            [ROLES.CENTRO]: 'Inicio',
            [ROLES.EMPRESA]: 'Inicio',
            [ROLES.ALUMNO]: 'Inicio',
        },
        icon: '&#9962;',
    },
    {
        key: 'internships',
        to: '/internships',
        label: {
            [ROLES.ADMIN]: 'Prácticas',
            [ROLES.CENTRO]: 'Prácticas',
            [ROLES.EMPRESA]: 'Mis Prácticas',
            [ROLES.ALUMNO]: 'Ofertas',
        },
        icon: '&#128188;',
    },
    {
        key: 'applications',
        to: '/applications',
        label: {
            [ROLES.EMPRESA]: 'Candidatos',
            [ROLES.ALUMNO]: 'Mis Candidaturas',
            [ROLES.ADMIN]: 'Candidaturas',
            [ROLES.CENTRO]: 'Candidaturas',
        },
        icon: '&#128140;',
    },
    {
        key: 'students',
        to: '/students',
        label: {
            [ROLES.ADMIN]: 'Alumnos',
            [ROLES.CENTRO]: 'Alumnos',
        },
        icon: '&#127891;',
    },
    {
        key: 'interviews',
        to: '/interviews',
        label: {
            [ROLES.ADMIN]: 'Entrevistas',
            [ROLES.CENTRO]: 'Entrevistas',
            [ROLES.EMPRESA]: 'Entrevistas',
            [ROLES.ALUMNO]: 'Entrevistas',
        },
        icon: '&#128197;',
    },
    {
        key: 'agreements',
        to: '/agreements',
        label: {
            [ROLES.ADMIN]: 'Convenios',
            [ROLES.CENTRO]: 'Convenios',
            [ROLES.EMPRESA]: 'Convenios',
        },
        icon: '&#128203;',
    },
    {
        key: 'profile',
        to: '/profile',
        label: {
            [ROLES.CENTRO]: 'Mi Centro',
            [ROLES.EMPRESA]: 'Mi Empresa',
            [ROLES.ALUMNO]: 'Mi Perfil',
        },
        icon: '&#128100;',
    },
];

export const ROLE_LABELS = {
    [ROLES.ADMIN]: 'Administrador',
    [ROLES.CENTRO]: 'Centro Educativo',
    [ROLES.EMPRESA]: 'Empresa',
    [ROLES.ALUMNO]: 'Alumno',
};

export function getNavigationForRole(role) {
    return NAV_ITEMS
        .filter((item) => canAccess(item.key, role))
        .map((item) => ({
            ...item,
            label: item.label?.[role] || item.label?.[ROLES.ADMIN] || item.key,
        }));
}