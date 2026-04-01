async function req(endpoint, opts = {}) {
  const token = localStorage.getItem('ns_token');
  const isFormData = typeof FormData !== 'undefined' && opts.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opts.headers,
  };
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);
  let res;
  try {
    res = await fetch('/api' + endpoint, { ...opts, headers, signal: controller.signal });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado. Comprueba que el servidor este iniciado.');
    }
    throw new Error('No se pudo conectar con el servidor.');
  } finally {
    clearTimeout(timeoutId);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const base = data.error || `Error ${res.status}`;
    if (res.status === 401) {
      throw new Error(`${base}. Inicia sesion de nuevo.`);
    }
    if (res.status === 403) {
      throw new Error(`${base}. Revisa que estas usando la cuenta correcta para esta accion.`);
    }
    throw new Error(base);
  }
  return data;
}

export const api = {
  login: (body) => req('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => req('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me: () => req('/me'),

  getInternships: () => req('/internships'),
  createInternship: (body) => req('/internships', { method: 'POST', body: JSON.stringify(body) }),

  applyToInternship: (id) => req(`/applications/${id}`, { method: 'POST' }),
  myApplications: () => req('/applications/my'),
  internshipApplications: (id) => req(`/applications/internship/${id}`),
  setApplicationStatus: (id, status) =>
    req(`/applications/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }),

  myStudentProfile: () => req('/students/me'),
  updateStudentProfile: (body) => req('/students/me', { method: 'PUT', body: JSON.stringify(body) }),
  uploadStudentCvPdf: (file) => {
    const body = new FormData();
    body.append('cv_pdf', file);
    return req('/students/me/cv-pdf', { method: 'POST', body });
  },
  validatedStudents: () => req('/students/validated'),
  allStudents: () => req('/students/all'),
  createStudent: (body) => req('/students', { method: 'POST', body: JSON.stringify(body) }),
  validateStudent: (id) => req(`/students/${id}/validate`, { method: 'POST' }),
  resetStudentPassword: (id, password) =>
    req(`/students/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ password }) }),

  myCompanyProfile: () => req('/companies/me'),
  updateCompanyProfile: (body) => req('/companies/me', { method: 'PUT', body: JSON.stringify(body) }),

  myCenterProfile: () => req('/centers/me'),
  updateCenterProfile: (body) => req('/centers/me', { method: 'PUT', body: JSON.stringify(body) }),

  myInterviews: () => req('/interviews/my'),
  createInterview: (body) => req('/interviews', { method: 'POST', body: JSON.stringify(body) }),

  getAgreements: () => req('/agreements'),
  createAgreement: (body) => req('/agreements', { method: 'POST', body: JSON.stringify(body) }),

  getFollowups: (studentId) => req(`/followups/${studentId}`),
  createFollowup: (body) => req('/followups', { method: 'POST', body: JSON.stringify(body) }),
};
