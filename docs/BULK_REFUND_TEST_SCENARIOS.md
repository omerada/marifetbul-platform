# Bulk Refund Approval - Test Senaryoları

**Sprint 1 - Story 1.1**  
**Tarih:** 17 Kasım 2025  
**Durum:** Geliştirme Tamamlandı - Manuel Test Bekliyor

---

## 📋 Test Kapsamı

Bu döküman, Bulk Refund Approval özelliğinin manuel testini için senaryoları içerir.

---

## 🎯 Özellik Özeti

### Backend Geliştirmeler

- ✅ `BulkApprovalResponse.java` DTO oluşturuldu
- ✅ `bulkApproveRefundsEnhanced()` metodu eklendi
- ✅ Detaylı hata takibi implementasyonu
- ✅ Her iade talebi için ayrı ayrı başarı/hata kontrolü

### Frontend Geliştirmeler

- ✅ `BulkApprovalResponse` TypeScript interface'i
- ✅ API client return type güncellemesi
- ✅ `BulkRefundActions` component'i iyileştirilmesi
- ✅ Detaylı toast bildirimleri (success/partial/fail)
- ✅ Admin sayfası entegrasyonu

---

## 🧪 Test Senaryoları

### Senaryo 1: Tüm İade Taleplerinin Başarılı Onaylanması

**Ön Koşullar:**

- Admin kullanıcı olarak giriş yapılmış olmalı
- En az 3 adet PENDING durumunda iade talebi olmalı

**Adımlar:**

1. Admin panelinde "İade Talepleri" sayfasına git
2. 3 iade talebini seç (checkbox ile)
3. "Seçilenleri Onayla" butonuna tıkla
4. Not eklemeden "Not Eklemeden Onayla" butonuna tıkla

**Beklenen Sonuç:**

- ✅ Yeşil renkli success toast görünmeli
- ✅ Toast mesajı: "Toplu Onay Başarılı"
- ✅ Açıklama: "3 iade talebi onaylandı. Toplam tutar: ₺[tutar]"
- ✅ Seçim otomatik temizlenmeli
- ✅ Liste yenilenmeli
- ✅ Onaylanan talepler APPROVED durumuna geçmeli

---

### Senaryo 2: Notla Toplu Onaylama

**Ön Koşullar:**

- Admin kullanıcı olarak giriş yapılmış olmalı
- En az 2 adet PENDING durumunda iade talebi olmalı

**Adımlar:**

1. Admin panelinde "İade Talepleri" sayfasına git
2. 2 iade talebini seç
3. "Seçilenleri Onayla" butonuna tıkla
4. Notlar alanına "Müşteri memnuniyeti için toplu onay" yaz
5. "Onayı Tamamla" butonuna tıkla

**Beklenen Sonuç:**

- ✅ Yeşil renkli success toast görünmeli
- ✅ Toast mesajı: "Toplu Onay Başarılı"
- ✅ Açıklama: "2 iade talebi onaylandı. Toplam tutar: ₺[tutar]"
- ✅ Onaylanan taleplerin admin notlarına girilen not eklenmiş olmalı
- ✅ Seçim otomatik temizlenmeli

---

### Senaryo 3: Kısmi Başarı (Bazı Talepler Başarısız)

**Ön Koşullar:**

- Admin kullanıcı olarak giriş yapılmış olmalı
- 2 adet PENDING durumunda iade talebi olmalı
- 1 adet zaten APPROVED durumunda iade talebi olmalı

**Adımlar:**

1. Admin panelinde "İade Talepleri" sayfasına git
2. 2 PENDING + 1 APPROVED durumdaki talebi seç (toplam 3)
3. "Seçilenleri Onayla" butonuna tıkla
4. "Not Eklemeden Onayla" butonuna tıkla

**Beklenen Sonuç:**

- ⚠️ Sarı renkli warning toast görünmeli
- ⚠️ Toast mesajı: "Kısmi Başarı"
- ⚠️ Açıklama: "2 onaylandı, 1 başarısız oldu."
- ✅ Başarılı olanlar APPROVED durumuna geçmeli
- ✅ Zaten onaylanmış olan değişmemeli
- ✅ Console/Network tab'de hata detayları görülebilmeli

---

### Senaryo 4: Tüm Taleplerin Başarısız Olması

**Ön Koşullar:**

- Admin kullanıcı olarak giriş yapılmış olmalı
- 3 adet zaten APPROVED durumunda iade talebi olmalı

**Adımlar:**

1. Admin panelinde "İade Talepleri" sayfasına git
2. 3 APPROVED durumdaki talebi seç
3. "Seçilenleri Onayla" butonuna tıkla
4. "Not Eklemeden Onayla" butonuna tıkla

**Beklenen Sonuç:**

- ❌ Kırmızı renkli error toast görünmeli
- ❌ Toast mesajı: "Toplu Onay Başarısız"
- ❌ Açıklama: "3 iade talebi onaylanamadı."
- ✅ Hiçbir durumda değişiklik olmamalı
- ✅ Console'da hata detayları loglanmalı

---

### Senaryo 5: Geçersiz ID'lerle Toplu Onaylama

**Ön Koşullar:**

- Admin kullanıcı olarak giriş yapılmış olmalı
- 2 adet PENDING durumunda iade talebi olmalı

**Adımlar:**

1. Browser console'u aç
2. Admin panelinde "İade Talepleri" sayfasına git
3. 2 iade talebini seç
4. Console'dan seçili ID listesini değiştir:
   ```javascript
   // Seçili ID'lere geçersiz ID ekle
   window.__selectedRefundIds = [
     ...window.__selectedRefundIds,
     'INVALID-ID-123',
   ];
   ```
5. "Seçilenleri Onayla" butonuna tıkla
6. "Not Eklemeden Onayla" butonuna tıkla

**Beklenen Sonuç:**

- ⚠️ Sarı renkli warning toast görünmeli
- ⚠️ Toast mesajı: "Kısmi Başarı"
- ⚠️ Açıklama: "2 onaylandı, 1 başarısız oldu."
- ✅ Geçerli ID'ler onaylanmalı
- ✅ Geçersiz ID için hata döndürülmeli
- ✅ Network tab'de response'da failedIds array'i görünmeli

---

### Senaryo 6: Boş Seçimle Onay Denemesi

**Ön Koşullar:**

- Admin kullanıcı olarak giriş yapılmış olmalı

**Adımlar:**

1. Admin panelinde "İade Talepleri" sayfasına git
2. Hiçbir talebi seçmeden "Seçilenleri Onayla" butonuna tıkla

**Beklenen Sonuç:**

- ✅ Button disabled olmalı (tıklanmamalı)
- ✅ Veya tıklanırsa hiçbir işlem yapmamalı
- ✅ Toast mesajı gösterilmemeli

---

### Senaryo 7: Network Hatası Durumu

**Ön Koşullar:**

- Admin kullanıcı olarak giriş yapılmış olmalı
- 2 adet PENDING durumunda iade talebi olmalı

**Adımlar:**

1. Browser Developer Tools'u aç
2. Network tab'e git
3. "Offline" modunu aktif et
4. Admin panelinde "İade Talepleri" sayfasına git
5. 2 iade talebini seç
6. "Seçilenleri Onayla" butonuna tıkla
7. "Not Eklemeden Onayla" butonuna tıkla

**Beklenen Sonuç:**

- ❌ Kırmızı renkli error toast görünmeli
- ❌ Toast mesajı: "Hata"
- ❌ Açıklama: "Toplu onaylama sırasında bir hata oluştu"
- ✅ Loading state gösterilip sonra kaldırılmalı
- ✅ Seçim korunmalı (temizlenmemeli)
- ✅ Kullanıcı tekrar deneyebilmeli

---

### Senaryo 8: Seçimi Temizleme

**Ön Koşullar:**

- Admin kullanıcı olarak giriş yapılmış olmalı
- En az 3 adet iade talebi olmalı

**Adımlar:**

1. Admin panelinde "İade Talepleri" sayfasına git
2. 3 iade talebini seç
3. "Seçimi Temizle" butonuna tıkla

**Beklenen Sonuç:**

- ✅ Tüm checkbox'lar işaretsiz hale gelmeli
- ✅ "X iade talebi seçildi" yazısı kaybolmalı
- ✅ Bulk action butonları gizlenmeli
- ✅ Hiçbir toast gösterilmemeli

---

## 🔍 API Response Kontrolleri

### Network Tab'de İncelenecekler:

**Endpoint:** `POST /api/v1/refunds/bulk-approve`

**Request Body:**

```json
{
  "refundIds": ["uuid-1", "uuid-2", "uuid-3"],
  "notes": "Optional admin notes"
}
```

**Success Response (Tümü Başarılı):**

```json
{
  "totalRequested": 3,
  "approvedCount": 3,
  "failedCount": 0,
  "totalAmountApproved": 1500.0,
  "failedIds": null,
  "errors": null
}
```

**Partial Success Response:**

```json
{
  "totalRequested": 3,
  "approvedCount": 2,
  "failedCount": 1,
  "totalAmountApproved": 1000.0,
  "failedIds": ["uuid-3"],
  "errors": [
    {
      "refundId": "uuid-3",
      "errorMessage": "Refund already approved",
      "errorCode": "INVALID_STATUS"
    }
  ]
}
```

**Complete Failure Response:**

```json
{
  "totalRequested": 3,
  "approvedCount": 0,
  "failedCount": 3,
  "totalAmountApproved": 0,
  "failedIds": ["uuid-1", "uuid-2", "uuid-3"],
  "errors": [...]
}
```

---

## 📊 Performans Testleri

### Test 1: 10 İade Talebini Toplu Onaylama

- ⏱️ Süre: < 2 saniye
- ✅ Tüm talepler başarılı olmalı
- ✅ Loading state gösterilmeli

### Test 2: 50 İade Talebini Toplu Onaylama

- ⏱️ Süre: < 5 saniye
- ✅ Progress indicator gösterilmeli
- ✅ Timeout olmadan tamamlanmalı

### Test 3: 100 İade Talebini Toplu Onaylama

- ⏱️ Süre: < 10 saniye
- ⚠️ Büyük miktarlar için uyarı gösterilebilir
- ✅ Backend timeout ayarları kontrol edilmeli

---

## 🔒 Güvenlik Testleri

### Test 1: Yetkisiz Kullanıcı Erişimi

- ❌ ADMIN rolü olmayan kullanıcı 403 Forbidden almalı
- ❌ Anonim kullanıcı 401 Unauthorized almalı

### Test 2: Başka Kullanıcının İade Taleplerine Erişim

- ✅ Admin tüm taleplere erişebilmeli
- ✅ Audit log kaydı oluşturulmalı
- ✅ Hangi admin ne zaman onayladı bilgisi tutulmalı

---

## 📝 Test Sonuçları Raporu

| Senaryo   | Durum       | Notlar | Test Eden | Tarih |
| --------- | ----------- | ------ | --------- | ----- |
| Senaryo 1 | ⏳ Bekliyor | -      | -         | -     |
| Senaryo 2 | ⏳ Bekliyor | -      | -         | -     |
| Senaryo 3 | ⏳ Bekliyor | -      | -         | -     |
| Senaryo 4 | ⏳ Bekliyor | -      | -         | -     |
| Senaryo 5 | ⏳ Bekliyor | -      | -         | -     |
| Senaryo 6 | ⏳ Bekliyor | -      | -         | -     |
| Senaryo 7 | ⏳ Bekliyor | -      | -         | -     |
| Senaryo 8 | ⏳ Bekliyor | -      | -         | -     |

---

## 🐛 Bulunan Hatalar

_(Test sırasında bulunacak hatalar burada listelenecek)_

---

## ✅ Checklist

### Backend

- [x] BulkApprovalResponse DTO oluşturuldu
- [x] bulkApproveRefundsEnhanced metodu implementasyonu
- [x] Her iade için ayrı error handling
- [x] Total amount hesaplaması
- [ ] Unit testler yazıldı
- [ ] Integration testler yazıldı
- [ ] Compile hataları düzeltildi

### Frontend

- [x] BulkApprovalResponse TypeScript interface
- [x] API client return type güncellemesi
- [x] BulkRefundActions component iyileştirmesi
- [x] Toast mesajları implementasyonu
- [x] Admin page entegrasyonu
- [ ] Component testleri yazıldı (lucide-react ESM issue nedeniyle skip edildi)
- [ ] E2E testler yazıldı

### Manuel Test

- [ ] Tüm senaryolar test edildi
- [ ] Performans testleri yapıldı
- [ ] Güvenlik testleri yapıldı
- [ ] Cross-browser test yapıldı
- [ ] Mobile responsive test yapıldı

---

## 🎯 Bir Sonraki Adımlar

1. Backend compile hatalarını düzelt
2. Manuel testleri tamamla
3. Bulunacak hataları düzelt
4. Story 1.2'ye geç (Advanced Filtering - 8 SP)

---

**Güncellenme:** 17 Kasım 2025  
**Versiyon:** 1.0  
**Durum:** Test Bekliyor
