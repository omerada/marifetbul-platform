# Order & Payment Checkout System - Complete Integration Sprint

**Sprint:** Order Management & Payment Checkout Complete Integration  
**Duration:** 2 Weeks (10 Working Days)  
**Priority:** CRITICAL (P0) - Core Business Function  
**Created:** October 25, 2025  
**Status:** Ready to Start  
**Type:** Integration Sprint (Following Messaging, Review & Wallet Pattern)

---

## 📋 Executive Summary

Bu sprint, Marifet platformundaki **Order (Sipariş) ve Payment Checkout (Ödeme) sisteminin tam entegrasyonunu** hedeflemektedir. Backend %100 production-ready ve tam özellikli durumda. Frontend'de bazı component'ler mevcut ancak **kritik kullanıcı akışları eksik veya yarım kalmış**. Bu sprint, order lifecycle management ve payment checkout flow'unu end-to-end tamamlayacaktır.

### 🔴 KRİTİK TESPİTLER

**Backend:** ✅ **TAMAMEN PRODUCTION-READY**

- OrderService, OrderStatusService, OrderPaymentOrchestrator fully implemented
- PaymentFacadeService, PaymentProcessingService tam çalışıyor
- Escrow system, refund mechanism hazır
- Stripe integration production-ready
- 10+ order status transition implemented

**Frontend Components:** ⚠️ **KISMEN MEVCUT**

- Order list pages exist (freelancer/employer)
- DeliverOrderModal, DisputeModal exists
- OrderDetail pages partial

**Integration:** ❌ **KRİTİK EKSİKLER**

1. **Package Purchase Flow EKSIK** - Paket satın alma checkout sayfası yok
2. **Payment Checkout UI EKSIK** - Stripe Elements entegrasyonu yok
3. **Order Creation from Job Proposal** - Proposal kabul → Order oluşumu eksik
4. **Payment Confirmation Flow** - Webhook callback sayfası eksik
5. **Escrow Management UI** - Freelancer/Employer escrow gösterimi yok
6. **Refund Request Flow** - Müşteri geri ödeme talep UI'ı yok

### 💡 Sprint Hedefi

**"Kullanıcı bir paketi sepete ekleyip ödemeyi tamamlayana kadar tüm akışı sorunsuz tamamlayabilmeli"**

---

## 🏗️ System Architecture Analysis

### Backend Architecture - PRODUCTION READY ✅

#### 1. Order Service Layer (Clean Architecture)

```java
OrderService
├── createOrder(CreateOrderRequest, userId)          ✅ CRUD Operations
├── updateOrder(orderId, UpdateOrderRequest, userId) ✅ Full validation
├── cancelOrder(orderId, userId)                     ✅ Cancel with refund
├── getOrder(orderId)                                ✅ Fetch operations
├── getOrdersByBuyer(buyerId, pageable)              ✅ Buyer orders
├── getOrdersBySeller(sellerId, pageable)            ✅ Seller orders
├── getOrdersByPackage(packageId, pageable)          ✅ Package orders
└── getOrderHistory(userId, filters, pageable)       ✅ History with filters

OrderStatusService (Status Transition Management)
├── confirmPayment(orderId, paymentId)               ✅ PENDING_PAYMENT → PAID
├── acceptOrder(orderId, userId)                     ✅ PAID → IN_PROGRESS (escrow hold)
├── deliverOrder(orderId, userId, deliveryProof)     ✅ IN_PROGRESS → DELIVERED
├── completeOrder(orderId, userId)                   ✅ DELIVERED → COMPLETED (escrow release)
├── cancelOrder(orderId, userId, reason)             ✅ ANY → CANCELLED (refund)
├── rejectOrder(orderId, userId, reason)             ✅ DELIVERED → REJECTED (dispute)
└── disputeOrder(orderId, userId, reason)            ✅ ANY → DISPUTED

OrderPaymentOrchestrator (Payment-Order Integration)
├── holdPaymentInEscrow(payment)                     ✅ Lock funds on accept
├── releasePaymentFromEscrow(paymentId)              ✅ Transfer on complete
├── refundFromEscrow(paymentId)                      ✅ Return on cancel
└── All operations with proper logging                ✅
```

#### 2. Payment Service Layer

```java
PaymentFacadeService (Main Service)
├── createPaymentIntent(request)                     ✅ Stripe integration
├── confirmPaymentIntent(intentId)                   ✅ Manual confirmation
├── processPayment(payment)                          ✅ Process logic
├── chargeOrder(orderId, paymentMethodId)            ✅ Legacy support
├── refundPayment(paymentId, amount, reason)         ✅ Partial/full refund
├── getPayment(paymentId)                            ✅ Query operations
├── getPaymentHistory(userId, pageable)              ✅ User history
├── getPaymentsByOrder(orderId)                      ✅ Order payments
└── handleStripeWebhook(payload, signature)          ✅ Webhook handler

PaymentProcessingService (Processing Logic)
├── createPaymentIntent()                            ✅ Stripe PaymentIntent
├── confirmPaymentIntent()                           ✅ Confirmation
├── calculatePlatformFee(amount)                     ✅ Fee calculation
├── calculateNetAmount(amount)                       ✅ Net amount
└── Payment status updates                            ✅

PaymentQueryService (Query Operations)
├── getPayment(paymentId)                            ✅
├── getPaymentHistory(userId)                        ✅
├── getPaymentsByOrder(orderId)                      ✅
└── Query optimization                                ✅

PaymentWebhookService (Stripe Webhooks)
├── handleStripeWebhook(payload, signature)          ✅
├── Signature verification                           ✅
├── Event processing (payment_intent.succeeded)      ✅
└── Auto order status update on payment success      ✅
```

#### 3. Database Schema ✅

```sql
-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,

    -- Parties
    buyer_id UUID REFERENCES users(id),
    seller_id UUID REFERENCES users(id),
    package_id UUID REFERENCES packages(id),

    -- Financial
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    platform_fee DECIMAL(10,2),
    seller_earnings DECIMAL(10,2),

    -- Status & Timeline
    status order_status NOT NULL DEFAULT 'PENDING_PAYMENT',
    created_at TIMESTAMP DEFAULT NOW(),
    accepted_at TIMESTAMP,
    delivered_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,

    -- Delivery
    delivery_date TIMESTAMP NOT NULL,
    delivery_proof JSONB,

    -- Custom orders
    custom_order_details JSONB,
    requirements TEXT,
    notes TEXT,

    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE order_status AS ENUM (
    'PENDING_PAYMENT',  -- Ödeme bekleniyor
    'PAID',            -- Ödeme yapıldı, freelancer kabul bekliyor
    'IN_PROGRESS',     -- İş devam ediyor
    'DELIVERED',       -- Teslim edildi, müşteri onay bekliyor
    'COMPLETED',       -- Tamamlandı, ödeme freelancer'a transfer edildi
    'CANCELLED',       // İptal edildi, para iade edildi
    'DISPUTED',        -- Anlaşmazlık
    'REJECTED'         -- Teslim reddedildi
);

-- Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    order_id UUID REFERENCES orders(id),

    -- Parties
    payer_id UUID REFERENCES users(id),
    payee_id UUID REFERENCES users(id),

    -- Amounts
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    platform_fee DECIMAL(10,2),
    net_amount DECIMAL(10,2),

    -- Stripe Integration
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    payment_method payment_method_type,

    -- Status
    status payment_status NOT NULL DEFAULT 'PENDING',
    description TEXT,
    failure_reason TEXT,

    -- Refund
    refunded_amount DECIMAL(10,2) DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    failed_at TIMESTAMP
);

CREATE TYPE payment_status AS ENUM (
    'PENDING',      -- Ödeme başlatıldı
    'PROCESSING',   -- İşleniyor
    'COMPLETED',    -- Tamamlandı
    'FAILED',       -- Başarısız
    'REFUNDED',     // Geri ödendi
    'PARTIALLY_REFUNDED',  -- Kısmi iade
    'CANCELLED'     -- İptal edildi
);

CREATE TYPE payment_method_type AS ENUM (
    'CREDIT_CARD',
    'BANK_TRANSFER',
    'WALLET'
);
```

#### 4. API Endpoints - ALL WORKING ✅

```
Order Management
POST   /api/v1/orders                          Create order
GET    /api/v1/orders/{id}                     Get order by ID
PUT    /api/v1/orders/{id}                     Update order
DELETE /api/v1/orders/{id}                     Cancel order

GET    /api/v1/orders/me                       Get my orders (buyer or seller)
GET    /api/v1/orders/buyer                    Get orders as buyer
GET    /api/v1/orders/seller                   Get orders as seller
GET    /api/v1/packages/{id}/orders            Get orders for package

Order Status Transitions
POST   /api/v1/orders/{id}/accept              Accept order (seller)
POST   /api/v1/orders/{id}/deliver             Deliver order (seller)
POST   /api/v1/orders/{id}/complete            Complete order (buyer)
POST   /api/v1/orders/{id}/cancel              Cancel order
POST   /api/v1/orders/{id}/dispute             Open dispute
POST   /api/v1/orders/{id}/reject              Reject delivery (buyer)

Payment Operations
POST   /api/v1/payments/intent                 Create payment intent (Stripe)
POST   /api/v1/payments/{id}/confirm           Confirm payment
GET    /api/v1/payments/{id}                   Get payment
GET    /api/v1/payments/history                Get payment history
POST   /api/v1/payments/{id}/refund            Request refund

POST   /api/v1/payments/webhook                Stripe webhook handler
```

### Frontend Architecture - PARTIAL ❌

#### Existing Pages ⚠️

```typescript
// Order List Pages - EXISTS
app/dashboard/freelancer/orders/page.tsx         ✅ Freelancer orders list
app/dashboard/employer/orders/page.tsx           ✅ Employer orders list

// Order Detail Pages - PARTIAL
app/dashboard/freelancer/orders/[id]/page.tsx    ⚠️ Basic detail
app/dashboard/employer/orders/[id]/page.tsx      ⚠️ Basic detail
app/dashboard/employer/orders/[id]/review/page.tsx  ✅ Review after completion

// MISSING CRITICAL PAGES ❌
app/checkout/[packageId]/page.tsx                ❌ DOES NOT EXIST
app/checkout/success/page.tsx                    ❌ DOES NOT EXIST
app/checkout/cancel/page.tsx                     ❌ DOES NOT EXIST
app/orders/[id]/payment/page.tsx                 ❌ DOES NOT EXIST
```

#### Existing Components ⚠️

```typescript
// Order Components
components/domains/orders/
├── DeliverOrderModal.tsx                        ✅ Delivery submission
├── DisputeModal.tsx                             ✅ Dispute creation
├── OrderCard.tsx                                ⚠️ Basic card
├── OrderDetail.tsx                              ⚠️ Partial detail
└── OrderStatusBadge.tsx                         ✅ Status display

// MISSING CRITICAL COMPONENTS ❌
components/checkout/
├── CheckoutForm.tsx                             ❌ DOES NOT EXIST
├── PaymentMethodSelector.tsx                    ❌ DOES NOT EXIST
├── OrderSummary.tsx                             ❌ DOES NOT EXIST
├── StripeCheckout.tsx                           ❌ DOES NOT EXIST
└── PaymentConfirmation.tsx                      ❌ DOES NOT EXIST

components/domains/orders/
├── OrderTimeline.tsx                            ❌ DOES NOT EXIST
├── EscrowStatus.tsx                             ❌ DOES NOT EXIST
├── RefundRequestModal.tsx                       ❌ DOES NOT EXIST
└── PaymentHistory.tsx                           ❌ DOES NOT EXIST
```

#### Existing Hooks ⚠️

```typescript
// Order Hooks - PARTIAL
hooks/business/
├── useOrder.ts                                  ⚠️ Basic hook exists
├── useOrders.ts                                 ⚠️ List hook exists
└── useOrderStatus.ts                            ❌ DOES NOT EXIST

// Payment Hooks - MISSING ❌
hooks/business/payment/
├── usePayment.ts                                ❌ DOES NOT EXIST
├── useStripeCheckout.ts                         ❌ DOES NOT EXIST
├── usePaymentIntent.ts                          ❌ DOES NOT EXIST
└── useRefund.ts                                 ❌ DOES NOT EXIST
```

---

## 🎯 User Flow Analysis

### Flow 1: Package Purchase & Checkout (CRITICAL - MISSING ❌)

**Current State:** Completely missing checkout flow

**Required Flow:**

```
1. User clicks "Buy Now" on package detail
   → Frontend: Navigate to /checkout/[packageId]
   → Backend: N/A (page doesn't exist)

2. Checkout page loads
   → Frontend: ❌ Page missing
   → Should display: Order summary, price breakdown, delivery date

3. User enters payment method
   → Frontend: ❌ Stripe Elements integration missing
   → Backend: POST /api/v1/payments/intent (exists ✅)

4. User confirms payment
   → Frontend: ❌ Payment confirmation flow missing
   → Backend: Stripe webhook → confirmPayment (exists ✅)

5. Redirect to success page
   → Frontend: ❌ Success page missing
   → Should show: Order number, next steps, seller info
```

**Backend Ready:** ✅ 100%  
**Frontend Ready:** ❌ 0%  
**Priority:** **CRITICAL P0**

---

### Flow 2: Order Acceptance & Escrow (PARTIAL ⚠️)

**Current State:** Backend complete, frontend basic

**Required Flow:**

```
1. Freelancer receives order notification
   → Frontend: ✅ Notification exists
   → Backend: ✅ Event publishing works

2. Freelancer views order detail
   → Frontend: ⚠️ Basic detail exists, missing escrow info
   → Backend: GET /api/v1/orders/{id} ✅

3. Freelancer clicks "Accept Order"
   → Frontend: ⚠️ Button exists but no escrow explanation
   → Backend: POST /api/v1/orders/{id}/accept ✅
   → Backend: Escrow hold triggered ✅

4. Order status → IN_PROGRESS
   → Frontend: ⚠️ Status badge updates but no timeline
   → Backend: ✅ Status transition complete
```

**Backend Ready:** ✅ 100%  
**Frontend Ready:** ⚠️ 40% (needs escrow UI, timeline)  
**Priority:** **HIGH P1**

---

### Flow 3: Order Delivery & Completion (PARTIAL ⚠️)

**Current State:** Delivery modal exists, completion flow partial

**Required Flow:**

```
1. Freelancer delivers work
   → Frontend: ✅ DeliverOrderModal exists
   → Backend: POST /api/v1/orders/{id}/deliver ✅

2. Buyer receives delivery notification
   → Frontend: ✅ Notification works
   → Backend: ✅ Event publishing works

3. Buyer reviews delivery
   → Frontend: ⚠️ Delivery preview missing
   → Backend: GET /api/v1/orders/{id} ✅

4. Buyer clicks "Complete Order"
   → Frontend: ⚠️ Button exists but no escrow release info
   → Backend: POST /api/v1/orders/{id}/complete ✅
   → Backend: Escrow release triggered ✅

5. Freelancer receives payment
   → Frontend: ❌ Payment receipt notification missing
   → Backend: ✅ Wallet transaction created
```

**Backend Ready:** ✅ 100%  
**Frontend Ready:** ⚠️ 50% (needs delivery preview, escrow release UI)  
**Priority:** **HIGH P1**

---

### Flow 4: Refund & Cancellation (PARTIAL ⚠️)

**Current State:** Backend complete, frontend modal exists

**Required Flow:**

```
1. User requests cancellation
   → Frontend: ⚠️ Cancel button exists, no refund explanation
   → Backend: POST /api/v1/orders/{id}/cancel ✅

2. System calculates refund amount
   → Frontend: ❌ Refund breakdown UI missing
   → Backend: ✅ Refund calculation logic exists

3. Refund processed
   → Frontend: ❌ Refund confirmation missing
   → Backend: refundFromEscrow() ✅

4. User receives refund notification
   → Frontend: ⚠️ Basic notification exists
   → Backend: ✅ Event publishing works
```

**Backend Ready:** ✅ 100%  
**Frontend Ready:** ⚠️ 30% (needs refund UI, confirmation)  
**Priority:** **MEDIUM P2**

---

### Flow 5: Dispute Resolution (EXISTS ✅)

**Current State:** Dispute modal exists, basic flow works

**Required Flow:**

```
1. User opens dispute
   → Frontend: ✅ DisputeModal exists
   → Backend: POST /api/v1/orders/{id}/dispute ✅

2. Dispute form submitted
   → Frontend: ✅ Form works
   → Backend: ✅ Dispute created

3. Admin review
   → Frontend: ⚠️ Admin dispute panel basic
   → Backend: ✅ Admin APIs exist
```

**Backend Ready:** ✅ 100%  
**Frontend Ready:** ✅ 70% (needs admin panel improvement)  
**Priority:** **LOW P3**

---

## 🔥 Critical Missing Features

### 1. Payment Checkout Page ❌ (CRITICAL P0)

**File:** `app/checkout/[packageId]/page.tsx` - **DOES NOT EXIST**

**Required Features:**

- [ ] Package information display
- [ ] Price breakdown (subtotal, platform fee, total)
- [ ] Delivery date selector
- [ ] Requirements/notes input
- [ ] Payment method selection
- [ ] Stripe Elements integration (CardElement)
- [ ] Payment processing loader
- [ ] Error handling (payment declined, etc.)

**Backend APIs to Use:**

```typescript
// Create order
POST /api/v1/orders
{
  packageId: string,
  buyerId: string,
  deliveryDate: string,
  requirements: string,
  notes: string
}

// Create payment intent
POST /api/v1/payments/intent
{
  orderId: string,
  amount: number,
  currency: string
}
```

---

### 2. Stripe Checkout Integration ❌ (CRITICAL P0)

**File:** `components/checkout/StripeCheckout.tsx` - **DOES NOT EXIST**

**Required Features:**

- [ ] Stripe Elements setup (@stripe/stripe-js)
- [ ] CardElement component
- [ ] Payment intent creation
- [ ] Payment confirmation
- [ ] 3D Secure handling
- [ ] Error states (card declined, insufficient funds)
- [ ] Loading states
- [ ] Success callback

**Implementation:**

```typescript
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

interface StripeCheckoutProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntent: string) => void;
  onError: (error: string) => void;
}

export function StripeCheckout({ clientSecret, amount, onSuccess, onError }: StripeCheckoutProps) {
  // Implementation
}
```

---

### 3. Order Timeline Component ❌ (HIGH P1)

**File:** `components/domains/orders/OrderTimeline.tsx` - **DOES NOT EXIST**

**Required Features:**

- [ ] Visual timeline display
- [ ] Order status milestones
- [ ] Timestamps for each status
- [ ] Current status highlight
- [ ] Next action indicator
- [ ] Escrow status integration

**Example:**

```
○ Order Created          Dec 15, 2024 10:30
↓
● Payment Confirmed      Dec 15, 2024 10:32
↓  💰 Funds in Escrow
● Accepted by Seller     Dec 15, 2024 11:00
↓
○ In Progress            (Current)
↓
○ Delivered              (Pending)
↓
○ Completed              (Pending)
   💸 Funds Released to Seller
```

---

### 4. Escrow Status Display ❌ (HIGH P1)

**File:** `components/domains/orders/EscrowStatus.tsx` - **DOES NOT EXIST**

**Required Features:**

- [ ] Current escrow state display
- [ ] Amount in escrow
- [ ] Escrow release conditions
- [ ] Timeline until auto-release (if applicable)
- [ ] Buyer/seller perspective differences

**For Buyer:**

```
Your payment is secure
✓ $500 held in escrow
✓ Released when you approve delivery
✓ Refunded if order cancelled
```

**For Seller:**

```
Payment secured
● $500 waiting in escrow
● Complete delivery to receive payment
● Funds released after buyer approval
```

---

### 5. Payment History Component ❌ (MEDIUM P2)

**File:** `components/domains/orders/PaymentHistory.tsx` - **DOES NOT EXIST**

**Required Features:**

- [ ] List all payments for order
- [ ] Payment status badges
- [ ] Amount breakdown
- [ ] Refund information
- [ ] Download receipt button
- [ ] Stripe transaction link (for debugging)

---

### 6. Refund Request Modal ❌ (MEDIUM P2)

**File:** `components/domains/orders/RefundRequestModal.tsx` - **DOES NOT EXIST**

**Required Features:**

- [ ] Refund reason selection
- [ ] Refund amount calculation
- [ ] Platform fee policy explanation
- [ ] Refund processing time info
- [ ] Confirmation step

---

## 📋 Sprint Tasks Breakdown

### Week 1: Critical Checkout Flow (Days 1-5)

#### Day 1: Payment Infrastructure Setup

- [ ] Install Stripe dependencies (`@stripe/stripe-js`, `@stripe/react-stripe-js`)
- [ ] Create payment hook infrastructure
  - [ ] `hooks/business/payment/usePaymentIntent.ts`
  - [ ] `hooks/business/payment/useStripeCheckout.ts`
- [ ] Create payment types
  - [ ] `types/business/features/payment.ts`
- [ ] Setup Stripe Elements wrapper
  - [ ] `components/checkout/StripeProvider.tsx`

#### Day 2: Checkout Page - Part 1

- [ ] Create checkout page
  - [ ] `app/checkout/[packageId]/page.tsx`
- [ ] Create order summary component
  - [ ] `components/checkout/OrderSummary.tsx`
  - [ ] Package info display
  - [ ] Price breakdown
  - [ ] Delivery date selector
- [ ] Requirements input component
  - [ ] `components/checkout/RequirementsForm.tsx`

#### Day 3: Checkout Page - Part 2

- [ ] Stripe checkout component
  - [ ] `components/checkout/StripeCheckout.tsx`
  - [ ] CardElement integration
  - [ ] Payment intent creation
  - [ ] Error handling
- [ ] Payment method selector
  - [ ] `components/checkout/PaymentMethodSelector.tsx`
  - [ ] Credit card
  - [ ] Wallet (future)

#### Day 4: Payment Confirmation Flow

- [ ] Success page
  - [ ] `app/checkout/success/page.tsx`
  - [ ] Order confirmation display
  - [ ] Next steps guide
  - [ ] Download receipt button
- [ ] Cancel page
  - [ ] `app/checkout/cancel/page.tsx`
  - [ ] Cancellation reason
  - [ ] Try again button
- [ ] Webhook callback handling
  - [ ] Update order status on payment success
  - [ ] Send notifications

#### Day 5: Testing & Refinement

- [ ] Test complete checkout flow
- [ ] Test Stripe test cards
- [ ] Test error scenarios
- [ ] Test webhook integration
- [ ] Fix bugs found during testing

### Week 2: Order Management Enhancement (Days 6-10)

#### Day 6: Order Timeline & Escrow UI

- [ ] Order timeline component
  - [ ] `components/domains/orders/OrderTimeline.tsx`
  - [ ] Visual timeline display
  - [ ] Status milestones
  - [ ] Timestamps
- [ ] Escrow status component
  - [ ] `components/domains/orders/EscrowStatus.tsx`
  - [ ] Amount display
  - [ ] Release conditions
  - [ ] Buyer/seller perspectives

#### Day 7: Order Detail Enhancement

- [ ] Enhance order detail pages
  - [ ] Add timeline to detail pages
  - [ ] Add escrow status display
  - [ ] Add payment history section
  - [ ] Add action buttons based on status
- [ ] Create delivery preview
  - [ ] `components/domains/orders/DeliveryPreview.tsx`
  - [ ] Uploaded files display
  - [ ] Delivery notes

#### Day 8: Payment History & Refund

- [ ] Payment history component
  - [ ] `components/domains/orders/PaymentHistory.tsx`
  - [ ] Payment list
  - [ ] Status badges
  - [ ] Download receipts
- [ ] Refund request modal
  - [ ] `components/domains/orders/RefundRequestModal.tsx`
  - [ ] Refund form
  - [ ] Amount calculation
  - [ ] Confirmation

#### Day 9: Order Status Hooks

- [ ] Order status hook
  - [ ] `hooks/business/useOrderStatus.ts`
  - [ ] Accept order
  - [ ] Deliver order
  - [ ] Complete order
  - [ ] Cancel order
  - [ ] Dispute order
- [ ] Refund hook
  - [ ] `hooks/business/payment/useRefund.ts`
  - [ ] Request refund
  - [ ] Get refund status

#### Day 10: Final Testing & Documentation

- [ ] End-to-end testing
  - [ ] Complete purchase flow
  - [ ] Order acceptance
  - [ ] Delivery submission
  - [ ] Order completion
  - [ ] Cancellation & refund
- [ ] Documentation
  - [ ] Update component documentation
  - [ ] Create user guides
  - [ ] API integration guide
- [ ] Performance optimization
  - [ ] Code splitting
  - [ ] Loading states
  - [ ] Error boundaries

---

## 🎨 UI/UX Specifications

### Checkout Page Layout

```
+---------------------------------------------------+
|  MarifetBul                              [Cart]   |
+---------------------------------------------------+
|                                                   |
|  +------------------+  +------------------------+ |
|  | Order Summary    |  | Payment Method         | |
|  |                  |  |                        | |
|  | Package: ...     |  | ○ Credit Card          | |
|  | Price: ...       |  | ○ Wallet (if balance)  | |
|  | Platform Fee: .. |  |                        | |
|  | Total: ...       |  | [Card Number]          | |
|  |                  |  | [MM/YY]  [CVC]         | |
|  | Delivery Date:   |  |                        | |
|  | [Date Picker]    |  | [Complete Purchase]    | |
|  |                  |  |                        | |
|  | Requirements:    |  | 🔒 Secure Payment      | |
|  | [Text Area]      |  | Powered by Stripe      | |
|  +------------------+  +------------------------+ |
|                                                   |
+---------------------------------------------------+
```

### Order Timeline Visual

```
Timeline (Vertical)
-----------------
● Order Created         Dec 15, 10:30
  Order #ORD-12345

● Payment Confirmed    Dec 15, 10:32
  💰 $500 in Escrow
  Stripe: pi_xxx...

● Accepted by Seller   Dec 15, 11:00
  Estimated delivery: Dec 20

○ In Progress          (Current)
  2 days remaining

○ Delivered            (Pending)
  Awaiting seller delivery

○ Completed            (Pending)
  Awaiting buyer approval
  💸 Funds released to seller
```

### Escrow Status Cards

**For Buyer:**

```
+--------------------------------+
| Your Payment is Secure         |
|                                |
| ✓ $500.00 held in escrow       |
| ✓ Released when you approve    |
| ✓ Refunded if cancelled        |
|                                |
| Next Step: Wait for delivery   |
+--------------------------------+
```

**For Seller:**

```
+--------------------------------+
| Payment Secured                |
|                                |
| ● $500.00 waiting in escrow    |
| ● Complete delivery to receive |
| ● Auto-released in 3 days      |
|   after delivery approval      |
|                                |
| Next Step: Deliver work        |
+--------------------------------+
```

---

## 🔗 API Integration Guide

### 1. Create Order & Payment Intent

```typescript
// Step 1: Create order
const orderResponse = await fetch('/api/v1/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    packageId: 'pkg-uuid',
    deliveryDate: '2024-12-20T00:00:00Z',
    requirements: 'Custom requirements...',
    notes: 'Additional notes...'
  })
});

const { data: order } = await orderResponse.json();

// Step 2: Create payment intent
const paymentResponse = await fetch('/api/v1/payments/intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    orderId: order.id,
    amount: order.amount,
    currency: 'TRY'
  })
});

const { data: paymentIntent } = await paymentResponse.json();
// Returns: { paymentId, clientSecret, amount }
```

### 2. Confirm Payment with Stripe

```typescript
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const handlePayment = async () => {
  const stripe = useStripe();
  const elements = useElements();

  if (!stripe || !elements) return;

  const cardElement = elements.getElement(CardElement);

  const { error, paymentIntent } = await stripe.confirmCardPayment(
    clientSecret,
    {
      payment_method: {
        card: cardElement!,
        billing_details: {
          name: 'Customer Name',
          email: 'customer@email.com'
        }
      }
    }
  );

  if (error) {
    // Handle error
    console.error(error.message);
  } else if (paymentIntent.status === 'succeeded') {
    // Payment successful
    // Backend webhook will update order status
    router.push(`/checkout/success?order=${orderId}`);
  }
};
```

### 3. Order Status Transitions

```typescript
// Accept order (seller)
POST /api/v1/orders/${orderId}/accept
// Response: Order with status IN_PROGRESS
// Backend: Triggers escrow hold

// Deliver order (seller)
POST /api/v1/orders/${orderId}/deliver
Body: {
  deliveryProof: {
    files: ['file-url-1', 'file-url-2'],
    notes: 'Delivery notes...'
  }
}
// Response: Order with status DELIVERED

// Complete order (buyer)
POST /api/v1/orders/${orderId}/complete
// Response: Order with status COMPLETED
// Backend: Triggers escrow release

// Cancel order
POST /api/v1/orders/${orderId}/cancel
Body: { reason: 'Cancellation reason' }
// Response: Order with status CANCELLED
// Backend: Triggers refund
```

---

## 🧪 Testing Checklist

### Stripe Test Cards

```
Success: 4242 4242 4242 4242
Declined: 4000 0000 0000 0002
Insufficient Funds: 4000 0000 0000 9995
3D Secure: 4000 0027 6000 3184
```

### Test Scenarios

#### Happy Path

- [ ] User browses package
- [ ] User clicks "Buy Now"
- [ ] Checkout page loads with correct package info
- [ ] User enters payment details
- [ ] Payment processes successfully
- [ ] Webhook updates order status to PAID
- [ ] User redirected to success page
- [ ] Seller receives notification
- [ ] Seller accepts order (escrow hold)
- [ ] Seller delivers work
- [ ] Buyer approves delivery
- [ ] Order completed (escrow release)
- [ ] Seller receives payment in wallet

#### Error Scenarios

- [ ] Payment declined → Show error, allow retry
- [ ] Insufficient funds → Show error, suggest different card
- [ ] Network error during payment → Show error, don't double charge
- [ ] Webhook failure → Manual admin intervention needed
- [ ] Order cancellation → Refund processed
- [ ] Dispute opened → Admin notified

#### Edge Cases

- [ ] User closes checkout page mid-payment
- [ ] User refreshes after successful payment
- [ ] Duplicate payment attempts
- [ ] Expired payment intent
- [ ] Order already paid
- [ ] Seller account suspended during order
- [ ] Buyer account suspended during order

---

## 📊 Success Metrics

### Technical Metrics

- [ ] Checkout conversion rate > 80%
- [ ] Payment success rate > 95%
- [ ] Average checkout time < 2 minutes
- [ ] Payment processing time < 3 seconds
- [ ] Webhook processing time < 1 second
- [ ] Page load time < 2 seconds
- [ ] Zero TypeScript errors
- [ ] Test coverage > 80%

### Business Metrics

- [ ] Order completion rate > 90%
- [ ] Dispute rate < 5%
- [ ] Refund rate < 10%
- [ ] Customer satisfaction score > 4.5/5
- [ ] Time to first payment < 24 hours after launch

---

## 🚀 Deployment Plan

### Phase 1: Checkout Flow (Week 1)

1. Deploy payment infrastructure
2. Deploy checkout page (feature flag: OFF)
3. Test in staging with Stripe test mode
4. Enable for internal team testing
5. Collect feedback and fix bugs
6. Enable for 10% of users (A/B test)
7. Monitor metrics for 2 days
8. Full rollout if metrics meet targets

### Phase 2: Order Management (Week 2)

1. Deploy enhanced order pages
2. Deploy timeline and escrow components
3. Test all order status transitions
4. Enable for internal team
5. Enable for all users
6. Monitor and optimize

---

## 📝 Documentation Deliverables

1. **User Guides**
   - [ ] How to purchase a package
   - [ ] Understanding escrow
   - [ ] Order lifecycle explained
   - [ ] How to request a refund

2. **Developer Guides**
   - [ ] Stripe integration guide
   - [ ] Webhook setup guide
   - [ ] Order status flow diagram
   - [ ] Payment testing guide

3. **API Documentation**
   - [ ] Order API reference
   - [ ] Payment API reference
   - [ ] Webhook events reference

---

## 🎯 Sprint Completion Criteria

### Must Have (P0)

- ✅ Checkout page functional
- ✅ Stripe payment integration working
- ✅ Success/cancel pages implemented
- ✅ Payment webhook processing orders
- ✅ Order timeline visible
- ✅ Escrow status displayed
- ✅ All TypeScript errors resolved
- ✅ Happy path tested end-to-end

### Should Have (P1)

- ✅ Payment history component
- ✅ Enhanced order detail pages
- ✅ Delivery preview
- ✅ Mobile responsive design
- ✅ Error handling comprehensive
- ✅ Loading states polished

### Nice to Have (P2)

- ⏳ Refund request modal
- ⏳ Invoice download
- ⏳ Payment receipt emails
- ⏳ Order export to PDF

---

## 👥 Team & Roles

**Development Team:** MarifetBul Development Team  
**Sprint Duration:** 10 working days  
**Sprint Start:** TBD  
**Sprint End:** TBD

**Responsibilities:**

- Frontend Development (React, TypeScript, Stripe)
- Backend Integration (API consumption)
- Testing (Unit, Integration, E2E)
- Documentation
- Deployment

---

## 📚 Related Documentation

- [MESSAGING_SYSTEM_SPRINT.md](./MESSAGING_SYSTEM_SPRINT.md)
- [REVIEW_SYSTEM_SPRINT.md](./REVIEW_SYSTEM_SPRINT.md)
- [WALLET_SYSTEM_DOCUMENTATION.md](./WALLET_SYSTEM_DOCUMENTATION.md)
- [PROPOSAL_SYSTEM_SPRINT.md](./PROPOSAL_SYSTEM_SPRINT.md)

---

## 🔄 Version History

- **v1.0** - October 25, 2025 - Initial sprint plan created
- Sprint follows proven patterns from Messaging, Review, and Wallet sprints

---

**End of Document**
