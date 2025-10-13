# Services and Service Bookings Backend Implementation Guide

This document outlines the backend database schema, stored procedures, API routes, and controllers needed to support the Services and Service Bookings features.

## Overview

The Services feature allows businesses to:
- Create and manage service offerings (e.g., spa services, guided tours, consultations)
- Organize services into multiple categories
- Set pricing models (fixed, per hour, per person, custom)
- Define service duration, capacity, and booking requirements
- Manage service bookings from customers
- Track booking status (pending, confirmed, completed, cancelled)

## Database Schema

### 1. Service Categories Table

```sql
CREATE TABLE service_category (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  business_id CHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
  INDEX idx_business_id (business_id),
  INDEX idx_status (status)
);
```

### 2. Services Table

```sql
CREATE TABLE service (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  business_id CHAR(36) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  price_type ENUM('fixed', 'per_hour', 'per_person', 'custom') DEFAULT 'fixed',
  duration_minutes INT,
  capacity INT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  terms_conditions TEXT,
  cancellation_policy TEXT,
  advance_booking_hours INT DEFAULT 24,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
  INDEX idx_business_id (business_id),
  INDEX idx_status (status)
);
```

### 3. Service Category Mapping Table (Many-to-Many)

```sql
CREATE TABLE service_category_map (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  service_id CHAR(36) NOT NULL,
  category_id CHAR(36) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES service(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES service_category(id) ON DELETE CASCADE,
  UNIQUE KEY unique_service_category (service_id, category_id),
  INDEX idx_service_id (service_id),
  INDEX idx_category_id (category_id)
);
```

### 4. Service Bookings Table

```sql
CREATE TABLE service_booking (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  service_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  business_id CHAR(36) NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration_minutes INT,
  number_of_people INT DEFAULT 1,
  total_price DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  special_requests TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES service(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
  INDEX idx_service_id (service_id),
  INDEX idx_user_id (user_id),
  INDEX idx_business_id (business_id),
  INDEX idx_booking_date (booking_date),
  INDEX idx_status (status)
);
```

## Stored Procedures

### Service Category Procedures

#### 1. Get Service Categories by Business ID
```sql
DELIMITER //
CREATE PROCEDURE GetServiceCategoriesByBusinessId(IN p_business_id CHAR(36))
BEGIN
    SELECT 
        id,
        business_id,
        name,
        description,
        display_order,
        status,
        created_at,
        updated_at
    FROM service_category
    WHERE business_id = p_business_id
    ORDER BY display_order ASC, name ASC;
END //
DELIMITER ;
```

#### 2. Get Service Category by ID
```sql
DELIMITER //
CREATE PROCEDURE GetServiceCategoryById(IN p_id CHAR(36))
BEGIN
    SELECT 
        id,
        business_id,
        name,
        description,
        display_order,
        status,
        created_at,
        updated_at
    FROM service_category
    WHERE id = p_id;
END //
DELIMITER ;
```

#### 3. Insert Service Category
```sql
DELIMITER //
CREATE PROCEDURE InsertServiceCategory(
    IN p_business_id CHAR(36),
    IN p_name VARCHAR(100),
    IN p_description TEXT,
    IN p_display_order INT,
    IN p_status VARCHAR(20)
)
BEGIN
    INSERT INTO service_category (business_id, name, description, display_order, status)
    VALUES (p_business_id, p_name, p_description, p_display_order, p_status);
    
    SELECT LAST_INSERT_ID() AS id;
END //
DELIMITER ;
```

#### 4. Update Service Category
```sql
DELIMITER //
CREATE PROCEDURE UpdateServiceCategory(
    IN p_id CHAR(36),
    IN p_name VARCHAR(100),
    IN p_description TEXT,
    IN p_display_order INT,
    IN p_status VARCHAR(20)
)
BEGIN
    UPDATE service_category
    SET 
        name = COALESCE(p_name, name),
        description = p_description,
        display_order = COALESCE(p_display_order, display_order),
        status = COALESCE(p_status, status),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_id;
END //
DELIMITER ;
```

#### 5. Delete Service Category
```sql
DELIMITER //
CREATE PROCEDURE DeleteServiceCategory(IN p_id CHAR(36))
BEGIN
    DELETE FROM service_category WHERE id = p_id;
END //
DELIMITER ;
```

### Service Procedures

#### 1. Get Services by Business ID (with categories)
```sql
DELIMITER //
CREATE PROCEDURE GetServicesByBusinessId(IN p_business_id CHAR(36))
BEGIN
    SELECT 
        s.id,
        s.business_id,
        s.name,
        s.description,
        s.base_price,
        s.price_type,
        s.duration_minutes,
        s.capacity,
        s.status,
        s.terms_conditions,
        s.cancellation_policy,
        s.advance_booking_hours,
        s.created_at,
        s.updated_at,
        (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', sc.id,
                    'name', sc.name,
                    'description', sc.description,
                    'is_primary', scm.is_primary
                )
            )
            FROM service_category_map scm
            INNER JOIN service_category sc ON scm.category_id = sc.id
            WHERE scm.service_id = s.id
        ) AS categories
    FROM service s
    WHERE s.business_id = p_business_id
    ORDER BY s.created_at DESC;
END //
DELIMITER ;
```

#### 2. Get Service by ID (with categories)
```sql
DELIMITER //
CREATE PROCEDURE GetServiceById(IN p_id CHAR(36))
BEGIN
    SELECT 
        s.id,
        s.business_id,
        s.name,
        s.description,
        s.base_price,
        s.price_type,
        s.duration_minutes,
        s.capacity,
        s.status,
        s.terms_conditions,
        s.cancellation_policy,
        s.advance_booking_hours,
        s.created_at,
        s.updated_at,
        (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', sc.id,
                    'name', sc.name,
                    'description', sc.description,
                    'is_primary', scm.is_primary
                )
            )
            FROM service_category_map scm
            INNER JOIN service_category sc ON scm.category_id = sc.id
            WHERE scm.service_id = s.id
        ) AS categories
    FROM service s
    WHERE s.id = p_id;
END //
DELIMITER ;
```

#### 3. Insert Service
```sql
DELIMITER //
CREATE PROCEDURE InsertService(
    IN p_business_id CHAR(36),
    IN p_name VARCHAR(200),
    IN p_description TEXT,
    IN p_base_price DECIMAL(10, 2),
    IN p_price_type VARCHAR(20),
    IN p_duration_minutes INT,
    IN p_capacity INT,
    IN p_status VARCHAR(20),
    IN p_terms_conditions TEXT,
    IN p_cancellation_policy TEXT,
    IN p_advance_booking_hours INT
)
BEGIN
    INSERT INTO service (
        business_id, name, description, base_price, price_type,
        duration_minutes, capacity, status, terms_conditions,
        cancellation_policy, advance_booking_hours
    )
    VALUES (
        p_business_id, p_name, p_description, p_base_price, p_price_type,
        p_duration_minutes, p_capacity, p_status, p_terms_conditions,
        p_cancellation_policy, p_advance_booking_hours
    );
    
    SELECT LAST_INSERT_ID() AS id;
END //
DELIMITER ;
```

#### 4. Update Service
```sql
DELIMITER //
CREATE PROCEDURE UpdateService(
    IN p_id CHAR(36),
    IN p_name VARCHAR(200),
    IN p_description TEXT,
    IN p_base_price DECIMAL(10, 2),
    IN p_price_type VARCHAR(20),
    IN p_duration_minutes INT,
    IN p_capacity INT,
    IN p_status VARCHAR(20),
    IN p_terms_conditions TEXT,
    IN p_cancellation_policy TEXT,
    IN p_advance_booking_hours INT
)
BEGIN
    UPDATE service
    SET 
        name = COALESCE(p_name, name),
        description = p_description,
        base_price = COALESCE(p_base_price, base_price),
        price_type = COALESCE(p_price_type, price_type),
        duration_minutes = p_duration_minutes,
        capacity = p_capacity,
        status = COALESCE(p_status, status),
        terms_conditions = p_terms_conditions,
        cancellation_policy = p_cancellation_policy,
        advance_booking_hours = p_advance_booking_hours,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_id;
END //
DELIMITER ;
```

#### 5. Delete Service
```sql
DELIMITER //
CREATE PROCEDURE DeleteService(IN p_id CHAR(36))
BEGIN
    DELETE FROM service WHERE id = p_id;
END //
DELIMITER ;
```

### Service Booking Procedures

#### 1. Get Service Bookings by Business ID
```sql
DELIMITER //
CREATE PROCEDURE GetServiceBookingsByBusinessId(IN p_business_id CHAR(36))
BEGIN
    SELECT 
        sb.id,
        sb.service_id,
        sb.user_id,
        sb.business_id,
        sb.booking_date,
        sb.booking_time,
        sb.duration_minutes,
        sb.number_of_people,
        sb.total_price,
        sb.status,
        sb.special_requests,
        sb.cancellation_reason,
        sb.created_at,
        sb.updated_at,
        s.name AS service_name,
        u.name AS user_name,
        u.email AS user_email
    FROM service_booking sb
    INNER JOIN service s ON sb.service_id = s.id
    INNER JOIN user u ON sb.user_id = u.id
    WHERE sb.business_id = p_business_id
    ORDER BY sb.booking_date DESC, sb.booking_time DESC;
END //
DELIMITER ;
```

#### 2. Get Service Bookings by Service ID
```sql
DELIMITER //
CREATE PROCEDURE GetServiceBookingsByServiceId(IN p_service_id CHAR(36))
BEGIN
    SELECT 
        sb.id,
        sb.service_id,
        sb.user_id,
        sb.business_id,
        sb.booking_date,
        sb.booking_time,
        sb.duration_minutes,
        sb.number_of_people,
        sb.total_price,
        sb.status,
        sb.special_requests,
        sb.cancellation_reason,
        sb.created_at,
        sb.updated_at,
        u.name AS user_name,
        u.email AS user_email
    FROM service_booking sb
    INNER JOIN user u ON sb.user_id = u.id
    WHERE sb.service_id = p_service_id
    ORDER BY sb.booking_date DESC, sb.booking_time DESC;
END //
DELIMITER ;
```

#### 3. Get Service Booking by ID
```sql
DELIMITER //
CREATE PROCEDURE GetServiceBookingById(IN p_id CHAR(36))
BEGIN
    SELECT 
        sb.id,
        sb.service_id,
        sb.user_id,
        sb.business_id,
        sb.booking_date,
        sb.booking_time,
        sb.duration_minutes,
        sb.number_of_people,
        sb.total_price,
        sb.status,
        sb.special_requests,
        sb.cancellation_reason,
        sb.created_at,
        sb.updated_at,
        s.name AS service_name,
        u.name AS user_name,
        u.email AS user_email
    FROM service_booking sb
    INNER JOIN service s ON sb.service_id = s.id
    INNER JOIN user u ON sb.user_id = u.id
    WHERE sb.id = p_id;
END //
DELIMITER ;
```

#### 4. Insert Service Booking
```sql
DELIMITER //
CREATE PROCEDURE InsertServiceBooking(
    IN p_service_id CHAR(36),
    IN p_user_id CHAR(36),
    IN p_business_id CHAR(36),
    IN p_booking_date DATE,
    IN p_booking_time TIME,
    IN p_duration_minutes INT,
    IN p_number_of_people INT,
    IN p_total_price DECIMAL(10, 2),
    IN p_status VARCHAR(20),
    IN p_special_requests TEXT
)
BEGIN
    INSERT INTO service_booking (
        service_id, user_id, business_id, booking_date, booking_time,
        duration_minutes, number_of_people, total_price, status, special_requests
    )
    VALUES (
        p_service_id, p_user_id, p_business_id, p_booking_date, p_booking_time,
        p_duration_minutes, p_number_of_people, p_total_price, p_status, p_special_requests
    );
    
    SELECT LAST_INSERT_ID() AS id;
END //
DELIMITER ;
```

#### 5. Update Service Booking
```sql
DELIMITER //
CREATE PROCEDURE UpdateServiceBooking(
    IN p_id CHAR(36),
    IN p_booking_date DATE,
    IN p_booking_time TIME,
    IN p_duration_minutes INT,
    IN p_number_of_people INT,
    IN p_total_price DECIMAL(10, 2),
    IN p_status VARCHAR(20),
    IN p_special_requests TEXT,
    IN p_cancellation_reason TEXT
)
BEGIN
    UPDATE service_booking
    SET 
        booking_date = COALESCE(p_booking_date, booking_date),
        booking_time = COALESCE(p_booking_time, booking_time),
        duration_minutes = p_duration_minutes,
        number_of_people = p_number_of_people,
        total_price = COALESCE(p_total_price, total_price),
        status = COALESCE(p_status, status),
        special_requests = p_special_requests,
        cancellation_reason = p_cancellation_reason,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_id;
END //
DELIMITER ;
```

#### 6. Delete Service Booking
```sql
DELIMITER //
CREATE PROCEDURE DeleteServiceBooking(IN p_id CHAR(36))
BEGIN
    DELETE FROM service_booking WHERE id = p_id;
END //
DELIMITER ;
```

## API Routes

### Service Category Routes (`routes/serviceCategoryRoutes.js`)

```javascript
const express = require('express');
const router = express.Router();
const serviceCategoryController = require('../controller/serviceCategoryController');
const { validateUUID, validateServiceCategory } = require('../utils/validation');

// GET all service categories for a business
router.get('/business/:businessId', validateUUID('businessId'), serviceCategoryController.getByBusinessId);

// GET service category by ID
router.get('/:id', validateUUID('id'), serviceCategoryController.getById);

// POST create new service category
router.post('/', validateServiceCategory, serviceCategoryController.create);

// PUT update service category
router.put('/:id', validateUUID('id'), validateServiceCategory, serviceCategoryController.update);

// DELETE service category
router.delete('/:id', validateUUID('id'), serviceCategoryController.delete);

module.exports = router;
```

### Service Routes (`routes/serviceRoutes.js`)

```javascript
const express = require('express');
const router = express.Router();
const serviceController = require('../controller/serviceController');
const { validateUUID, validateService, validateUUIDArray } = require('../utils/validation');

// GET all services for a business
router.get('/business/:businessId', validateUUID('businessId'), serviceController.getByBusinessId);

// GET service by ID
router.get('/:id', validateUUID('id'), serviceController.getById);

// POST create new service
router.post('/', validateService, validateUUIDArray('category_ids', 1), serviceController.create);

// PUT update service
router.put('/:id', validateUUID('id'), validateService, validateUUIDArray('category_ids', 1), serviceController.update);

// DELETE service
router.delete('/:id', validateUUID('id'), serviceController.delete);

module.exports = router;
```

### Service Booking Routes (`routes/serviceBookingRoutes.js`)

```javascript
const express = require('express');
const router = express.Router();
const serviceBookingController = require('../controller/serviceBookingController');
const { validateUUID, validateServiceBooking } = require('../utils/validation');

// GET all service bookings for a business
router.get('/business/:businessId', validateUUID('businessId'), serviceBookingController.getByBusinessId);

// GET all service bookings for a service
router.get('/service/:serviceId', validateUUID('serviceId'), serviceBookingController.getByServiceId);

// GET service booking by ID
router.get('/:id', validateUUID('id'), serviceBookingController.getById);

// POST create new service booking
router.post('/', validateServiceBooking, serviceBookingController.create);

// PUT update service booking
router.put('/:id', validateUUID('id'), serviceBookingController.update);

// DELETE service booking
router.delete('/:id', validateUUID('id'), serviceBookingController.delete);

module.exports = router;
```

### Register Routes in `index.js`

```javascript
// Import routes
const serviceCategoryRoutes = require('./routes/serviceCategoryRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const serviceBookingRoutes = require('./routes/serviceBookingRoutes');

// Register routes
app.use('/api/service-categories', serviceCategoryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/service-bookings', serviceBookingRoutes);
```

## Controllers

### Service Category Controller (`controller/serviceCategoryController.js`)

See implementation details in the controller file that follows the same pattern as productController.js with:
- Transaction support for writes
- Error handling with try-catch
- Proper response formatting
- UUID validation

### Service Controller (`controller/serviceController.js`)

Similar to productController.js with additional:
- Multi-category mapping management
- Transaction-based category assignment
- JSON parsing for categories array from stored procedures

### Service Booking Controller (`controller/serviceBookingController.js`)

Standard CRUD operations with:
- Business and service filtering
- Status updates
- Date/time validation

## Validation Rules

Add to `utils/validation.js`:

```javascript
const validateServiceCategory = [
  body('business_id').isUUID().withMessage('Valid business_id is required'),
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('description').optional(),
  body('display_order').optional().isInt({ min: 0 }).withMessage('Display order must be a positive integer'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
  handleValidationErrors
];

const validateService = [
  body('business_id').isUUID().withMessage('Valid business_id is required'),
  body('name').trim().notEmpty().withMessage('Service name is required'),
  body('base_price').isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
  body('price_type').isIn(['fixed', 'per_hour', 'per_person', 'custom']).withMessage('Invalid price type'),
  body('duration_minutes').optional().isInt({ min: 0 }),
  body('capacity').optional().isInt({ min: 1 }),
  body('status').optional().isIn(['active', 'inactive']),
  handleValidationErrors
];

const validateServiceBooking = [
  body('service_id').isUUID().withMessage('Valid service_id is required'),
  body('user_id').isUUID().withMessage('Valid user_id is required'),
  body('business_id').isUUID().withMessage('Valid business_id is required'),
  body('booking_date').isDate().withMessage('Valid booking date is required'),
  body('booking_time').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Valid time format required (HH:MM)'),
  body('total_price').isFloat({ min: 0 }).withMessage('Total price must be a positive number'),
  body('status').optional().isIn(['pending', 'confirmed', 'completed', 'cancelled']),
  handleValidationErrors
];
```

## Testing Endpoints

Use these cURL commands to test the APIs:

```bash
# Create Service Category
curl -X POST http://localhost:3000/api/service-categories \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": "uuid-here",
    "name": "Spa Services",
    "description": "Relaxation and wellness services",
    "display_order": 1,
    "status": "active"
  }'

# Create Service
curl -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": "uuid-here",
    "name": "Swedish Massage",
    "description": "60-minute relaxing massage",
    "base_price": 1500.00,
    "price_type": "fixed",
    "duration_minutes": 60,
    "capacity": 1,
    "status": "active",
    "category_ids": ["category-uuid-1", "category-uuid-2"]
  }'

# Create Service Booking
curl -X POST http://localhost:3000/api/service-bookings \
  -H "Content-Type: application/json" \
  -d '{
    "service_id": "service-uuid",
    "user_id": "user-uuid",
    "business_id": "business-uuid",
    "booking_date": "2025-10-15",
    "booking_time": "14:00",
    "duration_minutes": 60,
    "number_of_people": 1,
    "total_price": 1500.00,
    "status": "pending"
  }'
```

## Migration Order

1. Create service_category table
2. Create service table
3. Create service_category_map table
4. Create service_booking table
5. Create all stored procedures
6. Add routes and controllers
7. Test endpoints

## Notes

- All tables use UUID for primary keys
- Cascading deletes are enabled for related records
- Service categories support display ordering
- Services support multiple categories (many-to-many)
- Service bookings track customer information via joins
- Status enums are consistent across tables
- Timestamps are automatically managed
