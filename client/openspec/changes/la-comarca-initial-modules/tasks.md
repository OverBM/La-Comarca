## 1. Project Scaffold & Core Infrastructure

- [x] 1.1 Verify existing Angular 21 project scaffold, configure tsconfig, and confirm Bootstrap 5 is installed
- [x] 1.2 Install Bootstrap 5 as project dependency
- [x] 1.3 Create core folder structure (guards/, interceptors/, services/, mocks/)
- [x] 1.4 Set up environment.ts with useMock: boolean flag and API base URL
- [x] 1.5 Configure app.routes.ts with lazy-loaded routes for auth, home, catalogo, admin
- [x] 1.6 Create shared components: navbar (3 states), footer, loading (skeleton with simulated delay)

## 2. Mock Data Files

- [x] 2.1 Create productos.mock.ts with 8+ products (including descripcion and imagen URL)
- [x] 2.2 Create categorias.mock.ts with 3+ categories
- [x] 2.3 Create pedidos.mock.ts with sample orders and detalle_pedido items
- [x] 2.4 Create inventario.mock.ts with stock data (include some low-stock items)
- [x] 2.5 Create comprobantes.mock.ts with issued receipts (Boleta/Factura/Nota de Venta)

## 3. Auth Module

- [x] 3.1 Create auth models (usuario.model.ts, token.model.ts)
- [x] 3.2 Create storage.service.ts (localStorage wrapper — get/set/clear token)
- [x] 3.3 Create auth.service.ts with login(), logout(), authState Signal, role extraction from JWT, and useMock flag. Mock credentials: admin@comarca.com/admin123 (rol admin), cliente@comarca.com/cliente123 (rol cliente)
- [x] 3.4 Create auth.interceptor.ts (auto-attach JWT Bearer token, handle 401 responses)
- [x] 3.5 Create auth.guard.ts (redirect to /auth/login if no token)
- [x] 3.6 Create rol.guard.ts (check JWT role claim, restrict /admin to admin only)
- [x] 3.7 Create LoginComponent with email/password form and error messages

## 4. Home Page

- [x] 4.1 Create shared navbar component with 3-state logic (anónimo / cliente / admin) reading auth state from auth.service.ts. Admin navbar: Logo + Ver sitio + Ir al Panel + Cerrar sesión
- [x] 4.2 Create shared footer component with bakery info
- [x] 4.3 Create HomeComponent with hero section and featured products grid (hardcoded from mock)
- [x] 4.4 Connect CTA buttons to navigate to /catalogo
- [x] 4.5 Style hero section and featured products with Bootstrap + custom CSS
- [x] 4.6 Create placeholder pages for Nuestra Historia and Contacto (show "Próximamente")

## 5. Catalog Module

- [x] 5.1 Create catalog models (producto.model.ts with descripcion + imagen, categoria.model.ts)
- [x] 5.2 Create catalogo.service.ts with getProducts(), getProductById(), searchProducts(), getCategories() — all with useMock flag and delay(800) for skeleton visibility
- [x] 5.3 Create ListaProductosComponent with responsive Bootstrap grid, category filter dropdown, and search input
- [x] 5.4 Create DetalleProductoComponent showing full product info with image loaded via URL
- [x] 5.5 Wire up catalog routes (/catalogo, /catalogo/:id) with lazy loading

## 6. Admin Module — Layout & Routing

- [x] 6.1 Create AdminLayoutComponent with fixed sidebar and router-outlet for child routes
- [x] 6.2 Configure admin child routes: /admin/dashboard, /admin/productos, /admin/inventario, /admin/pedidos, /admin/facturacion
- [x] 6.3 Create sidebar with navigation links and active state highlighting
- [x] 6.4 Style sidebar layout with Bootstrap + custom CSS

## 7. Admin Module — Models & Services

- [x] 7.1 Create admin models (inventario.model.ts, movimiento.model.ts)
- [x] 7.2 Create admin-productos.service.ts (CRUD + category filter) with useMock flag and delay(800)
- [x] 7.3 Create inventario.service.ts (getStock, registerMovement, lowStockAlerts) with useMock flag and delay(800)
- [x] 7.4 Create admin-pedidos.service.ts (list orders, getOrderDetail) with useMock flag and delay(800)

## 8. Admin Module — Dashboard

- [x] 8.1 Create DashboardComponent with summary cards: ventas del día, pedidos del día, productos con stock bajo, últimos movimientos
- [x] 8.2 Add API methods to admin services for dashboard data aggregation
- [x] 8.3 Handle empty/loading/error states for dashboard cards

## 9. Admin Module — Product Management

- [x] 9.1 Create GestionProductosComponent with Bootstrap table of all products and category filter
- [x] 9.2 Add create/edit product modal or inline form
- [x] 9.3 Add delete product with confirmation dialog
- [x] 9.4 Wire up all CRUD operations to admin-productos.service.ts

## 10. Admin Module — Inventory Management

- [x] 10.1 Create GestionInventarioComponent with stock table, stock_actual vs stock_minimo, and low-stock visual alerts
- [x] 10.2 Create movement registration form (tipo: entrada/salida/ajuste, cantidad, motivo)
- [x] 10.3 Wire up stock display and movement creation to inventario.service.ts

## 11. Admin Module — Order Management

- [x] 11.1 Create GestionPedidosComponent with order list table (fecha, cliente, total)
- [x] 11.2 Create order detail view with line items from detalle_pedido
- [x] 11.3 Wire up to admin-pedidos.service.ts

## 12. Admin Module — Billing

- [x] 12.1 Create FacturacionComponent with comprobantes table (serie, correlativo, tipo, total, fecha)
- [x] 12.2 Add tipo filter dropdown (Boleta / Factura / Nota de Venta)
- [x] 12.3 Wire up to admin-pedidos.service.ts (or dedicated billing service)
- [x] 12.4 Create placeholder pages for Mi Perfil and Mis Pedidos (cliente section, show "Próximamente")
