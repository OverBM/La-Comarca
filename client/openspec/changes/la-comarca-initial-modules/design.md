## Context

La Comarca bakery web app is built on an existing Angular 21 project (already scaffolded) with standalone components. The backend exposes a REST API but is not yet built — all development uses mock data via an environment flag. This change implements the first three modules: authentication, public-facing pages (home + catalog), and admin panel.

**Constraints:**
- Angular 21 standalone components, Signals for state, RxJS only for HTTP
- Strict three-layer separation per domain: Components → Models → Services
- Lazy loading per domain module
- JWT auth with role-based guards
- Models map 1:1 to PostgreSQL tables
- Backend does not exist yet — mock flag in environment.ts enables frontend-only development
- Bootstrap 5 as base CSS, custom component styles

## Goals / Non-Goals

**Goals:**
- Implement user authentication with JWT, guards, and interceptor
- Build public homepage with hero section and featured products
- Build product catalog with grid, category filter, and search
- Build admin panel with dashboard, product/inventory/order management, and billing
- Enforce three-layer architecture pattern as a project convention

**Non-Goals:**
- Customer-facing account management (registration, profile) — future phase
- Shopping cart and checkout flow — future phase
- Real-time notifications or WebSocket features
- Image upload for products — images served via URL directa, no upload UI

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | Signals (Angular 16+) | Native to Angular, no extra dependencies; simpler than NgRx for this scale |
| HTTP layer | RxJS Observable + async pipe / toSignal | Only RxJS usage; keeps HTTP reactive while UI uses Signals |
| Auth storage | localStorage via StorageService | Simple, sufficient for web; token refreshed on page load from storage |
| Lazy-loading | Standalone components with loadComponent | Modern Angular pattern; no NgModules needed |
| Folder structure | Domain-first (auth/, admin/, catalogo/) | Colocation by feature, not by type; scales well |
| Admin route protection | canActivate with rolGuard | Checks JWT role claim; redirects to login if unauthorized |
| Project state | Already scaffolded | No ng new needed; verify and configure existing project |
| Mock strategy | environment.useMock flag | Each service checks flag; true → of(mockData), false → http.get() |
| Mock location | src/app/core/mocks/ | Centralized mock data shared across services |
| CSS framework | Bootstrap 5 + component CSS | Bootstrap for layout/grid/utilities; custom CSS per component for brand identity. Design tokens (colors, typography, spacing) from Stitch DS "La Comarca Identity" |
| Product model | Expanded with descripcion + imagen | Needed for catalog display; imagen es URL directa, <img [src]> binding |
| Featured products | Hardcoded in mock | No destacado field yet; first N products from mock as featured |
| Smart navbar | 3 states from JWT role | Anónimo → full menu; Cliente → menu + profile links; Admin → minimal + panel link |
| Auth state signal | Shared in auth.service.ts | Navbar subscribes to auth state signal; updates reactively on login/logout |
| Admin layout | Fixed sidebar with child routes | /admin loads layout with sidebar; /admin/dashboard, productos, inventario, pedidos, facturacion are child routes |
| Admin navbar | Logo + Ver sitio + Ir al Panel + Cerrar sesión | Admin needs to preview public site; Ver sitio links to / |
| Mock credentials | Fixed: admin@comarca.com / admin123 (rol admin), cliente@comarca.com / cliente123 (rol cliente) | Any other combination returns error; enables testable login flow without backend |
| Loading pattern | Skeleton loading via shared/loading component | Every mock service uses delay(800) to simulate network latency and make skeleton visible |
| Placeholder pages | "Próximamente" message | Nuestra Historia, Contacto (navbar público), Mi Perfil, Mis Pedidos (cliente) show placeholder; built in client module phase |

## Design System — "La Comarca Identity"

Design system source: Stitch project ID `13465324793805873724`, asset `La Comarca Identity`.

**Brand philosophy:** *Tactile Minimalism* — rustic warmth of a Peruvian bakery meets modern UI precision. "Artisanal Precision."

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#32170d` | Navigation, headings, high-emphasis buttons |
| `on-primary` | `#ffffff` | Text/icon on primary |
| `primary-container` | `#4b2c20` | Brand accent surfaces |
| `on-primary-container` | `#bf9282` | Text on primary-container |
| `secondary` | `#904d00` | CTAs, notifications, highlights |
| `on-secondary` | `#ffffff` | Text/icon on secondary |
| `secondary-container` | `#fe932c` | Warm accent surfaces |
| `tertiary` | `#341700` | Alternative emphasis |
| `tertiary-container` | `#4e2b0d` | Alternative accent surfaces |
| `surface` | `#fef9f2` | Page backgrounds (creamy off-white) |
| `surface-container` | `#f2ede6` | Card/container backgrounds |
| `surface-container-low` | `#f8f3ec` | Subtle container backgrounds |
| `surface-container-high` | `#ece7e1` | Elevated container backgrounds |
| `on-surface` | `#1d1c18` | Primary text color |
| `on-surface-variant` | `#504440` | Secondary/muted text |
| `outline` | `#83746f` | Borders, dividers |
| `outline-variant` | `#d5c3bd` | Subtle borders |
| `background` | `#fef9f2` | App background |
| `on-background` | `#1d1c18` | Text on background |
| `error` | `#ba1a1a` | Error states |
| `inverse-primary` | `#ecbcaa` | Primary on dark surfaces |
| `inverse-surface` | `#32302c` | Dark surface for contrast |
| `success` | `#6B705C` | Muted olive green for positive states |

### Typography

| Level | Font | Size | Weight | Line-Height | Letter-Spacing |
|-------|------|------|--------|-------------|----------------|
| `display-lg` | Newsreader | 48px | 600 | 1.1 | — |
| `headline-md` | Newsreader | 32px | 500 | 1.2 | — |
| `title-sm` | Newsreader | 20px | 600 | 1.4 | — |
| `body-lg` | Be Vietnam Pro | 18px | 400 | 1.6 | — |
| `body-md` | Be Vietnam Pro | 16px | 400 | 1.5 | — |
| `label-sm` | Be Vietnam Pro | 13px | 600 | 1.2 | 0.05em |

**Font pairing logic:** Newsreader (serif) for headlines — classic, authoritative, literary. Be Vietnam Pro (sans) for body — friendly, legible, efficient.

### Spacing (8px grid)

| Token | Value |
|-------|-------|
| `xs` | 4px |
| `base` | 8px |
| `sm` | 12px |
| `md` | 24px |
| `gutter` | 24px |
| `lg` | 48px |
| `xl` | 80px |
| `margin` | 32px |

### Roundness

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 0.25rem | Minimal rounding |
| `DEFAULT` | 0.5rem | Buttons, inputs, cards |
| `md` | 0.75rem | — |
| `lg` | 1rem | Product cards (soft frame for food photography) |
| `xl` | 1.5rem | — |
| `full` | 9999px | Badges (pill-shaped) |

### Shadows & Elevation

- **Shadow base:** Highly diffused (large blur radius), tinted with `primary-container` at 5-10% opacity
- **Card resting:** Soft tonal layering — no hard shadows, use `surface-container` as card background
- **Card hover:** Element lifts 3-5px with deepened tinted shadow — simulates tactile response
- **Transition:** `transition: all 200ms ease`

### Component Styles

**Product Cards**
- Full-width image at top with subtle inner-glow overlay for text legibility
- Product title in Newsreader (title-sm)
- Category label in Be Vietnam Pro small-caps (label-sm), e.g., "PAN TRADICIONAL"
- Price in primary color for visibility
- `rounded-lg` (1rem) corners

**Order Status Badges** (Low-saturation, high-contrast pattern)
- Pending: Cream background / Brown text
- In Oven: Light gold background / Deep gold text
- Ready: Pale sage background / Dark olive text

**Administrative Tables**
- Headers: 2px `secondary` bottom border (no full cell outlines)
- Row striping: alternate with `#F9F4ED` (paper tone)
- Focus on clarity over decoration

**Buttons**
- Primary: Solid `primary-container` background, `on-primary` text
- Secondary ("Ghost"): 1.5px `secondary` border, transparent background

### Grid

- **12-column grid** standard layout
- **Max-width: 1280px** on desktop (curated, boutique feel)
- Public pages: Fixed grid for editorial content
- Admin pages: Fluid content model

## Risks / Trade-offs

- **Token in localStorage** → Vulnerable to XSS. Mitigation: sanitize all inputs, use Angular's built-in XSS protection.
- **Mock data drifting from reality** → When backend arrives, mocks may not match real API responses. Mitigation: keep mocks in sync, add integration tests later.
- **Signals for all state** → Learning curve for team used to NgRx. Mitigation: keep patterns simple, document in code.
- **No image upload** → Product images must be hosted externally or manually added. Acceptable for MVP.
