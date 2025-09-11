# Sprint 6: Ödeme Sistemi & Bildirim Altyapısı - 2 hafta

## 🎯 Sprint Hedefleri

- Escrow tabanlı güvenli ödeme sistemi entegrasyonu
- Siparişler için ödeme akışı ve fatura yönetimi
- Bildirim merkezi ve push notification altyapısı
- Ödeme geçmişi ve invoice görüntüleme
- Bildirim tercihleri ve sessiz saatler yönetimi
- Ödeme ve bildirimlerle ilgili hata ve başarı durumları

## 📱 Geliştirilecek Ekranlar

### Ödeme Akışı Ekranları

**Rol**: Both  
**Özellikler**:

- Sipariş oluşturma sonrası ödeme ekranı
- Kredi kartı, banka transferi, cüzdan ile ödeme seçenekleri
- Escrow (güvenli ödeme) akışı
- Fatura ve ödeme geçmişi görüntüleme
- Ödeme başarısı/başarısızlığı durum ekranları
- Responsive (mobile, tablet, desktop)

### Bildirim Merkezi

**Rol**: Both
**Özellikler**:

- Gerçek zamanlı push notification (browser + email)
- Bildirim listesi ve okundu/okunmadı ayrımı
- Bildirim detay ekranı
- Bildirim tercihleri ve sessiz saatler
- Önemli olaylar için (ödeme, teklif, mesaj, teslimat) anlık bildirim
- Bildirim arşivleme ve silme

## 🎨 UI/UX Tasarım Gereksinimleri

### Component'lar

- **Yeni Component'lar**:
  - `PaymentForm` - Ödeme formu
  - `PaymentHistory` - Ödeme geçmişi
  - `InvoiceCard` - Fatura kartı
  - `NotificationCenter` - Bildirim merkezi
  - `NotificationModal` - Bildirim detayları
  - `PushNotificationToggle` - Push izinleri
  - `NotificationSettings` - Tercih ve sessiz saatler
- **Güncellenecek Component'lar**:
  - `Button`, `Badge`, `Card` (ödeme ve bildirim varyantları)
  - `Dialog`, `Sheet` (ödeme ve bildirim için)
- **UI Library Integration**:
  - `Alert`, `Toast`, `Switch`, `Tabs`, `Accordion` (Shadcn/ui)

### User Flow

- **Freelancer Flow**: Sipariş → Teslimat → Ödeme Bekleme → Ödeme Alındı → Bildirim
- **Employer Flow**: Sipariş → Ödeme → Onay → Bildirim → Fatura

### States & Interactions

- **Loading States**: Ödeme işlemi, bildirim yükleme
- **Error Handling**: Ödeme hatası, bildirim gönderim hatası
- **Empty States**: Hiç ödeme yok, hiç bildirim yok
- **Success States**: Ödeme başarılı, bildirim iletildi
- **Interactive Elements**: Fatura önizleme, bildirim ayarları

### Accessibility

- ARIA labels for payment inputs
- Keyboard navigation for notification list
- Screen reader support for payment/bildirim
- Focus management on modal/dialog

## ⚙️ Fonksiyonel Özellikler

### Payment System

**Açıklama**: Escrow tabanlı güvenli ödeme ve fatura yönetimi
**Employer Perspective**: Sipariş için ödeme yapma, fatura görüntüleme
**Freelancer Perspective**: Ödeme bekleme, ödeme alındı bildirimi, fatura indirme
**Acceptance Criteria**:

- [ ] Sipariş için ödeme akışı eksiksiz
- [ ] Kredi kartı, banka transferi, cüzdan ile ödeme
- [ ] Escrow fonksiyonu ve ödeme onayı
- [ ] Fatura oluşturma ve görüntüleme
- [ ] Ödeme geçmişi listeleniyor

### Notification System

**Açıklama**: Gerçek zamanlı bildirim merkezi ve push notification
**Employer Perspective**: Teklif, ödeme, teslimat, mesaj bildirimleri
**Freelancer Perspective**: Sipariş, ödeme, revizyon, mesaj bildirimleri
**Acceptance Criteria**:

- [ ] Push notification browser ve email ile iletiliyor
- [ ] Bildirim merkezi ve detay ekranı çalışıyor
- [ ] Okundu/okunmadı ayrımı ve arşivleme
- [ ] Bildirim tercihleri ve sessiz saatler yönetimi
- [ ] Kritik olaylarda anlık bildirim

## 🔌 Mock API Servisleri

### Endpoint Pattern: `/api/v1/payments`, `/api/v1/notifications`

#### POST /api/v1/payments

```typescript
interface CreatePaymentRequest {
  orderId: string;
  method: 'credit_card' | 'bank_transfer' | 'wallet';
  amount: number;
}

interface CreatePaymentResponse {
  success: boolean;
  data?: {
    paymentId: string;
    status: 'pending' | 'completed' | 'failed';
    paymentUrl?: string;
    invoiceUrl?: string;
  };
  error?: string;
}

const mockPaymentResponse = {
  success: true,
  data: {
    paymentId: 'pay-123',
    status: 'pending',
    paymentUrl: '/payment/pay-123',
    invoiceUrl: '/invoices/pay-123.pdf',
  },
};
```

#### GET /api/v1/payments/history

```typescript
interface GetPaymentHistoryResponse {
  data: Payment[];
}

const mockPaymentHistory = [
  {
    paymentId: 'pay-123',
    orderId: 'order-123',
    amount: 1200,
    method: 'credit_card',
    status: 'completed',
    createdAt: '2025-09-11T10:00:00Z',
    invoiceUrl: '/invoices/pay-123.pdf',
  },
  // ...
];
```

#### GET /api/v1/notifications

```typescript
interface GetNotificationsResponse {
  data: Notification[];
}

const mockNotifications = [
  {
    id: 'notif-1',
    type: 'payment',
    title: 'Ödemeniz başarıyla alındı',
    message: 'Siparişiniz için ödeme işlemi tamamlandı.',
    read: false,
    createdAt: '2025-09-11T10:05:00Z',
  },
  // ...
];
```

### MSW Handler Implementation

```typescript
// lib/msw/handlers/payment-notification.ts
export const paymentNotificationHandlers = [
  http.post('/api/v1/payments', ({ request }) => {
    // Payment creation logic
    return HttpResponse.json(mockPaymentResponse);
  }),
  http.get('/api/v1/payments/history', () => {
    return HttpResponse.json({ data: mockPaymentHistory });
  }),
  http.get('/api/v1/notifications', () => {
    return HttpResponse.json({ data: mockNotifications });
  }),
];
```

## 💻 Teknik Implementation

### State Management (Zustand)

```typescript
interface PaymentStore {
  payments: Payment[];
  isLoading: boolean;
  error: string | null;
  createPayment: (data: CreatePaymentRequest) => Promise<void>;
  fetchPaymentHistory: () => Promise<void>;
  clearError: () => void;
}

interface NotificationStore {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  archiveNotification: (id: string) => Promise<void>;
  updatePreferences: (prefs: NotificationPreferences) => Promise<void>;
  clearError: () => void;
}
```

### Custom Hooks

```typescript
// hooks/usePayment.ts
export function usePayment() {
  // State, create, fetch logic
}

// hooks/useNotification.ts
export function useNotification() {
  // State, fetch, mark as read, archive, preferences logic
}
```

### Form Validation (Zod)

```typescript
// lib/validations/payment.ts
export const paymentSchema = z.object({
  orderId: z.string().min(1, 'Sipariş ID gereklidir'),
  method: z.enum(['credit_card', 'bank_transfer', 'wallet']),
  amount: z.number().min(1, 'Tutar en az 1 TL olmalı'),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;
```

### Component Structure

```typescript
// components/payment/PaymentForm.tsx
interface PaymentFormProps {
  orderId: string;
  amount: number;
}

export function PaymentForm({ orderId, amount }: PaymentFormProps) {
  // Implementation
}
```

## 🚀 Sprint Deliverables

### Functional Deliverables

- [ ] Escrow tabanlı ödeme sistemi implemented
- [ ] Ödeme formu ve geçmişi ekranı
- [ ] Fatura oluşturma ve görüntüleme
- [ ] Bildirim merkezi ve push notification
- [ ] Bildirim tercihleri ve sessiz saatler
- [ ] Responsive design (mobile, tablet, desktop)

### Technical Deliverables

- [ ] PaymentStore ve NotificationStore Zustand stores
- [ ] usePayment, useNotification custom hooks
- [ ] TypeScript types ve Zod şemaları
- [ ] MSW handlers for payment/notification endpoints
- [ ] Unit tests for payment/notification components
- [ ] Integration tests for payment flows

### Quality Deliverables

- [ ] Accessibility (WCAG 2.1 AA) for payment/notification
- [ ] Cross-browser compatibility
- [ ] Performance optimized (payment latency <2s)
- [ ] Code review completed
- [ ] Documentation updated

## ✅ Test Scenarios

### User Journey Tests

- **Freelancer Journey**:
  1. Sipariş → Teslimat → Ödeme Bekleme → Bildirim → Fatura
  2. Bildirim merkezi → Okundu işaretleme
  3. Ödeme geçmişi görüntüleme

- **Employer Journey**:
  1. Sipariş → Ödeme → Onay → Bildirim → Fatura
  2. Bildirim merkezi → Tercih ayarları
  3. Fatura indirme

### Edge Cases

- **Ödeme başarısızlığı**: Hata mesajı, tekrar deneme
- **Bildirim spam**: Sessiz saatler, tercih yönetimi
- **Fatura bulunamıyor**: Hata mesajı, destek yönlendirme
- **Çoklu ödeme yöntemi**: Doğru method seçimi
- **Push izin reddi**: Alternatif bildirim

### Performance Tests

- Ödeme işlemi tamamlanma süresi <2s
- Bildirim iletimi <1s
- Fatura yüklenme süresi <1s

## 🔍 Kabul Kriterleri

### Functional Acceptance

- [ ] Ödeme akışı ve fatura yönetimi eksiksiz
- [ ] Bildirim merkezi ve push notification çalışıyor
- [ ] Okundu/okunmadı ayrımı ve arşivleme fonksiyonel
- [ ] Tüm ödeme yöntemleri destekleniyor
- [ ] Hata ve başarı durumları kullanıcı dostu

### Design Acceptance

- [ ] Payment ve notification ekranları responsive
- [ ] Loading ve error states kullanıcı dostu
- [ ] UI consistency ve accessibility sağlandı

### Technical Acceptance

- [ ] TypeScript strict mode hatası yok
- [ ] ESLint/Prettier uyumlu
- [ ] Test coverage %80+
- [ ] Console error/warning yok
- [ ] Performance hedefleri karşılandı

## 📊 Definition of Done

- [ ] Tüm fonksiyonel gereksinimler tamamlandı
- [ ] Responsive ve cross-browser test edildi
- [ ] Accessibility audit geçti
- [ ] Unit ve integration testler başarılı
- [ ] Code review ve dokümantasyon tamamlandı
- [ ] Performance metrikleri sağlandı
