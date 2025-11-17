# 🎯 MarifetBul - Odaklanmış Sprint Planı

**Tarih:** 17 Kasım 2025  
**Analiz Sonucu:** Milestone Payment System Frontend Entegrasyonu  
**Sprint Süresi:** 2 Hafta (10 iş günü)  
**Toplam Story Point:** 55 SP

---

## 📊 Durum Analizi Özeti

### ✅ Başarılı Alanlar (Production-Ready)

```
✅ Backend Milestone API        %100 (Tam entegre)
✅ Milestone Modal Components   %90  (Deliver, Accept, Reject hazır)
✅ Dashboard Konsolidasyonu     %100 (Unified dashboard başarılı)
✅ Refund User Flow             %100 (UI tamamlanmış)
✅ Wallet Base Functionality    %85  (Transactions, balance hazır)
✅ Order Management             %90  (CRUD, WebSocket entegre)
```

### ⚠️ Eksik/Tamamlanacak Alanlar

```
❌ Milestone Creation UI        %0   (Sipariş oluştururken milestone tanımlama YOK)
⚠️ OrderDetail Milestone Tab    %50  (Tab var ama sınırlı aksiyon)
⚠️ Wallet Escrow Breakdown      %30  (Escrow tab var ama breakdown eksik)
⚠️ Milestone Statistics         %0   (Dashboard widget eksik)
```

---

## 🎯 ODAK ALANI: Milestone Payment Frontend

**Neden Bu Sprint:**

1. **Backend %100 hazır** - API'ler test edilmiş, çalışıyor
2. **En yüksek business value** - Kullanıcı güveni ve ödeme esnekliği
3. **Diğer işlere engel** - Milestone olmadan wallet escrow tam çalışmıyor
4. **Production blocker** - MVP için kritik özellik

---

## 📅 Sprint Backlog (Öncelik Sıralı)

### 🔴 WEEK 1: Core Milestone Features (28 SP)

#### **Story 1.1: Milestone Oluşturma UI** ⭐⭐⭐⭐⭐

**Priority:** CRITICAL  
**Story Points:** 8 SP  
**Dosyalar:**

- `components/domains/milestones/CreateMilestoneForm.tsx` (MEVCUT - İyileştir)
- `app/checkout/[packageId]/MilestoneCreationStep.tsx` (YENİ)

**Görevler:**

- [ ] CreateMilestoneForm'u sipariş oluşturma akışına entegre et
- [ ] Dinamik milestone row ekleme/çıkarma (min 2, max 10)
- [ ] Total amount validation (∑milestone amounts = order total)
- [ ] Due date picker (her milestone için)
- [ ] Preview & confirmation modal
- [ ] Batch creation API çağrısı

**Acceptance Criteria:**

```typescript
// Sipariş oluşturma sırasında:
1. Kullanıcı "Milestone Kullan" checkbox'ını seçebilir
2. Minimum 2 milestone tanımlayabilir
3. Her milestone için:
   - Başlık (5-100 karakter)
   - Açıklama (20-500 karakter)
   - Tutar (₺1 - ₺∞)
   - Deadline (bugünden sonra)
4. Toplam tutar sipariş tutarına eşit olmalı
5. "Oluştur" butonuna basınca backend'e batch POST gider
6. Success: Redirect to order detail page
```

**API Endpoint (Mevcut):**

```typescript
POST /api/v1/orders/{orderId}/milestones/batch
Body: CreateOrderMilestoneRequest[]
Response: OrderMilestone[]
```

**Test Senaryoları:**

- [ ] Happy path: 3 milestone, toplam ₺1000
- [ ] Validation: Toplam ₺990 (hata: eksik ₺10)
- [ ] Validation: 15 milestone (hata: max 10)
- [ ] Edge case: Tek milestone (hata: min 2)

---

#### **Story 1.2: OrderDetail Milestone Tab İyileştirme** ⭐⭐⭐⭐

**Priority:** HIGH  
**Story Points:** 5 SP  
**Dosyalar:**

- `app/dashboard/orders/[id]/page.tsx` (MEVCUT - Güncelle)
- `components/domains/orders/OrderDetailTabs.tsx` (MEVCUT - Kullan)

**Görevler:**

- [ ] Milestone tab'da MilestoneList component render et (✅ Mevcut)
- [ ] Empty state: "Milestone Oluştur" butonu ekle
- [ ] Freelancer: Start, Deliver butonları görünür
- [ ] Employer: Accept, Reject butonları görünür
- [ ] Progress bar: Tamamlanan/Toplam milestone
- [ ] Real-time update (WebSocket entegrasyonu var)

**Mevcut Durum:**

```tsx
// ✅ Zaten var:
{
  activeTab === 'milestones' && (
    <MilestoneList
      orderId={order.id}
      userRole={userRole === 'seller' ? 'FREELANCER' : 'EMPLOYER'}
    />
  );
}
```

**Yapılacak İyileştirmeler:**

- [ ] Add "Create Milestones" button when no milestones exist
- [ ] Show milestone progress percentage
- [ ] Add filter: All / Pending / In Progress / Delivered / Accepted
- [ ] Add sort: By sequence / By due date

**Acceptance Criteria:**

```
1. Milestone listesi görünür (sequence sırasına göre)
2. Her milestone için durum badge'i
3. Freelancer teslim edebilir (modal açılır)
4. Employer onaylayabilir/reddedebilir
5. Progress: "3/5 Milestone Tamamlandı (%60)"
```

---

#### **Story 1.3: Milestone Action Modals Test & Polish** ⭐⭐⭐

**Priority:** HIGH  
**Story Points:** 5 SP  
**Dosyalar:**

- `components/domains/milestones/DeliverMilestoneModal.tsx` (✅ MEVCUT)
- `components/domains/milestones/AcceptMilestoneModal.tsx` (✅ MEVCUT)
- `components/domains/milestones/RejectMilestoneModal.tsx` (✅ MEVCUT)

**Görevler:**

- [ ] DeliverModal: File upload entegrasyonu test et
- [ ] AcceptModal: Escrow release mesajı ekle
- [ ] RejectModal: Revision reason dropdown
- [ ] Toast notifications iyileştir
- [ ] Error handling standardize et
- [ ] Loading states polish

**Mevcut Componentler:**

```
✅ DeliverMilestoneModal  - File upload + delivery notes
✅ AcceptMilestoneModal   - Confirmation + payment release
✅ RejectMilestoneModal   - Reason + revision request
```

**Polish Checklist:**

- [ ] Accept modal: "₺X escrow'dan serbest bırakılacak" uyarısı
- [ ] Deliver modal: Max 5 file upload, 10MB/file
- [ ] Reject modal: Predefined reason templates
- [ ] Validation messages user-friendly
- [ ] Success toast: Custom message per action

---

#### **Story 1.4: Milestone Statistics Widget** ⭐⭐

**Priority:** MEDIUM  
**Story Points:** 5 SP  
**Dosyalar:**

- `components/domains/milestones/MilestoneProgressWidget.tsx` (✅ MEVCUT - Kullan)
- `app/dashboard/page.tsx` (Dashboard'a ekle)

**Görevler:**

- [ ] Dashboard'a milestone stats widget ekle
- [ ] Freelancer: "Aktif Milestone'larım" kartı
- [ ] Employer: "Onay Bekleyen Milestone'lar" kartı
- [ ] Quick actions: "Teslim Et", "Onayla" linkleri
- [ ] Real-time update (WebSocket)

**Widget Tasarımı:**

```tsx
<MilestoneProgressWidget
  totalMilestones={10}
  completedMilestones={6}
  pendingAcceptance={2}
  overdueCount={1}
  onViewAll={() => router.push('/dashboard/orders')}
/>
```

**Acceptance Criteria:**

```
1. Dashboard'da göze çarpan konumda
2. Sayılar real-time güncellenir
3. "Hepsini Gör" butonu orders sayfasına götürür
4. Empty state: "Henüz milestone kullanmadınız"
```

---

#### **Story 1.5: Milestone Email & Notification Templates** ⭐

**Priority:** LOW (Backend hazır)  
**Story Points:** 3 SP  
**Görevler:**

- [ ] Email template review (backend'de var)
- [ ] In-app notification customization
- [ ] Push notification (Firebase FCM) test
- [ ] Notification preferences sayfası

**Backend Email Templates (Mevcut):**

```java
✅ MILESTONE_DELIVERED     - Freelancer teslim etti
✅ MILESTONE_ACCEPTED      - Employer onayladı
✅ MILESTONE_REJECTED      - Employer red etti
✅ MILESTONE_STATUS_CHANGED - Durum değişti
```

---

### 🟡 WEEK 2: Integration & Polish (27 SP)

#### **Story 2.1: Wallet Escrow Breakdown UI** ⭐⭐⭐⭐

**Priority:** HIGH  
**Story Points:** 8 SP  
**Dosyalar:**

- `app/dashboard/wallet/UnifiedWalletPage.tsx` (MEVCUT - Escrow tab güncelle)
- `components/domains/wallet/EscrowBalanceCard.tsx` (YENİ)

**Görevler:**

- [ ] Escrow tab'da balance breakdown kartı ekle
- [ ] Toplam / Kullanılabilir / Kilitli (escrow) göster
- [ ] Escrow detay listesi: Hangi siparişlerde kilitli
- [ ] Milestone-based escrow: "Milestone 3/5 - Logo Tasarım" gibi açıklama
- [ ] Tooltip: "Escrow nedir?" açıklama

**Tasarım:**

```tsx
<EscrowBalanceCard
  totalBalance={5000}
  availableBalance={2000}
  escrowBalance={3000}
  escrowDetails={[
    {
      orderId: 'xxx',
      orderNumber: 'ORD-001',
      amount: 1500,
      milestoneTitle: 'M1: Logo',
    },
    {
      orderId: 'yyy',
      orderNumber: 'ORD-002',
      amount: 1000,
      milestoneTitle: 'M2: Banner',
    },
    {
      orderId: 'zzz',
      orderNumber: 'ORD-003',
      amount: 500,
      milestoneTitle: 'M3: Revizyon',
    },
  ]}
/>
```

**Backend API (Mevcut):**

```typescript
GET /api/v1/wallet/escrow-details
Response: {
  total: 5000,
  available: 2000,
  escrow: 3000,
  escrowItems: [...] // Sipariş bazında breakdown
}
```

---

#### **Story 2.2: Milestone Transaction History** ⭐⭐⭐

**Priority:** MEDIUM  
**Story Points:** 5 SP  
**Dosyalar:**

- `app/dashboard/wallet/UnifiedWalletPage.tsx` (Transactions tab)
- `components/domains/wallet/TransactionList.tsx` (MEVCUT - Güncelle)

**Görevler:**

- [ ] Transaction filter: "Milestone Ödemeleri" seçeneği ekle
- [ ] Transaction row'da milestone badge göster
- [ ] Description: "Milestone 2/5: Logo Tasarımı - ₺500"
- [ ] Link to order detail (orderId ile)

**Mevcut Transaction Type Enum:**

```typescript
enum TransactionType {
  MILESTONE_PAYMENT = 'MILESTONE_PAYMENT', // ✅ Backend'de var
  // ... diğer tipler
}
```

---

#### **Story 2.3: Dashboard Milestone Widgets** ⭐⭐

**Priority:** MEDIUM  
**Story Points:** 8 SP  
**Dosyalar:**

- `app/dashboard/page.tsx` (Dashboard ana sayfa)
- `components/domains/dashboard/widgets/` (Widget componentleri)

**Görevler:**

- [ ] Freelancer Dashboard: "Aktif Milestone'lar" widget
- [ ] Employer Dashboard: "Onay Bekleyen Milestone'lar" widget
- [ ] Quick stats: Toplam kazanç / Bekleyen ödeme
- [ ] Widget'tan milestone detaya click

**Widget İçeriği:**

```tsx
// Freelancer Dashboard
<MilestoneStatsCard
  inProgress={3}
  delivered={2}
  accepted={5}
  totalEarnings={₺2500}
  pendingPayment={₺500}
/>

// Employer Dashboard
<MilestonePendingCard
  pendingAcceptance={2}
  autoAcceptCountdown="48 saat" // 72 saat sonra otomatik onay
  actionRequired={true}
/>
```

---

#### **Story 2.4: Notification System Enhancement** ⭐

**Priority:** LOW  
**Story Points:** 3 SP  
**Görevler:**

- [ ] Navbar notification badge: Milestone events
- [ ] Notification center: Milestone kategorisi
- [ ] Mark as read fonksiyonu
- [ ] Notification settings: Email/Push toggle

**Notification Types:**

```
1. MILESTONE_DELIVERED     - "Ali milestone teslim etti"
2. MILESTONE_ACCEPTED      - "Ahmet milestone'u onayladı"
3. MILESTONE_REJECTED      - "Revizyon talep edildi"
4. AUTO_ACCEPT_WARNING     - "24 saat içinde onaylamazsan otomatik onaylanacak"
```

---

#### **Story 2.5: Testing & Bug Fixes** ⭐⭐⭐

**Priority:** HIGH  
**Story Points:** 5 SP  
**Görevler:**

- [ ] Unit tests: Milestone components
- [ ] Integration tests: Milestone workflow (create → deliver → accept)
- [ ] E2E test: Complete milestone journey
- [ ] Bug fixes: Edge cases
- [ ] Performance: Optimize re-renders

**Test Coverage Hedefi:**

```
✅ Unit Tests:        80%+
✅ Integration Tests: 60%+
✅ E2E Tests:         40%+
```

**Critical Test Scenarios:**

```
1. Create Order + 3 Milestones → Success
2. Freelancer delivers milestone → Employer notified
3. Employer accepts → Escrow released → Wallet balance updated
4. Employer rejects → Freelancer notified → Revision flow
5. Auto-accept after 72 hours → Payment released
6. Concurrent milestone delivery (race condition test)
```

---

## 📈 Sprint Velocity & Timeline

### Daily Breakdown (10 iş günü)

```
📅 Week 1: Core Features
═══════════════════════════════════════════════════════

Day 1 (Mon)  │ Story 1.1: Milestone Creation UI (Start)
             │ - CreateMilestoneForm refactor
             │ - Checkout integration planning

Day 2 (Tue)  │ Story 1.1: Milestone Creation UI (Continue)
             │ - Dynamic form rows
             │ - Amount validation logic

Day 3 (Wed)  │ Story 1.1: Milestone Creation UI (Finish)
             │ - Due date picker
             │ - Batch API integration
             │ - Testing

Day 4 (Thu)  │ Story 1.2: OrderDetail Tab Enhancement
             │ - MilestoneList improvements
             │ - Empty state handling
             │ - Progress bar

Day 5 (Fri)  │ Story 1.3: Modal Polish
             │ - DeliverModal file upload
             │ - AcceptModal escrow message
             │ - RejectModal reason templates
───────────────────────────────────────────────────────
Week 1 Checkpoint: 18 SP completed ✅
═══════════════════════════════════════════════════════

📅 Week 2: Integration & Polish
═══════════════════════════════════════════════════════

Day 6 (Mon)  │ Story 1.4: Dashboard Widgets
             │ - MilestoneProgressWidget
             │ - FreelancerDashboard integration

Day 7 (Tue)  │ Story 1.5: Notifications (Quick)
             │ Story 2.1: Wallet Escrow UI (Start)
             │ - EscrowBalanceCard component
             │ - Balance breakdown logic

Day 8 (Wed)  │ Story 2.1: Wallet Escrow UI (Finish)
             │ - Escrow detail list
             │ - API integration

Day 9 (Thu)  │ Story 2.2: Transaction History
             │ Story 2.3: Dashboard Widgets
             │ - Milestone filter
             │ - Widget components

Day 10 (Fri) │ Story 2.5: Testing & Bug Fixes
             │ - Integration testing
             │ - E2E milestone journey
             │ - Bug fixes
───────────────────────────────────────────────────────
Week 2 Checkpoint: 55 SP completed ✅
═══════════════════════════════════════════════════════
```

---

## 🎯 Definition of Done (DoD)

Her story için:

### ✅ Code Quality

- [ ] TypeScript strict mode (no `any`)
- [ ] ESLint warnings: 0
- [ ] Prettier formatted
- [ ] No console.logs (sadece logger kullan)
- [ ] Comments: JSDoc for public APIs

### ✅ Testing

- [ ] Unit tests yazıldı (min %70 coverage)
- [ ] Integration test (varsa)
- [ ] Manual testing checklist tamamlandı
- [ ] Cross-browser test (Chrome, Firefox, Safari)

### ✅ UI/UX

- [ ] Responsive (mobile, tablet, desktop)
- [ ] Loading states var
- [ ] Error handling user-friendly
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Dark mode uyumlu

### ✅ Documentation

- [ ] README güncellendi (varsa)
- [ ] Changelog entry eklendi
- [ ] API documentation (backend değişikliği varsa)

### ✅ Deployment

- [ ] Code review approved (PR)
- [ ] Staging'de test edildi
- [ ] Performance regression yok
- [ ] Sentry'de yeni error yok

---

## 🚨 Risk & Mitigation

### Risk 1: Amount Validation Karmaşıklığı

**Problem:** Milestone tutarları toplam sipariş tutarını aşabilir  
**Mitigation:**

- Real-time validation
- UI'da kalan tutar göster: "Kalan: ₺250"
- Son milestone'u otomatik hesapla option

### Risk 2: WebSocket Connection Issues

**Problem:** Real-time update kaybolabilir  
**Mitigation:**

- Fallback: Polling her 30 saniye
- Reconnect logic (exponential backoff)
- User'a notification: "Bağlantı kesildi, yeniden deneniyor..."

### Risk 3: File Upload Size Limit

**Problem:** Delivery attachments çok büyük olabilir  
**Mitigation:**

- Client-side validation: Max 10MB/file
- Cloudinary compression
- Progress bar göster
- Chunk upload (büyük dosyalar için)

### Risk 4: Concurrent Milestone Updates

**Problem:** 2 employer aynı anda accept ederse  
**Mitigation:**

- Backend: Optimistic locking (version field)
- Frontend: Disable button after click
- Toast: "Başka biri zaten işlem yaptı, yenileniyor..."

---

## 📊 Success Metrics (KPI)

Sprint sonunda ölçülecek:

### User Adoption

```
✅ Milestone kullanım oranı: >30% (yeni siparişlerde)
✅ Ortalama milestone sayısı: 3-5 milestone/sipariş
✅ Milestone completion rate: >85%
```

### Performance

```
✅ Milestone listesi load time: <500ms
✅ Create milestone API response: <1s
✅ WebSocket notification delay: <2s
```

### Quality

```
✅ Bug count: <5 critical, <10 minor
✅ Test coverage: >70% (frontend)
✅ User satisfaction: 4.5+/5 (beta test feedback)
```

---

## 🎉 Sprint Tamamlama Kriterleri

Sprint başarılı sayılır eğer:

1. ✅ **Tüm CRITICAL stories tamamlandı** (Story 1.1, 1.2, 2.1)
2. ✅ **Kullanıcı milestone oluşturabilir** (End-to-end test geçti)
3. ✅ **Freelancer teslim edebilir, Employer onaylayabilir**
4. ✅ **Escrow balance doğru çalışıyor** (Wallet entegrasyonu OK)
5. ✅ **Sıfır production-blocking bug**
6. ✅ **Beta test kullanıcıları pozitif feedback verdi**

---

## 📚 Sonraki Sprint Planı (Sprint 2)

Bu sprint tamamlandıktan sonra:

### Sprint 2: Dashboard Route Cleanup & Optimization (1 hafta)

- [ ] `/admin` duplicate route kaldırma
- [ ] Navigation links standardize
- [ ] Breadcrumb düzeltmeleri
- [ ] SEO canonical URL fix

### Sprint 3: Performance & Code Quality (1 hafta)

- [ ] Duplicate component cleanup
- [ ] TODO/FIXME cleanup (100+ item)
- [ ] Type safety improvements (`any` → strict types)
- [ ] Bundle size optimization

### Sprint 4: Beta Launch Preparation (1 hafta)

- [ ] Monitoring & alerting setup (Sentry, Prometheus)
- [ ] Production deployment checklist
- [ ] User onboarding flow
- [ ] Help documentation

---

## 📞 Sprint Ritüeller

### Daily Standup (10:00)

- Ne yaptın dün?
- Bugün ne yapacaksın?
- Blocker var mı?

### Sprint Planning (Pazartesi 09:00)

- Story grooming
- Story point estimation
- Task assignment

### Sprint Review (Cuma 16:00)

- Demo: Tamamlanan features
- Stakeholder feedback
- Next sprint planning preview

### Sprint Retrospective (Cuma 17:00)

- Ne iyi gitti?
- Ne geliştirilebilir?
- Action items

---

## 🤝 İletişim & Escalation

**Blocker varsa:**

1. Daily standup'ta paylaş
2. Slack #dev-milestone-sprint kanalına yaz
3. 2 saat çözülmezse → Tech Lead'e escalate

**Production bug:**

1. Immediate: Sentry notification
2. Hotfix branch oluştur
3. Fix → Test → Deploy (max 2 saat)

---

**Sprint Başlangıç Tarihi:** 18 Kasım 2025 (Pazartesi)  
**Sprint Bitiş Tarihi:** 29 Kasım 2025 (Cuma)  
**Sprint Velocity Hedefi:** 55 SP / 10 gün = 5.5 SP/gün

**Let's ship it! 🚀**
