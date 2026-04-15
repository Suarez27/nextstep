const ROLES = {
    ADMIN: "admin",
    CENTRO: "centro",
    EMPRESA: "empresa",
    ALUMNO: "alumno",
};

const PERMISSIONS = {
    dashboard: [ROLES.ADMIN, ROLES.CENTRO, ROLES.EMPRESA, ROLES.ALUMNO],
    internships: [ROLES.ADMIN, ROLES.CENTRO, ROLES.EMPRESA, ROLES.ALUMNO],
    applications: [ROLES.ADMIN, ROLES.CENTRO, ROLES.EMPRESA, ROLES.ALUMNO],
    profile: [ROLES.CENTRO, ROLES.EMPRESA, ROLES.ALUMNO],
    students: [ROLES.ADMIN, ROLES.CENTRO],
    interviews: [ROLES.ADMIN, ROLES.CENTRO, ROLES.EMPRESA, ROLES.ALUMNO],
    agreements: [ROLES.ADMIN, ROLES.CENTRO, ROLES.EMPRESA],

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

function canAccess(permissionKey, role) {
    if (!permissionKey) return true;
    if (!role) return false;
    const allowed = PERMISSIONS[permissionKey];
    if (!allowed) return false;
    return allowed.includes(role);
}

module.exports = {
    ROLES,
    PERMISSIONS,
    canAccess,
};