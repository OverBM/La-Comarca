## ADDED Requirements

### Requirement: User can log in with email and password
The system SHALL authenticate users via email and password, returning a JWT token on success.

#### Scenario: Successful login
- **WHEN** user submits valid email and password on the login form
- **THEN** system returns a JWT token and user is redirected to the corresponding home page (admin → /admin, cliente → /)

#### Scenario: Failed login due to invalid credentials
- **WHEN** user submits invalid email or password
- **THEN** system shows an error message "Credenciales inválidas" and does not redirect

#### Scenario: Failed login due to inactive account
- **WHEN** user submits credentials for a user with activo = false
- **THEN** system shows an error message "Cuenta desactivada"

### Requirement: JWT token is attached to all API requests
The system SHALL automatically attach the JWT token as a Bearer token in the Authorization header of every HTTP request.

#### Scenario: Authenticated request includes token
- **WHEN** an authenticated user makes any API request
- **THEN** the request includes an Authorization header with "Bearer <token>"

#### Scenario: Expired token triggers redirect to login
- **WHEN** the API returns a 401 status code
- **THEN** the system clears the stored token and redirects the user to the login page

### Requirement: Admin routes are protected by role guard
The system SHALL restrict access to /admin routes to users with rol = 'admin'.

#### Scenario: Admin user accesses admin panel
- **WHEN** a user with rol = 'admin' navigates to /admin
- **THEN** the admin panel loads normally

#### Scenario: Non-admin user redirected from admin route
- **WHEN** a user with rol != 'admin' navigates to /admin
- **THEN** the system redirects to the home page

#### Scenario: Unauthenticated user redirected to login
- **WHEN** an unauthenticated user navigates to /admin
- **THEN** the system redirects to /auth/login

### Requirement: Navbar adapts to authentication state and role
The system SHALL display a different navbar depending on whether the user is anonymous, logged in as cliente, or logged in as admin. The role SHALL be read from the JWT token stored in localStorage via storage.service.ts.

#### Scenario: Anonymous navbar
- **WHEN** there is no token in storage
- **THEN** the navbar displays: Inicio, Catálogo, Nuestra Historia, Contacto, and a Login button

#### Scenario: Cliente logged in navbar
- **WHEN** a token with rol = 'cliente' is in storage
- **THEN** the navbar displays the public menu plus Mi Perfil, Mis Pedidos, and Cerrar Sesión

#### Scenario: Admin logged in navbar
- **WHEN** a token with rol = 'admin' is in storage
- **THEN** the navbar displays: logo, "Ver sitio" (link to /), "Ir al Panel" (link to /admin), and "Cerrar Sesión"; public menu is hidden
