/**
 * Función base para realizar peticiones fetch al servidor.
 * Maneja automáticamente el token de autenticación, tipos de contenido y errores comunes.
 */
async function req(endpoint, opts = {}) {
  const token = localStorage.getItem('ns_token');

  // Detectar si el cuerpo de la petición es FormData (para subida de archivos como el CV)
  const isFormData = typeof FormData !== 'undefined' && opts.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opts.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 segundos de timeout

  let res;
  try {
    // IMPORTANTE: El endpoint ya debe empezar por '/api' para que el proxy de Vite lo capture
    res = await fetch(endpoint, { ...opts, headers, signal: controller.signal });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado. Comprueba que el servidor esté iniciado.');
    }
    throw new Error('No se pudo conectar con el servidor.');
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const base = data.error || `Error ${res.status}`;
    if (res.status === 401) {
      throw new Error(`${base}. Inicia sesión de nuevo.`);
    }
    if (res.status === 403) {
      throw new Error(`${base}. No tienes permisos para realizar esta acción.`);
    }
    throw new Error(base);
  }

  return data;
}

/**
 * Objeto API con todos los endpoints de la plataforma NextStep.
 */
export const api = {
  // --- AUTENTICACIÓN ---
  login: (body) => req('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => req('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me: () => req('/api/me'),

  // --- OFERTAS DE PRÁCTICAS ---
  getInternships: () => req('/api/internships'),
  createInternship: (body) => req('/api/internships', { method: 'POST', body: JSON.stringify(body) }),

  // --- CANDIDATURAS / POSTULACIONES ---
  applyToInternship: (id) => req(`/api/applications/${id}`, { method: 'POST' }),
  myApplications: () => req('/api/applications/my'),
  internshipApplications: (id) => req(`/api/applications/internship/${id}`),
  setApplicationStatus: (id, status) =>
    req(`/api/applications/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }),

  // --- ALUMNOS ---
  myStudentProfile: () => req('/api/students/me'),
  updateStudentProfile: (body) => req('/api/students/me', { method: 'PUT', body: JSON.stringify(body) }),
  uploadStudentCvPdf: (file) => {
    const body = new FormData();
    body.append('cv_pdf', file);
    return req('/api/students/me/cv-pdf', { method: 'POST', body });
  },
  validatedStudents: () => req('/api/students/validated'),
  allStudents: () => req('/api/students/all'),
  createStudent: (body) => req('/api/students', { method: 'POST', body: JSON.stringify(body) }),
  validateStudent: (id) => req(`/api/students/${id}/validate`, { method: 'POST' }),
  resetStudentPassword: (id, password) =>
    req(`/api/students/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ password }) }),

  // --- EMPRESAS ---
  myCompanyProfile: () => req('/api/companies/me'),
  updateCompanyProfile: (body) => req('/api/companies/me', { method: 'PUT', body: JSON.stringify(body) }),

  // --- CENTROS EDUCATIVOS ---
  myCenterProfile: () => req('/api/centers/me'),
  updateCenterProfile: (body) => req('/api/centers/me', { method: 'PUT', body: JSON.stringify(body) }),

  // --- ENTREVISTAS ---
  myInterviews: () => req('/api/interviews/my'),
  createInterview: (body) => req('/api/interviews', { method: 'POST', body: JSON.stringify(body) }),

  // --- CONVENIOS ---
  getAgreements: () => req('/api/agreements'),
  createAgreement: (body) => req('/api/agreements', { method: 'POST', body: JSON.stringify(body) }),

  // --- SEGUIMIENTOS ---
  getFollowups: (studentId) => req(`/api/followups/${studentId}`),
  createFollowup: (body) => req('/api/followups', { method: 'POST', body: JSON.stringify(body) }),
};