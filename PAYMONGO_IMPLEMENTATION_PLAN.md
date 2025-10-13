# PayMongo Payment Implementation Plan
## City Venture - Complete Payment Workflow Guide

---

## 📋 Table of Contents
1. [Executive Summary](#executive-summary)
2. [Current System Analysis](#current-system-analysis)
3. [Payment Architecture Recommendation](#payment-architecture-recommendation)
4. [PayMongo Integration Overview](#paymongo-integration-overview)
5. [Database Schema Updates](#database-schema-updates)
6. [Implementation Workflow](#implementation-workflow)
7. [Sandbox Testing Guide](#sandbox-testing-guide)
8. [Business Owner Setup](#business-owner-setup)
9. [Security & Compliance](#security--compliance)
10. [API Implementation Examples](#api-implementation-examples)

---

## 🎯 Executive Summary

### Current State
- ✅ Products & Services CRUD operations complete
- ✅ Order and Service Booking tables implemented
- ✅ Basic payment table exists
- ✅ Mobile app displays products/services
- ❌ No payment processing integration
- ❌ No merchant payout configuration

### Recommendation: **Hybrid Escrow-Direct System**

**Why Hybrid?**
1. **Platform Protection**: Initial escrow holds funds for dispute resolution
2. **Business Cashflow**: Faster payouts after successful completion
3. **Customer Trust**: Refund capability for cancellations/issues
4. **Compliance**: Meets payment service provider requirements

---

## 🏗️ Current System Analysis

### Existing Database Tables

#### 1. **Order Management**
```javascript
order {
  - id (UUID)
  - business_id (UUID)
  - user_id (UUID)
  - order_number (String)
  - subtotal, discount_amount, tax_amount, total_amount
  - status: pending → confirmed → preparing → ready → completed → cancelled
  - payment_status: pending → paid → failed → refunded
  - payment_method: cash_on_pickup, card, digital_wallet
  - arrival_code (6-digit)
  - pickup_datetime
  - tracking timestamps
}

order_item {
  - order_id
  - product_id
  - quantity, unit_price, total_price
}
```

#### 2. **Service Booking Management**
```javascript
service_booking {
  - id (UUID)
  - service_id, business_id, user_id
  - booking_number
  - booking_datetime
  - duration_minutes, number_of_people
  - base_price, total_price
  - status: pending → confirmed → in_progress → completed → cancelled → no_show
  - payment_status: pending → paid → failed → refunded
  - payment_method: cash_on_site, cash_on_arrival, card, digital_wallet
  - tracking timestamps
}
```

#### 3. **Payment Table**
```javascript
payment {
  - id (UUID)
  - payer_type: Tourist, Owner
  - payment_type: Full Payment, Partial Payment
  - payment_method: Gcash, Paymaya, Credit Card, Cash
  - amount
  - status: Paid, Pending Balance
  - payment_for: Reservation, Pending Balance, Subscription
  - payer_id, payment_for_id
}
```

### ⚠️ Gaps Identified
1. No PayMongo transaction references
2. No merchant/business payout settings
3. No escrow hold/release mechanism
4. No webhook handling for payment updates
5. No payment intent/session tracking
6. No merchant account linking

---

## 💡 Payment Architecture Recommendation

### **Hybrid Model: Time-Delayed Direct-to-Merchant with Platform Escrow**

```
┌─────────────────────────────────────────────────────────────┐
│                    PAYMENT FLOW                              │
└─────────────────────────────────────────────────────────────┘

Customer Pays
     ↓
Platform Account (Escrow - 24-72hrs)
     ↓
Order/Service Completed + No Disputes
     ↓
Auto-Transfer to Business Account
     ↓
Platform Fee Deducted (Optional)
```

### Comparison Table

| Aspect | Direct-to-Merchant | Escrow | **Hybrid (Recommended)** |
|--------|-------------------|--------|---------------------------|
| Customer Protection | ❌ Low | ✅ High | ✅ High |
| Business Cashflow | ✅ Immediate | ❌ Delayed | 🟡 Moderate (24-72h) |
| Platform Control | ❌ None | ✅ Full | 🟡 Temporary |
| Refund Capability | ❌ Complex | ✅ Simple | ✅ Simple |
| Dispute Resolution | ❌ Hard | ✅ Easy | ✅ Easy |
| Implementation | ✅ Simple | 🟡 Moderate | 🟡 Moderate |
| PayMongo Support | ✅ Yes | ✅ Yes (Wallet) | ✅ Yes (Wallet + Payout) |

---

## 🔌 PayMongo Integration Overview

### PayMongo Services to Use

#### 1. **Payment Intents** (Customer Payment)
```
Customer → PayMongo Payment Intent → Your Platform Wallet
```
- Supports GCash, Maya, Card, Bank Transfer
- Secure 3D authentication
- Automatic payment confirmation

#### 2. **Wallet & Balance**
```
Platform Wallet → Holds funds temporarily → Auto-payout
```
- Store funds before merchant transfer
- Handle refunds easily
- Transaction history

#### 3. **Payouts API** (Business Payment)
```
Platform Wallet → PayMongo Payout → Business GCash/Bank Account
```
- Direct bank transfer
- E-wallet (GCash, Maya) payout
- Automated scheduling

#### 4. **Webhooks**
```
PayMongo → Your Server → Update database
```
- Real-time payment updates
- Payout confirmations
- Failed transaction alerts

---

## 🗄️ Database Schema Updates

### 1. New Table: `business_payout_settings`

```javascript
CREATE TABLE business_payout_settings (
  id UUID PRIMARY KEY DEFAULT (UUID()),
  business_id UUID NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  
  -- PayMongo Configuration
  paymongo_recipient_id VARCHAR(255) NULL,  -- PayMongo recipient account ID
  
  -- Payout Method
  payout_method ENUM('gcash', 'bank_transfer', 'paymaya') NOT NULL,
  
  -- GCash/PayMaya Details
  mobile_number VARCHAR(15) NULL,
  account_name VARCHAR(255) NULL,
  
  -- Bank Account Details
  bank_code VARCHAR(50) NULL,  -- e.g., 'bdo', 'bpi'
  account_number VARCHAR(50) NULL,
  
  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  verification_notes TEXT NULL,
  verified_at TIMESTAMP NULL,
  
  -- Payout Schedule
  payout_schedule ENUM('immediate', 'daily', 'weekly', 'monthly') DEFAULT 'daily',
  minimum_payout_amount DECIMAL(10,2) DEFAULT 100.00,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE KEY unique_business_payout (business_id),
  INDEX idx_verification_status (verification_status),
  INDEX idx_is_verified (is_verified)
);
```

### 2. New Table: `payment_transactions`

```javascript
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT (UUID()),
  
  -- Reference
  reference_type ENUM('order', 'service_booking') NOT NULL,
  reference_id UUID NOT NULL,  -- order_id or service_booking_id
  business_id UUID NOT NULL REFERENCES business(id),
  user_id UUID NOT NULL REFERENCES user(id),
  
  -- PayMongo Details
  paymongo_payment_intent_id VARCHAR(255) NULL,
  paymongo_payment_id VARCHAR(255) NULL,
  paymongo_webhook_id VARCHAR(255) NULL,
  
  -- Transaction Details
  transaction_type ENUM('payment', 'refund', 'partial_refund') DEFAULT 'payment',
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PHP',
  
  -- Payment Method from PayMongo
  payment_method_type ENUM('gcash', 'paymaya', 'card', 'grab_pay', 'bank_transfer') NULL,
  payment_method_details JSON NULL,  -- Store card last 4, etc.
  
  -- Status Tracking
  status ENUM(
    'pending',        -- Created, awaiting customer action
    'processing',     -- Customer authorized, processing
    'succeeded',      -- Payment successful
    'failed',         -- Payment failed
    'cancelled',      -- Cancelled by user/system
    'refunded',       -- Fully refunded
    'partial_refund'  -- Partially refunded
  ) DEFAULT 'pending',
  
  -- Timestamps
  payment_confirmed_at TIMESTAMP NULL,
  failed_at TIMESTAMP NULL,
  refunded_at TIMESTAMP NULL,
  
  -- Error Handling
  error_code VARCHAR(50) NULL,
  error_message TEXT NULL,
  
  -- Platform Fee (optional)
  platform_fee_percentage DECIMAL(5,2) DEFAULT 0,
  platform_fee_amount DECIMAL(10,2) DEFAULT 0,
  merchant_net_amount DECIMAL(10,2) NOT NULL,
  
  -- Metadata
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_reference (reference_type, reference_id),
  INDEX idx_business (business_id),
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_paymongo_intent (paymongo_payment_intent_id),
  INDEX idx_paymongo_payment (paymongo_payment_id),
  INDEX idx_payment_confirmed_at (payment_confirmed_at)
);
```

### 3. New Table: `business_payouts`

```javascript
CREATE TABLE business_payouts (
  id UUID PRIMARY KEY DEFAULT (UUID()),
  business_id UUID NOT NULL REFERENCES business(id),
  
  -- PayMongo Payout Details
  paymongo_payout_id VARCHAR(255) NOT NULL,
  paymongo_recipient_id VARCHAR(255) NOT NULL,
  
  -- Payout Information
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PHP',
  payout_method ENUM('gcash', 'bank_transfer', 'paymaya') NOT NULL,
  
  -- Status
  status ENUM(
    'pending',     -- Created, not sent yet
    'processing',  -- Sent to PayMongo
    'paid',        -- Successfully paid out
    'failed',      -- Payout failed
    'cancelled'    -- Cancelled before processing
  ) DEFAULT 'pending',
  
  -- Timing
  scheduled_payout_date DATE NOT NULL,
  actual_payout_date TIMESTAMP NULL,
  
  -- Related Transactions
  transaction_ids JSON NOT NULL,  -- Array of payment_transaction IDs included
  transaction_count INT NOT NULL,
  
  -- Details
  description TEXT NULL,
  notes TEXT NULL,
  
  -- Error Handling
  failure_code VARCHAR(50) NULL,
  failure_message TEXT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_business (business_id),
  INDEX idx_status (status),
  INDEX idx_paymongo_payout (paymongo_payout_id),
  INDEX idx_scheduled_date (scheduled_payout_date),
  INDEX idx_actual_date (actual_payout_date)
);
```

### 4. Update Existing `payment` Table

```javascript
ALTER TABLE payment ADD COLUMN (
  payment_transaction_id UUID NULL REFERENCES payment_transactions(id),
  INDEX idx_payment_transaction (payment_transaction_id)
);
```

---

## 🔄 Implementation Workflow

### Phase 1: Customer Payment Flow (Products & Services)

```
┌──────────────────────────────────────────────────────────────┐
│  CUSTOMER MAKES ORDER/BOOKING                                │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  1. Create Order/Service_Booking (status: pending)          │
│     - Calculate total_amount                                  │
│     - Apply discounts                                         │
│     - Generate order_number/booking_number                    │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  2. Create PayMongo Payment Intent                           │
│     POST /v1/payment_intents                                 │
│     {                                                         │
│       amount: total_amount * 100,  // in centavos           │
│       currency: "PHP",                                        │
│       payment_method_allowed: ["card", "gcash", "paymaya"], │
│       description: "Order #ORD-12345",                       │
│       metadata: { order_id, user_id, business_id }          │
│     }                                                         │
│     → Returns: payment_intent_id, client_key                 │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  3. Save to payment_transactions table                       │
│     - paymongo_payment_intent_id                             │
│     - status: 'pending'                                       │
│     - reference_id: order_id or booking_id                   │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  4. Return client_key to Mobile App                          │
│     - App opens PayMongo checkout                            │
│     - Customer selects payment method                        │
│     - Customer completes payment                             │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  5. PayMongo Webhook → Your Server                           │
│     Event: payment_intent.succeeded                          │
│     {                                                         │
│       data: {                                                 │
│         id: "pi_...",                                        │
│         attributes: {                                         │
│           status: "succeeded",                               │
│           amount: 50000,                                     │
│           metadata: { order_id: "..." }                     │
│         }                                                     │
│       }                                                       │
│     }                                                         │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  6. Update Database                                          │
│     - payment_transactions.status = 'succeeded'              │
│     - payment_transactions.payment_confirmed_at = NOW()      │
│     - order.payment_status = 'paid'                          │
│     - order.status = 'confirmed' (if auto-confirm enabled)   │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  7. Send Notifications                                       │
│     - Customer: Payment confirmed                            │
│     - Business: New paid order                               │
└──────────────────────────────────────────────────────────────┘
```

### Phase 2: Order Completion & Payout

```
┌──────────────────────────────────────────────────────────────┐
│  ORDER/SERVICE COMPLETED                                     │
│  - Customer picks up (order.status = 'completed')           │
│  - Service finished (service_booking.status = 'completed')   │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  Wait for Escrow Period (24-72 hours)                       │
│  - Check for disputes/refund requests                        │
│  - Allow customer review period                              │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  Automated Payout Job (Cron - Daily 2AM)                    │
│  - Query completed transactions past escrow period           │
│  - Group by business_id                                      │
│  - Check minimum_payout_amount                               │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  Create PayMongo Payout                                      │
│  POST /v1/payouts                                            │
│  {                                                            │
│    amount: (sum_of_transactions - platform_fees) * 100,    │
│    currency: "PHP",                                          │
│    destination: {                                            │
│      type: "gcash" / "bank_account",                        │
│      recipient_id: "rcp_..."                                │
│    },                                                         │
│    description: "Payout for period X"                       │
│  }                                                            │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  Save to business_payouts table                              │
│  - paymongo_payout_id                                        │
│  - transaction_ids (JSON array)                              │
│  - status: 'processing'                                      │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  PayMongo Webhook: payout.paid                               │
│  - Update business_payouts.status = 'paid'                   │
│  - Update actual_payout_date                                 │
│  - Notify business owner                                     │
└──────────────────────────────────────────────────────────────┘
```

---

## 🧪 Sandbox Testing Guide

### Step 1: Create PayMongo Test Account

1. Go to https://dashboard.paymongo.com/signup
2. Sign up for account
3. Verify email
4. Navigate to **Developers → API Keys**
5. Copy your **TEST** secret key: `sk_test_...`

### Step 2: Environment Setup

**Backend `.env` file:**
```env
# PayMongo Configuration
PAYMONGO_SECRET_KEY=sk_test_your_test_key_here
PAYMONGO_PUBLIC_KEY=pk_test_your_public_key_here
PAYMONGO_WEBHOOK_SECRET=whsec_your_webhook_secret_here
PAYMONGO_BASE_URL=https://api.paymongo.com/v1

# Payout Settings
ESCROW_PERIOD_HOURS=24
PLATFORM_FEE_PERCENTAGE=2.5
MINIMUM_PAYOUT_AMOUNT=100.00
```

### Step 3: Install PayMongo SDK

```bash
cd naga-venture-backend
npm install axios
# PayMongo doesn't have official Node SDK, use axios
```

### Step 4: Test Payment Methods

#### GCash Test Flow
```javascript
// Use these test credentials in PayMongo checkout
Payment Method: GCash
Mobile Number: Any 10-digit number (e.g., 09123456789)
OTP: 123456 (Always works in test mode)
Status: Will succeed immediately
```

#### PayMaya Test Flow
```javascript
Payment Method: PayMaya
Mobile Number: Any 10-digit number
OTP: 111111 (Test mode OTP)
Status: Will succeed immediately
```

#### Card Test Flow
```javascript
// Success scenario
Card Number: 4343 4343 4343 4345
Expiry: Any future date (e.g., 12/25)
CVC: 123
Status: Will succeed

// Failure scenario (insufficient funds)
Card Number: 4571 7360 0000 0183
Status: Will fail with "insufficient_funds"

// 3DS Authentication Required
Card Number: 4120 0000 0000 0007
Status: Will trigger 3DS flow, use OTP 123456
```

### Step 5: Sandbox Webhook Testing

#### Option A: Use ngrok for local testing
```bash
# Install ngrok
npm install -g ngrok

# Start your backend server
npm start  # Runs on port 3000

# In new terminal, expose localhost
ngrok http 3000

# Copy HTTPS URL: https://abcd-1234.ngrok.io
```

#### Option B: Use PayMongo Dashboard

1. Go to **Developers → Webhooks**
2. Click **Add Webhook**
3. Enter URL: `https://your-ngrok-url.ngrok.io/api/webhooks/paymongo`
4. Select events:
   - ✅ `payment.paid`
   - ✅ `payment.failed`
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.succeeded`
5. Copy **Webhook Secret**: `whsec_...`

### Step 6: Test Payout Flow

```javascript
// In PayMongo test mode, payouts are simulated
// They won't actually transfer money

// Create test recipient
POST https://api.paymongo.com/v1/recipients
{
  "data": {
    "attributes": {
      "type": "individual",
      "email": "merchant@test.com",
      "phone_number": "+639123456789",
      "bank_account": {
        "name": "Juan Dela Cruz",
        "account_number": "1234567890",
        "bank_code": "bdo"  // BDO test code
      }
    }
  }
}
// Returns: recipient_id (rcp_...)

// Create test payout
POST https://api.paymongo.com/v1/payouts
{
  "data": {
    "attributes": {
      "amount": 10000,  // PHP 100.00
      "currency": "PHP",
      "destination": {
        "type": "bank_account",
        "recipient_id": "rcp_..."
      }
    }
  }
}
// Status will automatically become "paid" in test mode after ~30 seconds
```

### Step 7: Testing Checklist

- [ ] Create order with products
- [ ] Generate payment intent
- [ ] Complete GCash payment (test mode)
- [ ] Verify webhook received
- [ ] Check order payment_status updated to 'paid'
- [ ] Check payment_transactions table populated
- [ ] Complete order (status → 'completed')
- [ ] Wait escrow period (reduce to 5 minutes for testing)
- [ ] Run payout cron job manually
- [ ] Verify payout created in PayMongo
- [ ] Check business_payouts table
- [ ] Verify payout webhook received
- [ ] Test refund flow
- [ ] Test cancelled order (before payment)
- [ ] Test service booking payment
- [ ] Test partial payment (if implemented)

---

## 👤 Business Owner Setup

### User Flow: Business Owner Adds Payout Account

#### 1. Mobile App: Add Payout Settings Screen

```
┌─────────────────────────────────────┐
│  💰 Payout Settings                 │
├─────────────────────────────────────┤
│                                     │
│  Select Payout Method:              │
│  ○ GCash                            │
│  ○ Bank Account                     │
│  ○ PayMaya                          │
│                                     │
│  [Next]                             │
└─────────────────────────────────────┘
```

#### 2A. GCash Configuration

```
┌─────────────────────────────────────┐
│  📱 GCash Account                   │
├─────────────────────────────────────┤
│                                     │
│  Mobile Number *                    │
│  ┌───────────────────────────────┐ │
│  │ +63 9XX XXX XXXX              │ │
│  └───────────────────────────────┘ │
│                                     │
│  Account Name *                     │
│  ┌───────────────────────────────┐ │
│  │ Juan Dela Cruz                │ │
│  └───────────────────────────────┘ │
│                                     │
│  ⚠️ Must match registered name     │
│                                     │
│  [Save & Verify]                    │
└─────────────────────────────────────┘
```

#### 2B. Bank Account Configuration

```
┌─────────────────────────────────────┐
│  🏦 Bank Account                    │
├─────────────────────────────────────┤
│                                     │
│  Select Bank *                      │
│  ┌───────────────────────────────┐ │
│  │ BDO (Banco de Oro)      ▼    │ │
│  └───────────────────────────────┘ │
│                                     │
│  Account Number *                   │
│  ┌───────────────────────────────┐ │
│  │ 1234567890                    │ │
│  └───────────────────────────────┘ │
│                                     │
│  Account Name *                     │
│  ┌───────────────────────────────┐ │
│  │ Juan Dela Cruz                │ │
│  └───────────────────────────────┘ │
│                                     │
│  [Save & Verify]                    │
└─────────────────────────────────────┘
```

#### 3. Backend Verification Process

```javascript
// API: POST /api/business/:businessId/payout-settings
async function setupBusinessPayout(req, res) {
  const { businessId } = req.params;
  const { payout_method, mobile_number, account_name, 
          bank_code, account_number } = req.body;
  
  try {
    // 1. Create PayMongo Recipient
    const recipientData = {
      type: "individual",
      email: req.business.email,
      phone_number: mobile_number,
      name: account_name
    };
    
    if (payout_method === 'gcash') {
      recipientData.gcash = {
        name: account_name,
        account_number: mobile_number
      };
    } else if (payout_method === 'bank_transfer') {
      recipientData.bank_account = {
        name: account_name,
        account_number: account_number,
        bank_code: bank_code
      };
    }
    
    const recipient = await paymongoAPI.createRecipient(recipientData);
    
    // 2. Save to database
    await db.query(`
      INSERT INTO business_payout_settings 
      (business_id, paymongo_recipient_id, payout_method, 
       mobile_number, account_name, bank_code, account_number,
       verification_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [businessId, recipient.id, payout_method, mobile_number, 
        account_name, bank_code, account_number]);
    
    // 3. Send test micro-payout for verification (PHP 1.00)
    // Business must confirm receipt
    
    res.json({ message: "Payout account added, verification pending" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
```

### Sandbox Testing: No Real Bank Account Needed

In **PayMongo Test Mode:**
- ✅ Use any fake bank account numbers
- ✅ Use any mobile numbers (format: +639XXXXXXXXX)
- ✅ Payouts will show as "paid" without actual transfer
- ✅ No verification needed in test mode

**For Production:**
- ⚠️ Real bank accounts required
- ⚠️ PayMongo KYC verification needed
- ⚠️ Micro-deposit verification (₱1.00)
- ⚠️ 24-48 hour verification period

---

## 🔐 Security & Compliance

### 1. PCI DSS Compliance
- ✅ **Never store card numbers** - PayMongo handles this
- ✅ **Use HTTPS only**
- ✅ **Tokenization** - Payment intents use tokens
- ✅ **No sensitive data in logs**

### 2. API Key Security
```javascript
// ❌ NEVER DO THIS
const API_KEY = "sk_live_abc123";  // Hardcoded

// ✅ DO THIS
const API_KEY = process.env.PAYMONGO_SECRET_KEY;
```

### 3. Webhook Signature Verification
```javascript
const crypto = require('crypto');

function verifyWebhookSignature(req) {
  const signature = req.headers['paymongo-signature'];
  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
  
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  return signature === expectedSignature;
}
```

### 4. Idempotency
```javascript
// Prevent duplicate payments
const idempotencyKey = uuidv4();

axios.post('https://api.paymongo.com/v1/payment_intents', data, {
  headers: {
    'Idempotency-Key': idempotencyKey
  }
});
```

### 5. Rate Limiting
```javascript
// Limit payment creation attempts
const rateLimit = require('express-rate-limit');

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // Max 5 payment attempts per 15 min
});

router.post('/create-payment', paymentLimiter, createPayment);
```

---

## 💻 API Implementation Examples

### 1. Create Payment Intent (Backend)

**File: `naga-venture-backend/controller/paymentIntentController.js`**

```javascript
import axios from 'axios';
import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
const PAYMONGO_BASE_URL = 'https://api.paymongo.com/v1';

// Base64 encode API key
const authToken = Buffer.from(PAYMONGO_SECRET_KEY).toString('base64');

export async function createPaymentIntent(req, res) {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { order_id, service_booking_id } = req.body;
    
    // Determine reference type and get details
    let referenceType, referenceId, amount, businessId, userId, description;
    
    if (order_id) {
      const [order] = await connection.query(
        'SELECT * FROM `order` WHERE id = ?', 
        [order_id]
      );
      
      if (!order || order.length === 0) {
        throw new Error('Order not found');
      }
      
      referenceType = 'order';
      referenceId = order_id;
      amount = order[0].total_amount;
      businessId = order[0].business_id;
      userId = order[0].user_id;
      description = `Payment for Order ${order[0].order_number}`;
    } else if (service_booking_id) {
      const [booking] = await connection.query(
        'SELECT * FROM service_booking WHERE id = ?', 
        [service_booking_id]
      );
      
      if (!booking || booking.length === 0) {
        throw new Error('Service booking not found');
      }
      
      referenceType = 'service_booking';
      referenceId = service_booking_id;
      amount = booking[0].total_price;
      businessId = booking[0].business_id;
      userId = booking[0].user_id;
      description = `Payment for Booking ${booking[0].booking_number}`;
    } else {
      throw new Error('order_id or service_booking_id required');
    }
    
    // Create PayMongo Payment Intent
    const paymentIntentData = {
      data: {
        attributes: {
          amount: Math.round(amount * 100), // Convert to centavos
          currency: 'PHP',
          payment_method_allowed: ['card', 'gcash', 'paymaya', 'grab_pay'],
          payment_method_options: {
            card: { request_three_d_secure: 'any' }
          },
          description: description,
          statement_descriptor: 'CityVenture',
          metadata: {
            reference_type: referenceType,
            reference_id: referenceId,
            business_id: businessId,
            user_id: userId
          }
        }
      }
    };
    
    const paymongoResponse = await axios.post(
      `${PAYMONGO_BASE_URL}/payment_intents`,
      paymentIntentData,
      {
        headers: {
          'Authorization': `Basic ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const paymentIntent = paymongoResponse.data.data;
    
    // Calculate platform fee (optional)
    const platformFeePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || 0);
    const platformFeeAmount = (amount * platformFeePercentage) / 100;
    const merchantNetAmount = amount - platformFeeAmount;
    
    // Save transaction to database
    const transactionId = uuidv4();
    await connection.query(`
      INSERT INTO payment_transactions (
        id, reference_type, reference_id, business_id, user_id,
        paymongo_payment_intent_id, amount, currency,
        platform_fee_percentage, platform_fee_amount, merchant_net_amount,
        status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [
      transactionId, referenceType, referenceId, businessId, userId,
      paymentIntent.id, amount, 'PHP',
      platformFeePercentage, platformFeeAmount, merchantNetAmount
    ]);
    
    await connection.commit();
    
    res.json({
      success: true,
      payment_intent_id: paymentIntent.id,
      client_key: paymentIntent.attributes.client_key,
      amount: amount,
      currency: 'PHP',
      status: paymentIntent.attributes.status
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Payment Intent Error:', error.response?.data || error.message);
    res.status(400).json({
      success: false,
      error: error.response?.data?.errors || error.message
    });
  } finally {
    connection.release();
  }
}

export async function getPaymentIntentStatus(req, res) {
  const { payment_intent_id } = req.params;
  
  try {
    const response = await axios.get(
      `${PAYMONGO_BASE_URL}/payment_intents/${payment_intent_id}`,
      {
        headers: {
          'Authorization': `Basic ${authToken}`
        }
      }
    );
    
    const paymentIntent = response.data.data;
    
    // Update local database
    await db.query(`
      UPDATE payment_transactions 
      SET status = ?,
          payment_method_type = ?,
          updated_at = NOW()
      WHERE paymongo_payment_intent_id = ?
    `, [
      paymentIntent.attributes.status,
      paymentIntent.attributes.payment_method_type,
      payment_intent_id
    ]);
    
    res.json({
      status: paymentIntent.attributes.status,
      amount: paymentIntent.attributes.amount / 100,
      payment_method: paymentIntent.attributes.payment_method_type
    });
    
  } catch (error) {
    res.status(400).json({
      error: error.response?.data?.errors || error.message
    });
  }
}
```

### 2. Webhook Handler (Backend)

**File: `naga-venture-backend/controller/webhookController.js`**

```javascript
import crypto from 'crypto';
import db from '../db.js';

export async function handlePayMongoWebhook(req, res) {
  try {
    // 1. Verify webhook signature
    const signature = req.headers['paymongo-signature'];
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
    
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // 2. Process webhook event
    const event = req.body.data;
    const eventType = event.attributes.type;
    const eventData = event.attributes.data;
    
    console.log(`Received webhook: ${eventType}`);
    
    switch (eventType) {
      case 'payment.paid':
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(eventData);
        break;
        
      case 'payment.failed':
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(eventData);
        break;
        
      case 'payout.paid':
        await handlePayoutSuccess(eventData);
        break;
        
      case 'payout.failed':
        await handlePayoutFailure(eventData);
        break;
        
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
    
    res.json({ received: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
}

async function handlePaymentSuccess(paymentData) {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const paymentIntentId = paymentData.attributes.payment_intent_id || paymentData.id;
    const paymentId = paymentData.id;
    const amount = paymentData.attributes.amount / 100;
    const paymentMethod = paymentData.attributes.source?.type || 'unknown';
    
    // Update payment_transactions
    const [transaction] = await connection.query(`
      SELECT * FROM payment_transactions 
      WHERE paymongo_payment_intent_id = ?
    `, [paymentIntentId]);
    
    if (!transaction || transaction.length === 0) {
      throw new Error(`Transaction not found for payment intent: ${paymentIntentId}`);
    }
    
    const txn = transaction[0];
    
    await connection.query(`
      UPDATE payment_transactions
      SET 
        paymongo_payment_id = ?,
        status = 'succeeded',
        payment_method_type = ?,
        payment_confirmed_at = NOW(),
        updated_at = NOW()
      WHERE id = ?
    `, [paymentId, paymentMethod, txn.id]);
    
    // Update order or service_booking
    if (txn.reference_type === 'order') {
      await connection.query(`
        UPDATE \`order\`
        SET 
          payment_status = 'paid',
          status = CASE 
            WHEN status = 'pending' THEN 'confirmed'
            ELSE status
          END,
          confirmed_at = CASE
            WHEN status = 'pending' THEN NOW()
            ELSE confirmed_at
          END,
          updated_at = NOW()
        WHERE id = ?
      `, [txn.reference_id]);
    } else if (txn.reference_type === 'service_booking') {
      await connection.query(`
        UPDATE service_booking
        SET 
          payment_status = 'paid',
          status = CASE 
            WHEN status = 'pending' THEN 'confirmed'
            ELSE status
          END,
          confirmed_at = CASE
            WHEN status = 'pending' THEN NOW()
            ELSE confirmed_at
          END,
          updated_at = NOW()
        WHERE id = ?
      `, [txn.reference_id]);
    }
    
    // TODO: Send notification to customer and business
    
    await connection.commit();
    console.log(`✅ Payment succeeded: ${paymentId}`);
    
  } catch (error) {
    await connection.rollback();
    console.error('Error handling payment success:', error);
    throw error;
  } finally {
    connection.release();
  }
}

async function handlePaymentFailure(paymentData) {
  const connection = await db.getConnection();
  
  try {
    const paymentIntentId = paymentData.attributes.payment_intent_id || paymentData.id;
    const errorCode = paymentData.attributes.last_payment_error?.code;
    const errorMessage = paymentData.attributes.last_payment_error?.message;
    
    await connection.query(`
      UPDATE payment_transactions
      SET 
        status = 'failed',
        error_code = ?,
        error_message = ?,
        failed_at = NOW(),
        updated_at = NOW()
      WHERE paymongo_payment_intent_id = ?
    `, [errorCode, errorMessage, paymentIntentId]);
    
    console.log(`❌ Payment failed: ${paymentIntentId} - ${errorMessage}`);
    
    // TODO: Send notification to customer about failure
    
  } catch (error) {
    console.error('Error handling payment failure:', error);
  } finally {
    connection.release();
  }
}

async function handlePayoutSuccess(payoutData) {
  const connection = await db.getConnection();
  
  try {
    const payoutId = payoutData.id;
    
    await connection.query(`
      UPDATE business_payouts
      SET 
        status = 'paid',
        actual_payout_date = NOW(),
        updated_at = NOW()
      WHERE paymongo_payout_id = ?
    `, [payoutId]);
    
    console.log(`✅ Payout succeeded: ${payoutId}`);
    
    // TODO: Send notification to business owner
    
  } catch (error) {
    console.error('Error handling payout success:', error);
  } finally {
    connection.release();
  }
}

async function handlePayoutFailure(payoutData) {
  const connection = await db.getConnection();
  
  try {
    const payoutId = payoutData.id;
    const errorCode = payoutData.attributes.failure_code;
    const errorMessage = payoutData.attributes.failure_message;
    
    await connection.query(`
      UPDATE business_payouts
      SET 
        status = 'failed',
        failure_code = ?,
        failure_message = ?,
        updated_at = NOW()
      WHERE paymongo_payout_id = ?
    `, [errorCode, errorMessage, payoutId]);
    
    console.log(`❌ Payout failed: ${payoutId} - ${errorMessage}`);
    
    // TODO: Send notification to business owner and admin
    
  } catch (error) {
    console.error('Error handling payout failure:', error);
  } finally {
    connection.release();
  }
}
```

### 3. Automated Payout Job (Backend)

**File: `naga-venture-backend/jobs/processPayouts.js`**

```javascript
import axios from 'axios';
import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
const PAYMONGO_BASE_URL = 'https://api.paymongo.com/v1';
const authToken = Buffer.from(PAYMONGO_SECRET_KEY).toString('base64');

const ESCROW_PERIOD_HOURS = parseInt(process.env.ESCROW_PERIOD_HOURS || 24);
const MINIMUM_PAYOUT_AMOUNT = parseFloat(process.env.MINIMUM_PAYOUT_AMOUNT || 100);

export async function processBusinessPayouts() {
  console.log('🔄 Starting automated payout processing...');
  
  try {
    // Get all businesses with verified payout settings
    const [businesses] = await db.query(`
      SELECT 
        b.id as business_id,
        b.business_name,
        bps.*
      FROM business b
      INNER JOIN business_payout_settings bps ON b.id = bps.business_id
      WHERE bps.is_verified = TRUE 
        AND bps.is_active = TRUE
    `);
    
    for (const business of businesses) {
      await processSingleBusinessPayout(business);
    }
    
    console.log('✅ Payout processing completed');
    
  } catch (error) {
    console.error('❌ Error in payout processing:', error);
  }
}

async function processSingleBusinessPayout(business) {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Find eligible transactions (completed + past escrow period)
    const escrowCutoff = new Date();
    escrowCutoff.setHours(escrowCutoff.getHours() - ESCROW_PERIOD_HOURS);
    
    const [eligibleTransactions] = await connection.query(`
      SELECT pt.*
      FROM payment_transactions pt
      LEFT JOIN \`order\` o ON pt.reference_type = 'order' AND pt.reference_id = o.id
      LEFT JOIN service_booking sb ON pt.reference_type = 'service_booking' AND pt.reference_id = sb.id
      WHERE pt.business_id = ?
        AND pt.status = 'succeeded'
        AND pt.payment_confirmed_at <= ?
        AND (
          (pt.reference_type = 'order' AND o.status = 'completed')
          OR
          (pt.reference_type = 'service_booking' AND sb.status = 'completed')
        )
        AND pt.id NOT IN (
          SELECT JSON_EXTRACT(transaction_ids, '$[*]')
          FROM business_payouts
          WHERE business_id = ?
        )
    `, [business.business_id, escrowCutoff, business.business_id]);
    
    if (eligibleTransactions.length === 0) {
      console.log(`No eligible transactions for ${business.business_name}`);
      return;
    }
    
    // Calculate total payout amount
    const totalAmount = eligibleTransactions.reduce(
      (sum, txn) => sum + parseFloat(txn.merchant_net_amount), 
      0
    );
    
    if (totalAmount < MINIMUM_PAYOUT_AMOUNT) {
      console.log(`Payout amount ${totalAmount} below minimum for ${business.business_name}`);
      return;
    }
    
    // Create PayMongo payout
    const payoutData = {
      data: {
        attributes: {
          amount: Math.round(totalAmount * 100), // centavos
          currency: 'PHP',
          destination: {
            type: business.payout_method === 'gcash' ? 'gcash' : 'bank_account',
            recipient_id: business.paymongo_recipient_id
          },
          description: `Payout for ${business.business_name} - ${eligibleTransactions.length} transactions`,
          statement_descriptor: 'CityVenture'
        }
      }
    };
    
    const payoutResponse = await axios.post(
      `${PAYMONGO_BASE_URL}/payouts`,
      payoutData,
      {
        headers: {
          'Authorization': `Basic ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const payout = payoutResponse.data.data;
    
    // Save payout record
    const payoutId = uuidv4();
    const transactionIds = eligibleTransactions.map(t => t.id);
    
    await connection.query(`
      INSERT INTO business_payouts (
        id, business_id, paymongo_payout_id, paymongo_recipient_id,
        amount, currency, payout_method, status,
        scheduled_payout_date, transaction_ids, transaction_count,
        description, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'processing', CURDATE(), ?, ?, ?, NOW())
    `, [
      payoutId,
      business.business_id,
      payout.id,
      business.paymongo_recipient_id,
      totalAmount,
      'PHP',
      business.payout_method,
      JSON.stringify(transactionIds),
      eligibleTransactions.length,
      `Automated payout - ${eligibleTransactions.length} transactions`
    ]);
    
    await connection.commit();
    
    console.log(`✅ Created payout ${payout.id} for ${business.business_name}: ₱${totalAmount.toFixed(2)}`);
    
  } catch (error) {
    await connection.rollback();
    console.error(`❌ Error processing payout for ${business.business_name}:`, error.response?.data || error);
  } finally {
    connection.release();
  }
}

// Run this with cron job
// Schedule: Every day at 2:00 AM
if (process.env.NODE_ENV === 'production') {
  const cron = require('node-cron');
  cron.schedule('0 2 * * *', processBusinessPayouts);
}
```

### 4. Routes Setup

**File: `naga-venture-backend/routes/paymentRoutes.js`**

```javascript
import express from 'express';
import * as paymentIntentController from '../controller/paymentIntentController.js';
import * as webhookController from '../controller/webhookController.js';

const router = express.Router();

// Payment Intents
router.post('/payment-intent', paymentIntentController.createPaymentIntent);
router.get('/payment-intent/:payment_intent_id', paymentIntentController.getPaymentIntentStatus);

// Webhooks (no auth middleware - PayMongo verifies via signature)
router.post('/webhook/paymongo', webhookController.handlePayMongoWebhook);

export default router;
```

### 5. Mobile App Integration

**Example: React Native Payment Flow**

```typescript
// PaymentScreen.tsx
import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

export default function PaymentScreen({ route, navigation }) {
  const { orderId, serviceBookingId } = route.params;
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);

  const initiatePayment = async () => {
    setLoading(true);
    
    try {
      // Call your backend to create payment intent
      const response = await fetch('https://your-api.com/api/payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          order_id: orderId,
          service_booking_id: serviceBookingId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Open PayMongo checkout page
        const checkoutUrl = `https://api.paymongo.com/v1/checkout_sessions/${data.client_key}`;
        setPaymentUrl(checkoutUrl);
      } else {
        Alert.alert('Error', 'Failed to create payment');
      }
      
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewNavigationChange = (navState) => {
    // Check for success/failure URLs
    if (navState.url.includes('payment-success')) {
      Alert.alert('Success', 'Payment completed!');
      navigation.navigate('OrderConfirmation', { orderId });
    } else if (navState.url.includes('payment-failed')) {
      Alert.alert('Failed', 'Payment was not successful');
      navigation.goBack();
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (paymentUrl) {
    return (
      <WebView
        source={{ uri: paymentUrl }}
        onNavigationStateChange={handleWebViewNavigationChange}
      />
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Complete Payment</Text>
      <Button title="Pay Now" onPress={initiatePayment} />
    </View>
  );
}
```

---

## 📊 Summary & Next Steps

### Recommendation: **Hybrid Escrow System**

**Pros:**
- ✅ Customer protection (refunds)
- ✅ Dispute resolution capability
- ✅ Fast payouts (24-72h, not immediate but reasonable)
- ✅ Platform revenue through fees
- ✅ Compliance with payment regulations

**Cons:**
- 🟡 Requires wallet management
- 🟡 More complex than direct
- 🟡 Businesses wait 1-3 days for money

### Implementation Checklist

#### Phase 1: Setup (Week 1)
- [ ] Create PayMongo test account
- [ ] Add environment variables
- [ ] Create database migrations (3 new tables)
- [ ] Set up webhook endpoint
- [ ] Install dependencies

#### Phase 2: Customer Payment (Week 2)
- [ ] Implement payment intent creation
- [ ] Add payment flow to order/booking creation
- [ ] Build webhook handler
- [ ] Update order/booking status on payment
- [ ] Test with GCash/Maya sandbox

#### Phase 3: Business Payout (Week 3)
- [ ] Build payout settings UI (mobile app)
- [ ] Create PayMongo recipient API
- [ ] Implement automated payout job
- [ ] Add payout history dashboard
- [ ] Test payout flow in sandbox

#### Phase 4: Production (Week 4)
- [ ] Complete PayMongo KYC verification
- [ ] Switch to live API keys
- [ ] Set up production webhooks
- [ ] Test with real small transactions
- [ ] Monitor and fix issues
- [ ] Add refund functionality
- [ ] Build admin dashboard for monitoring

### Estimated Costs

**PayMongo Fees:**
- Cards: 3.5% + ₱15 per transaction
- GCash/Maya: 2.5% per transaction
- Payouts: ₱15 per payout

**Your Platform Fee (Optional):**
- Suggested: 2-5% per transaction
- Example: ₱1000 order = ₱20-50 platform fee

---

## 📞 Support Resources

- **PayMongo Documentation**: https://developers.paymongo.com/docs
- **PayMongo Dashboard**: https://dashboard.paymongo.com
- **PayMongo Support**: support@paymongo.com
- **API Reference**: https://developers.paymongo.com/reference

---

**Last Updated:** October 2, 2025  
**Version:** 1.0  
**Author:** GitHub Copilot for City Venture Project
