# Database Design Enhancement - Product & Service Reservation System

## Overview
This document outlines the enhancements made to the database design to support a **simple yet functional** product pre-order and service booking system for the Naga Venture tourism platform.

## Executive Summary

### What Was Added:
1. ✅ **Service Booking System** - Tourists can now reserve/book services (tours, activities, etc.)
2. ✅ **Notification System** - Track and send notifications for orders and bookings
3. ✅ **Business Settings** - Businesses can configure preparation times and cancellation policies
4. ✅ **Enhanced Order Tracking** - Arrival codes, timestamps, and better lifecycle management
5. ✅ **Cancellation Framework** - Basic cancellation policies with refund calculation

### What Was Kept Simple (Not Implemented):
- ❌ Product variants/options (sizes, colors)
- ❌ Time slot capacity limits
- ❌ Product availability windows (breakfast/lunch/dinner only items)
- ❌ Daily stock quantity limits for pre-orders

---

## 📊 New Database Tables

### 1. `service_booking` Table
**Purpose:** Enable tourists to book/reserve services offered by businesses.

**Key Fields:**
- `id`, `service_id`, `business_id`, `user_id`
- `booking_number` - Unique identifier (e.g., "SB-12345678")
- `booking_datetime` - When the service is scheduled
- `duration_minutes` - Expected duration
- `number_of_people` - Party size
- `base_price`, `total_price` - Pricing at time of booking
- `status` - pending, confirmed, in_progress, completed, cancelled, no_show
- `payment_status` - pending, paid, failed, refunded
- `payment_method` - cash_on_site, cash_on_arrival, card, digital_wallet
- `arrival_code` - 6-digit code for verification
- Timestamps: `confirmed_at`, `cancelled_at`, `customer_arrived_at`, `service_started_at`, `service_completed_at`

### 2. `notification` Table
**Purpose:** Track all notifications sent to users about their orders and bookings.

**Key Fields:**
- `id`, `user_id`
- `notification_type` - order_created, booking_confirmed, payment_received, etc.
- `related_id` - ID of the order or booking
- `related_type` - "order" or "service_booking"
- `title`, `message` - Notification content
- `metadata` - JSON field for additional data
- `is_read`, `read_at` - Read status tracking
- `delivery_method` - push, email, sms, in_app
- `delivery_status` - pending, sent, failed, delivered

### 3. `business_settings` Table
**Purpose:** Store business-specific configurations for orders and bookings.

**Key Fields:**
- `id`, `business_id`

**Order Settings:**
- `minimum_preparation_time_minutes` (default: 30)
- `order_advance_notice_hours` (default: 0 - no minimum)
- `accepts_product_orders` (default: true)

**Service Booking Settings:**
- `accepts_service_bookings` (default: true)
- `service_booking_advance_notice_hours` (default: 0)
- `service_default_duration_minutes` (default: 60)

**Cancellation Policy:**
- `cancellation_deadline_hours` (nullable - no deadline if null)
- `cancellation_penalty_percentage` (0-100, default: 0)
- `cancellation_penalty_fixed` (fixed amount, default: 0)
- `allow_customer_cancellation` (default: true)

**Automation:**
- `auto_confirm_orders` (default: false - requires manual confirmation)
- `auto_confirm_bookings` (default: false)
- `send_notifications` (default: true)

### 4. Enhanced `order` Table
**New Fields Added:**
- `arrival_code` (VARCHAR 10) - 6-digit code customers show when arriving
- `customer_arrived_at` (TIMESTAMP) - When customer notified arrival
- `confirmed_at` (TIMESTAMP) - When business confirmed order
- `preparation_started_at` (TIMESTAMP) - When business started preparing
- `ready_at` (TIMESTAMP) - When order is ready for pickup
- `picked_up_at` (TIMESTAMP) - When customer picked up order
- `cancelled_at` (TIMESTAMP) - When order was cancelled
- `cancellation_reason` (TEXT) - Why order was cancelled
- `refund_amount` (DECIMAL) - Amount refunded if cancelled
- `no_show` (BOOLEAN) - Customer didn't show up for pickup

---

## 🔧 New Stored Procedures

### Service Booking Procedures
```sql
GetAllServiceBookings()
GetServiceBookingsByBusinessId(businessId)
GetServiceBookingsByUserId(userId)
GetServiceBookingById(bookingId)
InsertServiceBooking(...) -- 12 parameters
UpdateServiceBookingStatus(bookingId, status)
UpdateServiceBookingPaymentStatus(bookingId, payment_status)
CancelServiceBooking(bookingId, reason, refund_amount)
MarkCustomerArrivedForService(bookingId)
GetUpcomingServiceBookings(businessId) -- Next 7 days
GetServiceBookingStatsByBusiness(businessId, days)
```

### Notification Procedures
```sql
GetNotificationsByUserId(userId)
GetUnreadNotificationsByUserId(userId)
GetNotificationById(notificationId)
InsertNotification(...) -- 9 parameters
MarkNotificationAsRead(notificationId)
MarkAllNotificationsAsRead(userId)
UpdateNotificationDeliveryStatus(notificationId, status)
DeleteNotification(notificationId)
GetUnreadNotificationCount(userId)
```

### Business Settings Procedures
```sql
GetBusinessSettings(businessId)
UpsertBusinessSettings(...) -- 14 parameters
UpdateBusinessSettings(businessId, field, value)
```

### Enhanced Order Procedures
```sql
VerifyArrivalCode(businessId, arrivalCode)
MarkCustomerArrivedForOrder(orderId)
MarkOrderAsReady(orderId)
MarkOrderAsPickedUp(orderId)
```

---

## 🌐 New API Endpoints

### Service Bookings (`/api/service-bookings`)
```
GET    /api/service-bookings                      - Get all bookings
POST   /api/service-bookings                      - Create new booking
GET    /api/service-bookings/business/:businessId - Get business bookings
GET    /api/service-bookings/business/:businessId/upcoming - Upcoming (next 7 days)
GET    /api/service-bookings/business/:businessId/stats    - Booking statistics
GET    /api/service-bookings/user/:userId         - Get user's bookings
GET    /api/service-bookings/:id                  - Get booking details
PUT    /api/service-bookings/:id/status           - Update status
PUT    /api/service-bookings/:id/payment          - Update payment
PUT    /api/service-bookings/:id/cancel           - Cancel booking
PUT    /api/service-bookings/:id/arrived          - Mark customer arrived
```

### Notifications (`/api/notifications`)
```
GET    /api/notifications/user/:userId                    - Get all notifications
GET    /api/notifications/user/:userId/unread             - Get unread notifications
GET    /api/notifications/user/:userId/unread/count       - Count unread
POST   /api/notifications/user/:userId/mark-all-read      - Mark all as read
GET    /api/notifications/:id                             - Get notification
POST   /api/notifications                                 - Create notification
PUT    /api/notifications/:id/read                        - Mark as read
PUT    /api/notifications/:id/delivery-status             - Update delivery status
DELETE /api/notifications/:id                             - Delete notification
```

### Business Settings (`/api/business-settings`)
```
GET    /api/business-settings/:businessId         - Get settings
PUT    /api/business-settings/:businessId         - Update settings
```

### Enhanced Order Endpoints (`/api/orders`)
```
POST   /api/orders/business/:businessId/verify-arrival    - Verify arrival code
PUT    /api/orders/:id/arrived                            - Mark customer arrived
PUT    /api/orders/:id/ready                              - Mark order ready
PUT    /api/orders/:id/picked-up                          - Mark picked up
```

---

## 🔄 User Flows

### Product Pre-Order Flow (Tourist)
1. **Browse Products** - Tourist views products from a business
2. **Add to Cart** - Selects products, quantities
3. **Choose Pickup Time** - Selects when to pick up
4. **Place Order** - `POST /api/orders`
   - Receives order confirmation with `order_number` and `arrival_code`
   - Stock is reserved/deducted
   - Notification sent to tourist
5. **Arrival** - Tourist arrives at business
   - Shows 6-digit `arrival_code` to staff
   - Staff verifies: `POST /api/orders/business/:id/verify-arrival`
   - System marks: `PUT /api/orders/:id/arrived`
6. **Pickup** - Business hands over order
   - Staff marks: `PUT /api/orders/:id/picked-up`
   - Order status → "completed"

### Service Booking Flow (Tourist)
1. **Browse Services** - Tourist views available services
2. **Select Service** - Chooses service, date/time, party size
3. **Book Service** - `POST /api/service-bookings`
   - Receives booking confirmation with `booking_number`
   - Notification sent
4. **Confirmation** - Business confirms or auto-confirms
   - Status: pending → confirmed
5. **Service Day** - Customer arrives
   - `PUT /api/service-bookings/:id/arrived`
6. **Service Delivery** - Business provides service
   - Status: confirmed → in_progress → completed

### Business Owner Flow
1. **Configure Settings** - Set preparation time, cancellation policy
   - `PUT /api/business-settings/:businessId`
2. **Receive Order/Booking** - Notification of new order
3. **Confirm** - `PUT /api/orders/:id/status` (confirmed)
4. **Prepare** - Status → preparing
5. **Ready** - `PUT /api/orders/:id/ready`
6. **Customer Arrives** - Verify arrival code
7. **Complete** - Mark as picked up/completed

---

## 💡 Key Features

### Arrival Code System
- **What**: 6-digit code generated for each order
- **Why**: Allows businesses to quickly verify customers without searching
- **How**: Customer shows code → Business enters → System finds order
- **Example**: Tourist: "My code is 583921" → Staff verifies instantly

### Cancellation Policy
- **Flexible Deadlines**: Business sets "must cancel X hours before pickup"
- **Penalty Options**: 
  - Percentage-based (e.g., 20% penalty = 80% refund)
  - Fixed amount (e.g., $5 cancellation fee)
  - No penalty (full refund)
- **Auto-Calculation**: System calculates refund based on policy

### Business Settings
Businesses can customize:
- Minimum prep time (e.g., "need 2 hours to prepare food orders")
- Auto-confirmation (skip manual confirmation step)
- Accept/reject orders or bookings entirely
- Notification preferences

### Notification System
- **In-App Notifications**: Stored in database, displayed in app
- **Future-Ready**: Framework supports push, email, SMS
- **Event-Driven**: Automatically created on status changes
- **Unread Tracking**: Users can see notification count

---

## 📝 Example Use Cases

### Use Case 1: Bakery Pre-Orders
**Business**: Naga City Bakery
- Settings: 4-hour minimum prep time
- Tourist orders 2 dozen cupcakes for 2pm pickup
- System validates: Order must be placed by 10am
- Arrival: Tourist shows code "456789"
- Staff verifies, hands over cupcakes

### Use Case 2: Guided Tour Booking
**Business**: Naga Adventure Tours
- Service: "Mt. Isarog Day Hike"
- Price: $50/person
- Duration: 8 hours
- Tourist books for party of 4, total: $200
- Morning of tour: Guide marks them as arrived
- After tour: Marks as completed

### Use Case 3: Restaurant Pre-Order with Cancellation
**Business**: Bicolano Restaurant
- Settings: 2-hour cancellation deadline, 25% penalty
- Tourist orders food for 7pm ($40 total)
- Tourist cancels at 6:45pm (15 mins before deadline)
- System: Full refund ($40)
- **Alternative**: Cancels at 5:30pm (past deadline)
- System: 75% refund ($30), $10 penalty

---

## 🚀 Migration Instructions

### Step 1: Run Database Migrations
```bash
cd naga-venture-backend
npx knex migrate:latest
```

This will run migrations in order:
1. `20251001000001_service_booking_table.cjs`
2. `20251001000002_notification_system_table.cjs`
3. `20251001000003_business_settings_table.cjs`
4. `20251001000004_update_order_table_tracking.cjs`
5. `20251001000005_create_service_booking_procedures.cjs`
6. `20251001000006_create_notification_procedures.cjs`
7. `20251001000007_create_business_settings_procedures.cjs`

### Step 2: Restart Server
```bash
npm start
```

### Step 3: Test New Endpoints
Use the API documentation below to test the new features.

---

## 📖 API Request Examples

### Create Service Booking
```json
POST /api/service-bookings
{
  "service_id": "uuid-here",
  "business_id": "uuid-here",
  "user_id": "uuid-here",
  "booking_datetime": "2025-10-15T10:00:00Z",
  "duration_minutes": 120,
  "number_of_people": 2,
  "special_requests": "Vegetarian meal preferences",
  "payment_method": "card"
}
```

### Create Order with Arrival Code
```json
POST /api/orders
{
  "business_id": "uuid-here",
  "user_id": "uuid-here",
  "items": [
    {
      "product_id": "uuid-here",
      "quantity": 2,
      "special_requests": "Extra spicy"
    }
  ],
  "pickup_datetime": "2025-10-05T14:00:00Z",
  "payment_method": "cash_on_pickup"
}

Response includes:
{
  "message": "Order created successfully",
  "data": {
    "order_number": "ORD-12345678",
    "arrival_code": "583921",
    ...
  }
}
```

### Verify Arrival Code
```json
POST /api/orders/business/:businessId/verify-arrival
{
  "arrival_code": "583921"
}

Response:
{
  "id": "order-uuid",
  "order_number": "ORD-12345678",
  "user_first_name": "John",
  "user_last_name": "Doe",
  "total_amount": 45.50,
  ...
}
```

### Update Business Settings
```json
PUT /api/business-settings/:businessId
{
  "minimum_preparation_time_minutes": 120,
  "order_advance_notice_hours": 2,
  "accepts_product_orders": true,
  "accepts_service_bookings": true,
  "cancellation_deadline_hours": 2,
  "cancellation_penalty_percentage": 20,
  "allow_customer_cancellation": true,
  "auto_confirm_orders": false,
  "send_notifications": true
}
```

---

## 🎯 Design Decisions

### Why Simple?
- **Learning Curve**: Easy for businesses to understand and use
- **MVP Approach**: Get core functionality working first
- **Future Extensibility**: Can add complexity later if needed

### What Makes It Functional?
- **Complete Lifecycle**: Order/booking from creation to completion
- **Verification System**: Arrival codes prevent pickup errors
- **Business Control**: Settings let businesses customize behavior
- **Notification Framework**: Ready for future push notifications
- **Cancellation Handling**: Basic refund logic included

### Future Enhancements (If Needed)
1. **Time Slot Management**: Add capacity limits per time window
2. **Product Variants**: Add sizes, colors, customizations
3. **Queue Management**: Advanced pickup queue system
4. **SMS/Push Notifications**: Integrate with notification services
5. **Availability Windows**: Time-based product availability
6. **Booking Deposits**: Require upfront payments for bookings
7. **Rating System**: Link to product reviews after pickup

---

## ✅ Testing Checklist

### Service Bookings
- [ ] Create a service booking
- [ ] View bookings by business
- [ ] View bookings by user
- [ ] Cancel a booking (test refund calculation)
- [ ] Mark customer as arrived
- [ ] Complete a booking

### Orders with Arrival Codes
- [ ] Create an order (check arrival code generated)
- [ ] Verify arrival code works
- [ ] Mark customer arrived
- [ ] Mark order ready
- [ ] Mark order picked up
- [ ] Cancel order (test stock restoration)

### Notifications
- [ ] Notifications created on order/booking
- [ ] Mark notification as read
- [ ] Get unread count
- [ ] Mark all as read

### Business Settings
- [ ] Get default settings for new business
- [ ] Update settings
- [ ] Test auto-confirmation setting
- [ ] Test cancellation policy enforcement

---

## 📁 Files Created/Modified

### New Migration Files (7)
- `20251001000001_service_booking_table.cjs`
- `20251001000002_notification_system_table.cjs`
- `20251001000003_business_settings_table.cjs`
- `20251001000004_update_order_table_tracking.cjs`
- `20251001000005_create_service_booking_procedures.cjs`
- `20251001000006_create_notification_procedures.cjs`
- `20251001000007_create_business_settings_procedures.cjs`

### New Procedure Files (3)
- `procedures/serviceBookingProcedures.js`
- `procedures/notificationProcedures.js`
- `procedures/businessSettingsProcedures.js`

### New Controller Files (3)
- `controller/serviceBookingController.js`
- `controller/notificationController.js`
- `controller/businessSettingsController.js`

### New Route Files (3)
- `routes/service-bookings.js`
- `routes/notifications.js`
- `routes/business-settings.js`

### Modified Files (4)
- `procedures/orderProcedures.js` - Added 4 new procedures
- `controller/orderController.js` - Added arrival code logic
- `routes/orders.js` - Added 4 new endpoints
- `index.js` - Registered 3 new routes

---

## 🎓 Summary

You now have a **simple yet functional** system that allows:
- ✅ Tourists to pre-order products and avoid lines
- ✅ Tourists to book services in advance
- ✅ Businesses to manage preparation times
- ✅ Easy customer verification with arrival codes
- ✅ Basic cancellation policies with refunds
- ✅ Notification tracking framework
- ✅ Complete order/booking lifecycle management

The system is designed to be **straightforward to use** while providing **essential functionality** for a tourism reservation platform.

---

**Questions or Issues?**
Refer to the API_DOCUMENTATION.md for detailed endpoint documentation, or check the individual controller files for implementation details.
