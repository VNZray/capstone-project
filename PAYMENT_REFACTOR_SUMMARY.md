# Payment Architecture Refactoring: Single Source of Truth

**Date**: December 5, 2025  
**Branch**: mobile/shops-backend  
**Status**: Implementation Complete (Backend)

## Overview

Refactored the payment architecture to use the `payment` table as the **single source of truth** for all payment information. Removed redundant payment fields from the `order` table to improve data integrity and reduce duplication.

## Changes Made

### 1. Database Schema Changes

**Migration**: `20251205000001_remove_payment_fields_from_order.cjs`

**Removed from `order` table**:
- `payment_status` (ENUM: 'pending', 'paid', 'failed', 'refunded')
- `paymongo_checkout_id` (VARCHAR 100)
- `paymongo_payment_intent_id` (VARCHAR 255)
- `paymongo_source_id` (VARCHAR 100)
- `paymongo_payment_id` (VARCHAR 100)

**Retained in `order` table**:
- `payment_method` (ENUM: 'cash_on_pickup', 'paymongo') - for filtering/display
- `payment_method_type` (VARCHAR 50) - specific type when using paymongo (e.g., gcash, card)

**Queries now use**:
```sql
-- Fetch payment status and PayMongo info via LEFT JOIN
SELECT o.*, 
  p.status as payment_status,
  p.paymongo_payment_id,
  p.provider_reference as paymongo_payment_intent_id
FROM `order` o
LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
WHERE o.id = ?
```

### 2. Updated Order Procedures

All order stored procedures now JOIN with the `payment` table:

- **GetAllOrders()** - Added payment info via LEFT JOIN
- **GetOrdersByBusinessId()** - Filters unpaid PayMongo orders via payment table status
- **GetOrdersByUserId()** - Includes payment status from payment table
- **GetOrderById()** - Returns complete payment info (id, status, payment_id, intent_id, refund_id)
- **UpdateOrderStatus()** - Returns order with payment info
- **UpdatePaymentStatus()** - **Now updates payment table instead of order table**
- **CancelOrder()** - Updates payment status in payment table when applicable
- **VerifyArrivalCode()** - Includes payment status
- **MarkCustomerArrivedForOrder()** - Includes payment status
- **MarkOrderAsReady()** - Includes payment status
- **MarkOrderAsPickedUp()** - Includes payment status

### 3. Updated Payment Controllers

#### `paymentIntent.controller.js`
- `initiatePayment()` - Now fetches payment_status from payment table
- `createPaymentIntentForOrder()` - Fetches payment_status from payment table
- `getPaymentIntentStatus()` - Queries payment table for intent reference
- Removed all direct `order.paymongo_payment_intent_id` updates
- Stores payment_intent_id in `payment.provider_reference`

#### `paymentAttach.controller.js`
- Updated query to find order via `payment.provider_reference` instead of `order.paymongo_payment_intent_id`

#### `paymentWebhook.controller.js`
- `handleWebhook()` → `processWebhookEvent()` - Updated to only update payment table status
- Removed `order.payment_status` and `order.paymongo_payment_id` updates
- For payment.paid: Only updates `payment` table, order gets `updated_at` timestamp
- For payment.failed: Only updates `payment` table, order gets `updated_at` and status set to 'failed_payment'
- Fallback queries now search by `payment.provider_reference` (payment intent ID)

### 4. Updated Services

#### `orderTransitionService.js`
- Updated payment validation to check payment status from procedure results
- Payment status is now included in order data from procedures

#### `socketService.js`
- No changes needed - already receives `payment_status` from procedures

#### `orderController/utils.js`
- `getCompleteOrderForSocket()` - Now JOINs with payment table to fetch payment_status

### 5. Backend Workflow

**Order Creation → Payment Initiation → Webhook**

```
1. Create Order (cash_on_pickup)
   └─ InsertOrder() with payment_method = 'cash_on_pickup'
   └─ Emit notifications immediately
   └─ Order: payment_status not set (NULL joins to NULL in queries)

2. Create Order (paymongo)
   └─ InsertOrder() with payment_method = 'paymongo'
   └─ No notifications (deferred until payment)

3. Initiate Payment (PIPM Flow)
   └─ createPaymentIntentForOrder()
   └─ Create Payment Intent via PayMongo API
   └─ InsertPayment() with status='pending'
   └─ Store payment_intent_id in payment.provider_reference
   └─ Return payment_id + client_key to client

4. Payment Webhook (payment.paid)
   └─ processWebhookEvent()
   └─ UPDATE payment SET status='paid', paymongo_payment_id=?, ...
   └─ UPDATE order SET updated_at=NOW() (not payment_status)
   └─ Emit socket events + notifications
   └─ GetOrderById() JOIN now shows payment_status='paid'

5. Transition to Preparing
   └─ validateOrderTransition() checks payment.status = 'paid' (via procedure)
   └─ UpdateOrderStatus('preparing')
```

## Query Pattern for Fetching Orders

### Before (with order.payment_status)
```javascript
SELECT o.*, p.payment_method, o.payment_status
FROM order o
WHERE o.id = ?
```

### After (via payment table)
```javascript
SELECT o.*, p.payment_method, pt.status as payment_status
FROM order o
LEFT JOIN payment pt ON pt.payment_for = 'order' AND pt.payment_for_id = o.id
WHERE o.id = ?
```

**Note**: Use stored procedures (GetOrderById, etc.) which already handle this JOIN.

## Frontend Integration Points

### Web (city-venture-web)

Update `src/services/auth/PaymentService.tsx`:
- When displaying order payment status, it's now in the `payment_status` field from the joined query
- No changes needed if using the Order APIs that call procedures

### Mobile (city-venture)

Update `services/PaymentService.ts`:
- When displaying order payment status, it's now in the `payment_status` field from the joined query
- No changes needed if using the Order APIs that call procedures

## Migration Execution

```bash
# Run migration
npm run latest

# Verify payment fields removed from order table
DESCRIBE order;  # Should NOT show payment_status, paymongo_* columns

# Verify procedures work correctly
CALL GetOrderById('some-order-id');  # Should show payment info joined from payment table
```

## Rollback

```bash
# If needed to revert
npm run rollback
```

## Benefits

✅ **Single Source of Truth**: All payment data in one place  
✅ **Reduced Duplication**: Payment status not duplicated in order table  
✅ **Easier Queries**: Support multiple payments per order (future-proof)  
✅ **Better Separation**: Domain logic (order) vs. Payment logic (payment table)  
✅ **Cleaner Refunds**: Refund tracking only in payment table  
✅ **Supports Polymorphism**: Payment table can handle orders, bookings, etc.

## Testing Checklist

- [ ] Run migration: `npm run latest`
- [ ] Verify order table schema (no payment_* columns)
- [ ] Test cash_on_pickup order creation
- [ ] Test paymongo order creation + payment intent initiation
- [ ] Test webhook: payment.paid event
- [ ] Test webhook: payment.failed event
- [ ] Test order transition validation (should check payment.status)
- [ ] Test order status updates via procedures
- [ ] Verify socket emissions include payment_status
- [ ] Test payment refunds
- [ ] Test web dashboard displays payment status correctly
- [ ] Test mobile displays payment status correctly

## Files Modified

**Backend**:
- migrations/20251205000001_remove_payment_fields_from_order.cjs (new)
- procedures/orderProcedures.js
- controller/payment/paymentIntent.controller.js
- controller/payment/paymentAttach.controller.js
- controller/payment/paymentWebhook.controller.js
- services/orderTransitionService.js
- controller/order/utils.js

**Frontend** (Action Items):
- city-venture-web/src/services/* (verify OrderService uses updated procedures)
- city-venture/services/* (verify OrderService uses updated procedures)

## Questions?

Refer to the architecture guide in `docs/` and `backend/README.md` for more details on the payment flow.
