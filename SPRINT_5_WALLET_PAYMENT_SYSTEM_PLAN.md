# 💰 SPRINT 5: Wallet & Payment System - Komple Entegrasyon

**Sprint Hedefi:** Backend'de hazır olan wallet/payment/payout sistemini frontend'e tam entegre et  
**Sprint Süresi:** 5-6 gün  
**Öncelik:** 🔴 HIGH - Production-ready için kritik  
**Durum:** 🔄 BAŞLANMAMIŞ

---

## 📊 Mevcut Durum Analizi

### ✅ Backend Tarafı (HAZIR)

**Controller'lar:**

- ✅ `PaymentController.java` - Ödeme işlemleri (intent, confirm, refund)
- ✅ `WalletController.java` - Cüzdan bakiye ve işlemler
- ✅ `PayoutController.java` - Kazanç çekme istekleri
- ✅ `PayoutAdminController.java` - Admin payout onayları
- ✅ `WebhookController.java` - Stripe/PayPal webhook handler

**Endpoint'ler (40+):**

```
POST   /api/v1/payments/intent
POST   /api/v1/payments/intent/{id}/confirm
GET    /api/v1/payments/{id}
GET    /api/v1/payments/history
POST   /api/v1/payments/{id}/refund
GET    /api/v1/payments/order/{orderId}

GET    /api/v1/wallet
GET    /api/v1/wallet/balance
GET    /api/v1/wallet/transactions

POST   /api/v1/payouts
GET    /api/v1/payouts/{id}
GET    /api/v1/payouts/history
POST   /api/v1/payouts/{id}/cancel
GET    /api/v1/payouts/eligibility

ADMIN:
GET    /api/v1/admin/payouts/pending
POST   /api/v1/admin/payouts/{id}/process
POST   /api/v1/admin/payouts/{id}/approve
POST   /api/v1/admin/payouts/{id}/reject
```

**Service Layer:**

- ✅ `WalletService` - Escrow management
- ✅ `PaymentService` - Payment intent, Stripe integration
- ✅ `PayoutService` - Payout request & processing
- ✅ `TransactionService` - Transaction history

### ❌ Frontend Tarafı (EKSİK)

**lib/api/ - API Client Katmanı:**

- ❌ `lib/api/wallet.ts` - YOK
- ❌ `lib/api/payment.ts` - YOK
- ❌ `lib/api/payout.ts` - YOK
- ✅ `lib/api/payment-methods.ts` - Var (card management)

**Components:**

- ✅ `components/dashboard/freelancer/wallet/*` - Var ama backend entegrasyonu eksik
- ✅ `components/forms/PaymentForm.tsx` - Var ama eksik
- ✅ `app/dashboard/freelancer/wallet/` - Sayfalar var ama API bağlantısı yok

**Sorun:**

- Frontend components var ama backend API'lere bağlı değil
- Mock data veya placeholder'lar kullanılıyor
- Gerçek ödeme akışı çalışmıyor

---

## 🎯 Sprint 5 Hedefleri

### 1. API Client Layer (lib/api/)

- [ ] wallet.ts - Wallet API client
- [ ] payment.ts - Payment API client
- [ ] payout.ts - Payout API client
- [ ] Zod schemas (validators.ts'e ekle)
- [ ] Error handling & validation

### 2. Component Integration

- [ ] Wallet components'leri API'ye bağla
- [ ] Payment form'u Stripe ile entegre et
- [ ] Payout request flow
- [ ] Transaction history pagination

### 3. Admin Panel

- [ ] Payout admin sayfası
- [ ] Approve/Reject flow
- [ ] Transaction monitoring

### 4. Testing & Polish

- [ ] Payment flow end-to-end test
- [ ] Wallet operations test
- [ ] Error scenarios handling

---

## 📋 Task Breakdown

### **EPIC 1: API Client Implementation** (2 gün / 16 saat)

#### Story 1.1: Wallet API Client (6h)

**Dosya:** `lib/api/wallet.ts`

```typescript
/**
 * Wallet API Client
 * Handles wallet balance, transactions, and escrow operations
 */

import { apiClient } from '@/lib/infrastructure/api/apiClient';
import { validateResponse } from './validators';

// Types
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  pendingBalance: number;
  totalBalance: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'FROZEN';
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  paymentId?: string;
  type: 'CREDIT' | 'DEBIT' | 'ESCROW_HOLD' | 'ESCROW_RELEASE' | 'PAYOUT';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  createdAt: string;
}

export interface BalanceResponse {
  availableBalance: number;
  pendingBalance: number;
  totalBalance: number;
  totalEarnings: number;
  pendingPayouts: number;
}

// API Functions
export async function getWallet(): Promise<Wallet> {
  return await apiClient.get<Wallet>('/wallet');
}

export async function getBalance(): Promise<BalanceResponse> {
  return await apiClient.get<BalanceResponse>('/wallet/balance');
}

export async function getTransactions(
  page: number = 0,
  size: number = 20
): Promise<Transaction[]> {
  return await apiClient.get<Transaction[]>(
    `/wallet/transactions?page=${page}&size=${size}`
  );
}

export async function exportTransactions(
  format: 'csv' | 'pdf' = 'csv'
): Promise<Blob> {
  return await apiClient.get<Blob>(
    `/wallet/transactions/export?format=${format}`,
    { responseType: 'blob' }
  );
}

export const walletApi = {
  getWallet,
  getBalance,
  getTransactions,
  exportTransactions,
};
```

**Tasks:**

- [ ] `T1.1.1` Wallet types tanımla (1h)
- [ ] `T1.1.2` Wallet API fonksiyonları (2h)
- [ ] `T1.1.3` Transaction API fonksiyonları (2h)
- [ ] `T1.1.4` Unit testler (1h)

---

#### Story 1.2: Payment API Client (6h)

**Dosya:** `lib/api/payment.ts`

```typescript
/**
 * Payment API Client
 * Handles payment intents, confirmations, and refunds
 */

import { apiClient } from '@/lib/infrastructure/api/apiClient';

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: 'REQUIRES_PAYMENT_METHOD' | 'REQUIRES_CONFIRMATION' | 'SUCCEEDED';
}

export interface Payment {
  id: string;
  orderId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  platformFee: number;
  netAmount: number;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
  paymentMethod: string;
  stripePaymentIntentId?: string;
  failureReason?: string;
  refundedAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  orderId: string;
  amount: number;
  currency?: string;
  paymentMethodId?: string;
}

// API Functions
export async function createPaymentIntent(
  data: CreatePaymentRequest
): Promise<PaymentIntent> {
  return await apiClient.post<PaymentIntent>('/payments/intent', data);
}

export async function confirmPaymentIntent(
  paymentIntentId: string
): Promise<PaymentIntent> {
  return await apiClient.post<PaymentIntent>(
    `/payments/intent/${paymentIntentId}/confirm`
  );
}

export async function getPayment(paymentId: string): Promise<Payment> {
  return await apiClient.get<Payment>(`/payments/${paymentId}`);
}

export async function getPaymentHistory(
  page: number = 0,
  size: number = 20
): Promise<Payment[]> {
  return await apiClient.get<Payment[]>(
    `/payments/history?page=${page}&size=${size}`
  );
}

export async function requestRefund(
  paymentId: string,
  amount?: number,
  reason?: string
): Promise<Payment> {
  return await apiClient.post<Payment>(`/payments/${paymentId}/refund`, {
    amount,
    reason,
  });
}

export async function getPaymentsByOrder(orderId: string): Promise<Payment[]> {
  return await apiClient.get<Payment[]>(`/payments/order/${orderId}`);
}

export const paymentApi = {
  createPaymentIntent,
  confirmPaymentIntent,
  getPayment,
  getPaymentHistory,
  requestRefund,
  getPaymentsByOrder,
};
```

**Tasks:**

- [ ] `T1.2.1` Payment types (1h)
- [ ] `T1.2.2` Payment intent functions (2h)
- [ ] `T1.2.3` Payment history & refund (2h)
- [ ] `T1.2.4` Unit testler (1h)

---

#### Story 1.3: Payout API Client (4h)

**Dosya:** `lib/api/payout.ts`

```typescript
/**
 * Payout API Client
 * Handles payout requests and history
 */

import { apiClient } from '@/lib/infrastructure/api/apiClient';

export interface Payout {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  method: 'BANK_TRANSFER' | 'PAYPAL' | 'STRIPE';
  bankAccountId?: string;
  paypalEmail?: string;
  processingFee: number;
  netAmount: number;
  failureReason?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePayoutRequest {
  amount: number;
  method: 'BANK_TRANSFER' | 'PAYPAL' | 'STRIPE';
  bankAccountId?: string;
  paypalEmail?: string;
}

export interface PayoutEligibility {
  eligible: boolean;
  minimumAmount: number;
  maximumAmount: number;
  availableBalance: number;
  pendingPayouts: number;
  reason?: string;
}

// API Functions
export async function createPayout(
  data: CreatePayoutRequest
): Promise<Payout> {
  return await apiClient.post<Payout>('/payouts', data);
}

export async function getPayout(payoutId: string): Promise<Payout> {
  return await apiClient.get<Payout>(`/payouts/${payoutId}`);
}

export async function getPayoutHistory(
  page: number = 0,
  size: number = 20
): Promise<Payout[]> {
  return await apiClient.get<Payout[]>(
    `/payouts/history?page=${page}&size=${size}`
  );
}

export async function getPendingPayouts(): Promise<Payout[]> {
  return await apiClient.get<Payout[]>('/payouts/pending');
}

export async function cancelPayout(payoutId: string): Promise<Payout> {
  return await apiClient.post<Payout>(`/payouts/${payoutId}/cancel`);
}

export async function checkPayoutEligibility(): Promise<PayoutEligibility> {
  return await apiClient.get<PayoutEligibility>('/payouts/eligibility');
}

// Admin functions
export async function getPendingPayoutsAdmin(
  page: number = 0,
  size: number = 20
): Promise<Payout[]> {
  return await apiClient.get<Payout[]>(
    `/admin/payouts/pending?page=${page}&size=${size}`
  );
}

export async function processPayout(payoutId: string): Promise<Payout> {
  return await apiClient.post<Payout>(`/admin/payouts/${payoutId}/process`);
}

export async function approvePayout(payoutId: string): Promise<Payout> {
  return await apiClient.post<Payout>(`/admin/payouts/${payoutId}/approve`);
}

export async function rejectPayout(
  payoutId: string,
  reason: string
): Promise<Payout> {
  return await apiClient.post<Payout>(`/admin/payouts/${payoutId}/reject`, {
    reason,
  });
}

export const payoutApi = {
  createPayout,
  getPayout,
  getPayoutHistory,
  getPendingPayouts,
  cancelPayout,
  checkPayoutEligibility,
  // Admin
  getPendingPayoutsAdmin,
  processPayout,
  approvePayout,
  rejectPayout,
};
```

**Tasks:**

- [ ] `T1.3.1` Payout types (1h)
- [ ] `T1.3.2` Payout request functions (1.5h)
- [ ] `T1.3.3` Admin functions (1h)
- [ ] `T1.3.4` Unit testler (0.5h)

---

### **EPIC 2: Component Integration** (2 gün / 16 saat)

#### Story 2.1: Wallet Dashboard Integration (8h)

**Dosyalar:**

- `app/dashboard/freelancer/wallet/page.tsx`
- `components/dashboard/freelancer/wallet/WalletBalanceCard.tsx`
- `components/dashboard/freelancer/wallet/EarningsChart.tsx`
- `components/dashboard/freelancer/wallet/RecentTransactionsWidget.tsx`

**Before (Mock):**

```typescript
// Şu an mock data kullanılıyor
const [balance, setBalance] = useState({
  available: 1250.0,
  pending: 350.0,
  total: 1600.0,
});
```

**After (Real API):**

```typescript
import { walletApi } from '@/lib/api/wallet';

const { data: balance, isLoading } = useQuery({
  queryKey: ['wallet-balance'],
  queryFn: walletApi.getBalance,
});
```

**Tasks:**

- [ ] `T2.1.1` WalletBalanceCard API entegrasyonu (2h)
- [ ] `T2.1.2` EarningsChart veri entegrasyonu (2h)
- [ ] `T2.1.3` RecentTransactionsWidget (2h)
- [ ] `T2.1.4` Loading states & error handling (2h)

---

#### Story 2.2: Transaction History Page (4h)

**Dosya:** `app/dashboard/freelancer/wallet/transactions/page.tsx`

**Features:**

- ✅ Pagination
- ✅ Filtering (date, type, amount)
- ✅ Export to CSV/PDF
- ✅ Real-time updates

**Tasks:**

- [ ] `T2.2.1` Transaction list API integration (2h)
- [ ] `T2.2.2` Filters & pagination (1h)
- [ ] `T2.2.3` Export functionality (1h)

---

#### Story 2.3: Payout Request Flow (4h)

**Dosya:** `app/dashboard/freelancer/wallet/payouts/page.tsx`

**Components:**

- `RequestPayoutModal.tsx` - Payout request form
- `PayoutHistoryList.tsx` - Past payouts
- `PayoutEligibilityBanner.tsx` - Eligibility check

**Tasks:**

- [ ] `T2.3.1` RequestPayoutModal entegrasyonu (2h)
- [ ] `T2.3.2` Payout history list (1h)
- [ ] `T2.3.3` Eligibility check & validation (1h)

---

### **EPIC 3: Payment Flow Integration** (1 gün / 8 saat)

#### Story 3.1: Checkout Payment Integration (6h)

**Dosyalar:**

- `app/checkout/[packageId]/page.tsx`
- `components/forms/PaymentForm.tsx`
- `components/checkout/PaymentMethodSelector.tsx`

**Features:**

- ✅ Stripe Elements integration
- ✅ Payment intent creation
- ✅ 3D Secure handling
- ✅ Payment confirmation
- ✅ Error handling

**Tasks:**

- [ ] `T3.1.1` PaymentForm Stripe entegrasyonu (3h)
- [ ] `T3.1.2` Payment intent flow (2h)
- [ ] `T3.1.3` Success/Error handlers (1h)

---

#### Story 3.2: Order Payment Status (2h)

**Dosya:** `app/dashboard/employer/orders/[id]/page.tsx`

**Features:**

- Display payment status
- View payment details
- Request refund button
- Payment history for order

**Tasks:**

- [ ] `T3.2.1` Payment status display (1h)
- [ ] `T3.2.2` Refund request flow (1h)

---

### **EPIC 4: Admin Payout Management** (0.5 gün / 4 saat)

#### Story 4.1: Admin Payout Dashboard (4h)

**Dosya:** `app/admin/payouts/page.tsx`

**Features:**

- Pending payouts list
- Filter by status, user, amount
- Approve/Reject actions
- Bulk operations
- Payout statistics

**Tasks:**

- [ ] `T4.1.1` Pending payouts list (1.5h)
- [ ] `T4.1.2` Approve/Reject modals (1.5h)
- [ ] `T4.1.3` Statistics widget (1h)

---

### **EPIC 5: Testing & Polish** (0.5 gün / 4 saat)

#### Story 5.1: End-to-End Testing (2h)

**Test Scenarios:**

1. Complete order → Payment → Escrow hold → Order complete → Escrow release → Payout
2. Payment failure handling
3. Refund flow
4. Payout rejection

**Tasks:**

- [ ] `T5.1.1` Payment flow test (1h)
- [ ] `T5.1.2` Wallet operations test (1h)

---

#### Story 5.2: Error Handling & Edge Cases (2h)

**Scenarios:**

- Insufficient balance
- Payment method failure
- Payout below minimum
- Network errors
- Backend errors

**Tasks:**

- [ ] `T5.2.1` Error boundary updates (1h)
- [ ] `T5.2.2` User-friendly error messages (1h)

---

## 📊 Sprint Metrics

### Time Estimation

| Epic                          | Tasks  | Hours  | Days    |
| ----------------------------- | ------ | ------ | ------- |
| EPIC 1: API Client            | 12     | 16     | 2.0     |
| EPIC 2: Component Integration | 11     | 16     | 2.0     |
| EPIC 3: Payment Flow          | 5      | 8      | 1.0     |
| EPIC 4: Admin Panel           | 3      | 4      | 0.5     |
| EPIC 5: Testing               | 4      | 4      | 0.5     |
| **TOTAL**                     | **35** | **48** | **6.0** |

### Risk Assessment

| Risk                          | Probability | Impact   | Mitigation                       |
| ----------------------------- | ----------- | -------- | -------------------------------- |
| Stripe API integration issues | Medium      | High     | Test with Stripe test keys first |
| Payment intent timing issues  | Medium      | Medium   | Proper error handling & retries  |
| Webhook reliability           | Low         | High     | Implement webhook verification   |
| Escrow calculation errors     | Low         | Critical | Unit tests for all calculations  |

---

## ✅ Definition of Done

### Code Quality

- [ ] All TypeScript types properly defined
- [ ] Zero `any` types
- [ ] Proper error handling in all API calls
- [ ] Loading states for all async operations
- [ ] Unit tests for API clients (>80% coverage)

### Functionality

- [ ] Payment flow works end-to-end
- [ ] Wallet balance updates in real-time
- [ ] Transaction history displays correctly
- [ ] Payout requests can be created
- [ ] Admin can approve/reject payouts
- [ ] Error scenarios handled gracefully

### Integration

- [ ] All API endpoints connected
- [ ] Proper authentication
- [ ] CSRF protection working
- [ ] Webhooks configured (if needed)

### Documentation

- [ ] API client functions documented
- [ ] Component props documented
- [ ] Payment flow diagram
- [ ] Admin guide for payouts

---

## 🚀 Deployment Checklist

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Backend application.properties
stripe.api.key=sk_live_...
stripe.webhook.secret=whsec_...
payment.minimum.amount=10.00
payout.minimum.amount=50.00
platform.fee.percentage=10
```

### Backend Configuration

- [ ] Stripe keys configured
- [ ] Webhook endpoints registered
- [ ] Payment methods enabled
- [ ] Payout methods configured

### Frontend Configuration

- [ ] Stripe.js loaded
- [ ] API endpoints configured
- [ ] Error tracking enabled
- [ ] Analytics tracking added

---

## 📈 Success Metrics

### User Metrics

- Payment success rate: >95%
- Average payment time: <30 seconds
- Payout request to completion: <24 hours (admin approval)

### Technical Metrics

- API response time: <500ms
- Payment error rate: <5%
- Zero payment data loss
- Webhook success rate: >99%

### Business Metrics

- Transaction volume tracking
- Platform fee collection
- Payout frequency
- Refund rate

---

## 🎯 Sprint Goal Summary

**Primary Goal:** Kullanıcılar gerçek para transferi yapabilsin

**Deliverables:**

1. ✅ Working payment flow (order → payment → escrow)
2. ✅ Wallet dashboard (balance, transactions)
3. ✅ Payout request system
4. ✅ Admin payout approval
5. ✅ Complete error handling

**Success Criteria:**

- A test user can complete a full payment flow
- Freelancer can see wallet balance and request payout
- Admin can approve/reject payout requests
- All error scenarios handled properly

---

## 🔗 Dependencies

### External Services

- Stripe API (payment processing)
- PayPal API (optional payout method)
- Bank API integration (optional)

### Internal Dependencies

- Order system must be working
- User authentication
- Admin panel access

### Sprint Dependencies

- Sprint 3: Error handling (completed ✅)
- Sprint 4: API standardization (73% complete)

---

## 📞 Team

**Backend:** ✅ READY (All endpoints implemented)  
**Frontend:** 🔄 PENDING (This sprint)  
**DevOps:** Configure Stripe webhooks  
**QA:** Test payment flows extensively

---

**Next Sprint:** Sprint 6 - Notification System Integration
