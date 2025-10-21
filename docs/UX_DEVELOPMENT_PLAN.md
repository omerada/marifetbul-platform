# UX & Development Plan — Freelancer / Employer Panels

Tarih: 2025-10-21
Yazar: Otomatik oluşturuldu (repo taraması)

## Hedef

Freelancer ve Employer paneli, profil ekranları ve aralarındaki iş akışlarını (proposal, order, delivery, payment) eksiksiz dökümante etmek. Doküman tamamlanınca geliştirme işlemlerine başlayacağız — bu dosya onayınıza sunulmuştur.

---

## 1. Genel Özet

Kod tabanında (frontend): `app/dashboard`, `app/profile`, `components/domains/*`, `hooks/business/*`, `lib/core/store/*`, `lib/api/endpoints.ts` ana kaynaklardır.
Backend referansları `marifetbul-backend` içinde `order` ve `proposal` servisleri order lifecycle, escrow/payment orchestration ve proposal management iş mantığını içerir.

Bu doküman:

- Mevcut ekran ve komponent eşlemelerini listeler
- Her yapılacak iş için teknik kabul kriteri, tahmini zorluk ve bağımlılıkları belirtir
- Öncelik sırasını ve sprint planını sunar

---

## 2. Component -> Ekran -> API Eşlemesi (detaylı)

### 2.1 Dashboard Ekranları

| Ekran/Sayfa                  | Komponent                                              | Hook/Store                                                             | API Endpoints                                                    | Durum                                           |
| ---------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------- |
| Freelancer Dashboard Ana     | `app/dashboard/freelancer/page.tsx`                    | `useDashboard()`, `useOrderStore`, `useMessagingStore`, `useWebSocket` | `/api/dashboard/freelancer`, `/api/orders`, `/api/conversations` | ✅ Çalışıyor                                    |
| Freelancer Dashboard Bileşen | `components/domains/dashboard/FreelancerDashboard.tsx` | Yukarıdakiler                                                          | -                                                                | ✅ Çalışıyor                                    |
| - Stats Cards                | `components/domains/dashboard/StatsCard.tsx`           | -                                                                      | -                                                                | ✅ Çalışıyor                                    |
| - Activity Timeline          | `components/domains/dashboard/ActivityTimeline.tsx`    | -                                                                      | -                                                                | ✅ Çalışıyor                                    |
| - Quick Actions              | `components/domains/dashboard/QuickActions.tsx`        | -                                                                      | -                                                                | ✅ Çalışıyor                                    |
| Employer Dashboard Ana       | `app/dashboard/employer/page.tsx`                      | `useDashboard()`, `useMessagingStore`, `useWebSocket`                  | `/api/dashboard/employer`, job/proposal endpoints                | ✅ Çalışıyor                                    |
| Employer Dashboard Bileşen   | `components/domains/dashboard/EmployerDashboard.tsx`   | Yukarıdakiler                                                          | -                                                                | ✅ Çalışıyor (tabs: overview/messages/projects) |

### 2.2 Profil Ekranları

| Ekran/Sayfa              | Komponent                                         | Hook/Store                           | API Endpoints             | Durum                            |
| ------------------------ | ------------------------------------------------- | ------------------------------------ | ------------------------- | -------------------------------- |
| Profil Görüntüleme       | `app/profile/[id]/page.tsx`                       | `useProfile(userId?)`                | `GET /users/{id}/profile` | ✅ Çalışıyor                     |
| Freelancer Profil        | `components/domains/profile/ProfileView.tsx`      | `useProfile`, `useProfileValidation` | `GET /users/{id}/profile` | ✅ Çalışıyor                     |
| Employer Profil          | `components/domains/profile/EmployerProfile.tsx`  | `useProfile`                         | `GET /users/{id}/profile` | ✅ Çalışıyor                     |
| Profil Düzenleme         | `components/domains/profile/ProfileEditForm.tsx`  | `useProfile`, `useAvatarUpload`      | `PUT /users/{id}/profile` | ⚠️ Auto-save iyileştirme gerekli |
| Portfolio Galerisi       | `components/domains/profile/PortfolioGallery.tsx` | `useProfile`                         | -                         | ✅ Çalışıyor                     |
| Profil Düzenleme Sayfası | `app/profile/edit/page.tsx`                       | `useProfile`                         | `PUT /users/{id}/profile` | ⚠️ Kontrol et                    |

### 2.3 İş (Job) ve Teklif (Proposal) Akışları

| Ekran/Sayfa             | Komponent                                     | Hook/Store | API Endpoints                 | Durum          |
| ----------------------- | --------------------------------------------- | ---------- | ----------------------------- | -------------- |
| İş Detay                | `components/domains/jobs/JobDetail.tsx`       | -          | `GET /jobs/{id}`              | ✅ Çalışıyor   |
| Teklif Formu            | `components/domains/jobs/ProposalForm.tsx`    | -          | `POST /proposals`             | ✅ Çalışıyor   |
| Teklif Modal            | `components/domains/jobs/ProposalModal.tsx`   | -          | `POST /proposals`             | ✅ Çalışıyor   |
| Teklif Kartı            | `components/domains/jobs/ProposalCard.tsx`    | -          | -                             | ✅ Çalışıyor   |
| Employer İş Listesi     | `app/dashboard/employer/jobs/page.tsx`        | -          | `GET /jobs/me`                | ⚠️ Placeholder |
| Employer Teklif Listesi | `app/dashboard/employer/proposals/page.tsx`   | -          | `GET /proposals/by-job/{id}`  | ⚠️ Placeholder |
| **Teklif Kabul Akışı**  | **Henüz yok**                                 | -          | `POST /proposals/{id}/accept` | ❌ **EKSİK**   |
| Freelancer Tekliflerim  | `app/dashboard/freelancer/proposals/page.tsx` | -          | `GET /proposals/me`           | ⚠️ Placeholder |

### 2.4 Sipariş (Order) Akışları

| Ekran/Sayfa               | Komponent                                        | Hook/Store      | API Endpoints                | Durum                    |
| ------------------------- | ------------------------------------------------ | --------------- | ---------------------------- | ------------------------ |
| Siparişlerim (Freelancer) | `app/dashboard/freelancer/orders/page.tsx`       | `useOrderStore` | `GET /orders`                | ⚠️ Placeholder, veri yok |
| Siparişlerim (Employer)   | `app/dashboard/employer/orders/page.tsx`         | `useOrderStore` | `GET /orders`                | ⚠️ Placeholder, veri yok |
| Sipariş Timeline          | `components/domains/packages/OrderTimeline.tsx`  | `useOrderStore` | `GET /orders/{id}/timeline`  | ✅ Komponent hazır       |
| **Teslimat Modal**        | **Henüz yok**                                    | -               | `POST /orders/{id}/deliver`  | ❌ **EKSİK**             |
| **Onaylama Modal**        | **Henüz yok**                                    | -               | `POST /orders/{id}/approve`  | ❌ **EKSİK**             |
| **Revizyon Modal**        | **Henüz yok**                                    | -               | `POST /orders/{id}/revision` | ❌ **EKSİK**             |
| Sipariş Formu             | `components/domains/packages/OrderForm.tsx`      | -               | `POST /orders`               | ✅ Komponent hazır       |
| Fatura Kartı              | `components/domains/packages/InvoiceCard.tsx`    | -               | -                            | ✅ Komponent hazır       |
| Ödeme Geçmişi             | `components/domains/packages/PaymentHistory.tsx` | -               | -                            | ✅ Komponent hazır       |

### 2.5 Store & Hook Katmanı

| Store/Hook        | Dosya                            | Açıklama                                           | Durum                    |
| ----------------- | -------------------------------- | -------------------------------------------------- | ------------------------ |
| Dashboard Store   | `lib/core/store/dashboard.ts`    | Dashboard verilerini yönetir, auto-refresh         | ✅ Çalışıyor             |
| Profile Store     | `lib/core/store/profile.ts`      | Profil CRUD, avatar upload, auto-save              | ⚠️ Auto-save iyileştirme |
| Orders Store      | `lib/core/store/orders.ts`       | Sipariş yaşam döngüsü, timeline, real-time updates | ✅ Çalışıyor             |
| Messaging Store   | `lib/core/store/messaging.ts`    | Mesajlaşma, conversation yönetimi                  | ✅ Çalışıyor             |
| useDashboard Hook | `hooks/business/useDashboard.ts` | Dashboard store wrapper, visibility tracking       | ✅ Çalışıyor             |
| useProfile Hook   | `hooks/business/useProfile.ts`   | Profile store wrapper, validation helpers          | ✅ Çalışıyor             |
| useWebSocket Hook | `hooks/infrastructure/*`         | Real-time bağlantı yönetimi                        | ✅ Çalışıyor             |

### 2.6 API Endpoints (Frontend Proxy)

Tüm API endpoint'ler `lib/api/endpoints.ts` dosyasında tanımlı:

- `PROPOSAL_ENDPOINTS`: create, accept, reject, withdraw, by job, me
- `ORDER_ENDPOINTS`: create, start, deliver, approve, revision, complete, cancel, timeline
- `JOB_ENDPOINTS`: CRUD, search, filter, proposals count
- `USER_ENDPOINTS`: profile get/update, avatar upload
- `DASHBOARD_ENDPOINTS`: freelancer, employer overview

### 2.7 Eksik Olan Kritik Komponentler

1. **ProposalAcceptHandler** - Employer teklif kabul butonu ve yönlendirme mantığı
2. **OrderDeliverModal** - Freelancer teslimat formu ve dosya yükleme
3. **OrderApproveModal** - Employer onaylama/revizyon formu
4. **DisputeModal** - İki taraflı itiraz sistemi
5. **PaymentIntentFlow** - Ödeme başlatma ve escrow UI

---

## 3. Eksik/yarım kalan alanlar (öncelikli)

1. Proposal accept → frontend yönlendirme (employer): Accept sonrası order oluşturulması / redirect / success UX eksik.
2. Order deliver modal (freelancer): Dosya yükleme/attachments + `orders/{id}/deliver` çağrısı + timeline update
3. Ödeme / escrow frontend entegrasyonu: payment intent UI, escrow hold/release görselleştirmesi
4. Revision & approve delivery modals (employer)
5. Dispute yönetimi UI (hem freelancer hem employer tarafında)
6. Profil edit: auto-save güvenilirliği, dosya yükleme UX
7. Tests: store unit testleri ve uçtan uca senaryolar eksik
8. CI: Lint/typecheck/test otomasyonu gözden geçirilmeli

---

## 4. Her yapılacak için detaylı görev listesi (önceliklendirilmiş)

Aşağıdaki maddeler her biri ayrı ticket/PR olacak şekilde tasarlanmıştır. Her madde altında "Kabul Kriterleri" ve "Bağımlılıklar" yer alır.

### 4.1 Dokümantasyon (Bu dosya) — tamamlandı

- Çıktı: `DOCS/UX_DEVELOPMENT_PLAN.md`
- Kabul: Repo root altında erişilebilir ve üzerinde mutabık kalındıktan sonra geliştirme başlatılacak.

### 4.2 Proposal Accept Flow (Employer) — Önem: Yüksek

- Açıklama: Employer panelinde bir proposal kabul edildiğinde frontend `POST /proposals/{id}/accept` çağrısını yapacak, response doğrulanacak ve kullanıcı order sayfasına yönlendirilecek.
- Kabul Kriterleri:
  - API çağrısı yapılır, HTTP 200/201 ile success alınır
  - UI: toast success gösterilir ve employer `orders` sayfasına yönlendirilir
  - Hata durumunda kullanıcı bilgilendirilmeli (409/403/500)
  - Unit test: accept handler happy path + error path
- Bağımlılıklar: `PROPOSAL_ENDPOINTS.ACCEPT` backend
- Tahmini: 1-2 gün

### 4.3 Order Timeline & Deliver Modal (Freelancer) — Önem: Yüksek

- Açıklama: Freelancer siparişe dosya yükleyip teslim edebilmeli; timeline güncellenmeli, websocket ile realtime güncelleme desteklenmeli.
- Kabul Kriterleri:
  - Modal içinde dosya seçme, küçük ön izleme
  - `POST /orders/{id}/deliver` çağrısı gönderilir (attachments örnek: presigned URL veya multi-part)
  - Başarılı teslim -> timeline'a "DELIVERED" entry eklenir ve kullanıcı bilgilendirilir
  - Unit test/store test: timeline update handler
- Bağımlılıklar: backend deliver endpoint, file storage/presigned integration
- Tahmini: 2-3 gün

### 4.4 Payment Intent & Escrow UI — Önem: Yüksek/Orta

- Açıklama: Employer ödeme başlattığında payment intent UI, escrow hold gösterimi ve confirm ekranı.
- Kabul Kriterleri:
  - Payment intent oluşturma akışı (mock/staging) çalışır
  - Escrow hold başarılıysa UI durum değişir (PAID -> IN_PROGRESS)
  - Release on approve: onay sonrası ödeme serbest bırakma gösterimi
- Bağımlılıklar: backend payment endpoints, test/staging stripe gibi provider
- Tahmini: 3-5 gün (bağımlılıklara göre değişir)

### 4.5 Revision / Approve Delivery Modals (Employer) — Önem: Orta

- Açıklama: Employer teslimatı onaylar veya revizyon isteği gönderir.
- Kabul Kriterleri:
  - Approve: `POST /orders/{id}/approve` çağrısı (veya uygun endpoint) yapılır
  - Request revision: revizyon notu gönderilir, timeline geri IN_PROGRESS yapılır
- Tahmini: 1-2 gün

### 4.6 Dispute Flow — Önem: Orta

- Açıklama: Buyer veya Seller dispute açabilmeli; admin escalation path düşünülmeli.
- Kabul Kriterleri:
  - Dispute oluşturma UI ve backend çağrısı
  - Dispute durumu timeline ve order detayında görünür
- Tahmini: 2-4 gün

### 4.7 Profile Edit UX & Auto-save Harden — Önem: Orta

- Açıklama: Auto-save debounce, queue, error handling; avatar upload progress gösterimi
- Kabul Kriterleri:
  - Auto-save 3s debounce ile güvenilir çalışmalı, network hatasında retry veya feedback verilmeli
  - Avatar upload progress bar
- Tahmini: 1-2 gün

### 4.8 Tests (Unit + Integration + E2E) — Önem: Yüksek

- Açıklama: Orders store unit tests, proposal flow integration tests, 2 E2E (proposal->accept->order->deliver->approve)
- Kabul Kriterleri:
  - Jest unit testleri yeşil
  - En az 2 E2E senaryo (Cypress/Playwright)
- Tahmini: 3-6 gün

### 4.9 CI & Release Prep — Önem: Orta

- Açıklama: Lint, typecheck, build, tests CI iş akışı
- Kabul Kriterleri:
  - PR pipeline: lint + test + build geçiyor
- Tahmini: 1-2 gün

---

## 5. Sprint Plan (Öneri)

- Sprint 1 (2 hafta): 4.2 + 4.3 + küçük testler (orders store unit)
- Sprint 2 (2 hafta): 4.4 + 4.5
- Sprint 3 (2 hafta): 4.6 + 4.7 + test genişletme
- Sprint 4 (1-2 hafta): 4.8 + CI + polish + a11y

Her sprint sonunda PR review ve staging deploy yapılmalı.

---

## 6. Riskler ve öneriler

- Backend readiness: bazı endpoint'ler staging'de olmayabilir (özellikle payment/escrow). Eğer backend hazır değilse mock adapter / MSW kullanarak frontend geliştirmesini sürdürebiliriz.
- Auth & permissions: role-based kontrol backend tarafından korunmalı; frontend ek rol kontrolleri ile kullanıcı deneyimini iyileştirebilir.
- File upload: presigned URL akışı tercih edilirse frontend complexity azalır.

---

## 7. Next steps (ne zaman başlayacağız?)

1. Bu dokümanı inceleyin.
2. Onay verirseniz `Sprint 1` işlerine başlıyorum: ilk PR olarak `Proposal accept -> Order redirect` işini açacağım.

---

## 8. İletişim / Notlar

- Bu dosya otomatik tarama sonucu oluşturuldu. Repository içindeki spesifik dosya referansları için (ör. `components/domains/dashboard/FreelancerDashboard.tsx`) ilave detaylı eşleme tablosu oluşturabilirim.
