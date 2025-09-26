# Product & Service Management API Documentation

## Overview

This document outlines the new API endpoints added for comprehensive product and service management functionality, including inventory tracking, discount management, order processing, and customer reviews.

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints follow the existing authentication patterns in your system.

---

## 🛍️ Products API (`/api/products`)

### Product Categories

#### Get All Product Categories
```http
GET /api/products/categories
```
Returns all product categories across all businesses.

#### Get Product Categories by Business
```http
GET /api/products/categories/business/:businessId
```
Returns active product categories for a specific business.

#### Get Product Category by ID
```http
GET /api/products/categories/:id
```

#### Create Product Category
```http
POST /api/products/categories
Content-Type: application/json

{
  "business_id": "uuid",
  "name": "string",
  "description": "string", // optional
  "display_order": 0, // optional
  "status": "active" // optional
}
```

#### Update Product Category
```http
PUT /api/products/categories/:id
Content-Type: application/json

{
  "name": "string",
  "description": "string",
  "display_order": 0,
  "status": "active|inactive"
}
```

#### Delete Product Category
```http
DELETE /api/products/categories/:id
```

### Products

#### Get All Products
```http
GET /api/products
```
Returns all products with category and business information.

#### Get Products by Business
```http
GET /api/products/business/:businessId
```
Returns products for a specific business with stock information.

#### Get Products by Category
```http
GET /api/products/category/:categoryId
```

#### Get Product by ID
```http
GET /api/products/:id
```
Returns detailed product information including stock levels.

#### Create Product
```http
POST /api/products
Content-Type: application/json

{
  "business_id": "uuid",
  "product_category_id": "uuid",
  "name": "string",
  "description": "string", // optional
  "price": 29.99,
  "image_url": "string", // optional
  "status": "active" // optional
}
```

#### Update Product
```http
PUT /api/products/:id
Content-Type: application/json

{
  "product_category_id": "uuid",
  "name": "string",
  "description": "string",
  "price": 29.99,
  "image_url": "string",
  "status": "active|inactive|out_of_stock"
}
```

#### Delete Product
```http
DELETE /api/products/:id
```

### Stock Management

#### Get Product Stock
```http
GET /api/products/:productId/stock
```

#### Update Product Stock
```http
PUT /api/products/:productId/stock
Content-Type: application/json

{
  "quantity_change": 50, // positive for additions, negative for reductions
  "change_type": "restock|sale|adjustment|expired",
  "notes": "string", // optional
  "created_by": "uuid" // optional
}
```

#### Get Stock History
```http
GET /api/products/:productId/stock/history
```

---

## 🏷️ Discounts API (`/api/discounts`)

#### Get All Discounts
```http
GET /api/discounts
```

#### Get Discounts by Business
```http
GET /api/discounts/business/:businessId
```

#### Get Active Discounts by Business
```http
GET /api/discounts/business/:businessId/active
```

#### Get Discount by ID
```http
GET /api/discounts/:id
```

#### Create Discount
```http
POST /api/discounts
Content-Type: application/json

{
  "business_id": "uuid",
  "name": "string",
  "description": "string", // optional
  "discount_type": "percentage|fixed_amount",
  "discount_value": 10.00,
  "minimum_order_amount": 50.00, // optional
  "maximum_discount_amount": 100.00, // optional, for percentage discounts
  "start_datetime": "2024-01-01T00:00:00Z",
  "end_datetime": "2024-12-31T23:59:59Z", // optional
  "usage_limit": 100, // optional
  "usage_limit_per_customer": 1, // optional
  "status": "active", // optional
  "applicable_products": ["uuid1", "uuid2"] // optional array of product IDs
}
```

#### Update Discount
```http
PUT /api/discounts/:id
```

#### Delete Discount
```http
DELETE /api/discounts/:id
```

#### Validate Discount
```http
POST /api/discounts/:discountId/validate
Content-Type: application/json

{
  "order_total": 100.00,
  "user_id": "uuid", // optional
  "product_ids": ["uuid1", "uuid2"] // optional
}
```

#### Update Discount Usage Count
```http
PUT /api/discounts/:discountId/usage
```

#### Get Discount Statistics
```http
GET /api/discounts/:id/stats
```

---

## 🛠️ Services API (`/api/services`)

### Service Categories

#### Get All Service Categories
```http
GET /api/services/categories
```

#### Get Service Categories by Business
```http
GET /api/services/categories/business/:businessId
```

#### Create Service Category
```http
POST /api/services/categories
Content-Type: application/json

{
  "business_id": "uuid",
  "name": "string",
  "description": "string", // optional
  "display_order": 0, // optional
  "status": "active" // optional
}
```

### Services

#### Get All Services
```http
GET /api/services
```

#### Get Services by Business
```http
GET /api/services/business/:businessId
```

#### Get Services with Pricing
```http
GET /api/services/business/:businessId/pricing
```
Returns services with calculated effective prices including discounts.

#### Search Services
```http
GET /api/services/search?query=spa&business_id=uuid&price_min=50&price_max=200
```

#### Create Service
```http
POST /api/services
Content-Type: application/json

{
  "business_id": "uuid",
  "service_category_id": "uuid",
  "name": "string",
  "description": "string", // optional
  "base_price": 99.99,
  "price_type": "per_hour|per_day|per_week|per_month|per_session|fixed",
  "sale_type": "fixed|percentage", // optional
  "sale_value": 10.00, // optional
  "duration_estimate": "2-3 hours", // optional
  "image_url": "string", // optional
  "features": ["Feature 1", "Feature 2"], // optional array
  "requirements": "string", // optional
  "display_order": 0, // optional
  "status": "active" // optional
}
```

#### Get Service Statistics
```http
GET /api/services/business/:businessId/stats
```

---

## 📋 Orders API (`/api/orders`)

#### Get All Orders
```http
GET /api/orders
```

#### Get Orders by Business
```http
GET /api/orders/business/:businessId
```

#### Get Orders by User
```http
GET /api/orders/user/:userId
```

#### Get Order by ID
```http
GET /api/orders/:id
```

#### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "business_id": "uuid",
  "user_id": "uuid",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2,
      "special_requests": "string" // optional
    }
  ],
  "discount_id": "uuid", // optional
  "pickup_datetime": "2024-01-15T14:00:00Z",
  "special_instructions": "string", // optional
  "payment_method": "cash_on_pickup|card|digital_wallet" // optional
}
```

#### Update Order Status
```http
PUT /api/orders/:id/status
Content-Type: application/json

{
  "status": "pending|confirmed|preparing|ready|completed|cancelled"
}
```

#### Update Payment Status
```http
PUT /api/orders/:id/payment
Content-Type: application/json

{
  "payment_status": "pending|paid|failed|refunded"
}
```

#### Cancel Order
```http
PUT /api/orders/:id/cancel
Content-Type: application/json

{
  "cancellation_reason": "string" // optional
}
```

#### Get Order Statistics
```http
GET /api/orders/business/:businessId/stats?period=30
```

---

## ⭐ Product Reviews API (`/api/product-reviews`)

#### Get All Product Reviews
```http
GET /api/product-reviews
```

#### Get Reviews by Product
```http
GET /api/product-reviews/product/:productId
```

#### Get Reviews by User
```http
GET /api/product-reviews/user/:userId
```

#### Get Reviews by Business
```http
GET /api/product-reviews/business/:businessId
```

#### Create Product Review
```http
POST /api/product-reviews
Content-Type: application/json

{
  "product_id": "uuid",
  "user_id": "uuid",
  "order_id": "uuid", // optional
  "rating": 5,
  "review_title": "string", // optional
  "review_text": "string", // optional
  "is_verified_purchase": true // optional
}
```

#### Update Product Review
```http
PUT /api/product-reviews/:id
Content-Type: application/json

{
  "rating": 4,
  "review_title": "string",
  "review_text": "string",
  "status": "active|hidden|flagged"
}
```

#### Check if User Can Review Product
```http
GET /api/product-reviews/can-review/:productId/:userId
```

#### Get Product Review Statistics
```http
GET /api/product-reviews/product/:productId/stats
```

#### Get Business Review Statistics
```http
GET /api/product-reviews/business/:businessId/stats
```

---

## Data Models

### Product Category
```typescript
{
  id: string (UUID),
  business_id: string (UUID),
  name: string,
  description: string?,
  display_order: number,
  status: 'active' | 'inactive',
  created_at: timestamp,
  updated_at: timestamp
}
```

### Product
```typescript
{
  id: string (UUID),
  business_id: string (UUID),
  product_category_id: string (UUID),
  name: string,
  description: string?,
  price: decimal,
  image_url: string?,
  status: 'active' | 'inactive' | 'out_of_stock',
  created_at: timestamp,
  updated_at: timestamp
}
```

### Order
```typescript
{
  id: string (UUID),
  business_id: string (UUID),
  user_id: string (UUID),
  order_number: string,
  subtotal: decimal,
  discount_amount: decimal,
  tax_amount: decimal,
  total_amount: decimal,
  discount_id: string (UUID)?,
  pickup_datetime: timestamp,
  special_instructions: string?,
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled',
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded',
  payment_method: 'cash_on_pickup' | 'card' | 'digital_wallet',
  created_at: timestamp,
  updated_at: timestamp
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "fields": ["field1", "field2"] // for validation errors
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Notes

- All UUID parameters are validated
- Required fields are enforced
- Price values must be positive numbers
- Ratings must be integers between 1-5
- Stock operations are transactional
- Order creation includes automatic stock deduction
- Order cancellation restores stock levels
