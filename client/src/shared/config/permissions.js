import { ROLES } from './roles';

export const PERMISSIONS = {
    // Acceso a módulos / rutas
    dashboard: [ROLES.ADMIN, ROLES.CENTRO, ROLES.EMPRESA, ROLES.ALUMNO],
    internships: [ROLES.ADMIN, ROLES.CENTRO, ROLES.EMPRESA, ROLES.ALUMNO],
    applications: [ROLES.ADMIN, ROLES.CENTRO, ROLES.EMPRESA, ROLES.ALUMNO],
    profile: [ROLES.CENTRO, ROLES.EMPRESA, ROLES.ALUMNO],
    students: [ROLES.ADMIN, ROLES.CENTRO],
    interviews: [ROLES.ADMIN, ROLES.CENTRO, ROLES.EMPRESA, ROLES.ALUMNO],
    agreements: [ROLES.ADMIN, ROLES.CENTRO, ROLES.EMPRESA],

    // Acciones concretas
    internshipCreate: [ROLES.EMPRESA],
    internshipApply: [ROLES.ALUMNO],

    applicationsOwn: [ROLES.ALUMNO],
    applicationsReview: [ROLES.ADMIN, ROLES.CENTRO, ROLES.EMPRESA],
    applicationsStatusUpdate: [ROLES.ADMIN, ROLES.CENTRO, ROLES.EMPRESA],

    agreementCreate: [ROLES.ADMIN, ROLES.CENTRO],
    interviewCreate: [ROLES.ADMIN, ROLES.CENTRO, ROLES.EMPRESA],

    studentsValidatedView: [ROLES.ADMIN, ROLES.CENTRO, ROLES.EMPRESA],
    studentCreate: [ROLES.ADMIN, ROLES.CENTRO],
    studentValidate: [ROLES.ADMIN, ROLES.CENTRO],
    studentResetPassword: [ROLES.ADMIN, ROLES.CENTRO],

    followupCreate: [ROLES.ADMIN, ROLES.CENTRO, ROLES.EMPRESA],
};

export function canAccess(permissionKey, role) {
    if (!permissionKey) return true;
    if (!role) return false;

    const allowedRoles = PERMISSIONS[permissionKey];
    if (!allowedRoles) return false;

    return allowedRoles.includes(role);
}