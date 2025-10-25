# Blog Yorum Moderasyon - Yönetici Kılavuzu

**MarifetBul Platform** | Admin Panel v1.0 | Ekim 2025

## 📖 İçindekiler

1. [Giriş](#giriş)
2. [Admin Panel Erişimi](#admin-panel-erişimi)
3. [Dashboard Genel Bakış](#dashboard-genel-bakış)
4. [Moderasyon Kuyruğu](#moderasyon-kuyruğu)
5. [Tek Yorum İşlemleri](#tek-yorum-işlemleri)
6. [Toplu İşlemler](#toplu-işlemler)
7. [Moderasyon Notları](#moderasyon-notları)
8. [En İyi Uygulamalar](#en-iyi-uygulamalar)
9. [SSS](#sss)

---

## 🎯 Giriş

Blog yorum moderasyon sistemi, MarifetBul platformundaki kullanıcı yorumlarını yönetmenizi sağlar. Bu kılavuz, moderatör rolündeki yöneticilere yönelik kapsamlı bir el kitabıdır.

### Moderatör Sorumlulukları

✅ Yorumları incelemek ve onaylamak  
✅ Uygunsuz içerikleri reddetmek  
✅ Spam yorumları işaretlemek  
✅ Kullanıcı bildirimlerini değerlendirmek  
✅ Topluluk kurallarını uygulamak  
✅ İstatistikleri takip etmek

### Hedef Süreçler

- **Yanıt Süresi**: < 2 saat
- **Onay Oranı**: %85-90
- **Spam Yakalama**: %95+
- **Kullanıcı Memnuniyeti**: %90+

---

## 🔐 Admin Panel Erişimi

### Giriş Yapma

1. MarifetBul anasayfasına gidin
2. Sağ üst köşeden "Giriş Yap" tıklayın
3. Admin kimlik bilgilerinizi girin
4. 2FA kodunu girin (etkinse)

**URL:** `https://marifetbul.com/admin/login`

### İzinler

Moderatör rolü için gereken izinler:

```typescript
permissions: [
  'comments:read',      // Yorumları görüntüleme
  'comments:moderate',  // Moderasyon işlemleri
  'comments:approve',   // Yorumları onaylama
  'comments:reject',    // Yorumları reddetme
  'comments:spam',      // Spam işaretleme
  'comments:delete',    // Yorumları silme
  'reports:read',       // Bildirimleri görüntüleme
  'stats:read'          // İstatistikleri görüntüleme
]
```

### Navigasyon

Admin panel menüsünden:

```
Dashboard
  └─ Moderasyon
      ├─ Dashboard (/admin/moderation/dashboard)
      └─ Yorum Kuyruğu (/admin/moderation/comments)
```

---

## 📊 Dashboard Genel Bakış

### Dashboard Sayfası

**URL:** `/admin/moderation/dashboard`

Dashboard, yorum moderasyon faaliyetlerinizin genel bir görünümünü sunar.

```
┌─────────────────────────────────────────────────────────┐
│  📊 Yorum Moderasyon Dashboard                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐  ┌──────────────────────────┐    │
│  │ Bekleyen Yorumlar│  │ Son Yorumlar             │    │
│  │                  │  │                          │    │
│  │    47           │  │ Ahmet Y. • 2 sa          │    │
│  │  Bekliyor       │  │ "Harika makale..."       │    │
│  │                  │  │ [Bekliyor]               │    │
│  │ ↑ %15           │  │                          │    │
│  │                  │  │ Mehmet D. • 5 sa         │    │
│  │ Bu hafta: 89    │  │ "Çok faydalı..."         │    │
│  │ Bugün: 12       │  │ [Onaylandı]              │    │
│  │ Bildirilen: 5   │  │                          │    │
│  │                  │  │ [Tümünü Gör]             │    │
│  └──────────────────┘  └──────────────────────────┘    │
│                                                         │
│  ┌───────────────────────────────────────────────┐      │
│  │ İstatistikler                                 │      │
│  │                                               │      │
│  │ Toplam: 1,250    Onaylı: 1,108 (88.6%)      │      │
│  │ ████████████████████████████████░░░░  88.6%  │      │
│  │                                               │      │
│  │ Bekliyor: 47     Reddedildi: 82   Spam: 13  │      │
│  │                                               │      │
│  │ Bugün: Onaylı 8 | Reddedildi 4              │      │
│  │ Ort. Yanıt Süresi: 2.5 saat                  │      │
│  └───────────────────────────────────────────────┘      │
│                                                         │
│  🔄 Otomatik yenileme: 45 saniye                       │
└─────────────────────────────────────────────────────────┘
```

### Widget'lar

#### 1. Bekleyen Yorumlar Widget'ı

Moderasyon gerektiren yorumların özeti:

- **Toplam Bekleyen**: Onay bekleyen yorum sayısı
- **Trend**: Önceki güne göre artış/azalış
- **Bu Hafta**: Haftalık toplam
- **Bugün**: Bugünkü toplam
- **Bildirilen**: Bildirilen yorum sayısı

**Aksiyonlar:**

- "Kuyruğa Git" - Moderasyon kuyruğuna yönlendirir
- "Bildirilenler" - Sadece bildirilen yorumları gösterir

#### 2. İstatistikler Widget'ı

Genel moderasyon istatistikleri:

- **Toplam Yorumlar**: Sistemdeki tüm yorumlar
- **Onay Oranı**: Onaylanan yorumların yüzdesi
- **Bugün'ün Aktivitesi**: Günlük onay/ret sayıları
- **Ortalama Yanıt Süresi**: Yorumların işlenme süresi

#### 3. Son Yorumlar Widget'ı

En son gelen 5 yorum:

- Yazar adı
- Göreceli zaman ("2 saat önce")
- İçerik önizlemesi
- Durum badge'i
- Hızlı erişim

### Otomatik Yenileme

Dashboard her **60 saniyede** bir otomatik yenilenir:

- Countdown timer gösterir
- Manuel yenileme butonu mevcut
- Sekme focus'ta iken hızlı yenilenir
- İnternet bağlantısı geri gelince yenilenir

---

## 🔍 Moderasyon Kuyruğu

### Kuyruk Sayfası

**URL:** `/admin/moderation/comments`

Tüm yorumları görüntüleyin, filtreleyin ve yönetin.

```
┌─────────────────────────────────────────────────────────┐
│  🛡️  Yorum Moderasyonu                  [🔄 Yenile ⏱30s]│
├─────────────────────────────────────────────────────────┤
│  Toplam 1,250 yorum • 47 bekliyor                       │
│                                                         │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                      │
│  │ 47  │ │1,108│ │ 82  │ │ 13  │                      │
│  │Bekl.│ │Onay │ │ Red │ │Spam │                      │
│  └─────┘ └─────┘ └─────┘ └─────┘                      │
│                                                         │
│  🔎 [Ara: Kullanıcı, içerik...]  [🔽 Filtrele]        │
│  ┌────────────────────────────────────────────┐         │
│  │ [Tümü] [Bekliyor] [Onaylı] [Reddedildi] [Spam]│    │
│  └────────────────────────────────────────────┘         │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ ☐ Ahmet Yılmaz • 2 saat önce                   │    │
│  │   🟡 Onay Bekliyor                              │    │
│  │                                                 │    │
│  │   "Bu makale gerçekten çok faydalı. Özellikle  │    │
│  │   örnekler konuyu anlamama yardımcı oldu."     │    │
│  │                                                 │    │
│  │   Gönderi: "Next.js 14 Yenilikleri"           │    │
│  │                                                 │    │
│  │   [✓ Onayla] [✗ Reddet] [🚩 Spam]              │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  5 yorum seçildi [Toplu Onayla] [Toplu Reddet]        │
│                                                         │
│  ← Önceki  [1] 2 3 ... 25  Sonraki →                   │
└─────────────────────────────────────────────────────────┘
```

### Arama ve Filtreleme

#### Arama

Gerçek zamanlı arama (300ms debounce):

```typescript
// Arama kriterleri
- Yorum içeriği
- Yazar adı
- Gönderi başlığı
- Moderasyon notları
```

**Örnek Aramalar:**

- `spam` - "spam" kelimesi içeren yorumlar
- `ahmet` - Ahmet tarafından yazılan yorumlar
- `next.js` - Next.js hakkında yorumlar

#### Filtreler

**Durum Filtreleri:**

- **Tümü**: Tüm yorumlar (varsayılan)
- **Bekliyor**: Onay bekleyen yorumlar
- **Onaylı**: Onaylanmış yorumlar
- **Reddedildi**: Reddedilmiş yorumlar
- **Spam**: Spam işaretli yorumlar

**Sıralama:**

- En yeni önce (varsayılan)
- En eski önce
- En çok bildirilen
- Alfabetik

#### Sayfalama

- Sayfa başına 20 yorum
- Klavye ile gezinilebilir (←/→ tuşları)
- "Hızlı gezinme" seçenekleri

---

## ✅ Tek Yorum İşlemleri

### Yorum Kartı

Her yorum kartı şu bilgileri içerir:

```
┌──────────────────────────────────────────────┐
│ ☐  [Profil Resmi] Ahmet Yılmaz               │
│                   ahmet@example.com           │
│                   Üye: 2 yıl                  │
│                   🟡 Onay Bekliyor            │
│                                              │
│    "Bu makale gerçekten çok faydalı oldu.   │
│    Özellikle Server Components kısmı benim  │
│    için net olmayan noktaları açıkladı."    │
│                                              │
│    📝 Gönderi: "Next.js 14 Yenilikleri"     │
│    📅 Tarih: 25 Ekim 2025, 14:30            │
│    📊 Bildirim: 0                            │
│                                              │
│    [✓ Onayla] [✗ Reddet] [🚩 Spam]          │
│    [📝 Not Ekle] [🗑️ Sil]                    │
└──────────────────────────────────────────────┘
```

### İşlem 1: Yorum Onaylama

Uygun yorumları onaylayın.

**Adımlar:**

1. Yorumu okuyun ve değerlendirin
2. "Onayla" butonuna tıklayın
3. Onay diyalogunu inceleyin
4. "Onayla" ile confirm edin

**Onay Diyalogu:**

```
┌───────────────────────────────┐
│  Yorumu Onayla                │
│                               │
│  Bu yorumu onaylamak          │
│  istediğinize emin misiniz?   │
│                               │
│  Yorum yayınlanacak ve        │
│  kullanıcılar görebilecek.    │
│                               │
│  [İptal]  [Onayla]            │
└───────────────────────────────┘
```

**Sonuç:**

- Yorum durumu: APPROVED
- Kullanıcıya bildirim gönderilir
- Yorum blog yazısında görünür olur
- İstatistikler güncellenir

### İşlem 2: Yorum Reddetme

Topluluk kurallarına uymayan yorumları reddedin.

**Adımlar:**

1. "Reddet" butonuna tıklayın
2. Ret nedenini seçin
3. Not ekleyin (opsiyonel ama önerilir)
4. "Reddet" ile confirm edin

**Red Diyalogu:**

```
┌───────────────────────────────────┐
│  Yorumu Reddet                    │
│                                   │
│  Neden:                           │
│  ○ Spam içerik                    │
│  ● Uygunsuz içerik                │
│  ○ Topluluk kurallarına aykırı    │
│  ○ Yanıltıcı bilgi                │
│  ○ Kişisel saldırı                │
│  ○ Diğer                          │
│                                   │
│  Not (kullanıcıya görünür):       │
│  ┌─────────────────────────────┐  │
│  │ Küfür içerdiği için reddedi-│  │
│  │ ldi. Lütfen saygılı olun.   │  │
│  └─────────────────────────────┘  │
│                                   │
│  [İptal]  [Reddet]                │
└───────────────────────────────────┘
```

**Red Nedenleri:**

1. **Spam İçerik** - Reklam, tekrarlı mesajlar
2. **Uygunsuz İçerik** - Küfür, hakaret
3. **Topluluk Kurallarına Aykırı** - Kural ihlalleri
4. **Yanıltıcı Bilgi** - Yanlış/eksik bilgi
5. **Kişisel Saldırı** - Taciz, zorbalık
6. **Diğer** - Yukarıdakilere uymayan

**Sonuç:**

- Yorum durumu: REJECTED
- Kullanıcıya bildirim + neden gönderilir
- Yorum sadece yazara görünür
- Moderasyon notuna eklenir

### İşlem 3: Spam İşaretleme

Açık spam içeriği işaretleyin.

**Adımlar:**

1. "Spam" butonuna tıklayın
2. Spam nedenini seçin
3. Confirm edin

**Spam Diyalogu:**

```
┌───────────────────────────────────┐
│  Spam Olarak İşaretle             │
│                                   │
│  Spam tipi:                       │
│  ● Reklam/Tanıtım                 │
│  ○ Phishing/Dolandırıcılık        │
│  ○ Tekrarlanan içerik             │
│  ○ Bot/Otomatik mesaj             │
│  ○ Link spam                      │
│                                   │
│  ⚠️  Spam işaretlemeler öğrenme   │
│  algoritmasını etkiler.           │
│                                   │
│  [İptal]  [Spam İşaretle]         │
└───────────────────────────────────┘
```

**Sonuç:**

- Yorum durumu: SPAM
- Spam filtresi güncellenir
- Benzer içerikler otomatik işaretlenebilir
- Kullanıcı spam skoru artar

### İşlem 4: Yorum Silme

Kalıcı olarak yorumları silin.

**Uyarı:** ⚠️ Bu işlem geri alınamaz!

**Adımlar:**

1. "Sil" butonuna tıklayın
2. Silme nedenini girin
3. "Kal

ıcı olarak sil" ile confirm edin

**Silme Diyalogu:**

```
┌───────────────────────────────────┐
│  ⚠️  Yorumu Kalıcı Olarak Sil     │
│                                   │
│  Bu işlem geri alınamaz!          │
│                                   │
│  Neden:                           │
│  ┌─────────────────────────────┐  │
│  │ Yasal neden, mahkeme kararı │  │
│  └─────────────────────────────┘  │
│                                   │
│  Etkilenecekler:                  │
│  • Yorum silinecek                │
│  • Alt yanıtlar silinecek (3)     │
│  • İstatistikler güncellenir      │
│                                   │
│  [İptal]  [Kalıcı Olarak Sil]     │
└───────────────────────────────────┘
```

**Ne Zaman Kullanılır:**

- Yasal talepler
- Mahkeme kararları
- GDPR talepleri
- Ciddi ihlaller

---

## 📦 Toplu İşlemler

Birden fazla yorumu aynı anda işleyin.

### Yorum Seçimi

**Tek Seçim:**

- Her yorumun yanındaki checkbox'ı işaretleyin

**Toplu Seçim:**

- "Tümünü Seç" checkbox'ını işaretleyin
- Mevcut sayfadaki tüm yorumları seçer

**Seçim İpuçları:**

- `Shift + Click` - Aralık seçimi
- `Ctrl + Click` - Tekli ekleme/çıkarma

```
┌─────────────────────────────────────────────┐
│  ☑️  5 yorum seçildi                         │
│                                             │
│  [✓ Toplu Onayla]  [✗ Toplu Reddet]        │
│  [🚩 Spam İşaretle]  [🗑️ Toplu Sil]        │
│  [📝 Not Ekle]  [🔄 Seçimi Temizle]         │
└─────────────────────────────────────────────┘
```

### Toplu Onaylama

Birden fazla yorumu aynı anda onaylayın.

**Adımlar:**

1. Onaylamak istediğiniz yorumları seçin
2. "Toplu Onayla" butonuna tıklayın
3. Onay sayısını kontrol edin
4. Confirm edin

**Toplu Onay Diyalogu:**

```
┌───────────────────────────────────┐
│  Toplu Onaylama                   │
│                                   │
│  5 yorum onaylanacak              │
│                                   │
│  İşlem birkaç saniye sürebilir.   │
│                                   │
│  [İptal]  [Onayla (5)]            │
└───────────────────────────────────┘
```

**İlerleme Göstergesi:**

```
┌───────────────────────────────────┐
│  Yorumlar Onaylanıyor...          │
│                                   │
│  ████████████░░░░░░░░  60%        │
│                                   │
│  3/5 tamamlandı                   │
│                                   │
│  Lütfen bekleyin...               │
└───────────────────────────────────┘
```

**Sonuç Bildirimi:**

```
┌───────────────────────────────────┐
│  ✅ İşlem Tamamlandı              │
│                                   │
│  Başarılı: 5/5                    │
│  Başarısız: 0                     │
│                                   │
│  Tüm yorumlar başarıyla           │
│  onaylandı.                       │
│                                   │
│  [Tamam]                          │
└───────────────────────────────────┘
```

### Toplu Reddetme

Birden fazla yorumu aynı anda reddedin.

**Adımlar:**

1. Reddetmek istediğiniz yorumları seçin
2. "Toplu Reddet" butonuna tıklayın
3. Ortak ret nedenini seçin
4. Not ekleyin
5. Confirm edin

**Toplu Red Diyalogu:**

```
┌───────────────────────────────────┐
│  Toplu Reddetme                   │
│                                   │
│  5 yorum reddedilecek             │
│                                   │
│  Ortak neden:                     │
│  ● Spam içerik                    │
│  ○ Uygunsuz içerik                │
│  ○ Diğer...                       │
│                                   │
│  Not (tümüne uygulanır):          │
│  ┌─────────────────────────────┐  │
│  │ Spam kampanya tespit edildi │  │
│  └─────────────────────────────┘  │
│                                   │
│  [İptal]  [Reddet (5)]            │
└───────────────────────────────────┘
```

### Kısmi Başarı Yönetimi

Bazı işlemler başarısız olabilir:

```
┌───────────────────────────────────┐
│  ⚠️  Kısmi Başarı                 │
│                                   │
│  Başarılı: 3/5                    │
│  Başarısız: 2                     │
│                                   │
│  Hatalar:                         │
│  • Yorum #1234: Zaten onaylı      │
│  • Yorum #5678: Yetki hatası      │
│                                   │
│  [Hataları Tekrar Dene]  [Tamam]  │
└───────────────────────────────────┘
```

**Hata Tipleri:**

- **Zaten işlenmiş** - Başka moderatör işlemiş
- **Yetki hatası** - İzin yetersiz
- **Ağ hatası** - Bağlantı sorunu
- **Doğrulama hatası** - Geçersiz veri

---

## 📝 Moderasyon Notları

Her yoruma özel notlar ekleyebilirsiniz.

### Not Ekleme

**Adımlar:**

1. Yorum kartında "Not Ekle" butonuna tıklayın
2. Not tipini seçin
3. Notunuzu yazın
4. "Kaydet"e tıklayın

**Not Ekle Diyalogu:**

```
┌───────────────────────────────────┐
│  Moderasyon Notu Ekle             │
│                                   │
│  Tip:                             │
│  ○ Genel not                      │
│  ● İnceleme notu                  │
│  ○ Uyarı                          │
│  ○ İç iletişim                    │
│                                   │
│  Not:                             │
│  ┌─────────────────────────────┐  │
│  │ Kullanıcı daha önce uyarıldı│  │
│  │ Tekrarında hesap askıya al  │  │
│  └─────────────────────────────┘  │
│                                   │
│  ☑️ Diğer moderatörlere göster    │
│  ☐ Yöneticiye bildir              │
│                                   │
│  [İptal]  [Kaydet]                │
└───────────────────────────────────┘
```

### Not Görüntüleme

Notlar yorum kartında gösterilir:

```
┌───────────────────────────────────┐
│  📝 Moderasyon Notları (2)        │
│                                   │
│  ⚠️  Can Demir • 1 saat önce      │
│  "Kullanıcı daha önce uyarıldı   │
│  Tekrarında hesap askıya al"      │
│                                   │
│  📋 Ayşe Kaya • Dün 15:30         │
│  "İlk ihlal, uyarı verildi"       │
│                                   │
│  [+ Yeni Not]                     │
└───────────────────────────────────┘
```

### Not Tipleri

1. **Genel Not** - Standart bilgi notu
2. **İnceleme Notu** - Detaylı inceleme için
3. **Uyarı** - Dikkat gerektiren durumlar
4. **İç İletişim** - Moderatörler arası iletişim

---

## 🏆 En İyi Uygulamalar

### Hızlı Moderasyon İpuçları

#### 1. Klavye Kısayolları

```
Alt + A  - Onayla
Alt + R  - Reddet
Alt + S  - Spam işaretle
Alt + N  - Not ekle
Tab      - Sonraki yorum
Shift+Tab - Önceki yorum
```

#### 2. Toplu İşlemler

**Ne Zaman Kullanılır:**

- Aynı türde birden fazla yorum
- Spam dalgaları
- Benzer içerikler
- Zaman kazanmak için

**Ne Zaman Kullanılmaz:**

- Her yorum farklı değerlendirme gerektirir
- Şüpheli durumlar
- İlk inceleme

#### 3. Önceliklendirme

**Yüksek Öncelik:**

1. Bildirilen yorumlar
2. Spam şüphesi
3. Uygunsuz içerik
4. Bekleyen yorumlar (24 saat+)

**Normal Öncelik:**

1. Yeni yorumlar (<24 saat)
2. Yanıt yorumları
3. Düzenlenmiş yorumlar

**Düşük Öncelik:**

1. Zaten onaylanmış yorumlar
2. Eski yorumlar (inceleme)
3. Arşiv yorumları

### Karar Verme Kriterleri

#### Onaylama Kriterleri ✅

**Onayla:**

- İçerik açık ve anlaşılır
- Topluluk kurallarına uygun
- Yapıcı katkı sağlıyor
- Saygılı dil kullanılmış
- Spam değil

**Örnek:**

```
"Bu makale Next.js 14'ün yeni özelliklerini
çok iyi açıklamış. Özellikle Server Components
bölümü benim için çok faydalı oldu. Sorum var:
Metadata nasıl yönetilir?"
```

#### Reddetme Kriterleri ❌

**Reddet:**

- Küfür/hakaret içeriyor
- Konu dışı
- Yanıltıcı bilgi
- Kişisel saldırı
- Spam şüphesi

**Örnek:**

```
"Bu site berbat, hiçbir şey anlamadım.
Yazarın haberi yok konudan. Siteme gelin
orada daha iyi anlatıyorum: [spam-link]"
```

#### Spam Kriterleri 🚩

**Spam İşaretle:**

- Reklam/tanıtım linki
- Tekrarlanan mesaj
- Bot benzeri içerik
- Alakasız link
- Phishing denemesi

**Örnek:**

```
"İLK YORUM!!! 🎉🎉🎉
Siteme de gelin: [link]
ABONE OLUN LÜTFEN!!!"
```

### Moderasyon Hızı

**Hedef Süreler:**

- Spam: Anında (< 5 dakika)
- Bildirilen: 1 saat içinde
- Normal: 2 saat içinde
- Düşük öncelik: 24 saat içinde

**Toplu İşlemlerle Hızlanma:**

- 10+ benzer yorum → Toplu işlem
- Spam dalgası → Toplu spam işaretleme
- Temiz içerik seti → Toplu onaylama

---

## ❓ SSS

### Genel Sorular

**S: Kaç yorumu aynı anda işleyebilirim?**  
C: Toplu işlemlerde maksimum 50 yorum seçebilirsiniz.

**S: Otomatik moderasyon var mı?**  
C: Evet, spam filtreleri ve anahtar kelime kontrolü otomatik çalışır. Ancak final karar insana aittir.

**S: Moderasyon geçmişi tutuluyor mu?**  
C: Evet, tüm moderasyon işlemleri log'lanır ve denetlenebilir.

**S: Kullanıcı itiraz edebilir mi?**  
C: Evet, reddedilen yorumlar için itiraz sistemi mevcuttur.

### Teknik Sorular

**S: Auto-refresh ne sıklıkta çalışır?**  
C: Moderasyon kuyruğu 30 saniyede, dashboard 60 saniyede bir yenilenir.

**S: Offline çalışabilir miyim?**  
C: Hayır, moderasyon için internet bağlantısı gereklidir.

**S: Mobilde moderasyon yapabilir miyim?**  
C: Evet, ancak desktop deneyimi önerilir.

### Moderasyon Sorular

**S: Yanlış karar verdim, ne yapmalıyım?**  
C: Yorumun durumunu değiştirebilirsiniz. Tüm işlemler geri alınabilir (silme hariç).

**S: Şüpheli durumda ne yapmalıyım?**  
C: Not ekleyin ve başka bir moderatörden görüş alın.

**S: Tekrarlayan ihlalci ne yapmalıyım?**  
C: Kullanıcı profil sayfa sından hesap askıya alma işlemi yapabilirsiniz.

---

## 📞 Destek ve İletişim

### Moderatör Ekibi

**Koordinatör:** Ayşe Kaya  
**Email:** moderation@marifetbul.com  
**Slack:** #moderation-team  
**Acil:** +90 XXX XXX XX XX

### Çalışma Saatleri

**Vardiya 1:** 09:00 - 17:00  
**Vardiya 2:** 17:00 - 01:00  
**Vardiya 3:** 01:00 - 09:00

### Eğitim ve Kaynaklar

- **Onboarding:** 2 haftalık eğitim programı
- **Dökümanlar:** `/admin/docs/moderation/`
- **Video Eğitimler:** `/admin/training/videos/`
- **Haftalık Toplantı:** Salı 14:00

---

**Kılavuz Versiyonu:** 1.0  
**Son Güncelleme:** 25 Ekim 2025  
**Sonraki İnceleme:** 25 Ocak 2026

**Başarılı Moderasyonlar! 🛡️✨**

---

_Sorularınız mı var? [moderation@marifetbul.com](mailto:moderation@marifetbul.com)_
