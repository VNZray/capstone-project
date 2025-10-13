# Sample Workflows - Product & Service Reservation System

## Table of Contents
1. [Business Owner Workflow](#business-owner-workflow)
2. [Tourist/User Workflow](#touristuser-workflow)
3. [Admin Workflow](#admin-workflow)

---

## Business Owner Workflow

### Scenario: "Maria's Bicol Delicacies" - A Local Food Business

**Business Owner:** Maria Santos  
**Business Type:** Restaurant & Food Shop  
**Goal:** Set up product pre-orders and service bookings for her food tours

---

### **Phase 1: Initial Setup**

#### Step 1: Register Business (Already Done)
```json
Business already exists in system:
{
  "id": "b1234567-89ab-cdef-0123-456789abcdef",
  "business_name": "Maria's Bicol Delicacies",
  "category": "Restaurant",
  "phone_number": "+63-917-123-4567",
  "email": "maria@bicoldelicacies.com"
}
```

#### Step 2: Configure Business Settings
**API Call:** `PUT /api/business-settings/b1234567-89ab-cdef-0123-456789abcdef`

```json
{
  "minimum_preparation_time_minutes": 120,
  "order_advance_notice_hours": 2,
  "accepts_product_orders": true,
  "accepts_service_bookings": true,
  "cancellation_deadline_hours": 4,
  "cancellation_penalty_percentage": 25,
  "cancellation_penalty_fixed": 0,
  "allow_customer_cancellation": true,
  "service_booking_advance_notice_hours": 24,
  "service_default_duration_minutes": 180,
  "auto_confirm_orders": false,
  "auto_confirm_bookings": false,
  "send_notifications": true
}
```

**Reasoning:**
- Need 2 hours to prepare food orders
- Want 4-hour cancellation notice (25% penalty if late)
- Food tours need 24-hour advance booking
- Manual confirmation to check ingredient availability

---

### **Phase 2: Set Up Product Categories**

#### Step 3: Create Product Categories
**API Call:** `POST /api/products/categories`

```json
// Category 1: Main Dishes
{
  "business_id": "b1234567-89ab-cdef-0123-456789abcdef",
  "name": "Main Dishes",
  "description": "Traditional Bicolano main courses",
  "display_order": 1,
  "status": "active"
}

// Category 2: Desserts
{
  "business_id": "b1234567-89ab-cdef-0123-456789abcdef",
  "name": "Desserts",
  "description": "Sweet Bicol treats",
  "display_order": 2,
  "status": "active"
}

// Category 3: Snacks & Pasalubong
{
  "business_id": "b1234567-89ab-cdef-0123-456789abcdef",
  "name": "Snacks & Pasalubong",
  "description": "Take-home goodies",
  "display_order": 3,
  "status": "active"
}
```

---

### **Phase 3: Add Products**

#### Step 4: Create Products
**API Call:** `POST /api/products`

```json
// Product 1: Bicol Express
{
  "business_id": "b1234567-89ab-cdef-0123-456789abcdef",
  "category_ids": ["cat-main-dishes-uuid"],
  "name": "Bicol Express (1kg)",
  "description": "Spicy pork dish cooked in coconut milk and chili peppers",
  "price": 350.00,
  "image_url": "https://cdn.example.com/bicol-express.jpg",
  "status": "active"
}

// Product 2: Laing
{
  "business_id": "b1234567-89ab-cdef-0123-456789abcdef",
  "category_ids": ["cat-main-dishes-uuid"],
  "name": "Laing (500g)",
  "description": "Taro leaves cooked in coconut milk with pork",
  "price": 280.00,
  "image_url": "https://cdn.example.com/laing.jpg",
  "status": "active"
}

// Product 3: Pili Tart
{
  "business_id": "b1234567-89ab-cdef-0123-456789abcdef",
  "category_ids": ["cat-desserts-uuid", "cat-pasalubong-uuid"],
  "name": "Pili Tart (Box of 6)",
  "description": "Sweet tart with Pili nut filling",
  "price": 220.00,
  "image_url": "https://cdn.example.com/pili-tart.jpg",
  "status": "active"
}
```

#### Step 5: Set Initial Stock
**API Call:** `PUT /api/products/{productId}/stock`

```json
// For Bicol Express
{
  "quantity_change": 20,
  "change_type": "restock",
  "notes": "Initial stock - prepared 20 servings",
  "created_by": "maria-owner-uuid"
}
```

---

### **Phase 4: Create Service Offerings**

#### Step 6: Create Service Category
**API Call:** `POST /api/services/categories`

```json
{
  "business_id": "b1234567-89ab-cdef-0123-456789abcdef",
  "name": "Food Tours & Cooking Classes",
  "description": "Experience Bicol cuisine hands-on",
  "display_order": 1,
  "status": "active"
}
```

#### Step 7: Create Services
**API Call:** `POST /api/services`

```json
// Service 1: Bicol Food Tour
{
  "business_id": "b1234567-89ab-cdef-0123-456789abcdef",
  "service_category_id": "service-cat-uuid",
  "name": "Bicol Food Tour Experience",
  "description": "3-hour guided tour of local markets, cooking demonstration, and tasting of 5 signature Bicolano dishes",
  "base_price": 1200.00,
  "price_type": "per_session",
  "sale_type": "fixed",
  "sale_value": 0,
  "duration_estimate": "3 hours",
  "image_url": "https://cdn.example.com/food-tour.jpg",
  "features": ["Market tour", "Cooking demo", "5-dish tasting", "Recipe cards", "Souvenir apron"],
  "requirements": "Wear comfortable shoes, bring camera",
  "display_order": 1,
  "status": "active"
}

// Service 2: Cooking Class
{
  "business_id": "b1234567-89ab-cdef-0123-456789abcdef",
  "service_category_id": "service-cat-uuid",
  "name": "Hands-on Bicol Express Cooking Class",
  "description": "Learn to cook authentic Bicol Express from scratch",
  "base_price": 800.00,
  "price_type": "per_session",
  "sale_type": "fixed",
  "sale_value": 0,
  "duration_estimate": "2 hours",
  "image_url": "https://cdn.example.com/cooking-class.jpg",
  "features": ["Hands-on cooking", "All ingredients included", "Take home your dish", "Recipe booklet"],
  "requirements": "None - suitable for all skill levels",
  "display_order": 2,
  "status": "active"
}
```

---

### **Phase 5: Daily Operations - Managing Orders**

#### Step 8: Receive New Order Notification
**Incoming Order from Tourist (Auto-created by system):**

Tourist places order:
```json
POST /api/orders
{
  "business_id": "b1234567-89ab-cdef-0123-456789abcdef",
  "user_id": "tourist-juan-uuid",
  "items": [
    {
      "product_id": "bicol-express-uuid",
      "quantity": 2,
      "special_requests": "Extra spicy please!"
    },
    {
      "product_id": "laing-uuid",
      "quantity": 1,
      "special_requests": null
    }
  ],
  "pickup_datetime": "2025-10-05T14:00:00+08:00",
  "payment_method": "cash_on_pickup"
}
```

**System Response:**
```json
{
  "message": "Order created successfully",
  "data": {
    "id": "order-uuid-001",
    "order_number": "ORD-12345678",
    "arrival_code": "583921",
    "subtotal": 980.00,
    "total_amount": 980.00,
    "status": "pending",
    "pickup_datetime": "2025-10-05T14:00:00+08:00"
  }
}
```

**Maria receives notification in her business app:**
> 🔔 **New Order #ORD-12345678**  
> Customer: Juan Dela Cruz  
> Pickup: Oct 5, 2:00 PM  
> Total: ₱980.00  
> Items: Bicol Express (2x), Laing (1x)

---

#### Step 9: Review and Confirm Order
Maria checks her ingredient inventory and confirms:

**API Call:** `PUT /api/orders/order-uuid-001/status`
```json
{
  "status": "confirmed"
}
```

**Customer receives notification:**
> ✅ Your order #ORD-12345678 has been confirmed!  
> Pickup Code: **583921**  
> Show this code when you arrive.

---

#### Step 10: Prepare Order
Maria starts preparing the food:

**API Call:** `PUT /api/orders/order-uuid-001/status`
```json
{
  "status": "preparing"
}
```

---

#### Step 11: Customer Arrives
Juan (tourist) arrives at 2:00 PM and tells staff: "My code is 583921"

**Staff verifies:** `POST /api/orders/business/b1234567-89ab-cdef-0123-456789abcdef/verify-arrival`
```json
{
  "arrival_code": "583921"
}
```

**System Response:**
```json
{
  "id": "order-uuid-001",
  "order_number": "ORD-12345678",
  "user_first_name": "Juan",
  "user_last_name": "Dela Cruz",
  "user_phone": "+63-917-987-6543",
  "total_amount": 980.00,
  "status": "preparing",
  "items": [...],
  "special_instructions": "Extra spicy please!"
}
```

**Staff marks customer as arrived:** `PUT /api/orders/order-uuid-001/arrived`

---

#### Step 12: Order Ready & Handover
Food is packed and ready:

**API Call:** `PUT /api/orders/order-uuid-001/ready`

Staff hands over the food:

**API Call:** `PUT /api/orders/order-uuid-001/picked-up`
```json
{
  "status": "completed",
  "picked_up_at": "2025-10-05T14:05:00+08:00"
}
```

Customer receives notification:
> 🎉 Thank you for your order! Enjoy your Bicol Express!  
> Rate your experience: [Link to review]

---

### **Phase 6: Managing Service Bookings**

#### Step 13: Receive Booking Request
Tourist wants to book the Food Tour:

```json
POST /api/service-bookings
{
  "service_id": "food-tour-uuid",
  "business_id": "b1234567-89ab-cdef-0123-456789abcdef",
  "user_id": "tourist-sarah-uuid",
  "booking_datetime": "2025-10-08T09:00:00+08:00",
  "duration_minutes": 180,
  "number_of_people": 2,
  "special_requests": "One person is vegetarian",
  "payment_method": "card"
}
```

**System calculates:** 2 people × ₱1,200 = ₱2,400

**Maria receives notification:**
> 🔔 **New Booking Request #SB-87654321**  
> Service: Bicol Food Tour Experience  
> Date: Oct 8, 9:00 AM  
> People: 2  
> Total: ₱2,400  
> Note: One vegetarian

---

#### Step 14: Review and Confirm Booking
Maria checks her schedule and confirms:

**API Call:** `PUT /api/service-bookings/booking-uuid-001/status`
```json
{
  "status": "confirmed"
}
```

**Customer receives notification:**
> ✅ Your Food Tour booking is confirmed!  
> Date: October 8, 9:00 AM  
> Meeting Point: Maria's Bicol Delicacies  
> What to bring: Comfortable shoes, camera

---

#### Step 15: Day of Service
October 8, 9:00 AM - Sarah arrives:

**Staff marks arrival:** `PUT /api/service-bookings/booking-uuid-001/arrived`

**Start tour:** `PUT /api/service-bookings/booking-uuid-001/status`
```json
{
  "status": "in_progress"
}
```

**After 3 hours, tour ends:** `PUT /api/service-bookings/booking-uuid-001/status`
```json
{
  "status": "completed"
}
```

---

### **Phase 7: Handling Cancellations**

#### Step 16: Customer Wants to Cancel
Tourist placed order but needs to cancel:

Tourist calls: "I need to cancel order #ORD-99887766"

Maria checks: Order is for tomorrow 2 PM, customer calling today 10 AM (28 hours before pickup)

Business policy: 4-hour deadline, so this is BEFORE deadline = full refund

**API Call:** `PUT /api/orders/order-uuid-002/cancel`
```json
{
  "cancellation_reason": "Customer's plans changed - trip postponed"
}
```

**System automatically:**
- Restores product stock
- Calculates refund: Full amount (₱850)
- Sets order status to "cancelled"

**Customer receives:**
> Your order has been cancelled.  
> Refund: ₱850.00 (Full refund - cancelled within policy)

---

### **Phase 8: Analytics & Reports**

#### Step 17: Check Business Performance
Maria wants to see her performance for the last 30 days:

**API Call:** `GET /api/orders/business/b1234567-89ab-cdef-0123-456789abcdef/stats?period=30`

**Response:**
```json
{
  "overview": {
    "total_orders": 145,
    "completed_orders": 132,
    "cancelled_orders": 8,
    "pending_orders": 5,
    "total_revenue": 52340.00,
    "average_order_value": 396.67
  },
  "daily_stats": [...],
  "popular_products": [
    {
      "product_name": "Bicol Express (1kg)",
      "total_quantity": 156,
      "order_count": 89,
      "revenue": 19850.00
    },
    ...
  ]
}
```

**Service Booking Stats:** `GET /api/service-bookings/business/b1234567-89ab-cdef-0123-456789abcdef/stats?period=30`

```json
{
  "overview": {
    "total_bookings": 24,
    "completed_bookings": 20,
    "cancelled_bookings": 2,
    "upcoming_bookings": 2,
    "total_revenue": 28800.00,
    "average_booking_value": 1440.00
  },
  "popular_services": [
    {
      "name": "Bicol Food Tour Experience",
      "booking_count": 16,
      "total_revenue": 19200.00
    }
  ]
}
```

---

## Tourist/User Workflow

### Scenario: "Juan Dela Cruz" - Tourist Visiting Naga City

**User:** Juan Dela Cruz  
**From:** Manila  
**Goal:** Order local food ahead of time, avoid waiting in line

---

### **Phase 1: Browse & Discover**

#### Step 1: View Businesses
Juan opens the mobile app and browses restaurants:

**API Call:** `GET /api/business?category=Restaurant`

Sees: Maria's Bicol Delicacies, Bigg's Diner, etc.

---

#### Step 2: View Products
Juan selects Maria's restaurant:

**API Call:** `GET /api/products/business/b1234567-89ab-cdef-0123-456789abcdef`

**Response:**
```json
[
  {
    "id": "bicol-express-uuid",
    "name": "Bicol Express (1kg)",
    "description": "Spicy pork dish...",
    "price": 350.00,
    "image_url": "...",
    "current_stock": 18,
    "status": "active"
  },
  {
    "id": "laing-uuid",
    "name": "Laing (500g)",
    "description": "Taro leaves...",
    "price": 280.00,
    "current_stock": 25,
    "status": "active"
  },
  ...
]
```

---

### **Phase 2: Place Pre-Order**

#### Step 3: Add to Cart (Frontend Logic)
Juan adds:
- 2x Bicol Express (₱350 × 2 = ₱700)
- 1x Laing (₱280 × 1 = ₱280)
- 1x Pili Tart (₱220 × 1 = ₱220)

**Cart Total:** ₱1,200

---

#### Step 4: Select Pickup Time
Juan chooses: **Tomorrow, 2:00 PM**

System checks: Current time 12:00 PM
- Business requires 2 hours notice ✅
- Pickup is 26 hours away ✅

---

#### Step 5: Place Order
**API Call:** `POST /api/orders`

```json
{
  "business_id": "b1234567-89ab-cdef-0123-456789abcdef",
  "user_id": "juan-uuid",
  "items": [
    {
      "product_id": "bicol-express-uuid",
      "quantity": 2,
      "special_requests": "Extra spicy please!"
    },
    {
      "product_id": "laing-uuid",
      "quantity": 1
    },
    {
      "product_id": "pili-tart-uuid",
      "quantity": 1
    }
  ],
  "pickup_datetime": "2025-10-05T14:00:00+08:00",
  "special_instructions": "Will arrive by car, need parking",
  "payment_method": "cash_on_pickup"
}
```

**System Response:**
```json
{
  "message": "Order created successfully",
  "data": {
    "id": "order-uuid-003",
    "order_number": "ORD-34567890",
    "arrival_code": "729183",
    "subtotal": 1200.00,
    "total_amount": 1200.00,
    "status": "pending",
    "pickup_datetime": "2025-10-05T14:00:00+08:00"
  }
}
```

**Juan's app shows:**
> ✅ Order Placed!  
> Order #: ORD-34567890  
> Pickup Code: **729183**  
> Pickup: Oct 5, 2:00 PM  
> 
> Save your code! You'll need it when picking up.

---

### **Phase 3: Track Order**

#### Step 6: Check Order Status
Juan can check his order anytime:

**API Call:** `GET /api/orders/user/juan-uuid`

**Response:**
```json
[
  {
    "id": "order-uuid-003",
    "order_number": "ORD-34567890",
    "business_name": "Maria's Bicol Delicacies",
    "status": "confirmed",
    "total_amount": 1200.00,
    "pickup_datetime": "2025-10-05T14:00:00+08:00",
    "arrival_code": "729183"
  }
]
```

**App shows:**
> 📦 Order Status: Confirmed  
> Maria is preparing your food!  
> Pickup: Tomorrow at 2:00 PM

---

#### Step 7: Receive Notifications
**Notification 1 - Order Confirmed:**
```json
{
  "notification_type": "order_confirmed",
  "title": "Order Confirmed! 🎉",
  "message": "Maria's Bicol Delicacies confirmed your order #ORD-34567890. Pickup on Oct 5 at 2:00 PM.",
  "is_read": false
}
```

**Notification 2 - Order Ready:**
```json
{
  "notification_type": "order_ready",
  "title": "Order Ready for Pickup! 📦",
  "message": "Your order is ready! Show code 729183 when you arrive.",
  "is_read": false
}
```

Juan checks notifications: `GET /api/notifications/user/juan-uuid/unread`

---

### **Phase 4: Pickup**

#### Step 8: Arrive at Restaurant
October 5, 2:00 PM - Juan arrives

Juan approaches counter: **"Hi, I have an order. My code is 729183"**

Staff enters code and verifies → System finds Juan's order

Staff: "Found it! Bicol Express, Laing, and Pili Tart. That's ₱1,200."

---

#### Step 9: Payment & Pickup
Juan pays ₱1,200 cash.

Staff hands over food and marks order complete.

**Juan's app:**
> ✅ Order Completed!  
> Enjoy your meal! 🍽️  
> 
> How was your experience?  
> [⭐⭐⭐⭐⭐ Rate & Review]

---

### **Phase 5: Book a Service**

#### Step 10: Browse Services
Juan wants to try the food tour:

**API Call:** `GET /api/services/business/b1234567-89ab-cdef-0123-456789abcdef`

**Response:**
```json
[
  {
    "id": "food-tour-uuid",
    "name": "Bicol Food Tour Experience",
    "description": "3-hour guided tour...",
    "base_price": 1200.00,
    "price_type": "per_session",
    "duration_estimate": "3 hours",
    "image_url": "...",
    "features": ["Market tour", "Cooking demo", ...]
  }
]
```

---

#### Step 11: Book Service
Juan books for himself and his wife (2 people):

**API Call:** `POST /api/service-bookings`

```json
{
  "service_id": "food-tour-uuid",
  "business_id": "b1234567-89ab-cdef-0123-456789abcdef",
  "user_id": "juan-uuid",
  "booking_datetime": "2025-10-08T09:00:00+08:00",
  "number_of_people": 2,
  "special_requests": "My wife has mild allergy to shellfish",
  "payment_method": "card"
}
```

**Response:**
```json
{
  "message": "Service booking created successfully",
  "data": {
    "booking_number": "SB-11223344",
    "service_name": "Bicol Food Tour Experience",
    "booking_datetime": "2025-10-08T09:00:00+08:00",
    "total_price": 2400.00,
    "status": "pending"
  }
}
```

---

#### Step 12: Confirmation & Reminder
**Notification - Booking Confirmed:**
> ✅ Booking Confirmed!  
> Bicol Food Tour Experience  
> Date: Oct 8, 9:00 AM  
> People: 2  
> Total: ₱2,400  
> 
> Meeting Point: Maria's Bicol Delicacies  
> Requirements: Comfortable shoes, camera

**Day Before - Reminder:**
> 🔔 Reminder: Food Tour Tomorrow!  
> Tomorrow at 9:00 AM  
> See you there! 😊

---

### **Phase 6: Cancel if Needed**

#### Step 13: Emergency Cancellation
Juan's plans change - needs to cancel:

**API Call:** `PUT /api/service-bookings/booking-uuid-002/cancel`

```json
{
  "cancellation_reason": "Flight delayed, can't make it"
}
```

**System checks:**
- Cancellation policy: 4 hours before booking
- Current time: 30 hours before booking ✅
- **Refund:** Full amount (₱2,400)

**Response:**
```json
{
  "message": "Service booking cancelled successfully",
  "refund_amount": 2400.00
}
```

**Juan receives:**
> Booking Cancelled  
> Refund: ₱2,400 (Full refund)  
> We hope to see you next time!

---

## Admin Workflow

### Scenario: "Admin Carlo" - Platform Administrator

**Admin:** Carlo Reyes  
**Role:** System Administrator  
**Goal:** Monitor platform health, handle disputes, manage approvals

---

### **Phase 1: Daily Monitoring**

#### Step 1: Dashboard Overview
Carlo logs into admin panel:

**Multiple API Calls:**
```javascript
// Total businesses
GET /api/business

// Recent orders
GET /api/orders

// Recent bookings
GET /api/service-bookings

// Active products
GET /api/products

// Reports/Issues
GET /api/reports
```

**Dashboard shows:**
- 🏪 Active Businesses: 342
- 📦 Orders Today: 1,245
- 🎫 Bookings Today: 89
- ⚠️ Pending Reports: 5
- 📊 Total Revenue (30 days): ₱2,450,000

---

### **Phase 2: Handle Customer Dispute**

#### Step 2: Review Complaint
Customer complaint received via email:

**Issue:** "Order #ORD-55667788 - Food was cold and arrived late"

Carlo checks order details:

**API Call:** `GET /api/orders/order-uuid-complaint`

```json
{
  "id": "order-uuid-complaint",
  "order_number": "ORD-55667788",
  "business_id": "business-xyz-uuid",
  "business_name": "Quick Bite Restaurant",
  "user_id": "customer-maria-uuid",
  "user_email": "maria@email.com",
  "status": "completed",
  "pickup_datetime": "2025-10-01T12:00:00+08:00",
  "picked_up_at": "2025-10-01T12:45:00+08:00",
  "total_amount": 450.00,
  "items": [...]
}
```

**Analysis:**
- Scheduled pickup: 12:00 PM
- Actual pickup: 12:45 PM (45 minutes late)
- Customer has valid complaint

---

#### Step 3: Investigate Business
Carlo checks business performance:

**API Call:** `GET /api/orders/business/business-xyz-uuid/stats?period=30`

```json
{
  "overview": {
    "total_orders": 89,
    "completed_orders": 76,
    "cancelled_orders": 10,
    "average_order_value": 380.00
  }
}
```

**Findings:**
- High cancellation rate (11%)
- Multiple late pickups reported

---

#### Step 4: Take Action
Carlo creates internal report:

**API Call:** `POST /api/reports`

```json
{
  "reporter_id": "admin-carlo-uuid",
  "reported_entity_type": "business",
  "reported_entity_id": "business-xyz-uuid",
  "report_type": "quality_issue",
  "description": "Multiple complaints about late orders and food quality. Customer order #ORD-55667788 was 45 minutes late.",
  "severity": "medium",
  "status": "under_review"
}
```

**Actions taken:**
1. Contact business owner for explanation
2. Issue warning
3. Monitor next 10 orders
4. If pattern continues → suspend business temporarily

---

### **Phase 3: Review Business Applications**

#### Step 5: New Business Approval
New business "Naga Street Food Hub" applied:

**API Call:** `GET /api/approval/pending`

```json
[
  {
    "id": "approval-uuid-001",
    "business_name": "Naga Street Food Hub",
    "owner_name": "Pedro Santos",
    "business_type": "Food Stall",
    "status": "pending",
    "submitted_at": "2025-10-01T08:00:00+08:00",
    "documents": [
      "business_permit.pdf",
      "sanitary_permit.pdf",
      "dti_registration.pdf"
    ]
  }
]
```

---

#### Step 6: Review Documents
Carlo reviews submitted documents:

**API Call:** `GET /api/permit?business_id=naga-street-food-uuid`

```json
[
  {
    "permit_type": "Business Permit",
    "permit_number": "BP-2025-12345",
    "issue_date": "2025-01-15",
    "expiry_date": "2026-01-14",
    "status": "valid",
    "issuing_authority": "Naga City Business Permits Office"
  },
  {
    "permit_type": "Sanitary Permit",
    "permit_number": "SP-2025-67890",
    "issue_date": "2025-02-01",
    "expiry_date": "2026-01-31",
    "status": "valid",
    "issuing_authority": "City Health Office"
  }
]
```

**Verification checklist:**
- ✅ Valid business permit
- ✅ Valid sanitary permit
- ✅ DTI registration
- ✅ Owner identity verified
- ✅ Business address verified

---

#### Step 7: Approve Business
All checks passed:

**API Call:** `PUT /api/approval/approval-uuid-001`

```json
{
  "status": "approved",
  "reviewer_id": "admin-carlo-uuid",
  "review_notes": "All documents verified. Business approved for platform.",
  "conditions": "Must maintain valid permits at all times"
}
```

**System automatically:**
- Activates business account
- Sends approval email to owner
- Creates business_settings with defaults
- Allows business to start adding products

**Owner receives:**
> 🎉 Congratulations!  
> Your business "Naga Street Food Hub" has been approved!  
> You can now start adding products and accepting orders.

---

### **Phase 4: Monitor Product Quality**

#### Step 8: Review Product Reviews
Carlo checks recent low ratings:

**API Call:** `GET /api/product-reviews?rating_max=2&limit=20`

```json
[
  {
    "id": "review-uuid-001",
    "product_id": "product-abc-uuid",
    "product_name": "Spicy Laing",
    "user_name": "Jose M.",
    "rating": 1,
    "review_title": "Not authentic",
    "review_text": "This doesn't taste like real Bicolano laing. Very disappointing.",
    "created_at": "2025-10-01T15:30:00+08:00",
    "business_id": "business-def-uuid",
    "business_name": "Fake Bicol Restaurant"
  },
  ...
]
```

---

#### Step 9: Pattern Detection
Carlo notices "Fake Bicol Restaurant" has multiple 1-star reviews:

**API Call:** `GET /api/products/business/business-def-uuid`

**All products have low ratings (1-2 stars)**

**Decision:** Investigate business for misleading claims

**Action:** `POST /api/reports` → Flag business for review

---

### **Phase 5: System Health Checks**

#### Step 10: Check Stock Issues
Carlo monitors products with stock problems:

**API Call:** `GET /api/products?status=out_of_stock&limit=50`

```json
[
  {
    "id": "product-xyz",
    "name": "Popular Dish X",
    "business_name": "Busy Restaurant",
    "current_stock": 0,
    "last_restocked_at": "2025-09-28T10:00:00+08:00"
  }
]
```

**Finding:** Product out of stock for 3 days → Contact business owner

---

#### Step 11: Monitor Notifications
Check notification delivery issues:

**API Call:** `GET /api/notifications?delivery_status=failed&limit=20`

```json
[
  {
    "id": "notif-uuid-001",
    "user_id": "user-abc-uuid",
    "notification_type": "order_ready",
    "delivery_status": "failed",
    "sent_at": "2025-10-01T14:00:00+08:00",
    "error": "User push token expired"
  }
]
```

**Action:** Mark user for token refresh

---

### **Phase 6: Analytics & Reporting**

#### Step 12: Generate Platform Reports
Monthly performance review:

**Multiple API Calls:**
```javascript
// Overall order stats
GET /api/orders

// Booking stats
GET /api/service-bookings

// Business growth
GET /api/business

// User engagement
GET /api/users
```

**Platform Metrics (October 2025):**
```
📊 Overall Performance
- Total Orders: 8,945
- Total Bookings: 425
- Total Revenue: ₱3,450,000
- Active Users: 12,340
- Active Businesses: 342

📈 Growth
- Orders: +15% vs Sept
- New Users: +22% vs Sept
- New Businesses: +8% vs Sept

⭐ Quality Metrics
- Average Order Rating: 4.3/5
- Average Service Rating: 4.5/5
- Order Success Rate: 94%
- Cancellation Rate: 6%

🔝 Top Performing Businesses
1. Maria's Bicol Delicacies - ₱125,000
2. Naga Food Tours - ₱98,000
3. Bigg's Diner - ₱87,000
```

---

### **Phase 7: Handle Edge Cases**

#### Step 13: Resolve Stuck Order
Order stuck in "preparing" status for 6 hours:

**API Call:** `GET /api/orders/order-stuck-uuid`

```json
{
  "order_number": "ORD-99887766",
  "status": "preparing",
  "preparation_started_at": "2025-10-01T08:00:00+08:00",
  "pickup_datetime": "2025-10-01T12:00:00+08:00",
  "current_time": "2025-10-01T14:00:00+08:00"
}
```

**Issue:** Order is 2 hours past pickup time

**Carlo's action:**
1. Call business owner → No answer
2. Call customer → Customer waiting
3. **Decision:** Cancel order, full refund, flag business

**API Call:** `PUT /api/orders/order-stuck-uuid/cancel`

```json
{
  "cancellation_reason": "Business unresponsive, customer waited 2 hours. Order cancelled by admin. Full refund issued."
}
```

**Follow-up:** Suspend business pending investigation

---

### **Phase 8: Manage Business Settings Disputes**

#### Step 14: Business Refuses Cancellation
Customer cancelled 3 hours before pickup (within policy), but business refuses refund:

**API Call:** `GET /api/business-settings/business-dispute-uuid`

```json
{
  "cancellation_deadline_hours": 4,
  "cancellation_penalty_percentage": 50,
  "allow_customer_cancellation": true
}
```

**API Call:** `GET /api/orders/disputed-order-uuid`

```json
{
  "cancelled_at": "2025-10-01T09:00:00+08:00",
  "pickup_datetime": "2025-10-01T12:00:00+08:00",
  "hours_before_pickup": 3,
  "calculated_refund": 225.00,
  "order_total": 450.00
}
```

**Analysis:**
- Cancellation: 3 hours before
- Policy: 4-hour deadline with 50% penalty
- Customer: Should get 50% refund (₱225)
- Business: Claims no refund

**Carlo's ruling:**
- Customer cancelled **AFTER** 4-hour deadline (only 3 hours notice)
- Policy allows 50% penalty
- **Decision:** Customer gets ₱225 refund (correct)

**Action:** Educate customer on policy, warn business to honor automated refunds

---

## Summary

### Key Takeaways

**Business Owners:**
- Full control via business settings
- Real-time order/booking management
- Stock tracking and analytics
- Flexible cancellation policies

**Tourists/Users:**
- Easy pre-ordering with arrival codes
- Service booking capability
- Real-time notifications
- Clear cancellation terms

**Admins:**
- Comprehensive monitoring tools
- Dispute resolution workflows
- Business approval system
- Quality control mechanisms

---

## Database Tables Used

### Business Owner Uses:
- ✅ `business_settings` - Configure operations
- ✅ `product`, `product_category` - Manage menu
- ✅ `product_stock`, `stock_history` - Inventory
- ✅ `service`, `service_category` - Service offerings
- ✅ `order`, `order_item` - Order management
- ✅ `service_booking` - Booking management
- ✅ `notification` - Communication
- ✅ `discount` - Promotions

### Tourists Use:
- ✅ `order` - Place pre-orders
- ✅ `service_booking` - Book services
- ✅ `notification` - Stay informed
- ✅ `product_review` - Rate products

### Admins Use:
- ✅ All tables for monitoring
- ✅ `report` - Handle complaints
- ✅ `approval_records` - Business approvals
- ✅ `business_settings` - Override policies

---

**End of Workflows** 🎉
