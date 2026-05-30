## Why

La Comarca bakery needs a modern web application to manage daily operations and showcase products to customers. Currently no digital presence or administrative tool exists — orders are managed manually, inventory tracking is ad-hoc, and customers have no way to browse products online. This change delivers the foundational modules to digitize both the public-facing storefront and the administrative backoffice.

## What Changes

- Angular 21 standalone application with three-layer architecture (Components/Models/Services) — project already scaffolded
- Public homepage with hero section, hardcoded featured products (mocks), and CTA to catalog
- Product catalog with grid display, category filtering, and name search; model expanded with descripcion and imagen
- Admin panel (role-protected) with dashboard, product/inventory/order management, and billing
- JWT-based authentication flow with role-based guards
- Mock system via environment flag (useMock) — every service returns of(mockData) when true
- REST API integration layer with auto-attached auth tokens; swappable via mock flag
- Lazy-loaded routing for each domain module
- Bootstrap 5 as base CSS framework, custom styles per component

## Capabilities

### New Capabilities
- `user-auth`: Email/password login, JWT token management, auth guard, role guard (admin/cliente/vendedor), auto-attach token via interceptor, smart navbar with 3 states (anónimo/cliente/admin)
- `home-page`: Public landing page with hero section, La Comarca value proposition, hardcoded featured products grid (mock data), and call-to-action to catalog
- `product-catalog`: Public product grid with image (URL directa), name, price, category, descripcion; filter by category; search by name; detail view
- `admin-panel`: Protected admin area with dashboard (daily sales, orders, low-stock alerts, recent movements), product CRUD management, inventory stock tracking with manual movements, order listing/detail, billing/comprobantes listing with type filter

### Modified Capabilities

None — this is the initial implementation.

## Impact

- Existing Angular 21 project — no ng new needed, verify scaffold and configure
- Three-layer architecture per domain: `/Components` (presentation), `/Models` (TypeScript interfaces), `/Services` (API communication)
- Models map directly to PostgreSQL tables with expanded producto (descripcion, imagen)
- Mock system: `src/app/core/mocks/*.mock.ts` consumed by services when `useMock = true` in environment.ts
- Bootstrap 5 as base CSS framework; custom component styles in component-scoped CSS
- Business rules enforced at service layer (e.g., comprobantes.total must match SUM of detalle.subtotal)
- JWT auth interceptor adds `Authorization: Bearer <token>` to every request
- All admin routes protected by role guard (admin role only)
- Smart navbar with 3 visual states depending on auth status and role
