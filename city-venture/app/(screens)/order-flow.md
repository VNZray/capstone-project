┌─────────────────────────────────────────────────────────────────────────┐
│                        GRABFOOD-STYLE FLOW                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. CHECKOUT SCREEN                                                      │
│     └─> User fills billing info, selects payment method                  │
│     └─> Press "Place Order"                                              │
│                                                                          │
│  2. PRE-CONFIRMATION SCREEN (NEW)                                        │
│     └─> Shows order summary + 10 second countdown                        │
│     └─> "Cancel" button active during countdown                          │
│     └─> NO order created, NO payment intent yet                          │
│     └─> After 10s → Proceed to payment                                   │
│                                                                          │
│  3. PAYMENT PROCESSING                                                   │
│     └─> Create Payment Intent (with cart data in metadata)               │
│     └─> Attach e-wallet payment method                                   │
│     └─> Redirect to GCash/PayMaya                                        │
│                                                                          │
│  4. USER AUTHORIZES IN E-WALLET APP                                      │
│     └─> Success: status = 'succeeded'                                    │
│     └─> Failed: status = 'awaiting_payment_method' + last_payment_error  │
│     └─> Cancelled: User closes browser (status stays 'awaiting_next_action')│
│                                                                          │
│  5. AFTER REDIRECT BACK                                                  │
│     └─> Poll/check Payment Intent status                                 │
│     └─> IF succeeded:                                                    │
│           └─> CREATE ORDER (with payment already confirmed)              │
│           └─> Show success screen                                        │
│     └─> IF failed/cancelled:                                             │
│           └─> Show failure screen with retry option                      │
│           └─> NO order created                                           │
│                                                                          │
│  FOR CASH ON PICKUP:                                                     │
│     └─> After 10s grace → Create order immediately                       │
│     └─> Show confirmation                                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘