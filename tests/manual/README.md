# 🧪 Manuel Test Sayfaları

Bu klasör **development ortamında** manuel testing için kullanılır.  
**Production build'e dahil DEĞİLDİR.**

---

## 📁 İçerik

### Test Sayfaları

| Sayfa | URL (Development) | Amaç |
|-------|-------------------|------|
| WebSocket Test | `/test/websocket` | Real-time messaging test |
| Cloudinary Test | `/test/cloudinary` | Image upload & optimization test |
| Payment Test | `/test/payment` | Iyzico payment flow test |

---

## 🚀 Kullanım

### Development Ortamında

```bash
npm run dev
```

Tarayıcıda:
- http://localhost:3000/test/websocket
- http://localhost:3000/test/cloudinary
- http://localhost:3000/test/payment

### Production Ortamında

❌ Test sayfalarına erişim **YOKTUR**.  
Production build bu sayfaları içermez.

---

## 📝 Test Senaryoları

### WebSocket Test
1. Bağlantı durumunu kontrol et
2. Mesaj gönder/al
3. Reconnection test
4. Multiple tabs test

### Cloudinary Test
1. Single image upload
2. Multiple image upload
3. Image transformations
4. Error handling

### Payment Test
1. Payment intent creation
2. 3D Secure flow
3. Payment confirmation
4. Error scenarios

---

## ⚙️ Konfigürasyon

Test sayfaları `next.config.js` ile development ortamına yönlendirilir:

```javascript
// next.config.js
async rewrites() {
  if (process.env.NODE_ENV === 'development') {
    return [
      {
        source: '/test/:path*',
        destination: '/tests/manual/:path*',
      },
    ];
  }
  return [];
}
```

---

## 🔒 Güvenlik

- Test sayfaları **production'a deploy edilmez**
- Sensitive data test sayfalarında saklanmamalı
- `.env.local` kullanarak test credential'ları yönet

---

## 📚 Dokümantasyon

Detaylı test rehberi için:
- [Sprint 1 Implementation Guide](../../docs/SPRINT_1_IMPLEMENTATION_GUIDE.md)
- [Testing Strategy](../../docs/TESTING_STRATEGY.md)

---

**Son Güncelleme:** 10 Kasım 2025  
**Maintainer:** Development Team
