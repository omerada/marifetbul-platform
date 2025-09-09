# Kullanıcı Akışları & Ekranlar

## Genel Kullanıcı Tipleri

### 1. Misafir (Guest)

- Ana sayfa görüntüleme
- İş ilanları ve paket browsing
- Kayıt/Giriş

### 2. Freelancer

- Profil yönetimi
- Hizmet paketi oluşturma/düzenleme
- İş ilanlarına teklif verme
- Dashboard yönetimi

### 3. İşveren (Employer)

- Profil yönetimi
- İş ilanı oluşturma/düzenleme
- Teklif değerlendirme
- Dashboard yönetimi

---

## Freelancer Kullanıcı Akışları

### 1. Kayıt ve Onboarding

```
Kayıt Formu → Email Doğrulama → Freelancer Profil Oluşturma → İlk Paket Oluşturma → Dashboard
```

### 2. Ana Freelancer Akışı

```
Dashboard → İş İlanları Listesi → İş Detayı → Teklif Ver → Teklif Takibi → İletişim
```

### 3. Paket Yönetimi Akışı

```
Dashboard → Paketlerim → Yeni Paket Oluştur / Düzenle → Paket Detayları → Yayınla
```

---

## İşveren Kullanıcı Akışları

### 1. Kayıt ve Onboarding

```
Kayıt Formu → Email Doğrulama → İşveren Profil Oluşturma → İlk İş İlanı → Dashboard
```

### 2. Ana İşveren Akışı

```
Dashboard → İş İlanı Oluştur → İlan Detayları → Yayınla → Teklifleri Görüntüle → Freelancer Seç
```

### 3. Teklif Değerlendirme Akışı

```
Dashboard → Aktif İlanlarım → İlan Detayı → Gelen Teklifler → Teklif Detayı → Kabul Et/Reddet
```

---

## Detaylı Ekran Spesifikasyonları

## 1. Ana Sayfa (Landing Page)

### Desktop Layout

```
[Header: Logo + Navigation + Login/Register]
[Hero Section: Başlık + Alt başlık + CTA Buttons]
[Features Section: Freelancer vs İşveren karşılaştırma]
[Stats Section: Platform istatistikleri]
[Popular Categories: Popüler kategoriler]
[How It Works: 3 adımlı süreç]
[Footer]
```

### Mobil Layout

```
[Mobile Header: Hamburger + Logo + Login]
[Hero Section: Compact version]
[Toggle Buttons: Freelancer / İşveren]
[Features Cards: Stackable]
[CTA Section]
[Footer]
```

### Bileşenler

- **Hero CTA**: "Freelancer Ol" / "İş Ver" butonları
- **Category Cards**: Popüler kategoriler (6-8 adet)
- **Stats Counter**: Animasyonlu sayılar
- **Feature Comparison**: Freelancer vs İşveren

## 2. Kayıt/Giriş Sayfaları

### Kayıt Formu (Register)

```typescript
interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userType: "freelancer" | "employer";
  termsAccepted: boolean;
}
```

### Validasyon Kuralları

- Email: Format kontrolü + unique check
- Password: Min 8 karakter, büyük/küçük harf, sayı
- İsim: Min 2 karakter
- Terms: Zorunlu acceptance

### Form Adımları

1. **Temel Bilgiler**: Email, şifre, isim
2. **Kullanıcı Tipi**: Freelancer/İşveren seçimi
3. **Doğrulama**: Email verification

## 3. Dashboard Sayfaları

### Freelancer Dashboard

#### Layout Yapısı

```
[Top Stats Bar: Aktif Teklifler | Görüntülenme | Bu Ay Kazanç]
[Quick Actions: Yeni Paket | Teklifleri Gör | Profili Düzenle]
[Recent Activity: Son aktiviteler listesi]
[Performance Chart: Aylık performans grafiği]
```

#### Stats Cards

- **Aktif Teklifler**: Bekleyen teklif sayısı
- **Bu Ay Görüntülenme**: Profil görüntülenme sayısı
- **Potansiyel Kazanç**: Bekleyen tekliflerin toplamı
- **Tamamlanan İşler**: Bu aydaki iş sayısı

#### Quick Actions

- **Yeni Paket Oluştur**
- **İş İlanlarını Gör**
- **Profili Düzenle**
- **Mesajlar**

### İşveren Dashboard

#### Layout Yapısı

```
[Top Stats Bar: Aktif İlanlar | Gelen Teklifler | Harcanan Bütçe]
[Quick Actions: Yeni İlan | Teklifleri Değerlendir | Profili Düzenle]
[Active Jobs: Aktif iş ilanları]
[Recent Proposals: Son gelen teklifler]
```

#### Stats Cards

- **Aktif İlanlar**: Yayında olan ilan sayısı
- **Gelen Teklifler**: Değerlendirilmeyi bekleyen
- **Bu Ay Harcama**: Aylık bütçe harcaması
- **Tamamlanan İşler**: Sonuçlanan proje sayısı

## 4. İş İlanları (Jobs)

### İş İlanları Listesi

#### Filtreler

```typescript
interface JobFilters {
  category: string[];
  budget: { min: number; max: number };
  deadline: string;
  skills: string[];
  location: string[];
  jobType: "hourly" | "fixed" | "project";
}
```

#### Liste Kartı İçeriği

```
[Başlık]
[Kategori Badge + Bütçe]
[Açıklama (2 satır)]
[Skills Tags]
[Konum + Zaman]
[Teklif Sayısı]
```

#### Mobil Optimizasyon

- Stack layout
- Swipe gestures
- Infinite scroll
- Quick filter chips

### İş İlanı Detay Sayfası

#### Sections

1. **İş Başlığı ve Özet**

   - Başlık
   - Kategori
   - Bütçe aralığı
   - Deadline
   - İşveren bilgileri

2. **İş Açıklaması**

   - Detaylı açıklama
   - Gereksinimler
   - Beklentiler

3. **Gerekli Yetenekler**

   - Skill tags
   - Deneyim seviyesi

4. **Proje Detayları**

   - Proje süresi
   - Başlangıç tarihi
   - Çalışma şekli

5. **Teklif Ver Bölümü** (Freelancer için)
   - Teklif formu
   - Dosya yükleme
   - Mesaj alanı

## 5. Freelancer Paketleri (Packages)

### Paket Listesi

#### Filtreler

```typescript
interface PackageFilters {
  category: string[];
  priceRange: { min: number; max: number };
  deliveryTime: string[];
  rating: number;
  skills: string[];
}
```

#### Paket Kartı

```
[Thumbnail Image]
[Başlık]
[Freelancer Info: Avatar + İsim + Rating]
[Fiyat (En düşük paket)]
[Delivery Time]
[Rating + Review Count]
[Skills Tags (3 adet)]
```

### Paket Detay Sayfası

#### Sections

1. **Paket Gallery**

   - Thumbnail images
   - Video preview (opsiyonel)

2. **Paket Bilgileri**

   - Başlık ve açıklama
   - Kategori
   - Freelancer profili

3. **Paket Seçenekleri** (Tabbed)

   - **Temel**: En düşük fiyat paketi
   - **Standart**: Orta seviye paket
   - **Premium**: En üst seviye paket

4. **Her Paket için**

   - Fiyat
   - Teslimat süresi
   - Dahil olan hizmetler (checklist)
   - Ekstra hizmetler

5. **Freelancer Hakkında**

   - Kısa bio
   - Yetenekler
   - Portfolio örnekleri
   - Müşteri yorumları

6. **Sipariş Ver Butonu**
   - Paket seçimi
   - Ekstra hizmetler
   - Toplam fiyat hesaplama

## 6. Profil Sayfaları

### Freelancer Profil

#### Public Profil

```
[Cover Photo]
[Profile Photo + İsim + Ünvan]
[Rating + Review Count + Konum]
[About Section]
[Skills & Expertise]
[Portfolio/Packages]
[Reviews & Ratings]
[Contact Button]
```

#### Düzenlenebilir Profil

```
[Personal Info Form]
[Professional Info Form]
[Skills Selection]
[Portfolio Upload]
[Package Management]
[Account Settings]
```

### İşveren Profil

#### Public Profil

```
[Company Logo/Photo]
[Şirket Adı + Sektör]
[Konum + Kuruluş Yılı]
[Hakkında]
[Yayınlanan İş İlanları]
[Yorumlar]
[İletişim]
```

## 7. Mesajlaşma Sistemi

### Mesaj Listesi

```
[Search Bar]
[Conversation List]
  - [Avatar + İsim]
  - [Son mesaj + Zaman]
  - [Unread indicator]
[New Message Button]
```

### Mesaj Detay

```
[Conversation Header: İsim + Online Status]
[Message History]
  - [Mesaj bubbles]
  - [Timestamp]
  - [File attachments]
[Message Input]
  - [Text area]
  - [File upload]
  - [Send button]
```

## 8. Form Validasyonları

### Freelancer Paket Oluşturma

```typescript
interface PackageForm {
  title: string; // Min 10, Max 100 karakter
  description: string; // Min 50, Max 1000 karakter
  category: string; // Required selection
  subcategory: string; // Required selection

  // Paket seviyeleri
  basic: {
    price: number; // Min 50 TL
    deliveryDays: number; // 1-30 gün
    features: string[]; // En az 3 özellik
  };

  standard?: {
    price: number; // Basic'ten yüksek
    deliveryDays: number;
    features: string[];
  };

  premium?: {
    price: number; // Standard'dan yüksek
    deliveryDays: number;
    features: string[];
  };

  skills: string[]; // En az 3, max 10
  images: File[]; // En az 1, max 5 görsel
}
```

### İş İlanı Oluşturma

```typescript
interface JobForm {
  title: string; // Min 10, Max 100 karakter
  description: string; // Min 100, Max 2000 karakter
  category: string;
  subcategory: string;

  budget: {
    type: "fixed" | "hourly";
    min: number;
    max: number;
  };

  deadline: Date; // En az 1 gün sonra
  skills: string[]; // En az 2, max 15
  experience: "entry" | "intermediate" | "expert";

  attachments?: File[]; // Max 5 dosya
}
```

## 9. Loading States & Error Handling

### Loading States

- **Skeleton Loading**: Liste sayfaları için
- **Spinner**: Form submissions için
- **Progress Bar**: Dosya yüklemeleri için
- **Shimmer Effect**: Kart yüklemeleri için

### Error States

- **Network Error**: İnternet bağlantısı sorunu
- **Validation Error**: Form hataları (field-level)
- **404 Error**: Sayfa bulunamadı
- **500 Error**: Server error
- **Empty State**: Veri yok durumu

### Success States

- **Toast Notifications**: Başarı mesajları
- **Modal Confirmations**: Önemli işlemler için
- **Inline Success**: Form başarı durumu
- **Progress Indicators**: Çok adımlı işlemler

## 10. Responsive Breakpoint Behaviors

### Mobile (< 640px)

- Single column layout
- Bottom navigation
- Swipe gestures
- Collapsed menus

### Tablet (640px - 1024px)

- Two column layout
- Side navigation
- Touch-optimized controls

### Desktop (> 1024px)

- Multi-column layout
- Sidebar navigation
- Hover states
- Keyboard shortcuts
