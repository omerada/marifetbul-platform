# Review System - Production-Ready Integration Sprint# Review System - Production-Ready Sprint Documentation

**Sprint:** Review System Application-Wide Integration **Sprint:** Review System Complete Integration & Enhancement

**Duration:** 2 Weeks (10 Working Days) **Duration:** 2 Weeks (10 Working Days)

**Priority:** High (P0) **Priority:** High

**Created:** October 25, 2025 **Created:** October 25, 2025

**Status:** Ready to Start **Status:** Ready to Start

**Type:** Integration Sprint **Type:** Integration Sprint (Following Messaging System Pattern)

**Pattern:** Following MESSAGING_SYSTEM_SPRINT.md approach

---

---

## Executive Summary

## 📋 Executive Summary

Bu sprint, Marifet platformundaki review (değerlendirme) sisteminin application-wide entegrasyonunu ve production-ready hale getirilmesini hedeflemektedir. **Backend tam özellikli ve hazır** durumda. **Frontend component'ler mevcut ancak sayfa entegrasyonları eksik**. Bu sprint, MESSAGING_SYSTEM_SPRINT.md pattern'ini takip ederek review sistemini tüm kullanıcı akışlarına entegre edecektir.

Bu sprint, Marifet platformundaki **review (değerlendirme) sisteminin application-wide entegrasyonunu** hedeflemektedir.

### Mevcut Durum Analizi - Detaylı İnceleme

### Kritik Tespit

**NOT:** Backend review sistemi Sprint 5 God Class refactoring sonrası tamamen production-ready durumda. Frontend component'ler de mevcut ve çalışır durumda. **Asıl eksik olan application-wide entegrasyonlar ve kullanıcı akışlarına bağlantılardır.**

**Backend:** ✅ Tamamen production-ready (Sprint 5 refactoring sonrası facade pattern ile yapılandırılmış)

**Frontend Components:** ✅ Tüm component'ler mevcut ve çalışır durumda ---

**Integration:** ❌ **EKSIK** - Kullanıcı akışlarına entegrasyon yapılmamış

## Backend Architecture - TAMAMEN HAZIR ✅

**Analoji:** Messaging sisteminde olduğu gibi, **altyapı hazır ama kullanıcı erişemiyor**. Order tamamlandığında review yazma butonu yok, package detail'da reviews tab yok, admin moderation UI yok.

Backend review sistemi facade pattern ile refactor edilmiş ve tam özellikli:

### Sprint Hedefi

### Service Layer Structure (Facade Pattern)

Review sistemini **son kullanıcıya ulaştırmak** - "last mile integration"

````

---ReviewFacadeService (implements ReviewService)

    ├── ReviewCrudService (CRUD operations)

## 🔍 Current State Analysis    ├── ReviewValidationService (Business rules)

    ├── ReviewVotingService (Helpful/Not helpful voting)

> **Detaylı analiz için:** `REVIEW_SYSTEM_CURRENT_STATE.md` dokümanına bakın    ├── ReviewModerationService (Admin moderation)

    ├── SellerResponseService (Seller responses)

### Backend Status: ✅ PRODUCTION READY    ├── ReviewStatisticsService (Rating aggregation)

    └── RatingAggregationService (Caching & calculation)

**Architecture:** Facade Pattern (Sprint 5 refactoring)```



```### ✅ Mevcut Backend Özellikler

ReviewFacadeService (ReviewService implementation)

    ├── ReviewCrudService          → Create, Read, Update, Delete**Database & Entities:**

    ├── ReviewValidationService    → Business rules, permissions

    ├── ReviewVotingService        → Helpful/Not helpful voting- ✅ Review entity (tam özellikli)

    ├── ReviewModerationService    → Admin approve/reject/flag- ✅ ReviewStatus enum (PENDING, APPROVED, REJECTED, FLAGGED)

    ├── SellerResponseService      → Seller responses to reviews- ✅ ReviewType enum (ORDER_REVIEW, PACKAGE_REVIEW)

    ├── ReviewStatisticsService    → Rating aggregation, stats- ✅ Indexes ve optimizasyonlar

    └── RatingAggregationService   → Redis caching, calculation

```**Services:**



**Controllers: 4 REST Controllers** (All endpoints implemented)- ✅ ReviewCrudService (Create, Read, Update, Delete)

- ✅ ReviewModerationService (Approve, Reject, Flag resolution)

1. **ReviewUserController** - `/api/v1/user/reviews` (Authenticated users)- ✅ ReviewVotingService (Helpful votes)

2. **ReviewSellerController** - `/api/v1/seller/reviews` (Sellers)- ✅ SellerResponseService (Seller responses to reviews)

3. **ReviewAdminController** - `/api/v1/admin/reviews` (Admins)- ✅ ReviewValidationService (Business rules)

4. **ReviewController** - `/api/v1/reviews` (Public, no auth)- ✅ RatingAggregationService (Statistics & caching)



**Database:** Fully normalized with 4 tables**Controllers:**

- `reviews` - Main review entity

- `review_votes` - Helpful/not helpful tracking- ✅ ReviewController (Public endpoints)

- `review_flag_reports` - Flagging system- ✅ ReviewSellerController (Seller authenticated endpoints)

- `review_images` - Image attachments- ✅ ReviewAdminController (Admin moderation endpoints)



**Features:****Features:**

- 4 rating categories (overall, communication, quality, delivery)

- Verified purchase badge- ✅ 4 rating categories (overall, communication, quality, delivery)

- Helpful voting (prevents duplicates, self-voting)- ✅ Verified purchase reviews

- Auto-flag at 3 reports- ✅ Helpful/Not helpful voting

- Seller responses (10-500 chars)- ✅ Review flagging system

- 30-day edit/delete window- ✅ Seller response capability

- Soft delete (independent per user)- ✅ Rating statistics & aggregation

- Redis caching for statistics- ✅ Auto-approval by default



### Frontend Status: ⚠️ COMPONENTS READY, NOT INTEGRATED#### ✅ Mevcut Özellikler (Frontend)



**Components Inventory:****Components:**



| Component | Status | Location | Notes |- ✅ ReviewForm - Review oluşturma formu

|-----------|--------|----------|-------|- ✅ ReviewCard - Review display component

| ReviewForm | ✅ Ready | `components/shared/ReviewForm.tsx` | Full-featured, image upload, validation |- ✅ ReviewList - Review listesi ve filtreleme

| ReviewCard | ✅ Ready | `components/shared/ReviewCard.tsx` | Display, voting, actions |- ✅ ArticleRating - Article rating component

| ReviewList | ✅ Ready | `components/shared/ReviewList.tsx` | Pagination, filters, sort |

| RatingStars | ✅ Ready | `components/shared/RatingStars.tsx` | Interactive + read-only |**State Management:**

| RatingDistribution | ✅ Ready | `components/shared/RatingDistribution.tsx` | 5-star breakdown chart |

| ReviewFormModal | ✅ Ready | `components/domains/reviews/` | Modal wrapper |- ✅ reviewStore (Zustand)

| PackageReviewsTab | ✅ Ready | `components/domains/packages/` | **NOT USED** |- ✅ useReviews hook

- ✅ useReviewForm hook

**Pages Inventory:**

**Validations:**

| Page | Status | Completion | Notes |

|------|--------|------------|-------|- ✅ reviewSchema (Zod validation)

| Freelancer Reviews | ✅ Complete | 100% | Stats, filters, response dialog |

| Employer Reviews | ✅ Complete | 100% | Edit/delete, 30-day tracking |#### ❌ Eksik Özellikler

| Dashboard Reviews | ✅ Complete | 100% | Generic user reviews |

| Package Detail | ⚠️ Partial | 50% | Page exists, reviews tab NOT added |**Backend:**

| Order Detail (Employer) | ❌ Missing | 0% | **FILE DOESN'T EXIST** |

| Order Detail (Freelancer) | ❌ Missing | 0% | **FILE DOESN'T EXIST** |- ❌ Authenticated user için review CRUD endpoints (/api/v1/user/reviews)

| Admin Moderation | ❌ Missing | 0% | **DIRECTORY DOESN'T EXIST** |- ❌ Order completion sonrası otomatik review reminder

- ❌ Review notification system

**State Management:**- ❌ Review image upload

- ❌ Review helpful vote tracking (user specific)

- ✅ useReviewStore (Zustand) - Full CRUD, pagination, error handling- ❌ Review report history

- ✅ useReviews hook - Wrapper with filters- ❌ Bulk moderation operations

- ✅ useReviewForm hook - Form submission

**Frontend:**

### Critical Gaps: 🚨 THE ACTUAL PROBLEM

- ❌ Dashboard review pages (freelancer & employer)

#### Gap 1: Order → Review Flow (0% Complete)- ❌ Package detail review integration

- ❌ Admin review moderation UI

**Problem:** Users can't write reviews after completing orders- ❌ Review write modal (order-triggered)

- ❌ Review response UI for sellers

**What's Missing:**- ❌ Review notification badges

```- ❌ Review analytics dashboard

❌ Order detail pages don't exist- ❌ Mobile responsive optimizations

   - app/dashboard/employer/orders/[id]/page.tsx - DOESN'T EXIST

   - app/dashboard/freelancer/orders/[id]/page.tsx - DOESN'T EXIST**User Experience:**



❌ No "Write Review" button after order completion- ❌ Review yazma incentive'leri

❌ No OrderReviewPrompt component- ❌ Review quality guidelines

❌ No order-triggered ReviewFormModal- ❌ Review editing time limit (30 days)

❌ No review eligibility check on orders- ❌ Review response time tracking

```- ❌ Automated quality checks



**Expected User Flow:**---

````

Order Status = COMPLETED## Sprint Goals

    ↓

User sees "Write Review" button on order detail### Primary Goals

    ↓

Clicks button → ReviewFormModal opens1. **Complete User Review Flow** - Kullanıcıların review yazma, güncelleme, silme işlemlerini sorunsuz yapabilmesi

    ↓2. **Dashboard Integration** - Freelancer ve Employer dashboard'larına review yönetimi eklenmesi

Modal pre-filled with order context:3. **Package Detail Enhancement** - Package sayfalarına review sisteminin tam entegrasyonu

- orderId4. **Admin Moderation** - Admin paneline gelişmiş moderation araçlarının eklenmesi

- packageId

- sellerId### Secondary Goals

- sellerName

- type: ORDER_REVIEW5. **Order Completion Flow** - Order tamamlandığında review yazma akışının tetiklenmesi

  ↓6. **Notification System** - Review ile ilgili bildirimlerin eklenmesi

User submits → Review created7. **Quality Assurance** - Comprehensive testing ve bug fixes

    ↓

Success notification + navigate to /dashboard/reviews---

````

## User Stories

#### Gap 2: Package Reviews Display (50% Complete)

### Epic 1: User Review Management

**Problem:** Package detail page doesn't show reviews

#### US-1.1: Müşteri olarak sipariş sonrası review yazmak istiyorum

**What Exists:**

- ✅ PackageReviewsTab component (fully built)**Priority:** P0 (Must Have)

- ✅ ServiceDetail component with Tabs

- ✅ Package detail page structure**Acceptance Criteria:**



**What's Missing:**- [ ] Order COMPLETED durumuna geldiğinde "Review Yaz" butonu görünür

```tsx- [ ] Review form modal açılır ve order bilgileri otomatik doldurulur

// In ServiceDetail.tsx, Tabs section:- [ ] 4 kategori (communication, quality, timing, professionalism) için rating verilebilir

❌ Reviews TabsTrigger NOT added- [ ] Minimum 10 karakter yorum zorunluluğu

❌ Reviews TabsContent NOT added- [ ] Review public/private seçeneği

❌ PackageReviewsTab component imported but UNUSED- [ ] Başarılı submit sonrası "Teşekkürler" mesajı

❌ Review count not fetched- [ ] Review 30 gün içinde düzenlenebilir

❌ "Write Review" eligibility partial (commented out logic)- [ ] Validation hataları kullanıcıya net gösterilir

````

**Technical Tasks:**

**Fix Required:**

````tsx- [ ] POST /api/v1/user/reviews endpoint

// Add to TabsList:- [ ] ReviewUserController.java oluştur

<TabsTrigger value="reviews">- [ ] Order detail sayfasına review butonu ekle

  Değerlendirmeler ({reviewCount})- [ ] ReviewFormModal component

</TabsTrigger>- [ ] Review submission analytics tracking



// Add to TabsContent:---

<TabsContent value="reviews">

  <PackageReviewsTab #### US-1.2: Freelancer olarak aldığım reviews'ları görmek istiyorum

    packageId={packageId}

    sellerId={sellerId}**Priority:** P0 (Must Have)

    canWriteReview={canReview}

    onReviewSubmit={handleReviewSuccess}**Acceptance Criteria:**

  />

</TabsContent>- [ ] Dashboard'da "Değerlendirmeler" sekmesi

```- [ ] Tüm reviews liste halinde (paginated)

- [ ] Filter: Rating, Date, Verified

#### Gap 3: Admin Moderation UI (0% Complete)- [ ] Sort: Newest, Oldest, Highest Rating, Lowest Rating

- [ ] Overall rating score prominently displayed

**Problem:** Admins can't moderate reviews from UI- [ ] Rating distribution chart (5 star breakdown)

- [ ] Response rate gösterimi

**Backend Status:** ✅ All endpoints ready- [ ] Her review'a yanıt verme butonu

**Frontend Status:** ❌ Nothing exists

**Technical Tasks:**

**Missing Directory Structure:**

```- [ ] /app/dashboard/freelancer/reviews/page.tsx implement

app/admin/moderation/reviews/- [ ] GET /api/v1/seller/reviews endpoint kullanımı

  ├── page.tsx                    ❌ Doesn't exist- [ ] ReviewStats component

  ├── pending/page.tsx            ❌ Doesn't exist- [ ] RatingDistribution chart component

  └── flagged/page.tsx            ❌ Doesn't exist- [ ] Review response modal



components/domains/admin/moderation/reviews/---

  ├── PendingReviewsTable.tsx     ❌ Doesn't exist

  ├── FlaggedReviewsTable.tsx     ❌ Doesn't exist#### US-1.3: Freelancer olarak review'lara yanıt vermek istiyorum

  ├── ReviewDetailModal.tsx       ❌ Doesn't exist

  ├── ReviewModerationActions.tsx ❌ Doesn't exist**Priority:** P0 (Must Have)

  └── ReviewStatsWidget.tsx       ❌ Doesn't exist

```**Acceptance Criteria:**



---- [ ] Her review card'da "Yanıtla" butonu

- [ ] Response textarea (10-500 karakter)

## 🎯 Sprint Goals- [ ] Response preview

- [ ] Response edit/delete özelliği

### Primary Goals (P0 - Must Have)- [ ] Response timestamp gösterimi

- [ ] Müşteriye notification gönderimi

1. **Complete Order → Review Flow** ✅

   - Create order detail pages (employer & freelancer)**Technical Tasks:**

   - Add "Write Review" button with eligibility check

   - Implement OrderReviewButton component- [ ] ReviewResponseForm component

   - Connect ReviewFormModal with order context- [ ] POST /api/v1/seller/reviews/{id}/respond endpoint kullanımı

   - Test end-to-end flow- [ ] PUT /api/v1/seller/reviews/{id}/response endpoint kullanımı

- [ ] DELETE /api/v1/seller/reviews/{id}/response endpoint kullanımı

2. **Integrate Package Reviews Tab** ✅- [ ] Response notification trigger

   - Add reviews tab to ServiceDetail

   - Connect PackageReviewsTab component---

   - Fetch review count

   - Implement "Write Review" button eligibility#### US-1.4: Employer olarak verdiğim reviews'ları yönetmek istiyorum

   - Test filtering and sorting

**Priority:** P1 (Should Have)

3. **Build Admin Moderation UI** ✅

   - Create moderation pages structure**Acceptance Criteria:**

   - Build PendingReviewsTable

   - Build FlaggedReviewsTable- [ ] Dashboard'da "Verdiğim Değerlendirmeler" sayfası

   - Implement ReviewDetailModal- [ ] Tüm verdiğim reviews listesi

   - Add bulk actions- [ ] Edit butonu (30 gün içinde)

   - Connect to backend endpoints- [ ] Delete butonu

- [ ] Seller'ın response'u varsa gösterim

### Secondary Goals (P1 - Should Have)- [ ] Review status gösterimi (Pending, Approved, Rejected)



4. **Profile Rating Display****Technical Tasks:**

   - Show seller rating on profile header

   - Add reviews tab to profile- [ ] /app/dashboard/employer/reviews/page.tsx

   - Display public reviews list- [ ] GET /api/v1/user/reviews endpoint

   - Rating breakdown widget- [ ] PUT /api/v1/user/reviews/{id} endpoint

- [ ] DELETE /api/v1/user/reviews/{id} endpoint

5. **Order Completion Notifications**- [ ] Review edit modal

   - Review reminder after 7 days

   - Review deadline warning (30 days)---

   - Email notifications

### Epic 2: Package Review Integration

### Tertiary Goals (P2 - Nice to Have)

#### US-2.1: Ziyaretçi olarak package'ın reviews'larını görmek istiyorum

6. **Marketplace Integration**

   - Rating display in package cards**Priority:** P0 (Must Have)

   - Filter by rating

   - Sort by rating option**Acceptance Criteria:**



7. **Review Analytics**- [ ] Package detail sayfasında "Değerlendirmeler" tab

   - Admin analytics dashboard- [ ] Reviews list (paginated, 10 per page)

   - Review trends- [ ] Filter: All/5-star/4-star/3-star/2-star/1-star/Verified

   - Sentiment analysis (future)- [ ] Sort: Helpful, Recent, Rating

- [ ] Average rating prominently displayed

---- [ ] Rating distribution visual

- [ ] "Helpful" vote butonu

## 📝 User Stories & Acceptance Criteria- [ ] Verified purchase badge

- [ ] Seller responses gösterimi

### Epic 1: Order → Review Integration

**Technical Tasks:**

#### US-1.1: Employer - Write Review After Order Completion

- [ ] PackageReviewsTab component

**Priority:** P0 (Must Have)  - [ ] GET /api/v1/reviews/package/{packageId} endpoint integration

**Estimate:** 6 hours- [ ] usePackageReviews hook

- [ ] Review filtering logic

**As an** Employer (buyer)  - [ ] Infinite scroll or pagination

**I want to** write a review after my order is completed  - [ ] Helpful vote handling

**So that** I can provide feedback about the freelancer's work

---

**Acceptance Criteria:**

#### US-2.2: Package sayfasında review yazmak istiyorum

- [ ] Order detail page exists at `/dashboard/employer/orders/[id]`

- [ ] Page displays order information (package, seller, status, timeline)**Priority:** P1 (Should Have)

- [ ] When order status is `COMPLETED`, "Write Review" button appears

- [ ] Button is disabled if review already written (with "Review Submitted" message)**Acceptance Criteria:**

- [ ] Button checks review eligibility via `/api/v1/user/reviews/can-review/{orderId}`

- [ ] Clicking button opens ReviewFormModal with pre-filled data:- [ ] "Review Yaz" butonu (sadece satın almış kullanıcılar için)

  - orderId- [ ] Review form modal

  - packageId- [ ] Package bilgileri otomatik doldurulur

  - sellerId- [ ] Başarılı submit sonrası review listede görünür

  - sellerName- [ ] Duplicate review engellenir

  - type: `ORDER_REVIEW`

- [ ] Form shows 4 rating categories (overall, communication, quality, delivery)**Technical Tasks:**

- [ ] Text validation: 50-1000 characters

- [ ] Success: Toast notification "Review submitted successfully"- [ ] canUserReviewPackage check

- [ ] After success: Modal closes, button changes to "View Review" (links to review)- [ ] ReviewFormModal integration

- [ ] If order not completed: Button hidden or disabled with explanation- [ ] POST /api/v1/user/reviews endpoint

- [ ] If outside 30-day window: Button shows "Review period expired"- [ ] Optimistic UI update



**Technical Tasks:**---



- [ ] Create `app/dashboard/employer/orders/[id]/page.tsx`### Epic 3: Admin Moderation

- [ ] Fetch order data via `/api/v1/orders/{id}`

- [ ] Create `OrderReviewButton` component#### US-3.1: Admin olarak pending reviews'ları görmek istiyorum

  - Check eligibility: `GET /api/v1/user/reviews/can-review/{orderId}`

  - Parse reason if can't review (not buyer, not completed, already reviewed, etc.)**Priority:** P0 (Must Have)

  - Render appropriate state (button, disabled, message)

- [ ] Connect ReviewFormModal with order context**Acceptance Criteria:**

- [ ] Handle review submission success

  - Toast notification- [ ] Admin panel "Moderation" > "Reviews" sayfası

  - Update button state- [ ] Pending reviews tab

  - Optionally navigate to `/dashboard/reviews`- [ ] Tüm pending reviews table

- [ ] Add loading states- [ ] Quick preview

- [ ] Add error handling- [ ] Bulk select checkbox

- [ ] Approve/Reject buttons

**Design Notes:**- [ ] Admin notes field

- [ ] Search/filter functionality

````

┌──────────────────────────────────────────────┐**Technical Tasks:**

│ Order #12345 [Status] │

│ │- [ ] /app/admin/moderation/reviews/page.tsx

│ Package: Web Development │- [ ] GET /api/v1/admin/reviews/pending endpoint

│ Seller: John Doe │- [ ] PendingReviewsTable component

│ Price: ₺5,000 | Delivered: Oct 20, 2025 │- [ ] POST /api/v1/admin/reviews/{id}/approve endpoint

│ │- [ ] POST /api/v1/admin/reviews/{id}/reject endpoint

│ ┌──────────────────────────────────────────┐│- [ ] Bulk actions API

│ │ Timeline, Deliverables, Messages ││

│ └──────────────────────────────────────────┘│---

│ │

│ [Write Review] [Request Revision] [Approve] │#### US-3.2: Admin olarak flagged reviews'ları modere etmek istiyorum

└──────────────────────────────────────────────┘

````**Priority:** P0 (Must Have)



---**Acceptance Criteria:**



#### US-1.2: Freelancer - View Buyer's Review- [ ] Flagged reviews tab

- [ ] Flag reason gösterimi

**Priority:** P0 (Must Have)  - [ ] Flag count gösterimi

**Estimate:** 4 hours- [ ] Reporter bilgisi

- [ ] Quick actions: Approve, Reject, Delete

**As a** Freelancer (seller)  - [ ] Resolution notes

**I want to** see buyer's review on order detail page  - [ ] Flag history

**So that** I can read feedback and respond if needed

**Technical Tasks:**

**Acceptance Criteria:**

- [ ] FlaggedReviewsTable component

- [ ] Order detail page exists at `/dashboard/freelancer/orders/[id]`- [ ] GET /api/v1/admin/reviews/flagged endpoint

- [ ] If buyer submitted review, display ReviewCard on page- [ ] ReviewDetailModal component

- [ ] ReviewCard shows all ratings and text- [ ] POST /api/v1/admin/reviews/{id}/resolve endpoint

- [ ] If I haven't responded, "Respond to Review" button appears- [ ] Flag history display

- [ ] Clicking button opens response dialog (same as in `/dashboard/freelancer/reviews`)

- [ ] Response can be added (10-500 chars)---

- [ ] Success: Toast notification, ReviewCard updates with my response

- [ ] If I already responded, response is shown in ReviewCard#### US-3.3: Admin olarak review istatistiklerini görmek istiyorum

- [ ] Can edit/delete my response from ReviewCard

**Priority:** P2 (Nice to Have)

**Technical Tasks:**

**Acceptance Criteria:**

- [ ] Create `app/dashboard/freelancer/orders/[id]/page.tsx`

- [ ] Fetch order data via `/api/v1/orders/{id}`- [ ] Dashboard widget

- [ ] Check if review exists for this order:- [ ] Total reviews count

  - Query `/api/v1/reviews?orderId={orderId}` or include in order response- [ ] Pending count

- [ ] If review exists, fetch full review data- [ ] Flagged count

- [ ] Display ReviewCard component- [ ] Average review rating

- [ ] Add seller response functionality:- [ ] Response rate

  - Reuse response dialog from freelancer reviews page- [ ] Reviews trend (last 30 days)

  - POST `/api/v1/seller/reviews/{reviewId}/respond`

  - PUT `/api/v1/seller/reviews/{reviewId}/response`**Technical Tasks:**

  - DELETE `/api/v1/seller/reviews/{reviewId}/response`

- [ ] Handle success/error states- [ ] ReviewStatsWidget component

- [ ] GET /api/v1/admin/reviews/stats endpoint

---- [ ] Chart.js integration

- [ ] Real-time updates

#### US-1.3: Review Eligibility Validation

---

**Priority:** P0 (Must Have)

**Estimate:** 2 hours### Epic 4: Order Completion Flow



**As a** User  #### US-4.1: Order tamamlandığında review yazma hatırlatması almak istiyorum

**I want** clear feedback on why I can't write a review

**So that** I understand the review system rules**Priority:** P1 (Should Have)



**Acceptance Criteria:****Acceptance Criteria:**



- [ ] Call `/api/v1/user/reviews/can-review/{orderId}` endpoint- [ ] Order COMPLETED durumuna geldiğinde notification

- [ ] Endpoint returns: `{ canReview: boolean, reason?: string }`- [ ] "Review Yaz" call-to-action

- [ ] Possible reasons:- [ ] 7 gün sonra reminder notification

  - `NOT_BUYER` - "You can only review orders you purchased"- [ ] 30 gün sonrası review yazılamaz uyarısı

  - `NOT_COMPLETED` - "Order must be completed before reviewing"- [ ] Review yazıldıysa notification durur

  - `ALREADY_REVIEWED` - "You've already reviewed this order"

  - `REVIEW_WINDOW_EXPIRED` - "Review period (30 days) has expired"**Technical Tasks:**

- [ ] Display appropriate message to user based on reason

- [ ] Button disabled with tooltip explaining reason- [ ] Order completion event listener

- [ ] For expired window, show exact expiry date- [ ] Review reminder notification service

- [ ] ReviewReminderJob (scheduled)

**Technical Tasks:**- [ ] Notification template

- [ ] Review deadline enforcement

- [ ] Integrate existing backend endpoint (already implemented)

- [ ] Create `useReviewEligibility` hook---

  - Fetch eligibility on mount

  - Cache result### Epic 5: Notification System

  - Return `{ canReview, reason, isLoading, error }`

- [ ] Update OrderReviewButton to use hook#### US-5.1: Review bildirimleri almak istiyorum

- [ ] Add tooltip/popover for disabled state

- [ ] Format expiry date (e.g., "Review period ended on Oct 25, 2025")**Priority:** P1 (Should Have)



---**Acceptance Criteria:**



### Epic 2: Package Reviews Integration- [ ] Yeni review alındığında bildirim (seller)

- [ ] Review'a yanıt geldiğinde bildirim (buyer)

#### US-2.1: Visitor - View Package Reviews- [ ] Review helpful bulunduğunda bildirim (reviewer)

- [ ] Review approved/rejected bildirim (reviewer)

**Priority:** P0 (Must Have)  - [ ] Review flagged bildirim (admin)

**Estimate:** 3 hours

**Technical Tasks:**

**As a** Visitor (or logged-in user)

**I want to** see reviews for a package  - [ ] ReviewNotificationService

**So that** I can evaluate the quality before purchasing- [ ] Notification templates

- [ ] Email notifications

**Acceptance Criteria:**- [ ] In-app notifications

- [ ] Push notifications (optional)

- [ ] Package detail page (`/marketplace/packages/[id]`) has "Reviews" tab

- [ ] Tab shows review count: "Değerlendirmeler (23)"---

- [ ] Clicking tab loads PackageReviewsTab component

- [ ] Tab displays:## Technical Architecture

  - Rating summary (average + count)

  - Rating distribution (5-star chart)### Backend API Endpoints

  - Filters (All / 5★ / 4★ / 3★ / 2★ / 1★ / Verified)

  - Sort (Recent, Helpful, Rating)#### User Endpoints (Authentication Required)

  - Paginated review list (ReviewCard components)

- [ ] Reviews show:```

  - Reviewer name/avatarPOST   /api/v1/user/reviews                 Create review

  - Rating stars (overall + categories)GET    /api/v1/user/reviews                 Get my reviews

  - Review textGET    /api/v1/user/reviews/{id}            Get review detail

  - Verified purchase badge (if applicable)PUT    /api/v1/user/reviews/{id}            Update my review

  - Seller response (if any)DELETE /api/v1/user/reviews/{id}            Delete my review

  - Helpful vote countsPOST   /api/v1/user/reviews/{id}/helpful    Mark as helpful

  - Time agoPOST   /api/v1/user/reviews/{id}/flag       Flag review

- [ ] Helpful voting works (logged-in users only)GET    /api/v1/user/reviews/can-review/{orderId}  Check if can review

- [ ] Empty state: "No reviews yet. Be the first to review!"```

- [ ] Loading state: Skeleton loaders

- [ ] Pagination controls at bottom#### Seller Endpoints (Existing - Already Implemented)



**Technical Tasks:**```

GET    /api/v1/seller/reviews               Get reviews about me

- [ ] Modify `components/domains/packages/ServiceDetail.tsx`:POST   /api/v1/seller/reviews/{id}/respond  Respond to review

  - Add reviews tab to `<TabsList>`PUT    /api/v1/seller/reviews/{id}/response Update response

  - Add reviews content to `<TabsContent>`DELETE /api/v1/seller/reviews/{id}/response Delete response

  - Fetch review count: `GET /api/v1/reviews/package/{packageId}/count`GET    /api/v1/seller/reviews/stats         My rating stats

  - Pass packageId to PackageReviewsTab```

- [ ] Verify PackageReviewsTab component functionality:

  - Fetches reviews: `GET /api/v1/reviews/package/{packageId}`#### Admin Endpoints (Existing - Already Implemented)

  - Implements filters

  - Implements sorting```

  - Implements paginationGET    /api/v1/admin/reviews                All reviews

  - Connects to useReviewStoreGET    /api/v1/admin/reviews/pending        Pending reviews

- [ ] Test helpful voting:GET    /api/v1/admin/reviews/flagged        Flagged reviews

  - POST `/api/v1/user/reviews/{reviewId}/vote/helpful`POST   /api/v1/admin/reviews/{id}/approve   Approve review

  - POST `/api/v1/user/reviews/{reviewId}/vote/not-helpful`POST   /api/v1/admin/reviews/{id}/reject    Reject review

- [ ] Add loading/error statesPOST   /api/v1/admin/reviews/{id}/resolve   Resolve flag

- [ ] Test with 0, 1, 10, 100+ reviewsDELETE /api/v1/admin/reviews/{id}           Delete review

````

**Design Note:**

### Frontend Components Structure

````

┌────────────────────────────────────────────────┐```

│ [Overview] [Pricing] [FAQ] [Reviews (23)] ← TAB│components/

│                                                 │  domains/

│ ┌─────────────────────────────────────────────┐│    reviews/

│ │ ⭐ 4.8 / 5.0  (23 değerlendirme)           ││      ├── ReviewForm.tsx              ✅ (needs enhancement)

│ │                                             ││      ├── ReviewFormModal.tsx         ❌ (to create)

│ │ 5★ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 18 (78%)             ││      ├── ReviewCard.tsx              ✅ (needs enhancement)

│ │ 4★ ▓▓▓▓ 3 (13%)                            ││      ├── ReviewList.tsx              ✅ (needs enhancement)

│ │ 3★ ▓▓ 1 (4%)                               ││      ├── ReviewStats.tsx             ❌ (to create)

│ │ 2★ ▓ 1 (4%)                                ││      ├── RatingDistribution.tsx      ❌ (to create)

│ │ 1★  0 (0%)                                 ││      ├── ReviewResponseForm.tsx      ❌ (to create)

│ └─────────────────────────────────────────────┘│      ├── ReviewFilters.tsx           ❌ (to create)

│                                                 │      └── ReviewSkeleton.tsx          ❌ (to create)

│ [All] [5★] [4★] [3★] [2★] [1★] [Verified]     │

│ Sort: [Recent ▼]                               │    admin/

│                                                 │      moderation/

│ ┌─────────────────────────────────────────────┐│        reviews/

│ │ [Avatar] Jane Doe  ⭐⭐⭐⭐⭐  ✓Verified    ││          ├── PendingReviewsTable.tsx     ❌ (to create)

│ │          2 days ago                         ││          ├── FlaggedReviewsTable.tsx     ❌ (to create)

│ │                                             ││          ├── ReviewDetailModal.tsx       ❌ (to create)

│ │ "Excellent service! Delivered on time..."  ││          ├── ReviewModerationActions.tsx ❌ (to create)

│ │                                             ││          └── ReviewStatsWidget.tsx       ❌ (to create)

│ │ 💬 Seller Response (1 day ago)             ││```

│ │ "Thank you for your feedback!"             ││

│ │                                             ││### Database Schema (Already Implemented)

│ │ [👍 Helpful (5)] [👎 Not Helpful (0)]      ││

│ └─────────────────────────────────────────────┘│```sql

│                                                 │reviews (

│ [More Reviews...] [1] [2] [3]                  │  id UUID PRIMARY KEY,

└────────────────────────────────────────────────┘  reviewer_id UUID NOT NULL (FK -> users),

```  reviewee_id UUID NOT NULL (FK -> users),

  order_id UUID (FK -> orders),

---  package_id UUID (FK -> packages),

  type VARCHAR(20) NOT NULL,

#### US-2.2: Buyer - Write Package Review From Package Detail  status VARCHAR(20) NOT NULL DEFAULT 'APPROVED',

  overall_rating DECIMAL(2,1) NOT NULL,

**Priority:** P1 (Should Have)    communication_rating DECIMAL(2,1) NOT NULL,

**Estimate:** 2 hours  quality_rating DECIMAL(2,1) NOT NULL,

  delivery_rating DECIMAL(2,1) NOT NULL,

**As a** Buyer (who purchased this package)    review_text VARCHAR(1000) NOT NULL,

**I want to** write a review directly from package detail page    response_text VARCHAR(500),

**So that** I can share my experience conveniently  helpful_count INT DEFAULT 0,

  not_helpful_count INT DEFAULT 0,

**Acceptance Criteria:**  is_verified_purchase BOOLEAN DEFAULT FALSE,

  flagged_count INT DEFAULT 0,

- [ ] If I purchased and completed an order for this package, "Write Review" button appears above reviews list  admin_notes VARCHAR(500),

- [ ] Button only visible if:  created_at TIMESTAMP,

  - I'm logged in  updated_at TIMESTAMP,

  - I have a completed order for this package  responded_at TIMESTAMP

  - Order is within 30-day review window)

  - I haven't already reviewed this order```

- [ ] Clicking button opens ReviewFormModal with pre-filled data

- [ ] After submission, review appears in list (if approved)---

- [ ] If no eligible orders, button not shown

## Development Tasks Breakdown

**Technical Tasks:**

### Day 1-2: User Review Controller & Basic Flow

- [ ] Add eligibility check in PackageReviewsTab:

  - Fetch user's orders for this package: `GET /api/v1/orders?packageId={packageId}&userId={userId}&status=COMPLETED`**Backend:**

  - For each completed order, check if reviewed

  - Find first eligible order- [ ] Create ReviewUserController.java

- [ ] Render "Write Review" button if eligible- [ ] Implement POST /api/v1/user/reviews

- [ ] Pass eligible orderId to ReviewFormModal- [ ] Implement GET /api/v1/user/reviews

- [ ] After success, refetch reviews list- [ ] Implement PUT /api/v1/user/reviews/{id}

- [ ] Implement DELETE /api/v1/user/reviews/{id}

---- [ ] Add canUserReview validation

- [ ] Write unit tests

### Epic 3: Admin Moderation UI

**Frontend:**

#### US-3.1: Admin - View Pending Reviews

- [ ] Create ReviewFormModal.tsx

**Priority:** P0 (Must Have)  - [ ] Integrate with order detail page

**Estimate:** 6 hours- [ ] Add review button to completed orders

- [ ] Implement review submission flow

**As an** Admin  - [ ] Add success/error handling

**I want to** see all pending reviews in a table

**So that** I can approve or reject them**Estimated Time:** 16 hours



**Acceptance Criteria:**---



- [ ] Page exists at `/admin/moderation/reviews/pending`### Day 3-4: Dashboard Review Pages

- [ ] Displays table with columns:

  - Review ID**Freelancer Dashboard:**

  - Reviewer name (clickable → user profile)

  - Reviewee name (clickable → user profile)- [ ] Implement /app/dashboard/freelancer/reviews/page.tsx

  - Package/Order (clickable → detail)- [ ] Create ReviewStats component

  - Overall rating (stars)- [ ] Create RatingDistribution component

  - Review text (truncated, expandable)- [ ] Integrate GET /api/v1/seller/reviews

  - Created date (relative time)- [ ] Add filtering and sorting

  - Actions (Approve, Reject, View Detail)- [ ] Add response functionality

- [ ] Table is paginated (20 per page)

- [ ] Sort by: Date (default), Rating**Employer Dashboard:**

- [ ] Search by reviewer/reviewee name

- [ ] Click "View Detail" opens ReviewDetailModal- [ ] Implement /app/dashboard/employer/reviews/page.tsx

- [ ] Modal shows:- [ ] Create "My Reviews" list

  - Full review text- [ ] Add edit/delete actions

  - All ratings- [ ] Integrate user review endpoints

  - Images (if any)- [ ] Add review status indicators

  - Reviewer profile summary

  - Reviewee profile summary**Estimated Time:** 16 hours

  - Order/Package context

  - Admin notes field---

  - Approve/Reject buttons

- [ ] Approve: POST `/api/v1/admin/reviews/{id}/approve`### Day 5-6: Package Detail Review Integration

  - Success: Toast, row removed from table

  - Review becomes public**Frontend:**

  - Seller gets notification

- [ ] Reject: POST `/api/v1/admin/reviews/{id}/reject`- [ ] Create PackageReviewsTab component

  - Requires reason (admin notes)- [ ] Integrate GET /api/v1/reviews/package/{packageId}

  - Success: Toast, row removed- [ ] Add review filtering

  - Reviewer gets notification with reason- [ ] Implement helpful voting

- [ ] Bulk actions:- [ ] Add infinite scroll or pagination

  - Checkbox per row- [ ] Optimize performance

  - "Approve Selected" button

  - "Reject Selected" button**Backend:**

  - Confirmation dialog

- [ ] Empty state: "No pending reviews 🎉"- [ ] Add helpful vote tracking per user

- [ ] Loading state: Skeleton table- [ ] Implement POST /api/v1/user/reviews/{id}/helpful

- [ ] Add duplicate prevention

**Technical Tasks:**- [ ] Cache optimization



- [ ] Create `app/admin/moderation/reviews/pending/page.tsx`**Estimated Time:** 16 hours

- [ ] Create `components/domains/admin/moderation/reviews/PendingReviewsTable.tsx`

  - Fetch: `GET /api/v1/admin/reviews/pending?page={p}&size={s}&sort={s}`---

  - Render DataTable (reuse existing table component)

  - Add columns configuration### Day 7-8: Admin Moderation UI

  - Implement search (client-side or server-side)

  - Implement sorting**Frontend:**

- [ ] Create `components/domains/admin/moderation/reviews/ReviewDetailModal.tsx`

  - Accept reviewId prop- [ ] Create /app/admin/moderation/reviews/page.tsx

  - Fetch full review: `GET /api/v1/admin/reviews/{id}`- [ ] Create PendingReviewsTable component

  - Render all review details- [ ] Create FlaggedReviewsTable component

  - Admin notes textarea- [ ] Create ReviewDetailModal component

  - Approve/Reject buttons- [ ] Add bulk actions

- [ ] Implement approve action:- [ ] Add search and filters

  - POST `/api/v1/admin/reviews/{id}/approve`

  - Optimistic update**Backend:**

  - Refetch table data

- [ ] Implement reject action:- [ ] Implement bulk approve/reject

  - Validate admin notes (min 10 chars)- [ ] Add advanced filtering

  - POST `/api/v1/admin/reviews/{id}/reject` with body `{ reason: string }`- [ ] Optimize admin queries

  - Refetch table data

- [ ] Implement bulk actions:**Estimated Time:** 16 hours

  - Track selected review IDs (useState)

  - Approve all: Loop and call approve endpoint---

  - Reject all: Single modal for bulk reason, then loop

  - Show progress (X/Y approved)### Day 9: Order Completion & Notifications

- [ ] Add permissions check (admin role required)

- [ ] Add error handling (show errors in toast)**Backend:**



---- [ ] Create ReviewReminderService

- [ ] Add order completion event handler

#### US-3.2: Admin - Moderate Flagged Reviews- [ ] Implement notification templates

- [ ] Create scheduled job for reminders

**Priority:** P0 (Must Have)  - [ ] Add email notifications

**Estimate:** 5 hours

**Frontend:**

**As an** Admin

**I want to** see flagged reviews and resolve them  - [ ] Add notification badges

**So that** I can maintain content quality- [ ] Create notification dropdown

- [ ] Add review reminder UI

**Acceptance Criteria:**

**Estimated Time:** 8 hours

- [ ] Page exists at `/admin/moderation/reviews/flagged`

- [ ] Table columns:---

  - Review ID

  - Reviewer name### Day 10: Testing, Bug Fixes & Polish

  - Reviewee name

  - Overall rating**Testing:**

  - Review text (truncated)

  - Flag count (badge)- [ ] E2E test: Complete review creation flow

  - Flag reasons (tags: Spam, Inappropriate, Fake, etc.)- [ ] E2E test: Seller response flow

  - Created date- [ ] E2E test: Admin moderation flow

  - Actions (View Detail, Resolve, Delete)- [ ] E2E test: Review voting and flagging

- [ ] Clicking "View Detail" opens ReviewDetailModal with:- [ ] Performance testing

  - Review content- [ ] Mobile responsiveness testing

  - List of flag reports:

    - Reporter name**Polish:**

    - Flag reason

    - Reporter's explanation- [ ] UI/UX improvements

    - Report date- [ ] Loading states optimization

  - Resolution actions:- [ ] Error handling enhancement

    - Keep Review (resolve flags, review stays)- [ ] Accessibility improvements

    - Edit Review (admin edit mode)- [ ] Documentation updates

    - Reject Review (remove from public)

    - Delete Review (hard delete)**Estimated Time:** 8 hours

- [ ] "Keep Review" action:

  - POST `/api/v1/admin/reviews/{id}/resolve` with `{ action: 'KEEP' }`---

  - Marks all flags as resolved

  - Review status remains APPROVED## UI/UX Specifications

  - Success: Row removed from flagged list

- [ ] "Reject Review" action:### Review Form Design

  - Moves review to REJECTED status

  - No longer public**Layout:**

  - Reviewer notified

- [ ] "Delete Review" action:```

  - Confirmation dialog (dangerous action)┌─────────────────────────────────────┐

  - DELETE `/api/v1/admin/reviews/{id}`│  ⭐ İnceleme Yaz                    │

  - Permanent deletion│  ───────────────────────────────── │

  - Audit log entry│                                     │

- [ ] Sort by: Flag count (default, desc), Date│  [Name] için inceleme yazıyorsunuz │

- [ ] Filter by flag reason (checkboxes)│  Proje: [Project Title]            │

- [ ] Empty state: "No flagged reviews ✨"│                                     │

│  Progress: [====    ] 40%           │

**Technical Tasks:**│                                     │

│  Genel Değerlendirme               │

- [ ] Create `app/admin/moderation/reviews/flagged/page.tsx`│  ☆ ☆ ☆ ☆ ☆                        │

- [ ] Create `components/domains/admin/moderation/reviews/FlaggedReviewsTable.tsx`│                                     │

  - Fetch: `GET /api/v1/admin/reviews/flagged?page={p}&size={s}`│  Kategori Değerlendirmeleri        │

  - Render table with flag badges│  [💬 İletişim]      ☆☆☆☆☆        │

  - Color-code by flag count (yellow: 3-5, orange: 6-9, red: 10+)│  [⭐ Kalite]        ☆☆☆☆☆        │

- [ ] Extend ReviewDetailModal for flagged reviews:│  [⏰ Zamanlama]     ☆☆☆☆☆        │

  - Fetch flag reports: Include in review response or separate endpoint│  [👤 Profesyonellik] ☆☆☆☆☆       │

  - Display reporters list│                                     │

  - Add resolution action buttons│  Yorumunuz                          │

- [ ] Implement "Keep Review":│  [────────────────────────────]    │

  - POST `/api/v1/admin/reviews/{id}/resolve` body: `{ action: 'KEEP', notes?: string }`│  │                             │    │

  - Update table│  └─────────────────────────────┘    │

- [ ] Implement "Reject Review":│  ✓ Yeterli detay  |  125/2000      │

  - POST `/api/v1/admin/reviews/{id}/reject` body: `{ reason: string }`│                                     │

  - Update table│  □ Herkese Açık                    │

- [ ] Implement "Delete Review":│                                     │

  - Confirmation modal with warning│  [İptal]  [İnceleme Gönder]       │

  - DELETE `/api/v1/admin/reviews/{id}`└─────────────────────────────────────┘

  - Update table```

- [ ] Add filter UI:

  - Checkboxes for each ReviewFlag enum value### Review Card Design

  - Apply filters to API query

- [ ] Add permissions check (admin role)```

┌─────────────────────────────────────┐

---│ [Avatar] [Name]    [Employer]  [✓]  │

│          ⭐⭐⭐⭐⭐ 5/5  • 2 gün önce│

#### US-3.3: Admin - Review Moderation Dashboard│          Proje: Web Development     │

│                                     │

**Priority:** P1 (Should Have)  │ [💬4] [⭐5] [⏰5] [👤5]            │

**Estimate:** 3 hours│                                     │

│ Harika bir deneyimdi. Çok          │

**As an** Admin  │ profesyonel ve zamanında teslim... │

**I want to** see review moderation statistics  │ [Devamını oku]                      │

**So that** I can monitor platform health│                                     │

│ [👍 Faydalı (12)]  [Özel]         │

**Acceptance Criteria:**│                                     │

│ ┌─ Seller Response ───────────┐   │

- [ ] Page exists at `/admin/moderation/reviews`│ │ [Avatar] [Name] • Yanıt     │   │

- [ ] Displays stats cards:│ │ Teşekkür ederim! ...        │   │

  - Total reviews│ └─────────────────────────────┘   │

  - Pending count (with link to pending page)└─────────────────────────────────────┘

  - Flagged count (with link to flagged page)```

  - Rejected count

  - Approved count### Dashboard Stats Widget

  - Average overall rating (platform-wide)

- [ ] Shows charts:```

  - Reviews over time (line chart, last 30 days)┌─────────────────────────────────────┐

  - Rating distribution (5-star breakdown)│  Değerlendirme İstatistikleri       │

  - Flag reasons breakdown (pie chart)│  ───────────────────────────────── │

- [ ] Quick actions:│                                     │

  - "Go to Pending Reviews" button│  [⭐]  Ortalama Puan               │

  - "Go to Flagged Reviews" button│        4.8 / 5.0                    │

- [ ] Recent activity feed (last 10 moderation actions):│                                     │

  - "Admin X approved review #123"│  [👍]  Toplam Değerlendirme        │

  - "Admin Y rejected review #456 (reason: spam)"│        127                          │

  - Time ago│                                     │

│  [💬]  Yanıt Oranı                 │

**Technical Tasks:**│        95%                          │

│                                     │

- [ ] Create `app/admin/moderation/reviews/page.tsx`│  Rating Dağılımı:                  │

- [ ] Fetch stats: `GET /api/v1/admin/reviews/stats`│  5★ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 85%         │

  - If endpoint doesn't exist, create it:│  4★ ▓▓▓ 10%                        │

    ```java│  3★ ▓ 3%                           │

    @GetMapping("/stats")│  2★ ▓ 1%                           │

    public ResponseEntity<ReviewModerationStats> getStats() {│  1★ ▓ 1%                           │

        // Aggregate counts, averages, distributions└─────────────────────────────────────┘

    }```

    ```

- [ ] Create stat cards (reuse existing Card components)---

- [ ] Integrate Chart.js or Recharts for visualizations:

  - Line chart: Reviews per day## Testing Strategy

  - Bar chart: Rating distribution

  - Pie chart: Flag reasons### Unit Tests

- [ ] Create recent activity component:

  - Fetch from audit log or dedicated endpoint**Backend:**

  - Format actions

  - Relative time display- [ ] ReviewUserController tests

- [ ] Add navigation buttons- [ ] Review validation tests

- [ ] Add refresh button- [ ] Review business logic tests

- [ ] Rating calculation tests

---

**Frontend:**

### Epic 4: Profile & Marketplace Integration

- [ ] ReviewForm validation tests

#### US-4.1: Profile - Show Seller Rating- [ ] ReviewCard rendering tests

- [ ] reviewStore state tests

**Priority:** P1 (Should Have)  - [ ] useReviews hook tests

**Estimate:** 3 hours

### Integration Tests

**As a** Visitor viewing a freelancer profile

**I want to** see their overall rating and review count  - [ ] Review creation API flow

**So that** I can assess their credibility- [ ] Review update API flow

- [ ] Seller response API flow

**Acceptance Criteria:**- [ ] Admin moderation API flow

- [ ] Helpful vote API flow

- [ ] Freelancer profile page shows rating badge in header

- [ ] Badge displays:### E2E Tests

  - Star icon

  - Average overall rating (e.g., 4.8)```typescript

  - Review count (e.g., "23 reviews")// Example E2E test

- [ ] Badge is prominent (near name/title)describe('Review Creation Flow', () => {

- [ ] Clicking badge scrolls to reviews section (if exists) or opens reviews tab  it('should allow user to create review after order completion', () => {

- [ ] If no reviews, shows "No reviews yet"    // 1. Login as buyer

- [ ] Rating updates when new reviews are submitted    // 2. Navigate to completed order

    // 3. Click "Review Yaz" button

**Technical Tasks:**    // 4. Fill review form

    // 5. Submit review

- [ ] Identify profile page component (likely `app/profile/[username]/page.tsx`)    // 6. Verify success message

- [ ] Fetch seller rating: `GET /api/v1/reviews/seller/{sellerId}/rating`    // 7. Verify review appears in list

  - Response: `{ averageRating: number, totalReviews: number }`  });

- [ ] Create `SellerRatingBadge` component

- [ ] Add to profile header  it('should not allow duplicate reviews', () => {

- [ ] Style prominently (gold stars, large text)    // Test duplicate prevention

- [ ] Add click handler (scroll or navigate)  });



---  it('should allow review edit within 30 days', () => {

    // Test edit functionality

#### US-4.2: Profile - Reviews Tab  });

});

**Priority:** P1 (Should Have)  ```

**Estimate:** 4 hours

### Performance Tests

**As a** Visitor viewing a freelancer profile

**I want to** see a tab with their reviews  - [ ] Page load time < 2s

**So that** I can read detailed feedback- [ ] Review list pagination performance

- [ ] Database query optimization

**Acceptance Criteria:**- [ ] Cache hit rate > 80%

- [ ] API response time < 500ms

- [ ] Profile page has "Reviews" tab

- [ ] Tab shows review count in label---

- [ ] Clicking tab loads reviews list

- [ ] Reviews are public (APPROVED only)## Success Metrics

- [ ] Displays ReviewCard components

- [ ] Sorted by most recent by default### Quantitative Metrics

- [ ] Paginated (10 per page)

- [ ] Filter options: All / Verified only / By rating| Metric                 | Target  | Current | Status |

- [ ] Empty state: "No reviews yet"| ---------------------- | ------- | ------- | ------ |

| Review Submission Rate | > 30%   | 0%      | ❌     |

**Technical Tasks:**| Review Response Rate   | > 80%   | 0%      | ❌     |

| Average Review Rating  | > 4.0   | N/A     | ❌     |

- [ ] Add reviews tab to profile page Tabs component| Review Moderation Time | < 24h   | N/A     | ❌     |

- [ ] Fetch reviews: `GET /api/v1/reviews/seller/{sellerId}?page={p}&size=10`| User Satisfaction      | > 4.5/5 | N/A     | ❌     |

- [ ] Render ReviewList component (reuse)

- [ ] Pass `showPackageInfo={true}` to show which package was reviewed### Qualitative Metrics

- [ ] Implement pagination

- [ ] Add filter UI- [ ] Users find review process intuitive

- [ ] Test with various data scenarios- [ ] Sellers actively respond to reviews

- [ ] Admins can efficiently moderate content

---- [ ] Reviews help buyers make decisions

- [ ] Platform trust increases

#### US-4.3: Marketplace - Show Ratings in Package Cards

---

**Priority:** P2 (Nice to Have)

**Estimate:** 2 hours## Risk Assessment



**As a** User browsing marketplace  ### High Risk

**I want to** see ratings on package cards

**So that** I can quickly identify quality packages1. **User Adoption**

   - Risk: Users may not write reviews

**Acceptance Criteria:**   - Mitigation: Incentives, reminders, gamification



- [ ] Package cards show star rating below package title2. **Review Quality**

- [ ] Format: "⭐ 4.8 (12)" (rating + count)   - Risk: Fake or low-quality reviews

- [ ] If no reviews, shows "No reviews yet" (light gray text)   - Mitigation: Verification, moderation, quality checks

- [ ] Rating is clickable (navigates to package detail → reviews tab)

3. **Performance**

**Technical Tasks:**   - Risk: Slow page loads with many reviews

   - Mitigation: Pagination, caching, lazy loading

- [ ] Modify package list/search API response to include:

  - averageRating### Medium Risk

  - reviewCount

- [ ] Update PackageCard component (find in codebase)4. **Seller Pushback**

- [ ] Add rating display   - Risk: Sellers may not like negative reviews

- [ ] Style appropriately   - Mitigation: Response system, guidelines, fair moderation

- [ ] Handle zero reviews case

5. **Technical Debt**

---   - Risk: Quick implementation may create issues

   - Mitigation: Code reviews, refactoring time

### Epic 5: Notifications & Reminders

### Low Risk

#### US-5.1: Review Reminder After Order Completion

6. **Integration Issues**

**Priority:** P1 (Should Have)     - Risk: Breaking existing functionality

**Estimate:** 4 hours (Backend) + 2 hours (Frontend)   - Mitigation: Comprehensive testing, staging environment



**As a** Buyer  ---

**I want to** receive a reminder to review after order completion

**So that** I don't forget to leave feedback## Rollout Plan



**Acceptance Criteria:**### Phase 1: Beta (Week 1)



- [ ] Backend: Scheduled job runs daily- Deploy to staging environment

- [ ] Job finds completed orders from 7 days ago- Internal testing with team

- [ ] For each order without a review:- Bug fixes and adjustments

  - Send email: "How was your experience with [Seller]?"- Performance optimization

  - Send in-app notification

- [ ] Email includes:### Phase 2: Limited Release (Week 2)

  - Order summary

  - Seller name- Deploy to production (feature flag)

  - "Write Review" button (links to order detail page)- Enable for 10% of users

  - Deadline reminder (30 days from order completion)- Monitor metrics and errors

- [ ] In-app notification:- Collect user feedback

  - Bell icon badge

  - Notification text: "Review [Order #123]"### Phase 3: Full Release (Week 3)

  - Clicking navigates to order detail

- [ ] Users can disable review reminders in settings- Enable for all users

- Marketing announcement

**Backend Technical Tasks:**- Monitor success metrics

- Continuous improvement

- [ ] Create `ReviewReminderJob.java` (Spring @Scheduled)

- [ ] Query orders:---

  ```sql

  SELECT * FROM orders## Post-Sprint Enhancements

  WHERE status = 'COMPLETED'

    AND completed_at = CURRENT_DATE - INTERVAL '7 days'### Future Features (Not in this sprint)

    AND id NOT IN (SELECT order_id FROM reviews WHERE order_id IS NOT NULL)

  ```1. **Review Images**

- [ ] For each order:   - Allow users to upload images with reviews

  - Get buyer (order.buyer_id)   - Image moderation

  - Get seller (order.seller_id or package.freelancer_id)   - Gallery view

  - Check user preferences (review_reminders_enabled)

  - Create notification: `NotificationService.createReviewReminder(userId, orderId)`2. **Review Templates**

  - Send email: `EmailService.sendReviewReminderEmail(buyer, order, seller)`   - Pre-defined review questions

- [ ] Email template:   - Category-specific templates

  ```   - Quick review option

  Subject: How was your experience with [Seller]?

  3. **Advanced Analytics**

  Hi [Buyer],   - Sentiment analysis

     - Review trends

  Your order #[ORDER_NUMBER] was completed on [DATE].   - Competitor comparison

     - Predictive analytics

  We'd love to hear your feedback! Your review helps other buyers

  and supports quality sellers on Marifet.4. **Gamification**

     - Review badges

  [Write Review Button]   - Reviewer levels

     - Incentive programs

  Review deadline: [DEADLINE] (30 days from order completion)   - Leaderboards

````

- [ ] Add job configuration (cron: daily at 9 AM)5. **AI-Powered Features**

- [ ] Add logging - Auto-summarization

- [ ] Add job monitoring - Fake review detection
  - Quality scoring

**Frontend Technical Tasks:** - Automated responses

- [ ] Ensure notification system handles review reminder type---

- [ ] Notification component:
  - Icon: Star (colored)## Dependencies

  - Text: "How was your order #[NUM]? Write a review"

  - Click: Navigate to `/dashboard/employer/orders/[id]`### External Dependencies

- [ ] Bell badge shows unread count

- [ ] Mark notification as read on click- Order system (for review triggers)

- User authentication system

---- Notification system

- Email service

#### US-5.2: Review Deadline Warning

### Internal Dependencies

**Priority:** P2 (Nice to Have)

**Estimate:** 2 hours- Backend: Spring Boot 3.x, PostgreSQL

- Frontend: Next.js 14, React 18, Zustand

**As a** Buyer - UI: Tailwind CSS, shadcn/ui

**I want to** be warned before review deadline expires - Testing: Jest, Playwright

**So that** I don't miss the opportunity

---

**Acceptance Criteria:**

## Team Assignments

- [ ] 25 days after order completion, send warning notification

- [ ] Notification: "Last chance! Review deadline in 5 days"### Backend Developer

- [ ] Email reminder (if user opted in)

- [ ] Order detail page shows countdown: "Review deadline: 3 days remaining"- ReviewUserController implementation

- API endpoints

**Technical Tasks:**- Business logic

- Database optimization

- [ ] Add to ReviewReminderJob (or create separate job)- Unit tests

- [ ] Query orders completed 25 days ago without reviews

- [ ] Send notifications### Frontend Developer

- [ ] Frontend: Display countdown badge on order detail page
  - Calculate days remaining: `30 - daysSinceCompletion`- Component development

  - Show alert if < 7 days: "⚠️ Review deadline in {X} days"- Dashboard pages

- State management

---- UI/UX implementation

- E2E tests

## 🗓️ Development Timeline

### Full-Stack Developer

### Week 1: Core Integrations (P0 Goals)

- Integration work

#### Day 1-2: Order → Review Flow- Bug fixes

- Performance optimization

**Tasks:**- Documentation

- [ ] Create `app/dashboard/employer/orders/[id]/page.tsx`- Code reviews
  - Layout, order data fetching, sections

  - Status display, timeline, deliverables---

- [ ] Create `app/dashboard/freelancer/orders/[id]/page.tsx`
  - Similar structure## Daily Standup Questions

  - Seller-specific actions

- [ ] Create `OrderReviewButton` component1. What did I complete yesterday?
  - Eligibility check hook2. What will I work on today?

  - Button states (enabled, disabled, "View Review")3. Any blockers or challenges?

  - Tooltips for disabled state4. Any dependency on other tasks?

- [ ] Create `useReviewEligibility` hook
  - Fetch `/api/v1/user/reviews/can-review/{orderId}`---

  - Handle reasons

- [ ] Connect ReviewFormModal## Sprint Retrospective Topics
  - Pass order context

  - Handle submission### To Discuss

  - Success callback

- [ ] Test end-to-end- What went well?

- What could be improved?

**Estimate:** 16 hours (2 days)- What should we start doing?

- What should we stop doing?

---- Action items for next sprint

#### Day 3: Package Reviews Tab Integration---

**Tasks:**## Appendix

- [ ] Modify `components/domains/packages/ServiceDetail.tsx`
  - Add reviews TabsTrigger### Useful Links

  - Add reviews TabsContent

  - Fetch review count- [Backend README](../marifetbul-backend/README.md)

  - Pass props to PackageReviewsTab- [Frontend Architecture](../README.md)

- [ ] Test PackageReviewsTab functionality- [API Documentation](https://api.marifetbul.com/swagger-ui)
  - Review list display- [Design System](https://www.figma.com/marifetbul-design)

  - Filters (All, 5★, 4★, etc., Verified)

  - Sorting (Recent, Helpful, Rating)### References

  - Pagination

- [ ] Add "Write Review" button eligibility check- Sprint 5 God Class Refactoring (Review service decomposition)
  - Fetch user's completed orders for package- User Experience Development Plan

  - Check if any eligible- Admin Security Guide

  - Show button if eligible

- [ ] Test various scenarios:---
  - 0 reviews (empty state)

  - 1-5 reviews (no pagination)**Document Version:** 1.0

  - 20+ reviews (pagination)**Last Updated:** October 23, 2025

  - Filter by rating**Next Review:** Start of Sprint

  - Sort by helpful**Owner:** Development Team

**Estimate:** 8 hours (1 day)

---

#### Day 4-5: Admin Moderation UI - Pending Reviews

**Tasks:**

- [ ] Create directory structure:
  - `app/admin/moderation/reviews/`
  - `components/domains/admin/moderation/reviews/`
- [ ] Create `app/admin/moderation/reviews/pending/page.tsx`
  - Page layout, breadcrumbs
  - Fetch pending reviews
  - Render PendingReviewsTable
- [ ] Create `PendingReviewsTable.tsx`
  - Table component with columns
  - Search input (client-side)
  - Sort controls
  - Action buttons per row
- [ ] Create `ReviewDetailModal.tsx`
  - Modal layout
  - Fetch review detail
  - Display all fields
  - Admin notes textarea
  - Approve/Reject buttons
- [ ] Implement approve action
  - API call
  - Optimistic update
  - Toast notification
  - Refetch table
- [ ] Implement reject action
  - Validate admin notes
  - API call
  - Update table
- [ ] Implement bulk actions
  - Checkbox selection
  - "Approve Selected" button
  - "Reject Selected" button (single reason modal)
  - Progress indicator
- [ ] Add empty state
- [ ] Add loading state (skeleton)
- [ ] Test with various data

**Estimate:** 16 hours (2 days)

---

#### Day 6: Admin Moderation UI - Flagged Reviews

**Tasks:**

- [ ] Create `app/admin/moderation/reviews/flagged/page.tsx`
- [ ] Create `FlaggedReviewsTable.tsx`
  - Table with flag count badges
  - Flag reasons tags
  - Color coding by severity
- [ ] Extend ReviewDetailModal for flagged reviews
  - Show flag reports list
  - Reporter names
  - Flag reasons & explanations
  - Report dates
- [ ] Implement resolution actions:
  - "Keep Review" button → POST `/api/v1/admin/reviews/{id}/resolve`
  - "Reject Review" button → POST `/api/v1/admin/reviews/{id}/reject`
  - "Delete Review" button → DELETE `/api/v1/admin/reviews/{id}` (with confirmation)
- [ ] Add filter by flag reason
  - Checkboxes: Spam, Inappropriate, Fake, Harassment, Other
  - Apply to API query
- [ ] Test scenarios:
  - Single flag
  - Multiple flags (different reasons)
  - High flag count (10+)
  - Resolution workflows

**Estimate:** 8 hours (1 day)

---

### Week 2: Secondary Features & Polish

#### Day 7: Admin Dashboard & Profile Integration

**Tasks:**

- [ ] Create `app/admin/moderation/reviews/page.tsx` (main dashboard)
  - Stats cards
  - Fetch `/api/v1/admin/reviews/stats`
  - Display total, pending, flagged, etc.
- [ ] Add charts (optional, if time allows):
  - Reviews over time
  - Rating distribution
  - Flag reasons breakdown
- [ ] Add recent activity feed
- [ ] Quick navigation buttons
- [ ] Profile rating badge
  - Modify profile page
  - Add SellerRatingBadge component
  - Fetch rating data
  - Style prominently
- [ ] Profile reviews tab
  - Add tab to profile Tabs
  - Fetch seller reviews
  - Render ReviewList
  - Test

**Estimate:** 8 hours (1 day)

---

#### Day 8: Notifications & Reminders (Backend)

**Tasks:**

- [ ] Create `ReviewReminderJob.java`
  - @Scheduled annotation (daily at 9 AM)
  - Query orders completed 7 days ago without reviews
  - For each: Create notification, send email
- [ ] Create email template
  - Review reminder subject & body
  - "Write Review" CTA button
  - Deadline reminder
- [ ] Implement notification creation
  - NotificationService.createReviewReminder()
  - Notification type: REVIEW_REMINDER
- [ ] Test job execution
  - Run manually
  - Check logs
  - Verify emails sent
  - Verify notifications created
- [ ] Add deadline warning (25 days)
  - Separate query or same job
  - Different email template
- [ ] Add user preference check (review_reminders_enabled)

**Estimate:** 8 hours (1 day)

---

#### Day 9: Marketplace Integration & Polish

**Tasks:**

- [ ] Marketplace package cards
  - Modify PackageCard component
  - Add rating display
  - Fetch average rating & count (include in list API response)
  - Style & test
- [ ] Search filters
  - Add rating filter to search UI
  - Minimum rating dropdown (4+, 3+, etc.)
  - Apply to search API
- [ ] Sort by rating
  - Add sort option to search
  - Implement in backend (if not exists)
- [ ] Order detail page polish
  - Review deadline countdown
  - Calculate days remaining
  - Show warning if < 7 days
  - Alert styling
- [ ] Review button improvements
  - Better tooltips
  - Animations
  - Loading states
- [ ] Mobile responsiveness check
  - Test all pages on mobile
  - Fix layout issues
  - Ensure modals work on mobile

**Estimate:** 8 hours (1 day)

---

#### Day 10: Testing, Bug Fixes & Documentation

**Tasks:**

- [ ] **E2E Testing**
  - Test full order → review flow (employer perspective)
  - Test full order → review + response flow (freelancer)
  - Test package reviews tab (visitor, buyer)
  - Test admin moderation (pending → approve, flagged → resolve)
  - Test profile rating display
  - Test notifications
- [ ] **Edge Cases**
  - Review after 29 days (should work)
  - Review after 31 days (should fail)
  - Multiple orders for same package (correct order selection)
  - Duplicate review attempt (should be blocked)
  - Self-review attempt (should be blocked)
- [ ] **Performance Testing**
  - Load 100+ reviews on package detail
  - Admin table with 1000+ pending reviews
  - Verify pagination performance
- [ ] **Bug Fixes**
  - Fix any issues found during testing
  - Handle edge cases
  - Improve error messages
- [ ] **Documentation**
  - Update README with review system overview
  - Document admin moderation workflows
  - Add screenshots to docs
  - Update API documentation (if changes made)
- [ ] **Code Review**
  - Self-review all code
  - Check for code duplication
  - Refactor if needed
  - Add comments for complex logic
- [ ] **Deployment Preparation**
  - Create migration scripts (if DB changes needed)
  - Update environment variables (if any)
  - Prepare deployment checklist

**Estimate:** 8 hours (1 day)

---

## 📊 Technical Architecture

### Frontend Component Structure

```
app/
  dashboard/
    employer/
      orders/
        [id]/
          page.tsx ← NEW (Order detail with review button)
    freelancer/
      orders/
        [id]/
          page.tsx ← NEW (Order detail with review display)
      reviews/
        page.tsx ✅ EXISTS (Fully implemented)
    reviews/
      page.tsx ✅ EXISTS (Generic user reviews)

  marketplace/
    packages/
      [id]/
        page.tsx ✅ EXISTS (Modify to add reviews tab)

  admin/
    moderation/
      reviews/
        page.tsx ← NEW (Dashboard)
        pending/
          page.tsx ← NEW
        flagged/
          page.tsx ← NEW

components/
  domains/
    orders/
      OrderReviewButton.tsx ← NEW
      OrderReviewPrompt.tsx ← NEW (optional)

    packages/
      PackageReviewsTab.tsx ✅ EXISTS (Already built, not used)
      ServiceDetail.tsx ✅ EXISTS (Modify to add reviews tab)

    admin/
      moderation/
        reviews/
          PendingReviewsTable.tsx ← NEW
          FlaggedReviewsTable.tsx ← NEW
          ReviewDetailModal.tsx ← NEW
          ReviewModerationActions.tsx ← NEW
          ReviewStatsWidget.tsx ← NEW

    profile/
      SellerRatingBadge.tsx ← NEW

  shared/
    ReviewForm.tsx ✅ EXISTS
    ReviewCard.tsx ✅ EXISTS
    ReviewList.tsx ✅ EXISTS
    RatingStars.tsx ✅ EXISTS
    RatingDistribution.tsx ✅ EXISTS

hooks/
  business/
    useReviewStore.ts ✅ EXISTS
    useReviews.ts ✅ EXISTS
    useReviewForm.ts ✅ EXISTS
    useReviewEligibility.ts ← NEW
```

### Backend Enhancements Needed (Minor)

**Most backend is ready. Only additions:**

1. **ReviewReminderJob.java** (New)

   ```java
   @Component
   @EnableScheduling
   public class ReviewReminderJob {

       @Scheduled(cron = "0 0 9 * * *") // Daily at 9 AM
       public void sendReviewReminders() {
           // Find orders completed 7 days ago without reviews
           // Send notifications & emails
       }

       @Scheduled(cron = "0 0 9 * * *")
       public void sendDeadlineWarnings() {
           // Find orders completed 25 days ago without reviews
           // Send deadline warnings
       }
   }
   ```

2. **ReviewStats Endpoint** (If not exists)

   ```java
   @GetMapping("/api/v1/admin/reviews/stats")
   public ResponseEntity<ReviewModerationStats> getStats() {
       // Aggregate:
       // - Total reviews
       // - Pending count
       // - Flagged count
       // - Approved/Rejected counts
       // - Average rating
       // - Reviews per day (last 30 days)
       // - Flag reason distribution
   }
   ```

3. **Package List API Enhancement**
   - Include `averageRating` and `reviewCount` in PackageListResponse
   - Add to search/filter results

### API Endpoints Summary

**Already Implemented:**

- POST `/api/v1/user/reviews` - Create review
- GET `/api/v1/user/reviews` - Get my reviews
- GET `/api/v1/user/reviews/{id}` - Get review detail
- PUT `/api/v1/user/reviews/{id}` - Update review
- DELETE `/api/v1/user/reviews/{id}` - Delete review
- POST `/api/v1/user/reviews/{id}/vote/helpful`
- POST `/api/v1/user/reviews/{id}/vote/not-helpful`
- POST `/api/v1/user/reviews/{id}/flag`
- GET `/api/v1/user/reviews/can-review/{orderId}` - ✅ KEY ENDPOINT
- GET `/api/v1/seller/reviews` - Get reviews about me
- POST `/api/v1/seller/reviews/{id}/respond`
- PUT `/api/v1/seller/reviews/{id}/response`
- DELETE `/api/v1/seller/reviews/{id}/response`
- GET `/api/v1/seller/reviews/stats`
- GET `/api/v1/admin/reviews/pending`
- GET `/api/v1/admin/reviews/flagged`
- POST `/api/v1/admin/reviews/{id}/approve`
- POST `/api/v1/admin/reviews/{id}/reject`
- POST `/api/v1/admin/reviews/{id}/resolve`
- DELETE `/api/v1/admin/reviews/{id}`
- GET `/api/v1/reviews/seller/{sellerId}` - Public
- GET `/api/v1/reviews/package/{packageId}` - Public
- GET `/api/v1/reviews/package/{packageId}/verified` - Public
- GET `/api/v1/reviews/seller/{sellerId}/rating` - Public

**To Add (Minor):**

- GET `/api/v1/admin/reviews/stats` - Admin stats dashboard
- GET `/api/v1/reviews/package/{packageId}/count` - Review count (or include in detail)

---

## ✅ Testing Strategy

### Unit Tests

**Frontend:**

- [ ] OrderReviewButton component
  - Renders correctly for each state (enabled, disabled, "View Review")
  - Calls eligibility check on mount
  - Opens modal on click
- [ ] useReviewEligibility hook
  - Fetches eligibility correctly
  - Handles loading/error states
  - Returns correct reason messages
- [ ] PackageReviewsTab integration
  - Fetches reviews on mount
  - Applies filters correctly
  - Sorts reviews correctly
  - Pagination works
- [ ] Admin table components
  - Renders table rows correctly
  - Selection works (checkboxes)
  - Actions fire correct API calls

**Backend:**

- [ ] ReviewReminderJob
  - Queries correct orders
  - Creates notifications
  - Sends emails
  - Handles errors
- [ ] Admin stats endpoint
  - Returns correct counts
  - Calculates averages correctly

### Integration Tests

**Frontend + Backend:**

- [ ] Order detail page → Write review → Success
- [ ] Package detail → Reviews tab loads → Filter/sort works
- [ ] Admin pending table → Approve review → Row disappears
- [ ] Admin flagged table → Resolve → Status changes
- [ ] Profile page → Rating badge shows correct data

### E2E Tests (Playwright/Cypress)

```typescript
describe('Review System E2E', () => {

  it('should allow employer to write review after order completion', () => {
    // 1. Login as employer
    // 2. Navigate to /dashboard/employer/orders/{completedOrderId}
    // 3. Verify "Write Review" button exists
    // 4. Click button
    // 5. Verify ReviewFormModal opens
    // 6. Fill form (ratings + text)
    // 7. Submit
    // 8. Verify success toast
    // 9. Verify button changes to "View Review"
  });

  it('should show reviews on package detail page', () => {
    // 1. Navigate to /marketplace/packages/{packageId}
    // 2. Click "Reviews" tab
    // 3. Verify reviews load
    // 4. Verify review count matches
    // 5. Apply filter (5 stars only)
    // 6. Verify filtered results
    // 7. Sort by helpful
    // 8. Verify sort order
  });

  it('should allow admin to approve pending review', () => {
    // 1. Login as admin
    // 2. Navigate to /admin/moderation/reviews/pending
    // 3. Verify table loads
    // 4. Click "Approve" on first row
    // 5. Verify toast success
    // 6. Verify row disappears
    // 7. Navigate to package detail
    // 8. Verify review now appears publicly
  });

  it('should send review reminder 7 days after order completion', () => {
    // This requires time manipulation or mocking
    // 1. Complete an order
    // 2. Advance time by 7 days (mock or wait)
    // 3. Run ReviewReminderJob manually
    // 4. Verify notification created in DB
    // 5. Verify email sent (check email service logs/mock)
    // 6. Login as user
    // 7. Verify notification appears in bell icon
  });

});
```

### Performance Tests

- [ ] **Package reviews tab with 100+ reviews**
  - Load time < 2 seconds
  - Smooth scrolling
  - Pagination responsive
- [ ] **Admin pending table with 500+ reviews**
  - Load time < 3 seconds
  - Search responsive (< 500ms)
  - Sort responsive (< 500ms)
- [ ] **Review submission under load**
  - 50 concurrent review submissions
  - All succeed without timeout
  - No duplicate reviews created

### Accessibility Tests

- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA

---

## 🚀 Deployment Plan

### Phase 1: Staging Deployment (Day 8)

**Tasks:**

- [ ] Deploy backend changes (if any)
  - ReviewReminderJob
  - Stats endpoint
  - DB migrations (if needed)
- [ ] Deploy frontend changes
  - All new pages
  - Modified components
- [ ] Run smoke tests
- [ ] QA team testing

### Phase 2: Beta Release (Day 9)

**Tasks:**

- [ ] Enable for 10% of users (feature flag)
- [ ] Monitor errors (Sentry)
- [ ] Monitor performance (DataDog)
- [ ] Collect user feedback
- [ ] Fix critical bugs

### Phase 3: Full Release (Day 10)

**Tasks:**

- [ ] Enable for all users
- [ ] Marketing announcement
- [ ] Monitor metrics:
  - Review submission rate
  - Admin moderation time
  - User satisfaction (surveys)
- [ ] Continuous improvement

---

## 📈 Success Metrics

### Quantitative Metrics

| Metric                         | Target     | Measurement                                         |
| ------------------------------ | ---------- | --------------------------------------------------- |
| Review Submission Rate         | > 30%      | Orders with reviews / Completed orders              |
| Average Time to Review         | < 3 days   | Average of (review_created_at - order_completed_at) |
| Admin Moderation Time          | < 24 hours | Average of (review_approved_at - review_created_at) |
| Review Response Rate (Sellers) | > 60%      | Reviews with responses / Total reviews              |
| Helpful Vote Rate              | > 40%      | Reviews with >= 1 helpful vote / Total reviews      |

### Qualitative Metrics

- [ ] Users find review process intuitive (survey >= 4/5)
- [ ] Admins efficiently moderate reviews (no backlog)
- [ ] Reviews help buyers make decisions (A/B test: conversion rate)
- [ ] Platform trust increases (NPS improves)

---

## 🎯 Sprint Retrospective Topics

**Questions to Discuss:**

1. What went well?
   - Backend facade pattern paid off (easy to integrate)
   - Existing components reusable
2. What could be improved?
   - Better planning of integration points earlier
   - Component-first approach should include integration plan
3. What should we start doing?
   - Integration testing earlier in development
   - User flow mapping before component building
4. What should we stop doing?
   - Building components without clear usage plan
5. What did we learn?
   - Bottom-up + Top-down = Complete system
   - "Last mile integration" is critical for user value

---

## 📚 Appendix

### Useful Links

- [Backend Review Service](../marifetbul-backend/src/main/java/com/marifetbul/api/domain/review/)
- [Frontend Components](../components/shared/)
- [Review State Management](../hooks/business/useReviewStore.ts)
- [Current State Analysis](./REVIEW_SYSTEM_CURRENT_STATE.md)
- [Messaging System Sprint](./MESSAGING_SYSTEM_SPRINT.md) (pattern reference)

### References

- Sprint 5: God Class Refactoring (Review service decomposition)
- UX Development Plan
- Admin Security Guide

### Database Schema Quick Reference

```sql
-- reviews table
id UUID PRIMARY KEY
reviewer_id UUID NOT NULL (FK -> users)
reviewee_id UUID NOT NULL (FK -> users)
order_id UUID (FK -> orders)
package_id UUID (FK -> packages)
type VARCHAR(20) NOT NULL (ORDER_REVIEW | PACKAGE_REVIEW)
status VARCHAR(20) DEFAULT 'APPROVED' (PENDING | APPROVED | REJECTED | FLAGGED)
overall_rating DECIMAL(2,1) NOT NULL
communication_rating DECIMAL(2,1) NOT NULL
quality_rating DECIMAL(2,1) NOT NULL
delivery_rating DECIMAL(2,1) NOT NULL
review_text VARCHAR(1000) NOT NULL
response_text VARCHAR(500)
responded_at TIMESTAMP
helpful_count INT DEFAULT 0
not_helpful_count INT DEFAULT 0
is_verified_purchase BOOLEAN DEFAULT FALSE
flagged_count INT DEFAULT 0
admin_notes VARCHAR(500)
deleted_for_reviewer BOOLEAN DEFAULT FALSE
deleted_for_reviewee BOOLEAN DEFAULT FALSE
created_at TIMESTAMP
updated_at TIMESTAMP

-- review_votes table
id UUID PRIMARY KEY
review_id UUID NOT NULL (FK -> reviews)
user_id UUID NOT NULL (FK -> users)
is_helpful BOOLEAN NOT NULL
created_at TIMESTAMP
UNIQUE (review_id, user_id)

-- review_flag_reports table
id UUID PRIMARY KEY
review_id UUID NOT NULL (FK -> reviews)
reporter_id UUID NOT NULL (FK -> users)
flag_type VARCHAR(50) NOT NULL (SPAM | INAPPROPRIATE | FAKE | HARASSMENT | OTHER)
reason VARCHAR(500)
status VARCHAR(20) (PENDING | RESOLVED)
created_at TIMESTAMP

-- review_images table
id UUID PRIMARY KEY
review_id UUID NOT NULL (FK -> reviews)
image_url VARCHAR(500) NOT NULL
thumbnail_url VARCHAR(500)
filename VARCHAR(255)
file_size BIGINT
mime_type VARCHAR(100)
display_order INT
created_at TIMESTAMP
```

---

**Document Version:** 2.0 (Complete Integration Sprint)  
**Last Updated:** October 25, 2025  
**Next Review:** Sprint Kickoff Meeting  
**Owner:** Development Team  
**Approved By:** Product Owner

---

## 🏁 Sprint Checklist

### Before Starting Sprint

- [ ] Review and approve this document
- [ ] Assign developers to user stories
- [ ] Set up sprint board (Jira/GitHub Projects)
- [ ] Create tickets for each user story
- [ ] Schedule daily standups
- [ ] Prepare staging environment

### During Sprint

- [ ] Daily standup (15 min)
- [ ] Update sprint board daily
- [ ] Demo progress to stakeholders (mid-sprint)
- [ ] Address blockers immediately
- [ ] Code reviews within 24 hours
- [ ] Write tests alongside features

### End of Sprint

- [ ] Sprint demo to stakeholders
- [ ] Sprint retrospective meeting
- [ ] Update documentation
- [ ] Close completed tickets
- [ ] Move unfinished work to next sprint
- [ ] Celebrate achievements 🎉

---

_This sprint follows the successful pattern established in MESSAGING_SYSTEM_SPRINT.md - bottom-up infrastructure that needs top-down integration to deliver user value._
