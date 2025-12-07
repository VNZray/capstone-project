# Payment Architecture Refactoring - Implementation Complete

**Date**: December 5, 2025  
**Status**: ✅ Backend Refactoring Complete  
**Branch**: mobile/shops-backend

## Executive Summary

Successfully refactored the payment architecture to establish the **payment table as the single source of truth** for all payment-related information. Eliminated redundant payment fields from the order table to improve data integrity, reduce duplication, and support future extensibility (multiple payments per order, bookings, etc.).

## Architecture Change

### Before
```
Order Table: id, user_id, business_id, ..., payment_status, paymongo_checkout_id, paymongo_payment_intent_id, paymongo_source_id, paymongo_payment_id
Payment Table: id, payment_for, payment_for_id, status, paymongo_payment_id, metadata
```

**Problem**: Payment data duplicated in two places, causing inconsistency and sync issues

### After  
```
Order Table: id, user_id, business_id, ..., payment_method, payment_method_type (ONLY for filtering/display)
Payment Table: id, payment_for, payment_for_id, status, paymongo_payment_id, provider_reference (intent ID), refund_reference, metadata
```

**Solution**: All payment truth lives in payment table; order queries join to fetch payment details

## Files Modified

### Database & Migrations
- **migrations/20251205000001_remove_payment_fields_from_order.cjs** (NEW)
  - Removes 5 payment columns from order table
  - Recreates stored procedures to use JOIN pattern

### Procedures
- **procedures/orderProcedures.js** - 11 procedures updated
  - GetAllOrders()
  - GetOrdersByBusinessId()
  - GetOrdersByUserId()
  - GetOrderById()
  - UpdateOrderStatus()
  - UpdatePaymentStatus() - **Now updates payment table instead of order**
  - CancelOrder()
  - VerifyArrivalCode()
  - MarkCustomerArrivedForOrder()
  - MarkOrderAsReady()
  - MarkOrderAsPickedUp()

### Controllers
- **controller/payment/paymentIntent.controller.js**
  - initiatePayment() - Fetches payment_status from LEFT JOIN with payment table
  - createPaymentIntentForOrder() - Same fix
  - getPaymentIntentStatus() - Queries payment table for provider_reference
  - Stores payment_intent_id in payment.provider_reference (not order table)

- **controller/payment/paymentAttach.controller.js**
  - attachPaymentMethodToIntent() - Queries payment table to find order via provider_reference

- **controller/payment/paymentWebhook.controller.js**
  - handleWebhook() / processWebhookEvent()
  - payment.paid event - Updates ONLY payment table, order gets updated_at timestamp
  - payment.failed event - Updates ONLY payment table, order.status = 'failed_payment'
  - refund.updated event - Updates payment table, order gets updated_at timestamp
  - Fallback queries search by provider_reference instead of paymongo_payment_intent_id

- **controller/order/utils.js**
  - getCompleteOrderForSocket() - JOINs with payment table to fetch payment_status

### Services
- **services/orderTransitionService.js**
  - Payment validation now reads from order data that includes payment_status via procedure JOIN

## Database Query Pattern Changes

### Old Pattern (with redundant fields)
```javascript
SELECT o.id, o.order_number, o.payment_status, o.paymongo_payment_id
FROM order o
WHERE o.id = ?
```

### New Pattern (single source of truth)
```javascript
SELECT o.id, o.order_number, p.status as payment_status, p.paymongo_payment_id
FROM order o
LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
WHERE o.id = ?
```

**Note**: Direct queries rare; use stored procedures (GetOrderById, etc.) which handle JOIN

## Workflow Impact

### Order Creation
**No Change**: Same INSERT into order table

### Payment Initiation (PIPM Flow)
```
1. Client calls POST /api/payments/initiate with order_id
2. Server creates Payment Intent via PayMongo
3. Server calls InsertPayment() storing payment_intent_id in provider_reference
4. Return payment_id + client_key to client
```

**Before**: Stored payment_intent_id in order.paymongo_payment_intent_id  
**After**: Stored in payment.provider_reference (single source of truth)

### Webhook Processing (Payment Confirmed)
```
1. PayMongo sends payment.paid webhook
2. Server updates payment table: status='paid', paymongo_payment_id=?
3. Server updates order table: updated_at=NOW() (timestamp only)
4. GetOrderById() now joins payment table → shows status='paid'
5. Business can now transition order to 'preparing'
```

**Before**: Updated order.payment_status and order.paymongo_payment_id  
**After**: Updates only payment table; order status NOT modified

## Testing Checklist

- [ ] Run migration: `npm run latest`
- [ ] Verify schema: `DESCRIBE order;` (should NOT have payment_* columns)
- [ ] Test cash_on_pickup order: Create order, verify payment_status not in order table
- [ ] Test paymongo order creation
- [ ] Test payment intent creation: Verify stored in payment.provider_reference
- [ ] Test webhook (payment.paid): Verify payment table updated, order.updated_at changes
- [ ] Test webhook (payment.failed): Verify order.status = 'failed_payment'
- [ ] Test order transition: Verify uses payment.status from procedure
- [ ] Test payment refund: Verify refund_reference stored in payment table
- [ ] Test stored procedures: GetOrderById, GetOrdersByBusinessId return payment info
- [ ] Verify socket events include payment_status (from JOIN)
- [ ] Test web dashboard (should work without changes)
- [ ] Test mobile (should work without changes)

## Migration Steps

```bash
# 1. Backup database (recommended)
mysqldump -u user -p dbname > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Run migration
npm run latest

# 3. Verify
mysql -u user -p -e "DESCRIBE \`capstone-project\`.order;" | grep payment
# Should return empty (no payment fields)

# 4. Test critical flows
# - Create order and verify
# - Initiate payment and verify
# - Send test webhook and verify

# 5. If needed, rollback
npm run rollback
```

## Breaking Changes

⚠️ **For Backend Developers**:
- Do NOT update order.payment_status directly
- Do NOT query order.paymongo_payment_intent_id (use payment.provider_reference)
- Use stored procedures for order queries (they handle JOIN)
- Direct payment queries always use payment table

✅ **For Web/Mobile**:
- No breaking changes if using order APIs
- Payment status now comes via ORDER API (not separate)
- Frontend should continue working as-is

## Future-Proofing

This architecture now supports:
- ✅ Multiple payments per order (partial payments, installments)
- ✅ Payment history tracking across resources (booking, reservation, subscription)
- ✅ Clean refund tracking
- ✅ Polymorphic payment relationships
- ✅ Easy audit trails

## Verification Commands

```sql
-- Verify columns removed
DESCRIBE order;  -- Should not show payment_status, paymongo_*

-- Verify procedures work
CALL GetOrderById('some-uuid');  -- Should show payment info joined

-- Verify payment table has data
SELECT * FROM payment LIMIT 1;

-- Verify join works
SELECT o.id, p.status as payment_status FROM order o 
LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id 
LIMIT 1;
```

## Support

For questions or issues:
1. Check `docs/PAYMENT_INTEGRATION_GUIDE.md`
2. Review `backend/PAYMONGO_TESTING_GUIDE.md`
3. Refer to stored procedure definitions in `procedures/orderProcedures.js`
4. Check `controller/payment/*` implementations

---

**Created**: December 5, 2025  
**Completed by**: AI Assistant  
**For**: City Venture Capstone Project
