# Payment Refactor - Quick Reference

## What Changed

### Database
- **Removed from `order` table**:
  - `payment_status`
  - `paymongo_checkout_id`
  - `paymongo_payment_intent_id`
  - `paymongo_source_id`
  - `paymongo_payment_id`

- **Kept in `order` table**:
  - `payment_method` (cash_on_pickup or paymongo)
  - `payment_method_type` (gcash, card, etc.)

- **Added to `payment` table usage**:
  - `provider_reference` now stores payment_intent_id
  - `paymongo_payment_id` stores actual payment ID
  - `refund_reference` stores refund ID
  - `status` is the single source of truth for payment status

### Queries
**Old**: `SELECT o.payment_status FROM order o WHERE id = ?`  
**New**: `SELECT p.status FROM order o LEFT JOIN payment p ON... WHERE o.id = ?`

**Better**: Use stored procedures that handle the JOIN already

### Code Changes
1. **Procedures** (`orderProcedures.js`): All 11 now join with payment table
2. **Controllers** (`paymentIntent.controller.js`): Fetch payment_status from procedures
3. **Webhook** (`paymentWebhook.controller.js`): Updates payment table only
4. **Services**: orderTransitionService now handles payment checks via procedure results

## Migration
```bash
npm run latest
```

## Testing
```bash
# Create order
POST /api/orders { ... payment_method: "paymongo" }

# Initiate payment
POST /api/payments/initiate { order_id: "..." }

# Should return payment_id + payment_intent_id in response

# Check order (should NOT have payment_status in order table)
GET /api/orders/{id}

# Response includes payment_status from payment table via procedure
```

## For Developers

### ❌ DON'T
```javascript
// Don't update order payment_status
UPDATE order SET payment_status = 'paid' WHERE id = ?

// Don't query order.paymongo_payment_intent_id
SELECT paymongo_payment_intent_id FROM order WHERE id = ?
```

### ✅ DO
```javascript
// Use payment table for payment info
SELECT * FROM payment WHERE payment_for = 'order' AND payment_for_id = ?

// Use stored procedures which handle joins
CALL GetOrderById(order_id)  // Automatically joins payment table

// Get payment status from procedure result
const paymentStatus = orderFromProcedure.payment_status  // Comes from LEFT JOIN
```

## Files Changed
- migrations/20251205000001_remove_payment_fields_from_order.cjs (new)
- procedures/orderProcedures.js
- controller/payment/paymentIntent.controller.js
- controller/payment/paymentAttach.controller.js
- controller/payment/paymentWebhook.controller.js
- controller/order/utils.js
- services/orderTransitionService.js

## Documentation
- `PAYMENT_REFACTOR_SUMMARY.md` - Detailed migration guide
- `PAYMENT_REFACTOR_COMPLETE.md` - Full implementation details
