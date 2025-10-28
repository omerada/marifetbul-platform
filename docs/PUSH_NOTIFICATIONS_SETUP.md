# 🔔 Push Notifications Setup Guide

MarifetBul platformu Firebase Cloud Messaging (FCM) kullanarak web push notifications destekler. Bu rehber, push notification özelliğini baştan sona nasıl kuracağınızı gösterir.

---

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Ön Gereksinimler](#-ön-gereksinimler)
- [Firebase Projesi Kurulumu](#-firebase-projesi-kurulumu)
- [Backend Konfigürasyonu](#-backend-konfigürasyonu)
- [Frontend Konfigürasyonu](#-frontend-konfigürasyonu)
- [Test Etme](#-test-etme)
- [Kullanım](#-kullanım)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Özellikler

MarifetBul push notification sistemi şunları destekler:

- ✅ **Web Push Notifications**: Chrome, Firefox, Edge, Safari desteği
- ✅ **Background Notifications**: Uygulama kapalı iken bildirim alma
- ✅ **Foreground Notifications**: Uygulama açık iken toast bildirimleri
- ✅ **Multi-Device Support**: Kullanıcı birden fazla cihazda oturum açabilir
- ✅ **Device Management**: Kayıtlı cihazları görüntüleme ve kaldırma
- ✅ **Notification Actions**: Bildirim içinde eylem butonları
- ✅ **Auto Retry**: Token hataları durumunda otomatik yeniden deneme
- ✅ **Graceful Degradation**: Firebase yapılandırılmamışsa sistem çalışmaya devam eder

---

## 📦 Ön Gereksinimler

- Firebase hesabı (ücretsiz plan yeterli)
- HTTPS ile çalışan domain (production için)
- Modern tarayıcı (Chrome 50+, Firefox 44+, Edge 17+, Safari 16+)

---

## 🔥 Firebase Projesi Kurulumu

### 1. Firebase Projesi Oluşturun

1. [Firebase Console](https://console.firebase.google.com/)'a gidin
2. "Add project" veya "Create a project" butonuna tıklayın
3. Proje adını girin (örnek: `marifetbul-prod`)
4. Google Analytics'i etkinleştirin (opsiyonel)
5. "Create project" butonuna tıklayın

### 2. Web App Ekleyin

1. Firebase Console'da projenizi açın
2. Project Overview'da "Web" ikonuna (</>) tıklayın
3. App nickname girin (örnek: `MarifetBul Web`)
4. "Register app" butonuna tıklayın
5. Firebase SDK configuration değerlerini kopyalayın:

```javascript
const firebaseConfig = {
  apiKey: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:xxxxxxxxxxxxx',
};
```

### 3. Cloud Messaging Ayarları

#### 3.1 VAPID Key Oluşturun

1. Firebase Console'da **Project Settings** > **Cloud Messaging** sekmesine gidin
2. "Web Push certificates" bölümünü bulun
3. "Generate key pair" butonuna tıklayın
4. Oluşturulan VAPID key'i kopyalayın

#### 3.2 Service Account Key İndirin

1. **Project Settings** > **Service Accounts** sekmesine gidin
2. "Generate new private key" butonuna tıklayın
3. JSON dosyasını indirin (örnek: `your-project-xxxxx.json`)

---

## 🔧 Backend Konfigürasyonu

### 1. Service Account Key Yerleştirme

İndirdiğiniz Firebase service account JSON dosyasını backend'e ekleyin:

```bash
# JSON dosyasını kopyalayın
cp ~/Downloads/your-project-xxxxx.json \
   marifetbul-backend/src/main/resources/firebase-service-account.json
```

⚠️ **ÖNEMLİ**: `firebase-service-account.json` dosyası `.gitignore`'da olmalı ve asla commit edilmemeli!

### 2. Application Configuration

`marifetbul-backend/src/main/resources/application-dev.yml` dosyasını düzenleyin:

```yaml
marifetbul:
  push:
    enabled: true # false'dan true'ya değiştirin
    firebase:
      credentials-path: firebase-service-account.json
```

### 3. Backend'i Yeniden Başlatın

```bash
cd marifetbul-backend
./mvnw spring-boot:run
```

Başarılı olursa konsolda şu log'u göreceksiniz:

```
FirebaseApp initialized successfully: [DEFAULT]
```

---

## 💻 Frontend Konfigürasyonu

### 1. Environment Variables

`.env.local` dosyasını oluşturun veya düzenleyin:

```bash
# Firebase Configuration (from step 2)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# VAPID Key (from step 3.1)
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. Service Worker Configuration

`public/firebase-messaging-sw.js` dosyasını düzenleyin:

```javascript
// Firebase configuration
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY', // NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

⚠️ **NOT**: Service worker'da environment variable kullanamayız, değerleri manuel olarak kopyalayın!

### 3. Dependencies Yükleme

```bash
npm install
```

Firebase SDK zaten `package.json`'da mevcut.

### 4. Development Server Başlatma

```bash
npm run dev
```

---

## 🧪 Test Etme

### 1. Browser'da Permission İsteme

1. Uygulamaya giriş yapın
2. Bildirimler sayfasına gidin (`/notifications`)
3. "Push Bildirimleri" toggle'ını aktif edin
4. Tarayıcı izin isteğini onaylayın

### 2. Test Bildirimi Gönderme

#### Option A: Frontend'den Test

1. Bildirim ayarları paneline gidin
2. "Test Bildirimi Gönder" butonuna tıklayın
3. Birkaç saniye içinde bildirim alacaksınız

#### Option B: Backend API'den Test

```bash
# Önce giriş yapıp token alın
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "freelancer@test.com", "password": "Test123!"}'

# Test bildirimi gönderin (cookie'yi kullanın)
curl -X POST http://localhost:8080/api/v1/notifications/push/test \
  -H "Cookie: JSESSIONID=YOUR_SESSION_COOKIE" \
  -H "Content-Type: application/json"
```

### 3. Doğrulama Kontrolleri

✅ Service Worker Kayıtlı mı?

```javascript
// Browser Console'da çalıştırın
navigator.serviceWorker.getRegistrations().then(console.log);
```

✅ FCM Token Oluşturuldu mu?

```javascript
// Browser Console'da çalıştırın
// DevTools > Application > IndexedDB > firebase-messaging-database
```

✅ Backend'de Cihaz Kayıtlı mı?

```sql
-- PostgreSQL'de çalıştırın
SELECT * FROM device_tokens WHERE user_id = 'YOUR_USER_ID';
```

---

## 🎯 Kullanım

### Component Kullanımı

#### Push Notification Toggle

```tsx
import { PushNotificationToggle } from '@/components/notifications';

function NotificationSettings() {
  return (
    <div>
      <h2>Bildirim Ayarları</h2>
      <PushNotificationToggle />
    </div>
  );
}
```

#### Push Notification Settings Panel

```tsx
import { PushNotificationSettings } from '@/components/notifications';

function NotificationManagement() {
  return (
    <div>
      <h2>Kayıtlı Cihazlarım</h2>
      <PushNotificationSettings />
    </div>
  );
}
```

### Programmatic Kullanım

```typescript
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  sendTestNotification,
  getRegisteredDevices,
} from '@/lib/services/firebase-messaging.service';

// Subscribe
const success = await subscribeToPushNotifications();

// Unsubscribe
await unsubscribeFromPushNotifications();

// Test notification
await sendTestNotification();

// Get devices
const devices = await getRegisteredDevices();
```

### Backend'den Bildirim Gönderme

```java
@Autowired
private NotificationCrudService notificationService;

// Create notification
Notification notification = Notification.builder()
    .userId(userId)
    .type(NotificationType.NEW_MESSAGE)
    .title("Yeni Mesaj")
    .message("Ali Veli size mesaj gönderdi")
    .priority(NotificationPriority.HIGH)
    .channels(Set.of(NotificationChannel.PUSH, NotificationChannel.EMAIL))
    .data(Map.of("conversationId", "123"))
    .build();

// Send (automatically sends via push if enabled)
notificationService.createAndSendNotification(notification);
```

---

## 🐛 Troubleshooting

### Service Worker Kaydolmuyor

**Sorun**: Service worker register olmuyor  
**Çözüm**:

- HTTPS kullandığınızdan emin olun (localhost hariç)
- Browser console'da hata mesajlarını kontrol edin
- Service worker dosyasının `/firebase-messaging-sw.js` yolunda olduğunu doğrulayın

### Bildirim İzni Denied

**Sorun**: Tarayıcı izin vermiyor  
**Çözüm**:

- Tarayıcı ayarlarından site izinlerini kontrol edin
- Chrome: `chrome://settings/content/notifications`
- Firefox: Preferences > Privacy & Security > Permissions > Notifications

### FCM Token Oluşmuyor

**Sorun**: Token generation başarısız  
**Çözüm**:

- VAPID key'in doğru olduğunu kontrol edin
- Firebase configuration'ın eksiksiz olduğunu doğrulayın
- Browser console'da hata mesajlarını kontrol edin

### Backend'e Token Gönderilmiyor

**Sorun**: Cihaz backend'e kaydolmuyor  
**Çözüm**:

- API endpoint'in çalıştığını test edin: `/api/v1/notifications/push/subscribe`
- Authentication cookie'nin mevcut olduğunu kontrol edin
- Network tab'da request/response detaylarına bakın

### Bildirimler Gelmiyor

**Sorun**: Push notification gönderiliyor ama gelmiyor  
**Çözüm**:

- Device token'ın backend'de kayıtlı ve aktif olduğunu kontrol edin
- Service account JSON'ın doğru yerleştirildiğini doğrulayın
- Backend log'larında FCM hata mesajlarını arayın
- Firebase Console > Cloud Messaging'de proje ayarlarını kontrol edin

### Production'da HTTPS Hatası

**Sorun**: Production'da push notification çalışmıyor  
**Çözüm**:

- Domain'in geçerli SSL sertifikası olduğunu doğrulayın
- Service worker'ın production build'de dahil olduğunu kontrol edin
- Firebase'de authorized domains listesine production domain'i ekleyin

---

## 📚 Ek Kaynaklar

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications](https://web.dev/push-notifications-overview/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [MarifetBul Backend README](../marifetbul-backend/README.md)

---

## 🔐 Güvenlik Notları

1. ⚠️ **Service account JSON dosyasını asla commit etmeyin**
2. ⚠️ **Environment variable'ları production'da gizleyin**
3. ⚠️ **Firebase Console'da authorized domains listesini sınırlayın**
4. ⚠️ **Push notification rate limiting uygulayın**
5. ⚠️ **Kullanıcı izni olmadan notification göndermeyin**

---

**Son Güncelleme**: 29 Ekim 2025  
**Durum**: ✅ Production Ready  
**Sorun Bildirin**: [GitHub Issues](https://github.com/omerada/marifet/issues)
