# Service Multi-Category Implementation

## Overview
Implemented many-to-many relationship for services and categories, similar to the existing product-category implementation.

## Changes Made

### 1. Database Schema
**File:** `naga-venture-backend/migrations/20251001000009_create_service_category_map.cjs`
- Created `service_category_map` junction table
- Columns:
  - `id`: UUID primary key
  - `service_id`: References `service` table
  - `category_id`: References `service_category` table
  - `is_primary`: Boolean to mark the primary category
  - `created_at` and `updated_at` timestamps
- Unique constraint on `service_id` + `category_id` pair
- Indexes on both foreign keys
- Backfills existing `service.service_category_id` relationships

### 2. Stored Procedures Updates
**File:** `naga-venture-backend/procedures/serviceProcedures.js`

Updated the following procedures to return categories as JSON array:
- `GetAllServices()` - Returns all categories for each service
- `GetServicesByBusinessId()` - Returns all categories for services by business
- `GetServiceById()` - Returns all categories for a specific service
- `InsertService()` - Returns categories in the result
- `UpdateService()` - Returns categories in the result

**Categories JSON Structure:**
```json
[
  {
    "id": "category-uuid",
    "name": "Category Name",
    "is_primary": true/false,
    "display_order": 0
  }
]
```

### 3. Backend Controller Updates
**File:** `naga-venture-backend/controller/serviceController.js`

#### Helper Functions Added:
```javascript
const extractRows = (result) => { ... }
const parseCategories = (categories) => { ... }
const mapServiceRow = (row) => { ... }
const mapServiceRows = (rows) => { ... }
```

#### Updated Functions:
1. **`insertService`**
   - Now accepts `category_ids` array instead of single `service_category_id`
   - Validates that at least one category is provided
   - Uses transaction to:
     - Insert service with primary category
     - Insert all category mappings into `service_category_map`
     - Update `service.service_category_id` with primary category
   - Returns service with parsed categories

2. **`updateService`**
   - Now accepts `category_ids` array
   - Validates that at least one category is provided
   - Uses transaction to:
     - Update service with new primary category
     - Delete old category mappings
     - Insert new category mappings
     - Update `service.service_category_id` with new primary category
   - Returns service with parsed categories

3. **All GET endpoints** - Updated to use `mapServiceRow(s)` helpers to parse categories

### 4. Frontend Types (Already Correct)
**File:** `city-venture-web/src/types/Service.ts`

The frontend types were already correctly defined with `category_ids: string[]`:

```typescript
export interface CreateServicePayload {
  business_id: string;
  category_ids: string[];  // Already supports multiple categories
  name: string;
  description?: string;
  base_price: number;
  price_type: "fixed" | "per_hour" | "per_person" | "custom";
  // ... other fields
}

export interface UpdateServicePayload {
  category_ids?: string[];  // Already supports multiple categories
  // ... other fields
}
```

## How It Works

### Creating a Service with Multiple Categories:
```json
POST /api/services
{
  "business_id": "business-uuid",
  "category_ids": ["category-1-uuid", "category-2-uuid", "category-3-uuid"],
  "name": "Service Name",
  "base_price": 100,
  "price_type": "per_hour",
  // ... other fields
}
```

**Process:**
1. First category in array becomes the primary category
2. Service is created with `service_category_id` = first category
3. All categories are inserted into `service_category_map`
4. First category has `is_primary = true`, others `false`

### Updating a Service:
```json
PUT /api/services/:id
{
  "category_ids": ["new-category-1", "new-category-2"],
  // ... other fields
}
```

**Process:**
1. Updates service with new primary category (first in array)
2. Deletes all old category mappings
3. Inserts new category mappings
4. Returns service with all updated categories

### Response Format:
```json
{
  "message": "Service created successfully",
  "data": {
    "id": "service-uuid",
    "name": "Service Name",
    "service_category_id": "category-1-uuid",
    "primary_category_name": "Primary Category",
    "categories": [
      {
        "id": "category-1-uuid",
        "name": "Category 1",
        "is_primary": true,
        "display_order": 0
      },
      {
        "id": "category-2-uuid",
        "name": "Category 2",
        "is_primary": false,
        "display_order": 1
      }
    ],
    // ... other service fields
  }
}
```

## Migration Required

Run the following command to apply the migration:
```bash
cd naga-venture-backend
npx knex migrate:latest
```

This will:
1. Create the `service_category_map` table
2. Backfill existing service-category relationships
3. Recreate stored procedures with category array support

## Benefits

1. **Flexibility:** Services can now belong to multiple categories
2. **Consistency:** Matches the product-category implementation pattern
3. **Backwards Compatible:** Existing `service_category_id` column is maintained
4. **Primary Category:** First category in array is marked as primary
5. **Frontend Ready:** Frontend types already support `category_ids` array

## Testing

Test the implementation by:
1. Creating a new service with multiple categories
2. Updating an existing service with different categories
3. Fetching services and verifying categories array is returned
4. Verifying the primary category is properly identified

## Notes

- The `service_category_id` column is kept for backwards compatibility and quick queries
- The primary category (first in array) is always stored in `service_category_id`
- Category mappings are deleted and recreated on update (no partial updates)
- At least one category is required when creating or updating a service
