# Product Management Module

This module provides a complete product management interface for business owners to manage their products and inventory.

## Files Created

### Components

1. **`Products.tsx`** - Main product management page
   - Table and grid view modes
   - Product listing with stock levels and status
   - Add, edit, delete product functionality
   - Stock management integration
   - Real-time alerts for success/error messages

2. **`components/ProductFormModal.tsx`** - Add/Edit product modal
   - Form validation
   - Category selection
   - Price input (₱ PHP)
   - Product description
   - Image URL input
   - Status management (active/inactive/out_of_stock)

3. **`components/StockManagementModal.tsx`** - Stock management modal
   - Stock adjustment types:
     - Restock (add inventory)
     - Adjustment (manual corrections)
     - Expired (reduce stock for expired items)
     - Manual Sale (record offline sales)
   - Real-time stock preview
   - Stock level indicators (success/warning/danger)
   - Notes field for tracking changes

### Services & Types

4. **`services/ProductService.tsx`** - API integration layer
   - 15 product-related API functions
   - Categories: fetch, create, update, delete, reorder
   - Products: fetch all, fetch by business, create, update, delete
   - Stock: update, fetch history

5. **`types/Product.ts`** - TypeScript type definitions
   - `Product` interface with stock fields
   - `ProductCategory` interface
   - `ProductStock` interface
   - `StockHistory` interface
   - CRUD payload types

## Features

### Product Management
- ✅ View products in table or grid layout
- ✅ Add new products with categories
- ✅ Edit existing products
- ✅ Delete products with confirmation
- ✅ Product image display (with fallback icon)
- ✅ Status badges (active, inactive, out of stock)

### Inventory Management
- ✅ Real-time stock level display
- ✅ Color-coded stock indicators:
  - 🟢 Green: Stock above minimum
  - 🟡 Yellow: Stock at or below minimum
  - 🔴 Red: Out of stock (0 units)
- ✅ Stock adjustment modal with:
  - Restock operations
  - Stock adjustments
  - Expired item tracking
  - Manual sale recording
- ✅ Stock change preview before submitting

### User Experience
- ✅ Loading states with spinners
- ✅ Error and success alerts
- ✅ Empty states with helpful messages
- ✅ Warning when no categories exist
- ✅ Responsive grid/table layouts
- ✅ Icon buttons for quick actions

## Usage

### Prerequisites
1. Business must be selected in BusinessContext
2. At least one product category must exist

### Basic Workflow

1. **Select a business** (via BusinessContext)
2. **Create categories** (in Categories page)
3. **Add products**:
   - Click "Add Product" button
   - Fill in product details
   - Select category
   - Set price and status
   - Submit

4. **Manage stock**:
   - Click stock button (📦) on any product
   - Select action type (restock, adjustment, etc.)
   - Enter quantity change
   - Add notes (optional)
   - Submit

5. **Edit products**:
   - Click edit button (✏️) on any product
   - Modify details
   - Save changes

6. **Delete products**:
   - Click delete button (🗑️) on any product
   - Confirm deletion

## API Endpoints Used

### Products
- `GET /api/products` - Fetch all products
- `GET /api/products/business/:businessId` - Fetch by business
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories
- `GET /api/shop-categories?business_id=:businessId&type=product` - Fetch product categories
- `POST /api/shop-categories` - Create category (include category_type)
- `PUT /api/shop-categories/:id` - Update category
- `DELETE /api/shop-categories/:id` - Delete category

### Stock
- `PUT /api/product-stock/:productId` - Update stock
- `GET /api/product-stock/:productId/history` - Fetch stock history

## Data Flow

```
┌─────────────────┐
│  Products.tsx   │
└────────┬────────┘
         │
         ├──> useBusiness() → businessDetails.id
         │
         ├──> ProductService → API calls
         │
         ├──> ProductFormModal
         │    └──> handleProductSubmit()
         │         └──> ProductService.createProduct()
         │         └──> ProductService.updateProduct()
         │
         └──> StockManagementModal
              └──> handleStockUpdate()
                   └──> ProductService.updateProductStock()
```

## Component State

### Main State Variables
- `products`: Array of Product objects
- `categories`: Array of ShopCategory objects (or assignment entries when attached to products/services)
- `loading`: Boolean for loading state
- `viewMode`: "table" | "grid"
- `selectedProduct`: Product being edited/managed
- `productModalOpen`: Boolean for add/edit modal
- `stockModalOpen`: Boolean for stock management modal
- `error`: Error message string
- `success`: Success message string

## Example: Adding a Product

```typescript
// User clicks "Add Product"
setProductModalOpen(true);

// User fills form and submits
const payload: CreateProductPayload = {
  business_id: "business-123",
  product_category_id: "category-456",
  name: "Bicol Express (1kg)",
  description: "Spicy pork dish from Bicol region",
  price: 450.00,
  image_url: "https://example.com/bicol-express.jpg",
  status: "active"
};

await ProductService.createProduct(payload);

// Refresh products list
await fetchData();
```

## Example: Managing Stock

```typescript
// User clicks stock button for a product
setSelectedProduct(product);
setStockModalOpen(true);

// User selects "Restock" and enters +50
const payload: UpdateStockPayload = {
  quantity_change: 50,
  change_type: "restock",
  notes: "Weekly restock from supplier"
};

await ProductService.updateProductStock(product.id, payload);

// Stock updates from 20 → 70 units
```

## Styling

Uses Material-UI Joy components:
- `Button` with icons from react-icons/fi
- `Table` for tabular view
- `Card` for grid view
- `Chip` for status and stock badges
- `Modal` + `ModalDialog` for forms
- `Alert` for notifications
- `Sheet` for table container
- `CircularProgress` for loading

## Future Enhancements

Potential additions:
- [ ] Image upload functionality
- [ ] Bulk product import/export (CSV)
- [ ] Product search and filtering
- [ ] Category management interface
- [ ] Stock history viewing
- [ ] Low stock alerts/notifications
- [ ] Product statistics dashboard
- [ ] Barcode/SKU support
- [ ] Product variants (sizes, colors)
- [ ] Multi-image gallery per product

## Related Files

Backend:
- `naga-venture-backend/controller/productController.js`
- `naga-venture-backend/routes/products.js`
- `naga-venture-backend/procedures/productProcedures.js`
- `naga-venture-backend/migrations/[product-related].cjs`

Frontend:
- `city-venture-web/src/context/BusinessContext.tsx`
- `city-venture-web/src/components/PageContainer.tsx`
- `city-venture-web/src/services/api.tsx` (axios config)
