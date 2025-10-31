# 🔄 API Migration Guide - Route Cleanup

Bu dokuman, silinen duplicate route'lar ve yeni kullanım şekillerini açıklar.

## 📅 Migration Date: 31 Ekim 2025

---

## ❌ SİLİNEN ROUTES

### 1. Dashboard Routes (`/app/api/dashboard/*`)

#### ❌ Eski (Silindi)

```typescript
// Bu route'lar artık kullanılamaz
/api/aabddhors / employer / api / dashboard / freelancer;
```

#### ✅ Yeni (Kullanılacak)

```typescript
// V1 API endpoints kullanın
/api/1v /
  dashboard /
  employer /
  activities /
  api /
  v1 /
  dashboard /
  freelancer /
  activities;

// Dashboard data için
DASHBOARD_ENDPOINTS.BUYER_DASHBOARD; // Employer için
DASHBOARD_ENDPOINTS.SELLER_DASHBOARD; // Freelancer için
```

#### 📝 Kod Örneği

```typescript
// ❌ ESKİ (Artık çalışmaz)
const response = await fetch('/api/dashboard/employer');

// ✅ YENİ (Backend'e direkt)
import { DASHBOARD_ENDPOINTS } from '@/lib/api/endpoints';
import unifiedApiClient from '@/lib/infrastructure/api/UnifiedApiClient';

const response = await unifiedApiClient.get(
  DASHBOARD_ENDPOINTS.BUYER_DASHBOARD
);
```

---

### 2. Orders Routes (`/app/api/orders/*`)

#### ❌ Eski (Silindi)

```typescript
// Bu route'lar artık kullanılamaz
/api/deorrs /
  [orderId] /
  api /
  orders /
  [orderId] /
  status /
  api /
  orders /
  [orderId] /
  timeline /
  api /
  orders /
  statistics;
```

#### ✅ Yeni (Kullanılacak)

```typescript
// Backend API'yi direkt kullan
/api/1v / orders / { orderId } / api / v1 / orders / { orderId } / timeline;

// ORDER_ENDPOINTS kullan
ORDER_ENDPOINTS.GET(orderId);
ORDER_ENDPOINTS.GET_TIMELINE(orderId);
```

#### 📝 Kod Örneği

```typescript
// ❌ ESKİ (Artık çalışmaz)
const response = await fetch(`/api/orders/${orderId}`);

// ✅ YENİ (UnifiedApiClient ile)
import { ORDER_ENDPOINTS } from '@/lib/api/endpoints';
import unifiedApiClient from '@/lib/infrastructure/api/UnifiedApiClient';

const response = await unifiedApiClient.get(ORDER_ENDPOINTS.GET(orderId));

// Timeline için
const timeline = await unifiedApiClient.get(
  ORDER_ENDPOINTS.GET_TIMELINE(orderId)
);
```

---

## 🔄 DEĞİŞEN COMPONENTLER

### Payment Methods Page

#### ❌ Eski Versiyon (Silindi)

```
/app/dashboard/settings/payment/page.tsx (v1)
/app/dashboard/settings/payment/page-v2.tsx
```

#### ✅ Yeni Production Versiyon

```
/app/dashboard/settings/payment/page.tsx (v2 → production)
```

**Değişiklikler:**

- Component adı: `PaymentMethodsPageV2` → `PaymentMethodsPage`
- Daha modern UI/UX
- İyileştirilmiş error handling
- Better loading states

---

## 🗑️ SİLİNEN DOSYALAR

### Mock Files

```
❌ __mocks__/lucide-react.js    (Silindi - .tsx versiyonu kullanılacak)
✅ __mocks__/lucide-react.tsx   (Korundu - TSX mock production'da)
```

---

## ✅ BACKEND CONTROLLERS - DEĞİŞİKLİK YOK

**ÖNEMLİ:** Backend payment controllers duplicate DEĞİL! Farklı domain'lere hizmet veriyor:

```java
// Ana işlemler
✅ /controller/PaymentController.java    → /api/v1/payments (payment intents)
✅ /controller/WalletController.java     → /api/v1/wallet (cüzdan)
✅ /controller/PayoutController.java     → /api/v1/payouts (para çekme)
✅ /controller/RefundController.java     → /api/v1/refunds (iadeler)

// Settings & Methods
✅ /domain/payment/controller/PaymentMethodController.java → /api/v1/payment-methods
```

**Bu controller'lar SİLİNMEDİ çünkü farklı endpoint'lere hizmet veriyorlar!**

---

## 📚 API ENDPOINTS REFERANSI

### Dashboard Endpoints

```typescript
import { DASHBOARD_ENDPOINTS } from '@/lib/api/endpoints';

// Employer/Buyer Dashboard
DASHBOARD_ENDPOINTS.BUYER_DASHBOARD; // GET /dashboard/buyer/me
DASHBOARD_ENDPOINTS.BUYER_DASHBOARD_BY_DAYS(30); // GET /dashboard/buyer/me/days/30
DASHBOARD_ENDPOINTS.BUYER_SNAPSHOT; // GET /dashboard/buyer/me/snapshot

// Freelancer/Seller Dashboard
DASHBOARD_ENDPOINTS.SELLER_DASHBOARD; // GET /dashboard/seller/me
DASHBOARD_ENDPOINTS.SELLER_DASHBOARD_BY_DAYS(30); // GET /dashboard/seller/me/days/30
DASHBOARD_ENDPOINTS.SELLER_SNAPSHOT; // GET /dashboard/seller/me/snapshot

// Activity Timeline
DASHBOARD_ENDPOINTS.EMPLOYER_ACTIVITIES; // GET /dashboard/employer/activities
DASHBOARD_ENDPOINTS.FREELANCER_ACTIVITIES; // GET /dashboard/freelancer/activities
```

### Order Endpoints

```typescript
import { ORDER_ENDPOINTS } from '@/lib/api/endpoints';

// Order CRUD
ORDER_ENDPOINTS.GET(orderId); // GET /orders/{orderId}
ORDER_ENDPOINTS.UPDATE(orderId); // PUT /orders/{orderId}
ORDER_ENDPOINTS.CANCEL(orderId); // POST /orders/{orderId}/cancel

// Order Actions
ORDER_ENDPOINTS.START(orderId); // POST /orders/{orderId}/start
ORDER_ENDPOINTS.DELIVER(orderId); // POST /orders/{orderId}/deliver
ORDER_ENDPOINTS.ACCEPT_DELIVERY(orderId); // POST /orders/{orderId}/accept
ORDER_ENDPOINTS.REQUEST_REVISION(orderId); // POST /orders/{orderId}/revision
ORDER_ENDPOINTS.COMPLETE(orderId); // POST /orders/{orderId}/complete

// Order Timeline
ORDER_ENDPOINTS.GET_TIMELINE(orderId); // GET /orders/{orderId}/timeline

// My Orders
ORDER_ENDPOINTS.MY_ORDERS; // GET /orders/me
ORDER_ENDPOINTS.ACTIVE; // GET /orders/active
ORDER_ENDPOINTS.COMPLETED; // GET /orders/completed
```

---

## 🚀 MIGRATION STEPS

### Frontend Components

1. **Dashboard Components'larını Güncelle**

```typescript
// Hooks'larda
import { DASHBOARD_ENDPOINTS } from '@/lib/api/endpoints';
import unifiedApiClient from '@/lib/infrastructure/api/UnifiedApiClient';

// SWR ile
const { data, error } = useSWR(
  DASHBOARD_ENDPOINTS.SELLER_DASHBOARD,
  unifiedApiClient.get
);
```

2. **Order Components'larını Güncelle**

```typescript
import { ORDER_ENDPOINTS } from '@/lib/api/endpoints';

const fetchOrder = async (orderId: string) => {
  const response = await unifiedApiClient.get(ORDER_ENDPOINTS.GET(orderId));
  return response.data;
};
```

3. **Test'leri Güncelle**

```typescript
// Mock endpoint'leri güncelle
jest.mock('@/lib/api/endpoints', () => ({
  ORDER_ENDPOINTS: {
    GET: (id: string) => `/orders/${id}`,
    // ...
  },
}));
```

---

## ⚠️ BREAKING CHANGES

### API Route Changes

| Eski Route                  | Yeni Route                    | Status      |
| --------------------------- | ----------------------------- | ----------- |
| `/api/dashboard/employer`   | `/api/v1/dashboard/buyer/me`  | ❌ Breaking |
| `/api/dashboard/freelancer` | `/api/v1/dashboard/seller/me` | ❌ Breaking |
| `/api/orders/{id}`          | `/api/v1/orders/{id}`         | ❌ Breaking |

### Component Name Changes

| Eski Component         | Yeni Component       |
| ---------------------- | -------------------- |
| `PaymentMethodsPageV2` | `PaymentMethodsPage` |

---

## 🧪 TESTING

### Test Edilen Alanlar

✅ Dashboard endpoints (employer & freelancer)
✅ Order endpoints
✅ Payment methods page
✅ Mock files

### Test Komutu

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Type check
npm run type-check
```

---

## 📞 DESTEK

Sorun yaşarsanız:

1. **Endpoint kontrol edin:** `/lib/api/endpoints.ts` dosyasında doğru endpoint'i bulun
2. **UnifiedApiClient kullanın:** Tüm API call'lar için standart client
3. **Console logları kontrol edin:** Browser console'da API call'ları görebilirsiniz

---

## 📋 CHECKLIST

Migration tamamlandı mı?

- [x] Dashboard duplicate routes silindi
- [x] Orders duplicate routes silindi
- [x] Payment page V2 production'a alındı
- [x] Unused mock files temizlendi
- [ ] Tüm components güncellendi
- [ ] Tests pass
- [ ] No console errors
- [ ] Production build successful

---

**Son Güncelleme:** 31 Ekim 2025
**Durum:** ✅ Migration Tamamlandı
**Versiyon:** 1.0.0
