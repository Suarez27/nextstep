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


-----------------------------------------------------------------------------------------------------------------------------------------------

## Arquitectura base H1

### Objetivo
Estandarizar la arquitectura base del proyecto para que frontend y backend crezcan por módulos, evitando duplicación de lógica y facilitando el trabajo en equipo.

---

## Frontend

### Estructura base

```text
client/src/
  app/
    providers/
    router/

  modules/
    auth/
      context/
      pages/
    home/
      pages/
    dashboard/
      pages/
    internships/
      pages/
    applications/
      pages/
    profile/
      pages/
    students/
      pages/
    interviews/
      pages/
    agreements/
      pages/

  shared/
    layouts/
    router/
    styles/

  services/


## Estado de migración H1
### Código real ya movido a la arquitectura nueva

#### Global
- `modules/auth/context/AuthContext.jsx`
- `shared/layouts/AppLayout.jsx`
- `shared/config/navigation.js`

#### Páginas ya migradas
- `modules/home/pages/HomePage.jsx`
- `modules/auth/pages/LoginPage.jsx`
- `modules/dashboard/pages/DashboardPage.jsx`
- `modules/internships/pages/InternshipsPage.jsx`
- `modules/applications/pages/ApplicationsPage.jsx`
- `modules/profile/pages/ProfilePage.jsx`
- `modules/students/pages/StudentsPage.jsx`
- `modules/interviews/pages/InterviewsPage.jsx`
- `modules/agreements/pages/AgreementsPage.jsx`

### Carpetas temporales que siguen existiendo por compatibilidad
- `pages/`
- `components/`
- `context/`

### Regla a partir de ahora
- Todo código nuevo debe crearse en `app/`, `modules/`, `shared/` o `services/`.
- `pages/`, `components/` y `context/` quedan en modo compatibilidad temporal.
- Cuando una pieza ya esté migrada, el archivo antiguo debe quedar solo como wrapper.

## Sistema de diseño base H2

### Objetivo
Crear una base de componentes UI reutilizables apoyada en las clases CSS existentes, para evitar duplicación de estructura visual y preparar una futura evolución del diseño sin rehacer todas las páginas.

### Componentes base creados
- `Button`
- `PageHeader`
- `StatusBadge`
- `EmptyState`
- `LoadingState`
- `SectionCard`

### Regla
- Todo componente visual nuevo compartido debe crearse en `shared/components/ui`.
- Las páginas deben reutilizar esta base antes de crear nuevos botones, headers o estados vacíos.
- En esta fase se reutilizan las clases actuales del proyecto para no romper el diseño existente.

### Componentes UI añadidos en H2 paso 2
- `StatCard`
- `SectionHeader`

### Páginas integradas con la base UI
- `InternshipsPage`
- `ApplicationsPage`
- `AgreementsPage`
- `InterviewsPage`
- `DashboardPage`

### Regla
Antes de crear una nueva estructura visual repetida, revisar si puede resolverse con:
- `PageHeader`
- `Button`
- `StatusBadge`
- `EmptyState`
- `LoadingState`
- `SectionCard`
- `SectionHeader`
- `StatCard`

### Componentes UI añadidos en H2 paso 3
- `FormField`
- `FormRow`
- `FormActions`
- `Alert`
- `Modal`

### Páginas / módulos integrados en H2 paso 3
- `LoginPage`
- `ProfilePage`
- `StudentsPage` (parcial)
- modal de `InternshipsPage`
- modal de `InterviewsPage`
- modal de `AgreementsPage`

### Cierre de H2
El sistema de diseño base queda preparado para:
- páginas
- formularios
- estados de feedback
- modales
- tarjetas y bloques de panel

A partir de este punto, nuevas pantallas o CRUDs deben construirse apoyándose primero en la base de `shared/components/ui`.

## H3 - Autenticacion, permisos y navegacion por rol

### Objetivo
Centralizar la lógica de acceso del sistema para que:
- las rutas privadas,
- la navegación,
- los permisos por módulo,
- y la validación backend

respondan a una misma matriz de permisos.

### Frontend
Archivos principales:
- `shared/config/roles.js`
- `shared/config/permissions.js`
- `shared/config/navigation.js`
- `app/router/routeConfig.jsx`
- `shared/router/ProtectedRoute.jsx`

### Backend
Archivos principales:
- `server/utils/permissions.js`
- `server/middlewares/auth.js`

### Regla
- Las rutas privadas del frontend deben declararse en `routeConfig.jsx`.
- Cada ruta privada debe tener un `permissionKey`.
- El menú debe derivarse de `navigation.js`, no construirse manualmente por pantalla.
- En backend, los endpoints sensibles deben usar `authRequired` y, cuando aplique, `permissionRequired` y/o `roleRequired`.

### Roles actuales
- `admin`
- `centro`
- `empresa`
- `alumno`

### Cierre H3

#### Permisos granulares añadidos
Además de los permisos por módulo, el sistema ahora contempla permisos por acción, por ejemplo:
- `internshipCreate`
- `internshipApply`
- `applicationsOwn`
- `applicationsReview`
- `applicationsStatusUpdate`
- `agreementCreate`
- `interviewCreate`
- `studentCreate`
- `studentValidate`
- `studentResetPassword`
- `followupCreate`

#### Hook reusable
Se añade:
- `shared/hooks/useCanAccess.js`

Objetivo:
- evitar checks repetidos como `user.role === 'empresa'`
- reutilizar la misma matriz de permisos dentro de componentes

#### Regla
A partir de este punto:
- los accesos de ruta se resuelven con `permissionKey`
- la navegación se resuelve desde configuración
- las acciones visibles en pantalla deben apoyarse preferentemente en `useCanAccess(...)`
- los endpoints sensibles deben apoyarse en `permissionRequired(...)`

## H4 - Base CRUD reutilizable con React Admin

### Objetivo
Crear un backoffice administrativo separado del portal principal, basado en React Admin, para acelerar la construcción de CRUDs reutilizables.

### Estructura base creada
```text
client/src/admin/
  app/
  dataProvider/
  resources/
    companies/
  shared/
    crud/

    ### H4 paso 2

#### Mejoras de la base CRUD reusable
- `BaseForm`
- `BaseDatagrid`

#### Recursos administrativos funcionales
- `companies`
- `internships`

#### Regla
Todo nuevo recurso de React Admin debe seguir la estructura:

```text
admin/resources/<resource>/
  <Resource>List.jsx
  <Resource>Create.jsx
  <Resource>Edit.jsx
  <Resource>Show.jsx
  index.js
  ### Cierre H4

#### Acceso al backoffice
- La ruta `/admin` existe como espacio separado del portal principal.
- Solo el rol `admin` puede acceder al backoffice.
- El acceso al backoffice aparece en la navegación lateral y en el dashboard del administrador.

#### Cómo crear un nuevo recurso de React Admin
Ejemplo: `catalogs`

Estructura recomendada:

```text
client/src/admin/resources/catalogs/
  CatalogsList.jsx
  CatalogsCreate.jsx
  CatalogsEdit.jsx
  CatalogsShow.jsx
  index.js
## H5 - Normalizacion API y modularizacion backend

### Estado inicial
El backend original concentra mucha logica en `server/index.js`:
- arranque del servidor
- conexion y helpers de base de datos
- migraciones y seed
- validacion
- endpoints HTTP
- logica de dominio

### Objetivo de H5
Separar el backend por dominios y establecer un contrato API consistente.

### Contrato API objetivo
#### Exito
```json
{ "data": ... }

### H5 paso 2

#### Dominios modularizados
- `auth`
- `companies`
- `centers`

#### Estructura aplicada
```text
server/controllers/companies/
server/controllers/centers/
server/services/companies/
server/services/centers/
server/repositories/companies/
server/repositories/centers/
server/validators/companies/
server/validators/centers/
server/routes/companies.routes.js
server/routes/centers.routes.js

### H5 paso 3

#### Dominio modularizado
- `students`

#### Estructura aplicada
```text
server/controllers/students/
server/services/students/
server/repositories/students/
server/validators/students/
server/routes/students.routes.js

### H5 paso 4
Dominios modularizados:
- internships
- applications

### H5 paso 5
Dominios modularizados:
- interviews
- agreements
- followups

### Estado H5
Dominios backend modularizados:
- auth
- companies
- centers
- students
- internships
- applications
- interviews
- agreements
- followups

### Contrato frontend
Las funciones de `client/src/services/api.js` para los dominios modularizados deben devolver `res.data`.

## H6 - Catalogos base admin

### H6 paso 1
- Se incorpora el dominio backend `catalogs` con arquitectura H5: `routes`, `controllers`, `services`, `repositories` y `validators`.
- Se incorpora el dominio backend `catalog-items` con la misma separacion modular y contrato `{ data, meta? } / { error, code?, issues? }`.
- Se anaden dos recursos de React Admin en `/admin`: `catalogs` y `catalog-items`.
- Esta fase solo cubre base administrativa y CRUD protegido; no modifica aun formularios funcionales del portal principal.

### H6 paso 2
- Se exponen endpoints de lectura en `/api/catalogs` para consultar catalogos activos, items activos por clave y catalogo completo con items.
- El frontend incorpora una capa reutilizable para catalogos en `services/catalogs` y hooks en `shared/hooks/useCatalogs.js`.
- Se integra el consumo de catalogos en puntos funcionales iniciales:
  sector de empresa con `sectors`,
  area de practicas con `areas`,
  y tipos de documento en el flujo de CV PDF con `document_types`.

### Cierre H6
- La gestion de catalogos queda separada en dos capas:
  administracion CRUD en `/api/admin/catalogs` y `/api/admin/catalog-items`,
  y consumo funcional en `/api/catalogs`.
- El contrato H5 se mantiene en todas las rutas de H6:
  exito `{ data, meta? }`,
  error `{ error, code?, issues? }`.
- El backoffice incorpora filtros basicos, soporte visual para activacion/desactivacion y orden por `sort_order`.
- El frontend reutiliza catalogos sin hardcodear sectores, areas y el tipo documental del CV PDF.
- Las listas de estado de negocio como candidaturas o convenios no se movieron a catalogos en H6 porque eso implicaria una decision de modelo mayor fuera del alcance de esta historia.

## H31 - Base visual del admin

### Objetivo
- Dar al backoffice administrativo una identidad visual propia, mas clara y legible que la configuracion por defecto.

### Base aplicada
- `client/src/admin/theme/adminTheme.js`
- `client/src/admin/layout/AdminLayout.jsx`
- `client/src/admin/layout/AdminMenu.jsx`

### Criterios
- tema claro como estilo dominante
- app bar y sidebar con mas contraste y jerarquia visual
- tablas, formularios y botones con mejor lectura
- iconografia consistente por recurso
- sin cambios funcionales ni de backend

### H31 paso 2
- Se refuerza el sistema visual reutilizable del admin desde `shared/crud`, no desde estilos aislados por recurso.
- Las listas ganan toolbar, empty state, datagrid mas legible y mejor jerarquia de acciones.
- Create, edit y show comparten tarjetas, spacing, toolbar visual y estados mas claros.
- Los estados booleanos como activo/inactivo pasan a una representacion visual consistente reutilizable.

### Cierre H31
- El admin queda apoyado en un tema claro centralizado, con mejor contraste general en navegacion, tablas, formularios y acciones.
- `AdminLayout` y `AdminMenu` consolidan una experiencia mas legible en escritorio y portatil, con mejor jerarquia visual y labels consistentes.
- Los componentes base de `shared/crud` concentran spacing, estados vacios, jerarquia de acciones y lectura de datos para todos los recursos actuales.
- Se normalizan labels e iconografia de `companies`, `internships`, `catalogs` y `catalog-items` sin alterar backend, contratos API ni logica funcional.

## H7 - Empresas colaboradoras ampliadas

### H7 paso 1
- El dominio `companies` se amplia en backend para soportar ficha rica de empresa sobre la base H7: descripcion, datos de contacto, activacion y `updated_at`.
- El CRUD admin de `companies` deja de vivir inline en `server/index.js` y pasa a reutilizar controller, service, repository y validator del dominio modular.
- React Admin reutiliza el recurso existente `companies`, ahora con list, create, edit y show adaptados a la ficha ampliada y al estado `is_active`.
- El arranque backend conserva la forma H7 de la vista `companies` para no perder los campos ampliados al reiniciar la API.
- No se crea `company_contacts`; la ficha ampliada se mantiene dentro del recurso `companies`.
- Esta fase no modifica todavia el portal funcional de empresa, centro ni la ficha publica/operativa.

### H7 paso 2
- El portal funcional incorpora una ficha reutilizable de empresa con datos ampliados, estado activo/inactivo y ofertas asociadas.
- Se expone `GET /api/companies/:id` para lectura autenticada de detalle de empresa con sus practicas, manteniendo el contrato `{ data }`.
- El centro educativo y el administrador funcional pueden abrir la ficha desde el listado de practicas, sin crear nuevas tablas ni relaciones.
- El perfil `Mi Empresa` permite completar descripcion y datos de contacto, y muestra una vista previa operativa de la ficha.
- Esta fase deja la ficha preparada para futuras relaciones, sin tocar documentos ni incidencias.

### Cierre H7
- `companies` queda como recurso unico para empresa colaboradora: no se anade `company_contacts` ni se crean tablas nuevas.
- Campos H7 consolidados en backend, admin y portal: `description`, `contact_email`, `contact_phone`, `contact_person`, `is_active` y `updated_at`.
- Las validaciones aceptan campos de contacto vacios cuando son opcionales y alinean longitudes con la base H7.
- El admin permite listar, crear, editar, consultar y activar/desactivar empresas con labels consistentes.
- El portal permite que empresa complete su ficha y que centro/admin consulten la ficha desde las practicas, incluyendo ofertas asociadas.
- Queda fuera de H7 la relacion con documentos, incidencias u otros modulos futuros.
