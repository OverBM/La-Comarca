## ADDED Requirements

### Requirement: Admin panel uses sidebar layout
The system SHALL provide a fixed layout with a left sidebar for all /admin sub-routes. The sidebar SHALL remain visible when navigating between admin sections.

#### Scenario: Sidebar navigation
- **WHEN** an admin navigates to /admin
- **THEN** the sidebar is visible with links to: Dashboard, Productos, Inventario, Pedidos, Facturación
- **WHEN** clicking any sidebar link
- **THEN** the content area updates without reloading the sidebar

### Requirement: Dashboard shows daily summary
The system SHALL display an admin dashboard with key metrics: total sales today, orders today, low-stock products, and recent inventory movements.

#### Scenario: Dashboard loads with data
- **WHEN** an admin navigates to /admin
- **THEN** the dashboard shows cards for ventas del día, pedidos del día, productos con stock bajo, and últimos movimientos

#### Scenario: Dashboard handles empty data
- **WHEN** there is no data for the current day
- **THEN** dashboard cards show 0 or "Sin datos"

### Requirement: Admin can manage products (CRUD)
The system SHALL allow admins to create, read, update, and delete products.

#### Scenario: List all products
- **WHEN** an admin navigates to /admin/productos
- **THEN** a table displays all products with columns: nombre, categoría, precio_unitario, and actions

#### Scenario: Filter products by category
- **WHEN** an admin selects a category filter
- **THEN** only products in that category are shown in the table

#### Scenario: Create a new product
- **WHEN** an admin fills the create product form and submits
- **THEN** the product is created and appears in the product list

#### Scenario: Edit an existing product
- **WHEN** an admin clicks edit on a product and submits changes
- **THEN** the product is updated in the list

#### Scenario: Delete a product
- **WHEN** an admin clicks delete and confirms
- **THEN** the product is removed from the list

### Requirement: Admin can manage inventory stock
The system SHALL display current stock levels and allow manual movement registration.

#### Scenario: View inventory stock
- **WHEN** an admin navigates to /admin/inventario
- **THEN** a table shows each product with stock_actual and stock_minimo, with visual alerts for low stock

#### Scenario: Register inventory movement
- **WHEN** an admin fills the movement form (tipo, cantidad, motivo) and submits
- **THEN** a new movimientos_inventario record is created and stock_actual is updated

#### Scenario: Low stock alert visible
- **WHEN** a product's stock_actual is below stock_minimo
- **THEN** the product row shows a visual warning indicator

### Requirement: Admin can view and manage orders
The system SHALL display a list of orders with their details.

#### Scenario: List all orders
- **WHEN** an admin navigates to /admin/pedidos
- **THEN** a table displays all pedidos with fecha, cliente name, and total

#### Scenario: View order detail
- **WHEN** an admin clicks on an order
- **THEN** the system shows the full order detail including all detalle_pedido items with producto, cantidad, precio_unitario, and subtotal

### Requirement: Admin can view billing records
The system SHALL display issued comprobantes with filters by type.

#### Scenario: List comprobantes
- **WHEN** an admin navigates to /admin/facturacion
- **THEN** a table displays all comprobantes with serie, correlativo, tipo, total, and fecha

#### Scenario: Filter comprobantes by type
- **WHEN** an admin selects a tipo filter (Boleta/Factura/Nota de Venta)
- **THEN** only comprobantes of that type are displayed
