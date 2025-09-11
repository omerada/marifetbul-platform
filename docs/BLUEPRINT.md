# 📋 Marifet Platform Blueprint

**Freelancer & İşveren Marketplace - Detaylı Proje Spesifikasyonu**

---

## 🎯 Proje Tanımı

### Platform Konsepti

**Marifet**, Armut ve Bionluk platformlarının hibrit bir karışımı olan modern bir freelancer marketplace platformudur. Platform, hem **iş ilanı bazlı teklif sistemi** (Armut modeli) hem de **paket hizmet satış sistemi** (Bionluk modeli) sunarak çift yönlü bir marketplace deneyimi sağlar.

### Teknik Altyapı

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui Components
- **State Management**: Zustand
- **Forms & Validation**: React Hook Form + Zod
- **API Strategy**: Mock Service Worker → Production Backend
- **Testing**: Jest + React Testing Library
- **Icons**: Lucide React

---

## 👥 Platform Rolleri ve Yetkileri

### 🏢 Normal Kullanıcı (İşveren/Employer)

#### Ana Yetkiler

- ✅ **Freelancer Keşfi**: Tüm freelancer profillerini görüntüleme, filtreleme, arama
- ✅ **Paket Satın Alma**: Freelancer'ların paket hizmetlerini satın alma
- ✅ **İş İlanı Oluşturma**: Kendi projesi için iş ilanı yayınlama
- ✅ **Teklif Yönetimi**: Gelen teklifleri inceleme, karşılaştırma, seçme
- ✅ **Mesajlaşma**: Freelancer'larla birebir iletişim kurma
- ✅ **Güvenli Ödeme**: Escrow sistemi ile güvenli ödeme yapma
- ✅ **İş Takibi**: Proje sürecini takip etme, milestone onayları
- ✅ **Değerlendirme**: İş tamamlandıktan sonra freelancer'ı puanlama

#### Dashboard Özellikleri

- **Aktif Projeler**: Devam eden iş ve siparişler
- **Teklif Yönetimi**: Gelen tekliflerin durumu
- **Ödeme Geçmişi**: Tüm işlem geçmişi
- **Favori Freelancer'lar**: Kaydettiği freelancer profilleri
- **İş İlanları**: Aktif ve geçmiş ilanları

### 👨‍💻 Freelancer (Hizmet Veren)

#### Ana Yetkiler

- ✅ **Profil Yönetimi**: Detaylı profil, portföy, beceriler, deneyim
- ✅ **Paket Oluşturma**: Farklı fiyat ve özellikte hizmet paketleri tanımlama
- ✅ **İş İlanlarını Görme**: Tüm aktif iş ilanlarını görüntüleme
- ✅ **Teklif Verme**: İş ilanlarına özel teklif ve fiyat gönderme
- ✅ **Sipariş Yönetimi**: Gelen paket siparişlerini yönetme
- ✅ **İş Teslimi**: Proje dosyalarını teslim etme, revizyon yapma
- ✅ **Gelir Yönetimi**: Kazançları takip etme, para çekme
- ✅ **Müşteri Değerlendirme**: İşverenleri puanlama ve yorum yapma
- ✅ **Freelancer Ağı**: Diğer freelancer profillerini inceleme

#### Dashboard Özellikleri

- **Kazançlar**: Toplam gelir, bekleyen ödemeler, ödeme geçmişi
- **Aktif İşler**: Devam eden projeler ve siparişler
- **Paket Performansı**: Paket satış istatistikleri
- **Teklif Durumları**: Verilen tekliflerin durumu
- **Profil İstatistikleri**: Görüntülenme, rating, başarı metrikleri

---

## 🔄 Kullanıcı Akışları (User Flows)

### 🏢 İşveren Kullanıcı Akışları

#### 1. Onboarding Akışı

```
Kayıt → Email Doğrulama → Rol Seçimi (Employer) →
Profil Bilgileri → Şirket Bilgileri → Ödeme Yöntemi →
Dashboard'a Yönlendirme
```

#### 2. Freelancer Keşif Akışı

```
Ana Sayfa → Kategoriler/Arama → Filtreler Uygulama →
Freelancer Listesi → Profil İnceleme → Portföy/Yorumlar →
Mesaj Gönderme veya Paket Satın Alma
```

#### 3. Paket Satın Alma Akışı

```
Paket Seçimi → Paket Detayları → Özelleştirme →
Ödeme Bilgileri → Güvenli Ödeme → Sipariş Onayı →
Freelancer ile İletişim → İş Takibi → Teslim →
Onay → Değerlendirme
```

#### 4. İş İlanı Oluşturma Akışı

```
Dashboard → İlan Oluştur → Kategori Seçimi →
İş Detayları → Bütçe/Süre → Beceriler →
İlan Yayınlama → Teklif Alma → Teklif İnceleme →
Freelancer Seçimi → Proje Başlangıcı → İş Takibi →
Teslim → Ödeme Serbest Bırakma → Değerlendirme
```

### 👨‍💻 Freelancer Kullanıcı Akışları

#### 1. Onboarding Akışı

```
Kayıt → Email Doğrulama → Rol Seçimi (Freelancer) →
Kişisel Bilgiler → Beceriler/Deneyim → Portföy Ekleme →
Saat Ücreti Belirleme → İlk Paket Oluşturma →
Profil Onayı → Dashboard
```

#### 2. Paket Oluşturma Akışı

```
Dashboard → Paket Oluştur → Kategori Seçimi →
Paket Başlığı/Açıklama → Fiyatlandırma →
Teslimat Süresi → Revizyon Sayısı → Özellik Listesi →
Görseller Ekleme → Paket Yayınlama → Sipariş Bekleme
```

#### 3. İş İlanı Teklif Akışı

```
Dashboard → İlanları Görüntüle → Filtreler →
İlan Detayları → Teklif Hazırlama → Fiyat/Süre Önerisi →
Kapsamlı Açıklama → Portföy Örnekleri →
Teklif Gönderme → Onay Bekleme → Proje Başlangıcı
```

#### 4. Sipariş Yönetimi Akışı

```
Sipariş Alındı → İşveren ile İletişim → İş Başlangıcı →
Ara Teslimler → Geri Bildirim Alma → Revizyon →
Final Teslimat → İşveren Onayı → Ödeme Alma →
Değerlendirme Verme
```

---

## 📱 Detaylı Ekran Spesifikasyonları

### 🔐 Kimlik Doğrulama Ekranları

#### Login Ekranı

**Özellikler**:

- Email/Password girişi
- "Beni Hatırla" seçeneği
- Sosyal medya login (Google, LinkedIn)
- "Şifremi Unuttum" linki
- Kayıt sayfasına yönlendirme

**UI Components**:

- Input fields (email, password)
- Checkbox (remember me)
- Primary button (Giriş Yap)
- Social login buttons
- Link components

#### Register Ekranı

**Özellikler**:

- Multi-step form (3 adım)
- Adım 1: Temel bilgiler (email, şifre, ad/soyad)
- Adım 2: Rol seçimi (Employer/Freelancer)
- Adım 3: İlave bilgiler (rol bazlı)
- Email verification
- Şartlar ve koşullar onayı

**UI Components**:

- Stepper component
- Form inputs
- Role selection cards
- Checkbox (terms)
- Progress indicator

### 🏠 Ana Sayfa (Landing Page)

#### Hero Section

**Employer Görünümü**:

- "İşiniz için en iyi freelancer'ı bulun"
- Arama çubuğu (kategori + anahtar kelime)
- İstatistikler (aktif freelancer, tamamlanan proje)

**Freelancer Görünümü**:

- "Yeteneklerinizi paraya çevirin"
- "Hemen Başla" CTA butonu
- Başarı hikayeleri

#### Kategoriler Bölümü

- Grid layout (3x4 desktop, 2x6 tablet, 1x12 mobile)
- Her kategori: icon, isim, freelancer sayısı
- Hover effects
- Kategori sayfasına yönlendirme

#### Öne Çıkan Freelancer'lar

- Carousel component
- Freelancer kartları (avatar, isim, beceriler, rating, fiyat)
- "Tümünü Gör" linki

#### Popüler Paketler

- Grid layout (4 kart desktop, 2 tablet, 1 mobile)
- Paket kartları (görsel, başlık, fiyat, rating)
- "Paketleri Keşfet" linki

### 👤 Profil Yönetimi Ekranları

#### Freelancer Profil Görüntüleme

**Sol Panel (Sabit)**:

- Avatar (büyük)
- İsim, başlık
- Konum, dil bilgileri
- Response time
- Member since
- Online/offline durumu

**Ana İçerik (Tabs)**:

- **Hakkında**: Bio, beceriler, deneyim, sertifikalar
- **Portföy**: Proje örnekleri (grid, modal popup)
- **Paketler**: Mevcut paket hizmetleri
- **Yorumlar**: Rating breakdown, yorum listesi
- **İstatistikler**: Tamamlanan iş, müşteri memnuniyeti

**Sağ Panel (Sticky)**:

- Hızlı iletişim formu
- Favori'lere ekleme
- Rapor etme
- Sosyal medya linkleri

#### Employer Profil Görüntüleme

**Ana İçerik**:

- Şirket logosu/avatar
- Şirket adı, sektör
- Hakkında bölümü
- İlan geçmişi
- Verdiği yorumlar
- İstatistikler (toplam harcama, aktif projeler)

### 💼 İş Yönetimi Ekranları

#### İş İlanı Listeleme

**Filtre Paneli (Sol)**:

- Kategori/alt kategori
- Bütçe aralığı
- Proje türü (sabit fiyat/saatlik)
- Deneyim seviyesi
- Lokasyon
- Yayın tarihi
- Uzaktan çalışma

**İlan Listesi (Ana)**:

- İlan kartları (başlık, açıklama özeti, bütçe, beceriler)
- Teklif sayısı, yayın tarihi
- Bookmark/save özelliği
- Pagination

**Sıralama Seçenekleri**:

- En yeni
- Bütçe (düşükten yükseğe)
- Teklif sayısı
- Relevance

#### İş İlanı Detay Sayfası

**Ana İçerik**:

- İş başlığı, kategori
- Detaylı açıklama
- Bütçe/süre bilgileri
- Gerekli beceriler (etiketler)
- Ek dosyalar

**İşveren Bilgileri**:

- Şirket profili özeti
- Önceki iş geçmişi
- Rating, yorumlar
- Doğrulama durumu

**Teklif Verme Paneli**:

- Fiyat önerisi
- Teslimat süresi
- Cover letter alanı
- Portföy ekleme
- "Teklif Gönder" butonu

### 📦 Paket Sistem Ekranları

#### Paket Mağazası (Marketplace)

**Ana Layout**:

- Arama çubuğu (üst)
- Kategori filtresi (sol panel)
- Paket grid'i (ana alan)
- Pagination (alt)

**Paket Kartları**:

- Paket görseli
- Başlık (max 2 satır)
- Freelancer bilgisi (avatar, isim)
- Starting price
- Rating (yıldız + sayı)
- Delivery time
- "Quick View" hover overlay

**Filtreleme Seçenekleri**:

- Fiyat aralığı
- Teslimat süresi
- Rating
- Online freelancer'lar
- Pro freelancer'lar

#### Paket Detay Sayfası

**Paket Bilgileri (Sol)**:

- Image gallery (main image + thumbnails)
- Paket açıklaması
- Neler dahil listesi
- FAQ section
- Etiketler

**Freelancer Bilgileri (Sağ)**:

- Mini profil kartı
- Diğer paketleri
- İletişim butonu

**Fiyatlandırma Tablosu**:

- 3 tier pricing (Basic, Standard, Premium)
- Feature comparison
- Delivery time
- Revision count
- "Order Now" buttons

### 💬 Mesajlaşma Sistemi

#### Mesaj Listesi (Conversations)

**Sol Panel**:

- Conversation list
- Arama çubuğu
- Filtreler (okunmamış, arşiv)
- Online durumu indicators

**Ana İçerik**:

- Message thread
- Message bubbles (sent/received)
- Timestamp'ler
- File attachments
- Quick actions (archive, delete)

**Message Composer**:

- Text input
- File upload
- Emoji picker
- Send button
- Typing indicators

#### Quick Messaging

**Features**:

- Real-time messaging
- File sharing (images, documents)
- Message search
- Conversation archives
- Block/report functionality

### 💳 Ödeme ve Faturalandırma

#### Ödeme Sayfası

**Sipariş Özeti**:

- Paket/iş detayları
- Fiyat breakdown
- Tax calculation
- Total amount

**Ödeme Yöntemleri**:

- Kredi kartı
- PayPal
- Banka transferi
- Wallet balance

**Güvenlik**:

- SSL encryption
- PCI compliance
- Escrow system explanation

#### Fatura Yönetimi

- Fatura geçmişi
- PDF indirme
- Vergi raporları
- Expense tracking

---

## ⭐ Çift Taraflı Puanlama Sistemi

### İşveren → Freelancer Değerlendirme

#### Rating Kategorileri

1. **İş Kalitesi** (1-5 yıldız)
   - Teslimat kalitesi
   - Teknik yeterlilik
   - Yaratıcılık/çözüm önerisi

2. **İletişim** (1-5 yıldız)
   - Yanıt hızı
   - Açık iletişim
   - Professionalism

3. **Zaman Yönetimi** (1-5 yıldız)
   - Deadline'a uyma
   - İlerleme raporlama
   - Revizyon hızı

#### Yorum Sistemi

- **Structured feedback**: Pozitif/negatif yorumlar
- **Public/private comments**: Görünürlük seçenekleri
- **Response capability**: Freelancer yanıt verebilir
- **Moderation**: İnsan moderasyon süreci

### Freelancer → İşveren Değerlendirme

#### Rating Kategorileri

1. **Brief Netliği** (1-5 yıldız)
   - Açık talimatlar
   - Proje scope'u
   - Hedef kitlesi

2. **İletişim & İşbirliği** (1-5 yıldız)
   - Yanıt hızı
   - Constructive feedback
   - Respectful communication

3. **Ödeme Süreci** (1-5 yıldız)
   - Zamanında ödeme
   - Milestone approvals
   - Additional requests handling

### Puanlama Algoritması

- **Weighted average**: Son 12 ayın ağırlığı yüksek
- **Volume consideration**: Yorum sayısı faktörü
- **Reliability score**: Consistent performance tracking
- **Platform intervention**: Fake review detection

---

## 🚀 MVP (Minimum Viable Product) Öncelikleri

### 🥇 Faz 1: Temel Platform (4-5 Sprint)

**Kritik Özellikler**:

- ✅ Kullanıcı kayıt/giriş sistemi (rol bazlı)
- ✅ Temel profil yönetimi (Freelancer/Employer)
- ✅ İş ilanı oluşturma ve listeleme
- ✅ Temel paket sistemi
- ✅ Basit mesajlaşma
- ✅ Escrow ödeme sistemi (temel)
- ✅ Çift taraflı puanlama

### 🥈 Faz 2: Gelişmiş Özellikler (3-4 Sprint)

**İyileştirmeler**:

- ✅ Gelişmiş arama ve filtreleme
- ✅ Push bildirimleri
- ✅ Dosya paylaşımı
- ✅ Revizyon döngüsü yönetimi
- ✅ Detaylı analytics dashboard
- ✅ Email notification sistemi

### 🥉 Faz 3: Büyüme ve Optimizasyon (2-3 Sprint)

**İleri Seviye**:

- ✅ Premium üyelik sistemi
- ✅ AI powered eşleştirme
- ✅ SEO optimizasyonu
- ✅ Mobile app readiness
- ✅ Admin panel
- ✅ API for third-party integrations

---

## 📊 Platform Metrikleri ve KPI'lar

### Freelancer Success Metrics

- **Profile Completion Rate**: Profil tamamlama oranı
- **Response Rate**: Mesajlara yanıt verme oranı
- **Order Completion Rate**: Sipariş tamamlama oranı
- **Customer Satisfaction**: Ortalama rating
- **Repeat Customer Rate**: Tekrar müşteri oranı

### Employer Success Metrics

- **Job Posting Success**: İlan başarı oranı
- **Proposal Quality**: Gelen teklif kalitesi
- **Project Completion**: Proje tamamlama oranı
- **Freelancer Rating**: Freelancer'lara verilen ortalama puan
- **Platform Retention**: Platform'da kalış süresi

### Platform Health Metrics

- **User Acquisition Cost (UAC)**
- **Lifetime Value (LTV)**
- **Monthly Active Users (MAU)**
- **Transaction Volume**
- **Dispute Resolution Rate**
- **Platform Commission Revenue**

---

## 🔧 Teknik Özellikler ve Entegrasyon Noktaları

### API Endpoints (Mock → Production)

#### Authentication API

```typescript
POST / api / v1 / auth / register;
POST / api / v1 / auth / login;
POST / api / v1 / auth / logout;
POST / api / v1 / auth / refresh;
POST / api / v1 / auth / forgot - password;
POST / api / v1 / auth / reset - password;
POST / api / v1 / auth / verify - email;
```

#### User Management API

```typescript
GET / api / v1 / users / profile;
PUT / api / v1 / users / profile;
POST / api / v1 / users / avatar;
GET / api / v1 / users / { id } / public - profile;
PUT / api / v1 / users / password;
DELETE / api / v1 / users / account;
```

#### Job Management API

```typescript
GET / api / v1 / jobs;
POST / api / v1 / jobs;
GET / api / v1 / jobs / { id };
PUT / api / v1 / jobs / { id };
DELETE / api / v1 / jobs / { id };
GET / api / v1 / jobs / { id } / proposals;
POST / api / v1 / jobs / { id } / proposals;
```

#### Package System API

```typescript
GET / api / v1 / packages;
POST / api / v1 / packages;
GET / api / v1 / packages / { id };
PUT / api / v1 / packages / { id };
DELETE / api / v1 / packages / { id };
POST / api / v1 / packages / { id } / order;
GET / api / v1 / orders;
GET / api / v1 / orders / { id };
```

#### Messaging API

```typescript
GET / api / v1 / conversations;
POST / api / v1 / conversations;
GET / api / v1 / conversations / { id } / messages;
POST / api / v1 / conversations / { id } / messages;
PUT / api / v1 / messages / { id } / read;
```

#### Payment API

```typescript
POST / api / v1 / payments / intent;
POST / api / v1 / payments / confirm;
GET / api / v1 / payments / methods;
POST / api / v1 / payments / methods;
GET / api / v1 / payments / history;
POST / api / v1 / payments / withdrawal;
```

### Third-party Entegrasyonları

#### Payment Gateways

- **Stripe**: Ana ödeme sistemi
- **PayPal**: Alternative payment
- **Local Banks**: Türk bankacılık sistemi
- **Crypto**: Bitcoin, Ethereum (opsiyonel)

#### Communication Services

- **Twilio**: SMS notifications
- **SendGrid**: Email service
- **WebSocket**: Real-time messaging
- **Push Notifications**: Firebase Cloud Messaging

#### File Storage

- **AWS S3**: File uploads
- **Cloudinary**: Image processing
- **Google Drive API**: Document integration

#### Analytics & Monitoring

- **Google Analytics**: User behavior
- **Mixpanel**: Event tracking
- **Sentry**: Error monitoring
- **New Relic**: Performance monitoring

---

## 🎨 UI/UX Design Principles

### Design System

- **Modern Minimalism**: Clean, clutter-free interfaces
- **Professional Aesthetics**: Business-oriented color scheme
- **Intuitive Navigation**: Clear information architecture
- **Consistent Patterns**: Reusable UI components

### Color Palette

```css
Primary: #2563eb (Blue)
Secondary: #64748b (Slate)
Success: #22c55e (Green)
Warning: #f59e0b (Amber)
Error: #ef4444 (Red)
Background: #ffffff / #0f172a (Light/Dark)
```

### Typography

```css
Headings: Inter (600-700 weight)
Body: Inter (400-500 weight)
Code: JetBrains Mono
```

### Component Library

- **Shadcn/ui** base components
- **Custom business components**
- **Responsive grid system**
- **Consistent spacing scale**

### Accessibility Standards

- **WCAG 2.1 AA compliance**
- **Keyboard navigation**
- **Screen reader support**
- **High contrast mode**
- **Focus management**

---

## 🔒 Güvenlik ve Uyumluluk

### Data Security

- **SSL/TLS encryption**
- **Password hashing** (bcrypt)
- **JWT token security**
- **API rate limiting**
- **Input sanitization**
- **SQL injection prevention**
- **XSS protection**

### Payment Security

- **PCI DSS compliance**
- **Escrow system**
- **Fraud detection**
- **Secure payment processing**
- **Transaction monitoring**

### Privacy Compliance

- **GDPR compliance**
- **Cookie consent**
- **Data anonymization**
- **Right to deletion**
- **Privacy policy**
- **Terms of service**

### Platform Safety

- **User verification system**
- **Content moderation**
- **Dispute resolution process**
- **Spam detection**
- **Fake account prevention**

---

## 📈 Büyüme ve Genişleme Stratejisi

### Phase 1: Turkey Launch

- Turkish market focus
- Local payment methods
- Turkish language support
- Local customer service

### Phase 2: Regional Expansion

- MENA region expansion
- Multi-language support
- Local currency support
- Regional compliance

### Phase 3: Global Platform

- Worldwide availability
- Multi-timezone support
- Advanced localization
- Enterprise solutions

---

**🎯 Bu blueprint, AI Agent'ın 12 sprint'lik detaylı roadmap oluşturması için gerekli tüm bilgileri içerir. Her özellik, ekran ve akış detaylı şekilde tanımlanmıştır.**
