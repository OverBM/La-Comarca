## ADDED Requirements

### Requirement: Home page displays hero section
The system SHALL display a hero section at the top of the home page with the bakery name "La Comarca" and a value proposition.

#### Scenario: Hero section renders
- **WHEN** a user visits the home page
- **THEN** the hero section displays the bakery name, a tagline, and a "Ver Catálogo" CTA button

### Requirement: Home page shows featured products
The system SHALL display a grid of featured products below the hero section using hardcoded mock data (first N products from mock, no backend filtering).

#### Scenario: Featured products grid renders with products
- **WHEN** a user visits the home page and mock products exist
- **THEN** a grid of up to 8 products is displayed, each showing name, image (via URL), and price

#### Scenario: Featured products section hidden when empty
- **WHEN** there are no products available in mock data
- **THEN** the featured products section is not displayed

### Requirement: CTA links to catalog
The system SHALL provide a call-to-action button that navigates to the full product catalog.

#### Scenario: CTA button navigates to catalog
- **WHEN** a user clicks "Ver Catálogo" or "Explorar Productos"
- **THEN** the application navigates to /catalogo

### Requirement: Navbar and footer are present on home page
The system SHALL display the shared navbar and footer on the home page.

#### Scenario: Navbar visible for anonymous user
- **WHEN** the home page loads and no JWT token exists
- **THEN** the navbar shows: Inicio, Catálogo, Nuestra Historia, Contacto, and a Login button

#### Scenario: Navbar visible for logged-in cliente
- **WHEN** a user with rol = 'cliente' is logged in
- **THEN** the navbar adds: Mi Perfil, Mis Pedidos, and Cerrar Sesión; Login button is hidden

#### Scenario: Navbar visible for logged-in admin
- **WHEN** a user with rol = 'admin' is logged in
- **THEN** the navbar shows only the logo/brand and an "Ir al Panel" button linking to /admin, plus Cerrar Sesión; public menu links are hidden

#### Scenario: Footer visible on all pages
- **WHEN** any page loads
- **THEN** the footer is visible at the bottom with bakery information
