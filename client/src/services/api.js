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
  login: async (body) => {
    const res = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return res.data;
  },

  register: async (body) => {
    const res = await req('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return res.data;
  },

  me: async () => {
    const res = await req('/api/me');
    return res.data;
  },

  getActiveCatalogs: async () => {
    const res = await req('/api/catalogs');
    return res.data;
  },

  getCatalogItemsByKey: async (key) => {
    const res = await req(`/api/catalogs/${key}/items`);
    return res.data;
  },

  getCatalogByKey: async (key) => {
    const res = await req(`/api/catalogs/${key}`);
    return res.data;
  },

  getInternships: async (filters = {}) => {
    const query = new URLSearchParams(filters);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    const res = await req(`/api/internships${suffix}`);
    return res.data;
  },

  getInternship: async (id) => {
    const res = await req(`/api/internships/${id}`);
    return res.data;
  },

  createInternship: async (body) => {
    const res = await req('/api/internships', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return res.data;
  },

  applyToInternship: async (id) => {
    const res = await req(`/api/applications/${id}`, { method: 'POST' });
    return res.data;
  },

  myApplications: async () => {
    const res = await req('/api/applications/my');
    return res.data;
  },

  internshipApplications: async (id) => {
    const res = await req(`/api/applications/internship/${id}`);
    return res.data;
  },

  setApplicationStatus: async (id, status) => {
    const res = await req(`/api/applications/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
    return res.data;
  },

  // --- ALUMNOS ---
  myStudentProfile: async () => {
    const res = await req('/api/students/me');
    return res.data;
  },

  updateStudentProfile: async (body) => {
    const res = await req('/api/students/me', {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return res.data;
  },

  uploadStudentCvPdf: async (file) => {
    const body = new FormData();
    body.append('cv_pdf', file);
    const res = await req('/api/students/me/cv-pdf', {
      method: 'POST',
      body,
    });
    return res.data;
  },

  validatedStudents: async () => {
    const res = await req('/api/students/validated');
    return res.data;
  },

  allStudents: async () => {
    const res = await req('/api/students/all');
    return res.data;
  },

  createStudent: async (body) => {
    const res = await req('/api/students', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return res.data;
  },

  validateStudent: async (id) => {
    const res = await req(`/api/students/${id}/validate`, {
      method: 'POST',
    });
    return res.data;
  },

  resetStudentPassword: async (id, password) => {
    const res = await req(`/api/students/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    return res.data;
  },

  myCompanyProfile: async () => {
    const res = await req('/api/companies/me');
    return res.data;
  },

  updateCompanyProfile: async (body) => {
    const res = await req('/api/companies/me', {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return res.data;
  },

  updateInternship: async (id, body) => {
    const res = await req(`/api/internships/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return res.data;
  },

  deactivateInternship: async (id) => {
    const res = await req(`/api/internships/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },

  getCompanyDetail: async (id) => {
    const res = await req(`/api/companies/${id}`);
    return res.data;
  },

  myCenterProfile: async () => {
    const res = await req('/api/centers/me');
    return res.data;
  },

  updateCenterProfile: async (body) => {
    const res = await req('/api/centers/me', {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return res.data;
  },

  myInterviews: async () => {
    const res = await req('/api/interviews/my');
    return res.data;
  },

  createInterview: async (body) => {
    const res = await req('/api/interviews', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return res.data;
  },

  getAgreements: async () => {
    const res = await req('/api/agreements');
    return res.data;
  },

  createAgreement: async (body) => {
    const res = await req('/api/agreements', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return res.data;
  },

  getFollowups: async (studentId) => {
    const res = await req(`/api/followups/${studentId}`);
    return res.data;
  },

  createFollowup: async (body) => {
    const res = await req('/api/followups', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return res.data;
  },
};
