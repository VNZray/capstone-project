# Promotion System Documentation

## Overview
The promotion system has been generalized for all businesses to create and manage promotional advertisements/announcements with images and external links.

## Database Schema

### Promotion Table
```sql
promotion {
  id: UUID (primary key)
  business_id: UUID (foreign key to business, required)
  title: VARCHAR(255) (required)
  description: TEXT (optional)
  image_url: VARCHAR(500) (optional) - URL for promotional image
  external_link: VARCHAR(500) (optional) - External link for more info
  start_date: TIMESTAMP (required, defaults to NOW)
  end_date: TIMESTAMP (optional)
  is_active: BOOLEAN (default: true)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

### Indexes
- `idx_promotion_business` - on business_id
- `idx_promotion_dates` - on start_date, end_date
- `idx_promotion_active` - on is_active

## API Endpoints

### GET `/api/promotions`
Get all promotions with business information

### GET `/api/promotions/active`
Get all currently active promotions across all businesses

### GET `/api/promotions/business/:businessId`
Get all promotions for a specific business

### GET `/api/promotions/business/:businessId/active`
Get only active promotions for a specific business

### GET `/api/promotions/:id`
Get a specific promotion by ID

### POST `/api/promotions`
Create a new promotion

**Request Body:**
```json
{
  "business_id": "uuid",
  "title": "Summer Sale 2025!",
  "description": "Get 20% off all items this summer",
  "image_url": "https://example.com/images/summer-sale.jpg",
  "external_link": "https://example.com/summer-sale",
  "start_date": "2025-06-01 00:00:00",
  "end_date": "2025-08-31 23:59:59"
}
```

### PUT `/api/promotions/:id`
Update an existing promotion

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "image_url": "new-image-url",
  "external_link": "new-link",
  "start_date": "2025-06-01 00:00:00",
  "end_date": "2025-09-30 23:59:59",
  "is_active": true
}
```

### DELETE `/api/promotions/:id`
Delete a promotion

### POST `/api/promotions/maintenance/update-expired`
Maintenance endpoint to automatically deactivate expired promotions

## Stored Procedures

1. **GetAllPromotions()** - Retrieve all promotions with business names
2. **GetPromotionsByBusinessId(businessId)** - Get promotions for a specific business
3. **GetActivePromotionsByBusinessId(businessId)** - Get active promotions for a business
4. **GetAllActivePromotions()** - Get all active promotions
5. **GetPromotionById(id)** - Get promotion details by ID
6. **InsertPromotion(...)** - Create new promotion
7. **UpdatePromotion(...)** - Update existing promotion
8. **DeletePromotion(id)** - Delete a promotion
9. **UpdateExpiredPromotions()** - Auto-deactivate expired promotions

## Business Owner Workflow

### Creating a Promotion
1. Business owner navigates to "Manage Promotions"
2. Clicks "Create Promotion"
3. Fills in the form:
   - **Title**: Eye-catching promotion title (required)
   - **Description**: Detailed information about the promotion
   - **Image**: Upload promotional image/banner (single image)
   - **External Link**: Optional link to landing page or detailed info
   - **Start Date**: When promotion becomes active (defaults to now)
   - **End Date**: When promotion expires (optional, can be left open-ended)
4. Submits the form

### Managing Promotions
- View all promotions (active and inactive)
- Edit existing promotions
- Deactivate/Activate promotions manually
- Delete promotions that are no longer needed
- System automatically deactivates promotions after end_date

## Key Features

### Simplified Design
- **General Purpose**: No longer tied to specific discount values or rooms
- **Advertisement Focused**: Designed for business announcements and promotions
- **Flexible**: Can promote anything - sales, events, new products, special offers

### Performance Optimizations
- Indexed queries on business_id, dates, and is_active status
- Stored procedures for efficient database operations
- Direct single-query operations without complex joins

### Active Promotion Logic
A promotion is considered "active" when:
1. `is_active = true`
2. `start_date <= NOW()`
3. `end_date IS NULL` OR `end_date >= NOW()`

## Migration
The migration file includes:
- Table creation
- Index creation
- Stored procedure creation

To apply the migration:
```bash
npm run migrate
```

To rollback:
```bash
npm run migrate:rollback
```

## Files Created/Modified

### Created Files:
1. `procedures/promotionProcedures.js` - Stored procedures
2. `controller/promotionController.js` - Business logic
3. `routes/promotions.js` - API routes

### Modified Files:
1. `migrations/20250826175738_promotion_table.cjs` - Database schema
2. `index.js` - Route registration

## Usage Example

### Creating a Promotion via API
```javascript
const promotion = {
  business_id: "abc-123-def-456",
  title: "Grand Opening Sale!",
  description: "Join us for our grand opening. 50% off everything!",
  image_url: "https://mybusiness.com/images/grand-opening.jpg",
  external_link: "https://mybusiness.com/grand-opening",
  start_date: "2025-10-20 00:00:00",
  end_date: "2025-10-27 23:59:59"
};

fetch('http://localhost:3000/api/promotions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(promotion)
});
```

### Fetching Active Promotions for Display
```javascript
// Get all active promotions
fetch('http://localhost:3000/api/promotions/active')
  .then(res => res.json())
  .then(promotions => {
    promotions.forEach(promo => {
      console.log(promo.title, promo.image_url);
    });
  });
```

## Notes
- The system is optimized for speed with minimal validation
- Image upload handling should be implemented separately (file upload service)
- External links can point to any URL for more information
- Promotions automatically become inactive after end_date
- No complex business rules - simple and efficient
