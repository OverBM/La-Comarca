## ADDED Requirements

### Requirement: Catalog displays products in a grid
The system SHALL display all available products in a responsive grid layout. Each product card SHALL show image (via URL directa), name, price, category, and description.

#### Scenario: Catalog grid renders with products
- **WHEN** a user navigates to /catalogo and products exist
- **THEN** a responsive grid displays each product card with image (via URL), name, price, category, and a short description snippet

#### Scenario: Empty catalog shows message
- **WHEN** there are no products available
- **THEN** the catalog displays "No hay productos disponibles"

### Requirement: User can filter products by category
The system SHALL allow users to filter the product grid by selecting a category.

#### Scenario: Filter by category
- **WHEN** a user selects a category from the filter
- **THEN** only products in that category are displayed

#### Scenario: Clear filter shows all products
- **WHEN** a user clears the category filter
- **THEN** all products are displayed again

### Requirement: User can search products by name
The system SHALL allow users to search for products by name using a text input.

#### Scenario: Search by product name
- **WHEN** a user types in the search input
- **THEN** only products whose name contains the search text are displayed

#### Scenario: Search with no results
- **WHEN** no products match the search query
- **THEN** the system displays "No se encontraron productos"

### Requirement: User can view product detail
The system SHALL display a detail view when a user clicks on a product.

#### Scenario: View product detail
- **WHEN** a user clicks on a product card
- **THEN** the system navigates to /catalogo/:id showing full product details including name, description, price, category, and image loaded from the product's imagen URL

#### Scenario: Product image fallback
- **WHEN** a product has no imagen URL or the URL fails to load
- **THEN** the system displays a placeholder image
