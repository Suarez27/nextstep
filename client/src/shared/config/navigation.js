export const NAV = {
    admin: [
        { to: '/dashboard', label: 'Inicio', icon: '&#9962;' },
        { to: '/internships', label: 'Prácticas', icon: '&#128188;' },
        { to: '/students', label: 'Alumnos', icon: '&#127891;' },
        { to: '/agreements', label: 'Convenios', icon: '&#128203;' },
        { to: '/interviews', label: 'Entrevistas', icon: '&#128197;' },
    ],
    centro: [
        { to: '/dashboard', label: 'Inicio', icon: '&#9962;' },
        { to: '/internships', label: 'Prácticas', icon: '&#128188;' },
        { to: '/students', label: 'Alumnos', icon: '&#127891;' },
        { to: '/agreements', label: 'Convenios', icon: '&#128203;' },
        { to: '/interviews', label: 'Entrevistas', icon: '&#128197;' },
        { to: '/profile', label: 'Mi Centro', icon: '&#127979;' },
    ],
    empresa: [
        { to: '/dashboard', label: 'Inicio', icon: '&#9962;' },
        { to: '/internships', label: 'Mis Prácticas', icon: '&#128188;' },
        { to: '/applications', label: 'Candidatos', icon: '&#128101;' },
        { to: '/interviews', label: 'Entrevistas', icon: '&#128197;' },
        { to: '/agreements', label: 'Convenios', icon: '&#128203;' },
        { to: '/profile', label: 'Mi Empresa', icon: '&#127970;' },
    ],
    alumno: [
        { to: '/dashboard', label: 'Inicio', icon: '&#9962;' },
        { to: '/internships', label: 'Ofertas', icon: '&#128188;' },
        { to: '/applications', label: 'Mis Candidaturas', icon: '&#128140;' },
        { to: '/profile', label: 'Mi Perfil', icon: '&#128100;' },
    ],
};

export const ROLE_LABELS = {
    admin: 'Administrador',
    centro: 'Centro Educativo',
    empresa: 'Empresa',
    alumno: 'Alumno',
};