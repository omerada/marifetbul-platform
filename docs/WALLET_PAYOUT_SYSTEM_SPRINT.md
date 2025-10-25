# Wallet & Payout System - Production-Ready Integration Sprint

**Sprint:** Wallet & Payout System Application-Wide Integration  
**Duration:** 2 Weeks (10 Working Days)  
**Priority:** High (P0)  
**Created:** October 25, 2025  
**Status:** Ready to Start  
**Type:** Integration Sprint (Following Messaging & Review System Pattern)

---

## 📋 Executive Summary

Bu sprint, Marifet platformundaki **Wallet (Cüzdan) ve Payout (Para Çekme) sisteminin application-wide entegrasyonunu** hedeflemektedir.

### Kritik Tespit

**Backend:** ✅ **Tamamen production-ready** (Sprint 11 ve 13 refactoring sonrası facade pattern ile yapılandırılmış)  
**Frontend:** ❌ **TAMAMEN EKSİK** - Hiçbir wallet/payout UI component'i veya dashboard entegrasyonu yok  
**Integration:** ❌ **EKSIK** - Kullanıcı kazancını göremiyor, para çekme yapamıyor, transaction geçmişi yok

**Analoji:** Proposal ve Review sistemlerinde olduğu gibi, **backend tam hazır ama frontend sıfırdan yapılacak**.

---

## 🏗️ Backend Architecture - TAMAMEN HAZIR ✅

Backend wallet sistemi facade pattern ile refactor edilmiş ve tam özellikli:

### Service Layer Structure (Facade Pattern)

```
WalletFacadeService (implements WalletService)
    ├── WalletEscrowService (Escrow operations)
    ├── WalletBalanceService (Add/deduct balance)
    ├── WalletTransactionService (Transaction history)
    └── PayoutRequestService (Withdrawal operations)

PayoutFacadeService (implements PayoutService)
    ├── PayoutRequestService (Create, process, cancel)
    ├── PayoutProcessingService (Stripe integration)
    └── PayoutValidationService (Limits, eligibility)
```

### Database Schema (Fully Implemented)

**Tables:**

- `wallets` - User wallet with balance and pending_balance
- `transactions` - Transaction history (PAYMENT_RECEIVED, PAYMENT_RELEASED, PAYOUT_REQUESTED, etc.)
- `payouts` - Payout requests with status tracking
- `v_user_wallet_balances` - View for quick balance lookups
- `v_pending_payouts` - View for admin payout management

**Key Fields:**

- `wallet.balance` - Available balance (can withdraw)
- `wallet.pending_balance` - Funds in escrow (orders in progress)
- `wallet.total_earned` - Lifetime earnings
- `payout.status` - PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED

### ✅ Mevcut Backend Özellikler

**WalletService (Facade):**

- ✅ getOrCreateWallet() - Auto-create wallet on first transaction
- ✅ getWalletByUserId() - Fetch wallet by user
- ✅ addBalance() - Add funds to wallet
- ✅ deductBalance() - Deduct funds (with validation)
- ✅ getAvailableBalance() - Get withdrawable amount
- ✅ getTotalBalance() - balance + pending_balance
- ✅ holdInEscrow() - Lock funds during order
- ✅ releaseFromEscrow() - Release funds on order completion
- ✅ refundFromEscrow() - Refund on order cancellation
- ✅ getTransactionHistory() - Paginated transaction list
- ✅ calculateTotalEarnings() - Sum of all earnings

**PayoutService (Facade):**

- ✅ requestPayout() - Create withdrawal request
- ✅ processPayout() - Execute payout via Stripe
- ✅ cancelPayout() - Cancel and refund to wallet
- ✅ markPayoutCompleted() - Update status after transfer
- ✅ markPayoutFailed() - Handle failed payouts
- ✅ getPayout() - Get payout details
- ✅ getPayoutHistory() - User's payout history
- ✅ getPendingPayouts() - User's pending payouts
- ✅ getAllPendingPayouts() - Admin view of all pending
- ✅ calculatePendingPayoutAmount() - Sum of pending withdrawals
- ✅ canRequestPayout() - Check eligibility (min balance, limits)

**Controllers:**

- ✅ WalletController - `/api/v1/wallet` (User endpoints)
- ✅ PayoutController - `/api/v1/payouts` (Payout endpoints)
- ✅ PayoutAdminController - `/api/v1/admin/payouts` (Admin moderation)

**Business Rules:**

- ✅ Minimum payout: ₺100 (configurable)
- ✅ Maximum payout: ₺50,000 (configurable)
- ✅ Rate limiting: 1 payout per 24h
- ✅ Pending payout limit: 1 at a time
- ✅ Auto-create wallet on user registration
- ✅ Transaction history with pagination
- ✅ Escrow management (hold/release/refund)

---

## ❌ Frontend Status: TAMAMEN EKSİK

### Missing Frontend Components

**Dashboard Widgets:**

- ❌ WalletBalanceCard - Balance display (available, pending, total)
- ❌ EarningsChart - Earnings over time chart
- ❌ RecentTransactions - Last 5 transactions widget
- ❌ PayoutStatusBadge - Current payout status indicator
- ❌ QuickPayoutButton - "Para Çek" quick action

**Pages:**

- ❌ /dashboard/freelancer/wallet - Main wallet page
- ❌ /dashboard/freelancer/wallet/transactions - Transaction history
- ❌ /dashboard/freelancer/wallet/payouts - Payout history
- ❌ /dashboard/freelancer/wallet/request-payout - Payout request form
- ❌ /admin/payouts - Admin payout moderation

**Components:**

- ❌ TransactionList - Paginated transaction table
- ❌ TransactionCard - Single transaction display
- ❌ PayoutRequestForm - Payout form with validation
- ❌ PayoutCard - Payout status card
- ❌ PayoutMethodSelector - Bank transfer / Stripe payout selector
- ❌ BankAccountForm - Bank account info input
- ❌ PayoutLimitsDisplay - Min/max limits and eligibility
- ❌ EscrowExplainer - "Funds in escrow" tooltip

**Hooks:**

- ❌ useWallet - Wallet state management
- ❌ useBalance - Balance fetching hook
- ❌ useTransactions - Transaction history hook
- ❌ usePayouts - Payout history hook
- ❌ usePayoutRequest - Payout request submission
- ❌ usePayoutEligibility - Check if can request payout

**State Management:**

- ❌ walletStore (Zustand) - Wallet state
- ❌ payoutStore (Zustand) - Payout state

**User Experience:**

- ❌ Real-time balance updates
- ❌ Transaction filtering (type, date range)
- ❌ Payout status notifications
- ❌ Escrow explanation tooltips
- ❌ Earnings breakdown (by order)
- ❌ Export transactions (CSV)
- ❌ Payout receipt download

---

## 🎯 Sprint Goals

### Primary Goals (P0 - Must Have)

1. **Freelancer Wallet Dashboard**
   - Balance display (available, pending, total, lifetime)
   - Earnings chart (last 30 days)
   - Recent transactions widget
   - Quick payout button

2. **Transaction History Page**
   - Paginated transaction list
   - Filter by type (RECEIVED, RELEASED, PAYOUT, etc.)
   - Date range filter
   - Export to CSV

3. **Payout Request Flow**
   - Payout request form
   - Bank account input
   - Validation (min/max, eligibility)
   - Success/error handling
   - Status tracking

4. **Payout History Page**
   - List of all payout requests
   - Status badges (PENDING, COMPLETED, FAILED)
   - Receipt download
   - Cancel pending payout

5. **Admin Payout Moderation**
   - Pending payouts table
   - Process payout (approve)
   - Mark as completed/failed
   - User wallet view

### Secondary Goals (P1 - Should Have)

6. **Earnings Analytics**
   - Revenue breakdown by month
   - Top earning packages
   - Average order value
   - Earnings vs payouts chart

7. **Notification System**
   - Payout approved notification
   - Payout completed notification
   - Payout failed notification
   - Low balance warning

8. **Mobile Optimization**
   - Responsive wallet dashboard
   - Touch-friendly payout form
   - Mobile transaction list

### Tertiary Goals (P2 - Nice to Have)

9. **Advanced Features**
   - Recurring payouts (monthly auto-withdraw)
   - Multiple bank accounts
   - Payout scheduling
   - Tax document generation

---

## 📝 User Stories & Acceptance Criteria

### Epic 1: Freelancer Wallet Dashboard

#### US-1.1: Freelancer olarak wallet dashboard'umu görmek istiyorum

**Priority:** P0 (Must Have)  
**Estimate:** 8 hours

**As a** Freelancer  
**I want to** see my wallet dashboard  
**So that** I can track my earnings and balance

**Acceptance Criteria:**

- [ ] Dashboard exists at `/dashboard/freelancer/wallet`
- [ ] Displays 4 balance cards:
  - Available Balance (withdrawable)
  - Pending Balance (in escrow)
  - Total Balance (sum of both)
  - Lifetime Earnings (all-time)
- [ ] Balance values formatted as currency (₺)
- [ ] Prominent "Para Çek" (Withdraw) button
- [ ] Button disabled if balance < minimum payout (₺100)
- [ ] Tooltip on disabled button: "Minimum para çekme tutarı ₺100"
- [ ] Earnings chart (line chart, last 30 days)
- [ ] Recent transactions section (last 5)
- [ ] "Tüm İşlemleri Gör" link to transaction history
- [ ] Loading states for all sections
- [ ] Error handling with retry button
- [ ] Real-time updates (on new transaction)

**Technical Tasks:**

- [ ] Create `/app/dashboard/freelancer/wallet/page.tsx`
- [ ] Create `WalletBalanceCard` component
- [ ] Create `EarningsChart` component (using Chart.js or Recharts)
- [ ] Create `RecentTransactions` widget
- [ ] Implement `useWallet` hook
  - Fetch: GET `/api/v1/wallet`
  - Fetch balance: GET `/api/v1/wallet/balance`
- [ ] Implement `useBalance` hook for real-time updates
- [ ] Add to dashboard navigation sidebar
- [ ] Add loading skeletons
- [ ] Add error boundaries

**Design Notes:**

```
┌──────────────────────────────────────────────┐
│ 💰 Cüzdanım                                  │
│                                              │
│ ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│ │ Available  │ │  Pending   │ │ Lifetime │ │
│ │   ₺1,234   │ │   ₺500     │ │  ₺45,678 │ │
│ │ [Para Çek] │ │ (Escrow)   │ │          │ │
│ └────────────┘ └────────────┘ └──────────┘ │
│                                              │
│ 📈 Kazançlar (Son 30 Gün)                   │
│ [Line Chart showing daily earnings]         │
│                                              │
│ 📋 Son İşlemler              [Tümünü Gör]   │
│ ┌────────────────────────────────────────┐  │
│ │ ↗️ Ödeme Alındı   +₺250   2 gün önce  │  │
│ │ ↘️ Para Çekme     -₺500   5 gün önce  │  │
│ │ ↗️ Escrow Serbest +₺180   1 hafta önce│  │
│ └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

---

#### US-1.2: Bakiye kartlarını anlayabilmek istiyorum

**Priority:** P0 (Must Have)  
**Estimate:** 2 hours

**As a** Freelancer  
**I want to** understand the difference between available, pending, and total balance  
**So that** I know how much I can withdraw

**Acceptance Criteria:**

- [ ] Available Balance card has tooltip: "Şu anda çekebileceğiniz tutar"
- [ ] Pending Balance card has tooltip: "Devam eden siparişlerde tutulan tutar (escrow)"
- [ ] Lifetime Earnings card has tooltip: "Toplam kazancınız (başlangıçtan bu yana)"
- [ ] Escrow info icon with detailed explanation modal
- [ ] Modal explains escrow lifecycle:
  - Order accepted → Funds held in escrow
  - Order completed → Funds released to available balance
  - Order cancelled → Funds refunded to buyer
- [ ] "Neden para çekemiyorum?" FAQ link

**Technical Tasks:**

- [ ] Create `BalanceTooltip` component
- [ ] Create `EscrowExplainerModal` component
- [ ] Add info icons with onClick handlers
- [ ] Add FAQ section in docs

---

### Epic 2: Transaction History

#### US-2.1: İşlem geçmişimi görmek istiyorum

**Priority:** P0 (Must Have)  
**Estimate:** 8 hours

**As a** Freelancer  
**I want to** see my full transaction history  
**So that** I can track all money movements

**Acceptance Criteria:**

- [ ] Page exists at `/dashboard/freelancer/wallet/transactions`
- [ ] Displays paginated transaction list (20 per page)
- [ ] Transaction card shows:
  - Type icon (↗️ income, ↘️ expense)
  - Type label (Ödeme Alındı, Para Çekme, Escrow, etc.)
  - Amount (color: green for positive, red for negative)
  - Date (formatted: "2 gün önce" or "25 Ekim 2025, 14:30")
  - Description
  - Related order link (if applicable)
- [ ] Filter by type:
  - Tümü
  - Ödeme Alındı (PAYMENT_RECEIVED)
  - Escrow Serbest (PAYMENT_RELEASED)
  - Para Çekme (PAYOUT_REQUESTED)
  - İade (REFUND_RECEIVED)
- [ ] Date range filter (Last 7 days, 30 days, 3 months, All time, Custom)
- [ ] Sort by date (newest first default)
- [ ] Search by description or order number
- [ ] Export to CSV button
- [ ] Empty state: "Henüz işlem kaydı yok"
- [ ] Loading state: Skeleton list
- [ ] Pagination controls at bottom

**Technical Tasks:**

- [ ] Create `/app/dashboard/freelancer/wallet/transactions/page.tsx`
- [ ] Create `TransactionList` component
- [ ] Create `TransactionCard` component
- [ ] Create `TransactionFilters` component
- [ ] Implement `useTransactions` hook
  - Fetch: GET `/api/v1/wallet/transactions?page={p}&size={s}&type={t}&startDate={sd}&endDate={ed}`
  - Support filters and pagination
- [ ] Implement CSV export
  - Format: Date, Type, Amount, Description, Order ID
  - Download as `transactions-{date}.csv`
- [ ] Add to wallet navigation tabs
- [ ] Optimize performance (virtualized list for 100+ items)

**Design Notes:**

```
┌──────────────────────────────────────────────┐
│ 📋 İşlem Geçmişi                             │
│                                              │
│ [Tümü ▼] [Son 30 Gün ▼] [🔍 Ara] [Export]   │
│                                              │
│ ┌────────────────────────────────────────┐  │
│ │ ↗️ Ödeme Alındı              +₺250.00  │  │
│ │    Sipariş #12345           2 gün önce │  │
│ │    "Web sitesi tasarımı tamamlandı"    │  │
│ └────────────────────────────────────────┘  │
│                                              │
│ ┌────────────────────────────────────────┐  │
│ │ ↘️ Para Çekme                -₺500.00  │  │
│ │    Banka Transferi          5 gün önce │  │
│ │    "Para çekme talebi onaylandı"       │  │
│ └────────────────────────────────────────┘  │
│                                              │
│ [1] [2] [3] ... [10]                        │
└──────────────────────────────────────────────┘
```

---

### Epic 3: Payout Request Flow

#### US-3.1: Para çekme talebinde bulunmak istiyorum

**Priority:** P0 (Must Have)  
**Estimate:** 10 hours

**As a** Freelancer  
**I want to** request a payout (withdrawal)  
**So that** I can transfer my earnings to my bank account

**Acceptance Criteria:**

- [ ] Clicking "Para Çek" button opens RequestPayoutModal
- [ ] Modal displays:
  - Available balance at top
  - Amount input (₺)
  - Min/max limits displayed: "Minimum: ₺100, Maksimum: ₺50,000"
  - Payout method selector (Bank Transfer)
  - Bank account form:
    - Bank name (dropdown)
    - IBAN (TR format validation)
    - Account holder name
    - Confirm IBAN checkbox
  - Terms checkbox: "Ödeme koşullarını okudum ve kabul ediyorum"
  - Estimated arrival: "2-3 iş günü içinde"
  - "Talep Oluştur" button
- [ ] Validation errors:
  - Amount < ₺100: "Minimum para çekme tutarı ₺100"
  - Amount > ₺50,000: "Maksimum para çekme tutarı ₺50,000"
  - Amount > available balance: "Yetersiz bakiye"
  - Invalid IBAN: "Geçersiz IBAN formatı"
  - Empty bank name: "Banka seçiniz"
  - Empty account holder: "Hesap sahibi adı giriniz"
- [ ] Eligibility checks:
  - Has pending payout: "Zaten beklemede bir talebiniz var"
  - Requested within 24h: "24 saat içinde sadece 1 talep oluşturabilirsiniz"
- [ ] Success flow:
  - POST request to `/api/v1/payouts`
  - Modal closes
  - Toast notification: "Para çekme talebiniz oluşturuldu. İnceleniyor..."
  - Navigate to `/dashboard/freelancer/wallet/payouts`
  - New payout appears in list with status PENDING
- [ ] Error handling:
  - API error: Show error message
  - Network error: Retry option

**Technical Tasks:**

- [ ] Create `RequestPayoutModal` component
- [ ] Create `PayoutMethodSelector` component
- [ ] Create `BankAccountForm` component
- [ ] Create `PayoutLimitsDisplay` component
- [ ] Implement `usePayoutRequest` hook
  - Check eligibility: GET `/api/v1/payouts/eligibility`
  - Submit request: POST `/api/v1/payouts`
  - Body: `{ amount, method, bankAccountInfo: { bankName, iban, accountHolder } }`
- [ ] Implement IBAN validation (TR format: TR + 24 digits)
- [ ] Add Turkish bank list (Ziraat, İş Bankası, Garanti, Akbank, etc.)
- [ ] Add form validation with Zod schema
- [ ] Add loading states
- [ ] Add error handling

**Design Notes:**

```
┌──────────────────────────────────────────────┐
│ 💸 Para Çekme Talebi                         │
│                                              │
│ Kullanılabilir Bakiye: ₺1,234.00            │
│                                              │
│ Çekmek İstediğiniz Tutar                    │
│ [₺] [____________]                          │
│ Min: ₺100 | Max: ₺50,000                    │
│                                              │
│ Ödeme Yöntemi                                │
│ ● Banka Transferi                            │
│                                              │
│ Banka Bilgileri                              │
│ Banka: [Türkiye İş Bankası ▼]              │
│ IBAN:  [TR__ ____ ____ ____ ____ ____]     │
│ Hesap Sahibi: [_________________]           │
│                                              │
│ ☐ IBAN'ı doğruladım                         │
│ ☐ Ödeme koşullarını kabul ediyorum          │
│                                              │
│ ℹ️  Tahmini Süre: 2-3 iş günü               │
│                                              │
│ [İptal]  [Talep Oluştur]                    │
└──────────────────────────────────────────────┘
```

---

#### US-3.2: Para çekme taleplerimizi görmek istiyorum

**Priority:** P0 (Must Have)  
**Estimate:** 6 hours

**As a** Freelancer  
**I want to** see my payout history  
**So that** I can track my withdrawal requests

**Acceptance Criteria:**

- [ ] Page exists at `/dashboard/freelancer/wallet/payouts`
- [ ] Displays list of all payouts (paginated, 10 per page)
- [ ] Payout card shows:
  - Amount
  - Status badge (PENDING: yellow, PROCESSING: blue, COMPLETED: green, FAILED: red, CANCELLED: gray)
  - Payout method (Bank Transfer)
  - Bank name and masked IBAN (TR** \*\*** \***\* \*\*** \***\* **45)
  - Request date
  - Completed date (if completed)
  - Actions:
    - [İptal] button (if status PENDING)
    - [Makbuz İndir] button (if status COMPLETED)
    - [Detay] button
- [ ] Status badge tooltips:
  - PENDING: "İnceleniyor"
  - PROCESSING: "İşleme alındı"
  - COMPLETED: "Hesabınıza aktarıldı"
  - FAILED: "Başarısız oldu"
  - CANCELLED: "İptal edildi"
- [ ] Filter by status (All, Pending, Completed, Failed)
- [ ] Empty state: "Henüz para çekme talebiniz yok"
- [ ] Loading state: Skeleton cards
- [ ] Cancel payout confirmation dialog
- [ ] Success: "Para çekme talebiniz iptal edildi. Tutar bakiyenize eklendi."

**Technical Tasks:**

- [ ] Create `/app/dashboard/freelancer/wallet/payouts/page.tsx`
- [ ] Create `PayoutList` component
- [ ] Create `PayoutCard` component
- [ ] Create `PayoutStatusBadge` component
- [ ] Create `CancelPayoutDialog` component
- [ ] Implement `usePayouts` hook
  - Fetch: GET `/api/v1/payouts/history?page={p}&size={s}&status={st}`
  - Cancel: POST `/api/v1/payouts/{id}/cancel`
- [ ] Implement receipt download
  - Generate PDF with payout details
  - Or link to backend endpoint: GET `/api/v1/payouts/{id}/receipt`
- [ ] Add to wallet navigation tabs
- [ ] Optimize performance

**Design Notes:**

```
┌──────────────────────────────────────────────┐
│ 💸 Para Çekme Talepleri                      │
│                                              │
│ [Tümü ▼] [Yeni Talep +]                     │
│                                              │
│ ┌────────────────────────────────────────┐  │
│ │ ₺500.00        [PENDING]     2 gün önce│  │
│ │ Banka Transferi                         │  │
│ │ Türkiye İş Bankası - TR** **** **45    │  │
│ │ [İptal] [Detay]                         │  │
│ └────────────────────────────────────────┘  │
│                                              │
│ ┌────────────────────────────────────────┐  │
│ │ ₺1,000.00      [COMPLETED]   1 hafta   │  │
│ │ Banka Transferi                         │  │
│ │ Ziraat Bankası - TR** **** **78        │  │
│ │ Tamamlandı: 20 Ekim 2025                │  │
│ │ [Makbuz İndir] [Detay]                  │  │
│ └────────────────────────────────────────┘  │
│                                              │
│ [1] [2] [3]                                 │
└──────────────────────────────────────────────┘
```

---

### Epic 4: Admin Payout Moderation

#### US-4.1: Admin olarak bekleyen para çekme taleplerini görmek istiyorum

**Priority:** P0 (Must Have)  
**Estimate:** 8 hours

**As an** Admin  
**I want to** see all pending payout requests  
**So that** I can approve or reject them

**Acceptance Criteria:**

- [ ] Page exists at `/admin/payouts/pending`
- [ ] Displays table with columns:
  - Payout ID
  - User (name, email, clickable → profile)
  - Amount
  - Method
  - Bank Info (clickable → modal with full details)
  - Request Date
  - Waiting Time (e.g., "2h 34m" or "3 days")
  - User Balance (available, pending)
  - Actions
- [ ] Actions per row:
  - [İncele] - Opens detail modal
  - [Onayla] - Approve payout
  - [Reddet] - Reject payout
- [ ] Detail modal shows:
  - Full user info (name, email, phone, profile link)
  - Payout amount
  - Bank details (bank name, IBAN, account holder)
  - User wallet status (available, pending, total, lifetime earnings)
  - Transaction history (last 10)
  - Order history (completed count, total revenue)
  - Admin notes field
  - [Onayla] [Reddet] buttons
- [ ] Approve confirmation:
  - Dialog: "Bu para çekme talebini onaylıyor musunuz?"
  - Success: POST `/api/v1/admin/payouts/{id}/approve`
  - Toast: "Para çekme talebi onaylandı. İşleme alınıyor..."
  - Row updated to PROCESSING status
- [ ] Reject confirmation:
  - Dialog with reason input (required)
  - POST `/api/v1/admin/payouts/{id}/reject` with body `{ reason }`
  - Toast: "Para çekme talebi reddedildi. Kullanıcı bilgilendirildi."
  - Row removed from pending list
  - Amount returned to user's wallet
- [ ] Filter by waiting time (< 1h, 1-6h, 6-24h, > 24h)
- [ ] Sort by date (oldest first default)
- [ ] Search by user name/email
- [ ] Pagination (20 per page)
- [ ] Empty state: "Bekleyen talep yok 🎉"
- [ ] Auto-refresh every 30 seconds

**Technical Tasks:**

- [ ] Create `/app/admin/payouts/pending/page.tsx`
- [ ] Create `PendingPayoutsTable` component
- [ ] Create `PayoutDetailModal` component
- [ ] Create `ApprovePayoutDialog` component
- [ ] Create `RejectPayoutDialog` component
- [ ] Implement admin payout endpoints:
  - GET `/api/v1/admin/payouts/pending?page={p}&size={s}`
  - POST `/api/v1/admin/payouts/{id}/approve`
  - POST `/api/v1/admin/payouts/{id}/reject`
- [ ] Add admin permissions check
- [ ] Add auto-refresh (useInterval hook)
- [ ] Add bulk actions (approve/reject multiple)

**Design Notes:**

```
┌────────────────────────────────────────────────────────────────┐
│ 💸 Bekleyen Para Çekme Talepleri (Admin)                      │
│                                                                │
│ [< 1h: 2] [1-6h: 5] [6-24h: 3] [> 24h: 1] [🔄 Refresh]       │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ID      │ User           │ Amount   │ Bank      │ Time  │ │
│ ├──────────────────────────────────────────────────────────┤ │
│ │ #12345  │ Ahmet Y.      │ ₺500     │ İş Bank.  │ 2h    │ │
│ │         │ ahmet@...     │          │ [Detay]   │       │ │
│ │         │ Balance: ₺1.2K│          │           │       │ │
│ │         │ [İncele] [Onayla] [Reddet]             │       │
│ ├──────────────────────────────────────────────────────────┤ │
│ │ #12344  │ Ayşe K.       │ ₺1,000   │ Ziraat    │ 5h    │ │
│ │ ...                                                       │ │
│ └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

---

### Epic 5: Dashboard Integration

#### US-5.1: Dashboard'da wallet widget'ını görmek istiyorum

**Priority:** P1 (Should Have)  
**Estimate:** 4 hours

**As a** Freelancer  
**I want to** see my balance on dashboard homepage  
**So that** I can quickly check my earnings

**Acceptance Criteria:**

- [ ] WalletWidget on dashboard homepage (top row)
- [ ] Compact card shows:
  - Available balance (large font)
  - "Para Çek" button
  - Quick stats: Total earned this month
  - Link: "Cüzdana Git →"
- [ ] Widget auto-updates on new transaction
- [ ] Widget shows loading skeleton on mount
- [ ] Widget handles error state

**Technical Tasks:**

- [ ] Create `WalletWidget` component
- [ ] Add to `/app/dashboard/freelancer/page.tsx`
- [ ] Reuse `useBalance` hook
- [ ] Add real-time updates (WebSocket or polling)

---

### Epic 6: Earnings Analytics

#### US-6.1: Kazanç analizlerimi görmek istiyorum

**Priority:** P1 (Should Have)  
**Estimate:** 8 hours

**As a** Freelancer  
**I want to** see my earnings analytics  
**So that** I can understand my revenue trends

**Acceptance Criteria:**

- [ ] Analytics tab on wallet page
- [ ] Charts:
  - Earnings over time (line chart, last 6 months)
  - Revenue breakdown by package (pie chart)
  - Average order value (stat card)
  - Earnings vs payouts comparison (bar chart)
- [ ] Date range selector (Last month, 3 months, 6 months, 1 year, All time)
- [ ] Export analytics report (PDF)
- [ ] Top earning packages list (top 5)
- [ ] Stats cards:
  - Total orders
  - Total revenue
  - Average order value
  - Conversion rate (proposals → orders)

**Technical Tasks:**

- [ ] Create `/app/dashboard/freelancer/wallet/analytics/page.tsx`
- [ ] Create `EarningsAnalytics` component
- [ ] Implement analytics endpoints (if not exist):
  - GET `/api/v1/wallet/analytics/earnings?period={period}`
  - GET `/api/v1/wallet/analytics/revenue-breakdown`
- [ ] Use Chart.js or Recharts for visualizations
- [ ] Implement PDF export (jsPDF)

---

### Epic 7: Notifications

#### US-7.1: Para çekme bildirimleri almak istiyorum

**Priority:** P1 (Should Have)  
**Estimate:** 4 hours

**As a** Freelancer  
**I want to** receive notifications about my payout status  
**So that** I'm informed about my withdrawal progress

**Acceptance Criteria:**

- [ ] Notification on payout approved:
  - Title: "Para Çekme Talebiniz Onaylandı"
  - Body: "₺{amount} tutarındaki talebiniz işleme alındı. 2-3 iş günü içinde hesabınıza aktarılacak."
  - CTA: "Detayları Gör"
- [ ] Notification on payout completed:
  - Title: "Para Çekme Tamamlandı"
  - Body: "₺{amount} hesabınıza aktarıldı. İyi çalışmalar!"
  - CTA: "Makbuzu İndir"
- [ ] Notification on payout failed:
  - Title: "Para Çekme Başarısız Oldu"
  - Body: "₺{amount} tutarındaki talebiniz başarısız oldu. Tutar bakiyenize iade edildi."
  - CTA: "Destek Al"
- [ ] Notification on low balance:
  - Title: "Bakiyeniz Düşük"
  - Body: "Kullanılabilir bakiyeniz ₺{balance}. Yeni siparişler alarak kazancınızı artırabilirsiniz."
  - CTA: "Paketlerimi Düzenle"
- [ ] In-app notification badge
- [ ] Email notification (opt-in)
- [ ] Push notification (opt-in, future)

**Technical Tasks:**

- [ ] Create notification templates
- [ ] Integrate with existing NotificationService
- [ ] Add payout events to notification system
- [ ] Email template design
- [ ] User preferences for notification types

---

## 🗓️ Development Timeline

### Week 1: Core Features (Days 1-5)

#### Day 1-2: Wallet Dashboard

**Backend:** (Already complete)

**Frontend:**

- [ ] Create wallet page structure
- [ ] Implement WalletBalanceCard component
- [ ] Implement EarningsChart component
- [ ] Implement RecentTransactions widget
- [ ] Create useWallet hook
- [ ] Create useBalance hook
- [ ] Add to navigation
- [ ] Test with mock data

**Estimate:** 16 hours (2 days)

---

#### Day 3: Transaction History

**Frontend:**

- [ ] Create transaction history page
- [ ] Implement TransactionList component
- [ ] Implement TransactionCard component
- [ ] Implement TransactionFilters component
- [ ] Create useTransactions hook
- [ ] Add pagination
- [ ] Add CSV export
- [ ] Test filtering and sorting

**Estimate:** 8 hours (1 day)

---

#### Day 4-5: Payout Request Flow

**Frontend:**

- [ ] Create RequestPayoutModal component
- [ ] Implement PayoutMethodSelector
- [ ] Implement BankAccountForm
- [ ] Implement PayoutLimitsDisplay
- [ ] Create usePayoutRequest hook
- [ ] Add IBAN validation
- [ ] Add bank list
- [ ] Add form validation (Zod)
- [ ] Test success/error flows
- [ ] Create payout history page
- [ ] Implement PayoutList component
- [ ] Implement PayoutCard component
- [ ] Create usePayouts hook
- [ ] Add cancel payout functionality
- [ ] Test end-to-end

**Estimate:** 16 hours (2 days)

---

### Week 2: Admin & Enhancements (Days 6-10)

#### Day 6-7: Admin Payout Moderation

**Frontend:**

- [ ] Create admin pending payouts page
- [ ] Implement PendingPayoutsTable
- [ ] Implement PayoutDetailModal
- [ ] Implement ApprovePayoutDialog
- [ ] Implement RejectPayoutDialog
- [ ] Add admin endpoints
- [ ] Add auto-refresh
- [ ] Add bulk actions
- [ ] Test admin workflows

**Estimate:** 16 hours (2 days)

---

#### Day 8: Dashboard Integration

**Frontend:**

- [ ] Create WalletWidget component
- [ ] Add to freelancer dashboard
- [ ] Add to employer dashboard (view only)
- [ ] Add real-time updates
- [ ] Test responsiveness

**Estimate:** 4 hours (0.5 day)

---

#### Day 9: Earnings Analytics

**Frontend:**

- [ ] Create analytics page
- [ ] Implement charts (line, pie, bar)
- [ ] Add date range selector
- [ ] Add export to PDF
- [ ] Create analytics hook
- [ ] Test visualizations

**Estimate:** 8 hours (1 day)

---

#### Day 10: Testing & Polish

**Testing:**

- [ ] E2E test: Wallet dashboard load
- [ ] E2E test: Payout request flow
- [ ] E2E test: Transaction history
- [ ] E2E test: Admin moderation
- [ ] Unit test: useWallet hook
- [ ] Unit test: usePayoutRequest hook
- [ ] Performance test: Large transaction history
- [ ] Mobile responsive test

**Polish:**

- [ ] UI/UX improvements
- [ ] Loading states optimization
- [ ] Error handling enhancement
- [ ] Accessibility improvements (WCAG 2.1 AA)
- [ ] Documentation updates

**Estimate:** 8 hours (1 day)

---

## 🧪 Testing Strategy

### Unit Tests

- [ ] useWallet hook tests
- [ ] useBalance hook tests
- [ ] useTransactions hook tests
- [ ] usePayoutRequest hook tests
- [ ] IBAN validation tests
- [ ] Form validation tests (Zod schemas)
- [ ] Currency formatting tests

### Integration Tests

- [ ] GET /api/v1/wallet integration
- [ ] GET /api/v1/wallet/balance integration
- [ ] GET /api/v1/wallet/transactions integration
- [ ] POST /api/v1/payouts integration
- [ ] POST /api/v1/payouts/{id}/cancel integration
- [ ] GET /api/v1/payouts/history integration
- [ ] Admin endpoints integration

### E2E Tests

```typescript
describe('Wallet & Payout Flow', () => {
  it('should display wallet dashboard', () => {
    // Login as freelancer
    // Navigate to /dashboard/freelancer/wallet
    // Verify balance cards visible
    // Verify earnings chart visible
    // Verify recent transactions visible
  });

  it('should request payout successfully', () => {
    // Login as freelancer
    // Navigate to wallet
    // Click "Para Çek"
    // Fill payout form
    // Submit
    // Verify success message
    // Verify payout in history with PENDING status
  });

  it('should cancel pending payout', () => {
    // Login as freelancer
    // Navigate to payout history
    // Click cancel on pending payout
    // Confirm cancellation
    // Verify success message
    // Verify payout status changed to CANCELLED
    // Verify balance increased
  });

  it('should moderate payout as admin', () => {
    // Login as admin
    // Navigate to /admin/payouts/pending
    // Click "İncele" on a payout
    // View user details
    // Click "Onayla"
    // Confirm approval
    // Verify payout status changed to PROCESSING
  });
});
```

### Performance Tests

- [ ] Wallet dashboard load time < 2s
- [ ] Transaction history pagination (1000+ items)
- [ ] Chart rendering performance
- [ ] Admin table rendering (100+ pending payouts)

---

## 📈 Success Metrics

### Quantitative Metrics

| Metric                     | Target  | Current | Status |
| -------------------------- | ------- | ------- | ------ |
| Payout Request Rate        | > 50%   | 0%      | ❌     |
| Payout Approval Time (Avg) | < 4h    | N/A     | ❌     |
| Failed Payout Rate         | < 5%    | N/A     | ❌     |
| User Satisfaction (Wallet) | > 4.5/5 | N/A     | ❌     |
| Support Tickets (Wallet)   | < 10/mo | N/A     | ❌     |

### Qualitative Metrics

- [ ] Users easily understand balance types
- [ ] Payout request process is intuitive
- [ ] Transaction history is clear and useful
- [ ] Admin can efficiently process payouts
- [ ] Mobile experience is seamless

---

## 🚨 Risk Assessment

### High Risk

1. **Security - Bank Account Info Storage**
   - Risk: Sensitive bank data exposure
   - Mitigation: Encrypt IBAN and account info, PCI DSS compliance, regular security audits

2. **User Confusion - Escrow vs Available Balance**
   - Risk: Users don't understand why they can't withdraw pending balance
   - Mitigation: Clear tooltips, escrow explainer modal, FAQ section, visual indicators

3. **Admin Overload - Manual Payout Approval**
   - Risk: High volume of payout requests, slow approval times
   - Mitigation: Bulk actions, auto-approval for verified users (future), payout limits

### Medium Risk

4. **IBAN Validation - International IBANs**
   - Risk: Only TR IBANs supported initially
   - Mitigation: Add international IBAN support in Phase 2, clear messaging

5. **Performance - Large Transaction History**
   - Risk: Slow page load for users with 1000+ transactions
   - Mitigation: Pagination, virtualized list, caching, database indexing

### Low Risk

6. **Integration - Stripe Payout API**
   - Risk: Stripe API changes, downtime
   - Mitigation: Error handling, fallback to manual bank transfer, retry mechanism

---

## 📊 Progress Tracking

### Day 1-2: Wallet Dashboard ✅/❌

- [ ] Wallet page created
- [ ] Balance cards implemented
- [ ] Earnings chart functional
- [ ] Recent transactions widget
- [ ] Navigation added

### Day 3: Transaction History ✅/❌

- [ ] Transaction page created
- [ ] Transaction list functional
- [ ] Filters working
- [ ] CSV export implemented
- [ ] Pagination working

### Day 4-5: Payout Request Flow ✅/❌

- [ ] Request modal functional
- [ ] Form validation working
- [ ] IBAN validation working
- [ ] Payout history page
- [ ] Cancel payout working

### Day 6-7: Admin Moderation ✅/❌

- [ ] Admin page created
- [ ] Pending table functional
- [ ] Approve/reject working
- [ ] Detail modal functional
- [ ] Auto-refresh working

### Day 8: Dashboard Integration ✅/❌

- [ ] Widget added to dashboard
- [ ] Real-time updates working

### Day 9: Analytics ✅/❌

- [ ] Analytics page created
- [ ] Charts functional
- [ ] Export working

### Day 10: Testing & Polish ✅/❌

- [ ] E2E tests passing
- [ ] Performance optimized
- [ ] Accessibility compliant
- [ ] Documentation complete

---

## ✅ Definition of Done

### Code Quality

- [ ] TypeScript errors: 0
- [ ] ESLint warnings: 0
- [ ] Unit test coverage: > 80%
- [ ] Integration tests: All passing
- [ ] E2E tests: All passing
- [ ] Code review: Approved

### Functionality

- [ ] All user stories acceptance criteria met
- [ ] All primary goals (P0) complete
- [ ] Frontend-backend integration working
- [ ] Real-time updates functional
- [ ] Error handling comprehensive

### Performance

- [ ] Wallet dashboard load < 2s
- [ ] Transaction history pagination smooth
- [ ] Chart rendering < 1s
- [ ] Admin table rendering < 2s

### Accessibility

- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigation working
- [ ] Screen reader compatible
- [ ] Color contrast ratios met

### Documentation

- [ ] User guide updated
- [ ] Admin guide updated
- [ ] API documentation updated
- [ ] Code comments added
- [ ] README updated

### Deployment

- [ ] Staging deployment successful
- [ ] Production deployment successful
- [ ] Monitoring dashboards created
- [ ] Alerting configured
- [ ] Rollback plan documented

---

## 🔗 Related Documentation

- [Messaging System Sprint](./MESSAGING_SYSTEM_SPRINT.md) - Pattern reference
- [Review System Sprint](./REVIEW_SYSTEM_SPRINT.md) - Pattern reference
- [Proposal System Sprint](./PROPOSAL_SYSTEM_SPRINT.md) - Pattern reference
- [Payment System Architecture](../marifetbul-backend/docs/PAYMENT_ARCHITECTURE.md)
- [Wallet Service Refactoring](../marifetbul-backend/docs/WALLET_REFACTORING.md)
- [Backend README](../marifetbul-backend/README.md)

---

## 📝 Sprint Retrospective Topics

### To Discuss

- Wallet dashboard UX effectiveness
- Payout request flow clarity
- Admin moderation efficiency
- Transaction history performance
- Analytics value to users
- Escrow explanation clarity
- Mobile experience quality
- Security implementation
- Future features prioritization

---

## 🚀 Post-Sprint Enhancements

### Phase 2 (Future Sprint)

1. **Recurring Payouts**
   - Auto-withdraw every month
   - Configurable schedule
   - Smart payout (when balance > threshold)

2. **Multiple Bank Accounts**
   - Save multiple accounts
   - Set default account
   - Quick account switching

3. **Payout Scheduling**
   - Schedule payout for specific date
   - Recurring schedule (weekly, monthly)
   - Smart scheduling based on earnings pattern

4. **Tax Documents**
   - Earnings certificate generation
   - Tax form downloads (e-Fatura integration)
   - Annual income report

5. **Advanced Analytics**
   - Earnings forecast (AI-powered)
   - Cash flow projections
   - Tax estimation
   - Retirement savings calculator

6. **International Payouts**
   - Support international IBANs
   - Multi-currency support
   - Forex conversion
   - PayPal integration
   - Wise integration

7. **Instant Payouts**
   - Premium feature (extra fee)
   - Instant bank transfer
   - Same-day payout

8. **Wallet Referral Program**
   - Earn bonus for referrals
   - Referral bonus tracking
   - Withdrawal of referral earnings

---

## 🛠️ Technical Architecture

### Frontend Architecture

```
app/dashboard/freelancer/wallet/
  ├── page.tsx (Main wallet dashboard)
  ├── transactions/
  │   └── page.tsx (Transaction history)
  ├── payouts/
  │   └── page.tsx (Payout history)
  └── analytics/
      └── page.tsx (Earnings analytics)

components/domains/wallet/
  ├── WalletBalanceCard.tsx
  ├── EarningsChart.tsx
  ├── RecentTransactions.tsx
  ├── TransactionList.tsx
  ├── TransactionCard.tsx
  ├── TransactionFilters.tsx
  ├── RequestPayoutModal.tsx
  ├── PayoutMethodSelector.tsx
  ├── BankAccountForm.tsx
  ├── PayoutLimitsDisplay.tsx
  ├── PayoutList.tsx
  ├── PayoutCard.tsx
  ├── PayoutStatusBadge.tsx
  ├── CancelPayoutDialog.tsx
  ├── WalletWidget.tsx
  └── EarningsAnalytics.tsx

hooks/business/
  ├── useWallet.ts
  ├── useBalance.ts
  ├── useTransactions.ts
  ├── usePayouts.ts
  ├── usePayoutRequest.ts
  └── usePayoutEligibility.ts

stores/
  ├── walletStore.ts (Zustand)
  └── payoutStore.ts (Zustand)

types/
  └── wallet.ts (TypeScript interfaces)
```

### Backend Architecture (Already Implemented)

```
com.marifetbul.api.domain.payment/
  ├── controller/
  │   ├── WalletController.java
  │   ├── PayoutController.java
  │   └── PayoutAdminController.java
  ├── service/
  │   ├── WalletService.java (interface)
  │   ├── PayoutService.java (interface)
  │   └── facade/
  │       ├── WalletFacadeService.java
  │       ├── WalletEscrowService.java
  │       ├── WalletBalanceService.java
  │       ├── WalletTransactionService.java
  │       ├── PayoutFacadeService.java
  │       ├── PayoutRequestService.java
  │       └── PayoutProcessingService.java
  ├── entity/
  │   ├── Wallet.java
  │   ├── Transaction.java
  │   ├── Payout.java
  │   ├── PayoutMethod.java (enum)
  │   ├── PayoutStatus.java (enum)
  │   └── TransactionType.java (enum)
  ├── repository/
  │   ├── WalletRepository.java
  │   ├── TransactionRepository.java
  │   └── PayoutRepository.java
  └── dto/
      ├── WalletResponse.java
      ├── BalanceResponse.java
      ├── TransactionResponse.java
      ├── PayoutRequest.java
      └── PayoutResponse.java
```

---

## 📚 API Endpoints Summary

### Wallet Endpoints (User)

```
GET    /api/v1/wallet                      Get wallet
GET    /api/v1/wallet/balance              Get balance
GET    /api/v1/wallet/transactions         Get transactions
```

### Payout Endpoints (User)

```
POST   /api/v1/payouts                     Request payout
GET    /api/v1/payouts/{id}                Get payout detail
GET    /api/v1/payouts/history             Get payout history
GET    /api/v1/payouts/pending             Get pending payouts
POST   /api/v1/payouts/{id}/cancel         Cancel payout
GET    /api/v1/payouts/eligibility         Check eligibility
GET    /api/v1/payouts/limits              Get payout limits
```

### Admin Endpoints

```
GET    /api/v1/admin/payouts/pending       Get all pending
POST   /api/v1/admin/payouts/{id}/approve  Approve payout
POST   /api/v1/admin/payouts/{id}/reject   Reject payout
POST   /api/v1/admin/payouts/{id}/complete Mark completed
POST   /api/v1/admin/payouts/{id}/fail     Mark failed
GET    /api/v1/admin/payouts/stats         Get statistics
```

---

## 🎨 UI/UX Guidelines

### Color System

- **Available Balance:** Green (`text-green-600`)
- **Pending Balance:** Yellow (`text-yellow-600`)
- **Total Balance:** Blue (`text-blue-600`)
- **Positive Transactions:** Green (`text-green-600`)
- **Negative Transactions:** Red (`text-red-600`)
- **Payout Pending:** Yellow (`bg-yellow-100`)
- **Payout Processing:** Blue (`bg-blue-100`)
- **Payout Completed:** Green (`bg-green-100`)
- **Payout Failed:** Red (`bg-red-100`)

### Typography

- **Balance Amounts:** Large, bold, prominent
- **Transaction Amounts:** Medium, clear
- **Descriptions:** Small, muted
- **Dates:** Small, muted

### Icons

- **Wallet:** 💰
- **Earnings:** 📈
- **Transaction In:** ↗️
- **Transaction Out:** ↘️
- **Payout:** 💸
- **Bank:** 🏦
- **Success:** ✅
- **Error:** ❌
- **Pending:** ⏳

### Spacing

- Large gaps between major sections
- Compact spacing within cards
- Clear visual hierarchy

---

**Document Version:** 1.0  
**Last Updated:** October 25, 2025  
**Next Review:** Start of Sprint  
**Owner:** Development Team

---

_Bu sprint dokümanı, Marifet wallet & payout sisteminin application-wide entegrasyonunu, production-ready bir implementasyon için detaylı teknik spesifikasyonlar içermektedir. Messaging, Review ve Proposal sistemleri pattern'leri takip edilmiştir._
