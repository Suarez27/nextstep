# Documentación de Arquitectura - NextStep Gestión de Prácticas FP

## Introducción
Este documento explica la estructura, flujo de datos y responsabilidades de cada archivo en la aplicación cliente de NextStep. La aplicación es una plataforma de gestión de prácticas para centros educativos, empresas y alumnos.

---

## 1. Archivos de Punto de Entrada

### `index.html`
**Ubicación:** `client/index.html`

**Propósito:** Es el archivo HTML principal que se carga en el navegador. Es el punto de entrada de toda la aplicación web.

**Contenido:**
- Define la estructura HTML básica de la aplicación
- Contiene un `<div id="root"></div>` donde React renderiza toda la aplicación
- Importa el script principal `src/main.jsx` que inicia la aplicación

**Relación con otros archivos:** → carga `main.jsx`

---

### `main.jsx`
**Ubicación:** `client/src/main.jsx`

**Propósito:** Es el punto de entrada de React que inicializa la aplicación y la renderiza en el DOM.

**Contenido:**
```
- Importa React y ReactDOM
- Importa el componente App
- Importa los estilos globales (index.css)
- Crea la raíz de React con createRoot()
- Renderiza el componente App dentro del <div id="root">
```

**Responsabilidades:**
1. Inicializar la aplicación React
2. Aplicar React.StrictMode para detectar problemas en desarrollo
3. Cargar los estilos globales

**Relación con otros archivos:** → carga `App.jsx`

---

## 2. Enrutamiento y Componente Principal

### `App.jsx`
**Ubicación:** `client/src/App.jsx`

**Propósito:** Es el componente raíz de la aplicación que:
1. Configura el sistema de enrutamiento (React Router)
2. Envuelve la aplicación con el contexto de autenticación
3. Define todas las rutas disponibles en la aplicación
4. Implementa protección de rutas (rutas privadas y públicas)

**Estructura de Rutas:**

| Ruta | Componente | Protección | Roles permitidos |
|------|-----------|-----------|-----------------|
| `/login` | Login | Pública | Sin autenticación |
| `/` (raíz) | Layout | Protegida | Todos los autenticados |
| `/dashboard` | Dashboard | Protegida | Todos |
| `/internships` | Internships | Protegida | Todos |
| `/applications` | Applications | Protegida | Todos |
| `/profile` | Profile | Protegida | Todos |
| `/students` | Students | Protegida | admin, centro |
| `/interviews` | Interviews | Protegida | Todos |
| `/agreements` | Agreements | Protegida | Todos |

**Componentes de Protección:**
- `ProtectedRoute`: Valida que el usuario esté autenticado y tenga los roles requeridos
- `PublicRoute`: Valida que el usuario NO esté autenticado (para login)
- Mientras se carga la autenticación, muestra un `splash screen`

**Relación con otros archivos:**
- → Usa `AuthProvider` de `AuthContext.jsx`
- → Carga componentes de `pages/` y `components/`

---

### `Layout.jsx`
**Ubicación:** `client/src/components/Layout.jsx`

**Propósito:** Componente contenedor que proporciona la estructura visual común a todas las páginas autenticadas (sidebar + main content).

**Elementos principales:**
1. **Sidebar izquierdo:** Navegación principal
2. **Topbar superior:** Información de la aplicación
3. **Área principal:** Renderiza las páginas dinámicas con `<Outlet>`

**Navegación por rol:**
- **admin:** Inicio, Prácticas, Alumnos, Convenios, Entrevistas
- **centro:** Inicio, Prácticas, Alumnos, Convenios, Entrevistas, Mi Centro
- **empresa:** Inicio, Mis Prácticas, Candidatos, Entrevistas, Convenios, Mi Empresa
- **alumno:** Inicio, Ofertas, Mis Candidaturas, Mi Perfil

**Características:**
- Muestra avatar del usuario con inicial del nombre
- Menú de navegación activable según el rol del usuario
- Botón de logout en el footer del sidebar
- Usa `NavLink` de React Router para navegación

**Relación con otros archivos:**
- → Usa `useAuth()` de `AuthContext.jsx`
- → Renderiza componentes de `pages/` mediante `<Outlet>`

---

## 3. Gestión del Estado de Autenticación

### `AuthContext.jsx`
**Ubicación:** `client/src/context/AuthContext.jsx`

**Propósito:** Contexto compartido que gestiona:
1. Estado global del usuario autenticado
2. Operaciones de autenticación (login, register, logout)
3. Persistencia de token en localStorage

**Estado Global proporcionado:**
```javascript
{
  user: {
    name: string,
    role: "admin" | "centro" | "empresa" | "alumno",
    ... otros datos del usuario
  },
  loading: boolean,  // true mientras se recupera los datos del usuario
  login: (email, password) => Promise,
  register: (data) => Promise,
  logout: () => void
}
```

**Flujo de Autenticación:**

1. **Inicialización (al cargar la app):**
   - Busca token en localStorage
   - Si existe token, llama a `api.me()` para obtener datos del usuario actual
   - Si no existe o falla, limpia localStorage y deja al usuario sin autenticar

2. **Login:** 
   - Llama a `api.login(email, password)`
   - Recibe token y datos del usuario
   - Guarda token en localStorage
   - Actualiza estado global del usuario

3. **Register:**
   - Llama a `api.register(data)`
   - Recibe token y datos del nuevo usuario
   - Guarda token en localStorage
   - Actualiza estado global del usuario

4. **Logout:**
   - Elimina token de localStorage
   - Limpia el estado del usuario

**Hook `useAuth()`:**
- Se usa en cualquier componente para acceder a `{ user, loading, login, register, logout }`
- Ejemplo: `const { user, logout } = useAuth();`

**Relación con otros archivos:**
- → Carga datos del usuario mediante `api.me()`
- → Se usa en `App.jsx` para proteger rutas
- → Se usa en `Layout.jsx` para mostrar datos del usuario
- → Se usa en `Internships.jsx` para acceder al usuario actual

---

## 4. Capa de Servicios (API)

### `api.js`
**Ubicación:** `client/src/services/api.js`

**Propósito:** Capa de abstracción que centraliza todas las llamadas al backend. Proporciona:
1. Autenticación automática con token
2. Manejo centralizado de errores
3. Timeouts automáticos
4. Interfaz limpia para el resto de la app

**Función interna `req(endpoint, opts)`:**
- Realiza la petición HTTP con fetch
- Automáticamente incluye el token JWT en headers
- Maneja FormData para subidas de archivos
- Timeout de 12 segundos
- Manejo de errores específicos por código HTTP:
  - 401: Usuario no autenticado → mensaje de re-login
  - 403: Permisos insuficientes → mensaje de cuenta incorrecta
  - Otros: Mensaje de error genérico

**Endpoints disponibles:**

**Autenticación:**
- `login(body)` → POST /auth/login
- `register(body)` → POST /auth/register
- `me()` → GET /me

**Prácticas:**
- `getInternships()` → GET /internships
- `createInternship(body)` → POST /internships

**Candidaturas:**
- `applyToInternship(id)` → POST /applications/{id}
- `myApplications()` → GET /applications/my
- `internshipApplications(id)` → GET /applications/internship/{id}
- `setApplicationStatus(id, status)` → POST /applications/{id}/status

**Perfil de Alumno:**
- `myStudentProfile()` → GET /students/me
- `updateStudentProfile(body)` → PUT /students/me
- `uploadStudentCvPdf(file)` → POST /students/me/cv-pdf

**Gestión de Alumnos (admin/centro):**
- `validatedStudents()` → GET /students/validated
- `allStudents()` → GET /students/all
- `createStudent(body)` → POST /students
- `validateStudent(id)` → POST /students/{id}/validate
- `resetStudentPassword(id, password)` → POST /students/{id}/reset-password

**Perfil de Empresa:**
- `myCompanyProfile()` → GET /companies/me
- `updateCompanyProfile(body)` → PUT /companies/me

**Perfil de Centro:**
- `myCenterProfile()` → GET /centers/me
- `updateCenterProfile(body)` → PUT /centers/me

**Entrevistas:**
- `myInterviews()` → GET /interviews/my
- `createInterview(body)` → POST /interviews

**Convenios:**
- `getAgreements()` → GET /agreements
- `createAgreement(body)` → POST /agreements

**Seguimientos:**
- `getFollowups(studentId)` → GET /followups/{studentId}
- `createFollowup(body)` → POST /followups

**Relación con otros archivos:**
- Se usa en `AuthContext.jsx` para login, register y obtener datos del usuario
- Se usa en todas las páginas (`Internships.jsx`, `Applications.jsx`, etc.)

---

## 5. Componentes de Página

### `Internships.jsx`
**Ubicación:** `client/src/pages/Internships.jsx`

**Propósito:** Página que gestiona las ofertas de prácticas. El comportamiento varía según el rol del usuario:

**Funcionalidades por rol:**

| Rol | Funcionalidad |
|-----|--------------|
| **admin** | Ver todas las prácticas, crear nuevas ofertas, gestionar candidatos |
| **centro** | Ver todas las prácticas, crear nuevas ofertas, gestionar candidatos |
| **empresa** | Ver y gestionar sus propias prácticas, crear nuevas ofertas |
| **alumno** | Ver ofertas de prácticas disponibles, candidatarse |

**Componentes internos:**

1. **`NewInternshipModal`:**
   - Componente modal para crear nueva oferta de práctica
   - Campos: título, descripción, horas totales, plazas, horario
   - Validación de formulario
   - Solo accesible para admin, centro y empresa

2. **Componente principal `Internships`:**
   - Lista de prácticas disponibles
   - Búsqueda/filtrado de prácticas
   - Botón "Candidarse" para alumnos
   - Estado de loading
   - Manejo de errores
   - Mensajes de confirmación

**Estado interno:**
```javascript
{
  internships: [],      // Lista de prácticas
  showModal: boolean,   // Mostrar/ocultar modal
  msg: string,         // Mensaje de confirmación/error
  loading: boolean,    // Cargando datos
  search: string       // Texto de búsqueda
}
```

**Flujo de datos:**
1. Al montar el componente, carga todas las prácticas con `api.getInternships()`
2. Usuario puede crear nueva oferta (si tiene rol apropiado)
3. Usuario puede candidatarse a una práctica con `api.applyToInternship(id)`
4. Recarga la lista después de crear o candidatarse

**Relación con otros archivos:**
- → Usa `useAuth()` de `AuthContext.jsx` para obtener rol del usuario
- → Usa `api` de `services/api.js` para backend

---

## 6. Flujo Completo de la Aplicación

```
Usuario abre navegador
    ↓
index.html carga
    ↓
main.jsx inicia React
    ↓
App.jsx renderiza
    ↓
AuthProvider envuelve la app
    ↓
AuthContext verifica token en localStorage
    ↓
Si hay token válido:
    ├→ Obtiene datos del usuario con api.me()
    ├→ Guarda estado en contexto
    └→ user != null
    
Si no hay token:
    └→ user = null
    
    ↓
App.jsx intenta renderizar ruta actual
    ↓
PublicRoute o ProtectedRoute valida
    ├→ Si Public + usuario autenticado → redirige a /dashboard
    ├→ Si Protected + usuario NO autenticado → redirige a /login
    ├→ Si Protected + rol insuficiente → redirige a /dashboard
    └→ Si validación OK → renderiza componente
    
    ↓
Layout.jsx renderiza sidebar + navegación + página actual
    ↓
Puede ser cualquier página (Internships, Profile, etc.)
    ↓
Página usa useAuth() para obtener datos del usuario
    ↓
Página usa api para llamadas al backend
    ↓
Usuario interactúa
    ↓
Se actualiza estado local (useState)
    ↓
Componente se re-renderiza
```

---

## 7. Relaciones entre Archivos

### Importancia y dependencias:

```
index.html
    ↓
main.jsx (carga App.jsx + estilos)
    ↓
App.jsx
    ├→ AuthProvider (de AuthContext.jsx)
    ├→ BrowserRouter (React Router)
    ├→ Layout.jsx
    ├→ Páginas (Internships.jsx, etc.)
    └→ ProtectedRoute/PublicRoute (validación)
    
AuthContext.jsx
    ├→ api.js (login, register, me)
    └→ localStorage (almacena token)
    
api.js
    ├→ localStorage (obtiene token)
    └→ Backend de NextStep
    
Layout.jsx
    ├→ AuthContext.jsx (useAuth)
    └→ React Router (NavLink, Outlet)
    
Internships.jsx (y otras páginas)
    ├→ AuthContext.jsx (useAuth)
    ├→ api.js (llamadas al backend)
    └→ useState (estado local)
```

---

## 8. Resumen de Responsabilidades

| Archivo | Responsabilidad |
|---------|-----------------|
| `index.html` | Punto de entrada HTML |
| `main.jsx` | Inicializa React |
| `App.jsx` | Enrutamiento y protección de rutas |
| `Layout.jsx` | Estructura visual común (sidebar + nav) |
| `AuthContext.jsx` | Gestión de autenticación global |
| `api.js` | Abstracción de llamadas al backend |
| `Internships.jsx` | Gestión de ofertas de prácticas |

---

## 9. Tecnologías Utilizadas

- **React 18:** Framework de componentes
- **React Router 6:** Enrutamiento del lado del cliente
- **Context API:** Gestión de estado global
- **Fetch API:** Llamadas HTTP
- **localStorage:** Almacenamiento de token
- **FormData:** Subida de archivos

---

## 10. Consideraciones de Seguridad

1. **Token JWT:** Se almacena en localStorage y se envía en header `Authorization: Bearer <token>`
2. **Protección de rutas:** Las rutas están protegidas por rol
3. **Manejo de 401:** Si el servidor responde 401, se elimina el token y se pide re-login
4. **Timeout:** Las peticiones tienen timeout de 12 segundos
5. **Validación de roles:** Se valida en cliente (y debe validarse en servidor también)

---

## 11. Guía para Entender el Código

**Para comenzar a entender la aplicación:**

1. Lee este archivo (que estás leyendo)
2. Abre `index.html` → entiende que es solo un contenedor
3. Abre `main.jsx` → entiende que inicializa React
4. Abre `App.jsx` → entiende las rutas disponibles
5. Abre `AuthContext.jsx` → entiende cómo funciona la autenticación
6. Abre `api.js` → entiende los endpoints disponibles
7. Abre `Layout.jsx` → entiende la estructura visual
8. Abre cualquier página como `Internships.jsx` → entiende cómo se usan los contextos y servicios

---

## 12. Flujo de Ejemplo: Un Alumno se Candidata a una Práctica

```
1. Alumno inicia sesión
   ├→ Input email + password en Login.jsx
   ├→ OnSubmit: api.login(email, password)
   ├→ Backend valida credenciales
   ├→ Retorna { token, user }
   ├→ AuthContext guarda token en localStorage
   ├→ AuthContext actualiza estado global del usuario
   └→ App.jsx redirige a /dashboard

2. Alumno navega a "Ofertas" (/internships)
   ├→ Internships.jsx monta
   ├→ useEffect: api.getInternships()
   ├→ Backend retorna lista de prácticas
   └→ UI renderiza lista

3. Alumno hace click en "Candidarse"
   ├→ handleClick: applyTo(internship_id)
   ├→ api.applyToInternship(internship_id)
   ├→ Backend crea candidatura
   ├→ Retorna { success: true }
   ├→ Muestra mensaje "Candidatura enviada"
   └→ Opcionalmente recarga lista
```

---

## 13. Notas Importantes

- **Estado global vs Local:** El contexto mantiene solo datos de autenticación. Otros datos son estado local de componentes.
- **Reutilización:** `useAuth()` y `api` se reutilizan en múltiples componentes.
- **CORS:** Las peticiones a `/api/...` asumen que el frontend y backend están en el mismo dominio o CORS está configurado.
- **Token en localStorage:** Es susceptible a XSS pero adecuado para aplicaciones internas.

---

**Última actualización:** Marzo 2026

