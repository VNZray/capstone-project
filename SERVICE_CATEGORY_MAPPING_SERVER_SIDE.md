# Service Category Mapping - Server-Side Implementation

## Overview
Moved service category mapping logic from application code to stored procedures for better performance and maintainability.

## Changes Made

### 1. New Stored Procedures

#### `InsertServiceCategoryMappings(p_service_id, p_category_ids)`
**Purpose:** Insert multiple category mappings for a service
**Parameters:**
- `p_service_id` (CHAR(36)): Service UUID
- `p_category_ids` (JSON): Array of category IDs

**Logic:**
- Iterates through JSON array of category IDs
- Checks if mapping already exists (prevents duplicates)
- Inserts new mapping with UUID
- First category marked as `is_primary = TRUE`
- Subsequent categories marked as `is_primary = FALSE`

**Example:**
```sql
CALL InsertServiceCategoryMappings(
  'service-uuid', 
  '["cat-1-uuid", "cat-2-uuid", "cat-3-uuid"]'
);
```

#### `UpdateServiceCategoryMappings(p_service_id, p_category_ids)`
**Purpose:** Replace all category mappings for a service
**Parameters:**
- `p_service_id` (CHAR(36)): Service UUID
- `p_category_ids` (JSON): New array of category IDs

**Logic:**
- Deletes all existing mappings for the service
- Calls `InsertServiceCategoryMappings` to add new mappings

**Example:**
```sql
CALL UpdateServiceCategoryMappings(
  'service-uuid', 
  '["new-cat-1", "new-cat-2"]'
);
```

### 2. Updated Controller Logic

#### `insertService` Function
**Before:**
```javascript
// Multiple individual INSERT queries in loop
const insertMappingQuery = "INSERT INTO service_category_map ...";
for (let i = 0; i < validCategoryIds.length; i++) {
  await connection.query(insertMappingQuery, [uuidv4(), serviceId, categoryId, i === 0 ? 1 : 0]);
}
```

**After:**
```javascript
// Single stored procedure call
const categoryIdsJson = JSON.stringify(validCategoryIds);
await connection.query("CALL InsertServiceCategoryMappings(?, ?)", [serviceId, categoryIdsJson]);
```

#### `updateService` Function
**Before:**
```javascript
// DELETE then multiple INSERT queries
await connection.query("DELETE FROM service_category_map WHERE service_id = ?", [id]);
const insertMappingQuery = "INSERT INTO service_category_map ...";
for (let i = 0; i < validCategoryIds.length; i++) {
  await connection.query(insertMappingQuery, [uuidv4(), id, categoryId, i === 0 ? 1 : 0]);
}
```

**After:**
```javascript
// Single stored procedure call
const categoryIdsJson = JSON.stringify(validCategoryIds);
await connection.query("CALL UpdateServiceCategoryMappings(?, ?)", [id, categoryIdsJson]);
```

### 3. Migration File
**File:** `20251001000010_update_service_procedures_with_category_mapping.cjs`

Recreates all service procedures with the new category mapping procedures included.

## Benefits

### 1. **Performance**
- **Reduced Network Round-trips:** One stored procedure call instead of N+1 queries
- **Server-side Processing:** Loop executes in MySQL instead of application
- **Optimized Execution:** MySQL can optimize the entire operation

**Example Performance:**
- **Before:** 1 service insert + 3 category inserts = 4 database calls
- **After:** 1 service insert + 1 stored procedure call = 2 database calls
- **Improvement:** 50% reduction in database calls

### 2. **Maintainability**
- **Centralized Logic:** Category mapping logic in one place
- **Easier Testing:** Can test procedures independently
- **Consistent Behavior:** Same logic for all services

### 3. **Data Integrity**
- **Atomic Operations:** All within stored procedure transaction
- **Duplicate Prevention:** Built-in check for existing mappings
- **Constraint Validation:** MySQL handles foreign key constraints

### 4. **Code Clarity**
- **Simpler Controller:** Less complex looping logic
- **Clear Intent:** Procedure names are self-documenting
- **Reduced Boilerplate:** No UUID generation or manual query building

## Migration Instructions

Run the migration to update the stored procedures:
```bash
cd naga-venture-backend
npx knex migrate:latest
```

This will:
1. Drop old service procedures
2. Create new procedures with category mapping support
3. Ready for immediate use

## Testing

### Test Insert Service with Multiple Categories:
```javascript
POST /api/services
{
  "business_id": "business-uuid",
  "category_ids": ["cat-1", "cat-2", "cat-3"],
  "name": "Test Service",
  "base_price": 100,
  "price_type": "per_hour"
}
```

**Expected Result:**
- Service created with `service_category_id = "cat-1"` (primary)
- 3 rows in `service_category_map`:
  - `cat-1` with `is_primary = TRUE`
  - `cat-2` with `is_primary = FALSE`
  - `cat-3` with `is_primary = FALSE`

### Test Update Service Categories:
```javascript
PUT /api/services/:id
{
  "category_ids": ["cat-4", "cat-5"]
}
```

**Expected Result:**
- Old mappings deleted
- New mappings created with `cat-4` as primary
- `service.service_category_id` updated to `"cat-4"`

## Technical Details

### JSON Parameter Handling
MySQL stored procedures can accept JSON parameters and process them:

```sql
-- Extract array length
SET category_count = JSON_LENGTH(p_category_ids);

-- Extract element by index
SET current_category_id = JSON_UNQUOTE(JSON_EXTRACT(p_category_ids, CONCAT('$[', i, ']')));
```

### Duplicate Prevention
```sql
IF NOT EXISTS (
  SELECT 1 FROM service_category_map 
  WHERE service_id = p_service_id AND category_id = current_category_id
) THEN
  INSERT INTO service_category_map ...
END IF;
```

### Primary Category Logic
```sql
DECLARE is_first BOOLEAN DEFAULT TRUE;

-- First iteration
INSERT INTO service_category_map (..., is_primary) VALUES (..., is_first);

SET is_first = FALSE;  -- Subsequent iterations
```

## Comparison with Product Implementation

Both Services and Products now use the same pattern:

| Feature | Products | Services |
|---------|----------|----------|
| Multi-category support | ✅ | ✅ |
| Junction table | `product_category_map` | `service_category_map` |
| Insert procedure | `InsertProductCategoryMappings` | `InsertServiceCategoryMappings` |
| Update procedure | `UpdateProductCategoryMappings` | `UpdateServiceCategoryMappings` |
| Primary category flag | ✅ `is_primary` | ✅ `is_primary` |
| JSON parameter | ✅ | ✅ |
| Server-side logic | ✅ | ✅ |

## Rollback Plan

If issues arise, rollback the migration:
```bash
npx knex migrate:rollback
```

This will restore the previous procedure versions (though manual category mapping in controller will still be needed).

## Future Enhancements

1. **Batch Operations:** Add procedures for bulk service category updates
2. **Category Validation:** Validate category belongs to same business
3. **Ordering:** Support custom category display order per service
4. **Statistics:** Add procedure to get category usage statistics
5. **Audit Trail:** Track category mapping changes

## Notes

- Stored procedures improve performance by reducing network overhead
- JSON parameters require MySQL 5.7.8+ (supported in all modern versions)
- All category operations are now consistent between INSERT and UPDATE
- Transaction handling remains in controller for better error management
