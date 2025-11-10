# 🎯 MarifetBul - Milestone-Based Manual Payment Workflow Implementation

## 📋 Overview

Bu dokümantasyon, MarifetBul platformuna eklenen **aşamalı (milestone-based) proje yönetimi** ve **IBAN tabanlı manuel ödeme sistemi** implementasyonunu detaylandırır.

## 🔄 İş Akışı (Workflow)

### Yeni İş Akışı Durumları

```
Sipariş Oluştur → PENDING_PAYMENT (Ödeme Bekleniyor)
    ↓
Alıcı IBAN'a manuel ödeme yapar
    ↓
Satıcı ödemeyi onayla → PAID (Ödendi)
    ↓
Satıcı işi kabul et → IN_PROGRESS (Devam Ediyor)
    ↓
Aşama 1 tamamla → Milestone DELIVERED
    ↓
Alıcı aşamayı onayla → Milestone ACCEPTED
    ↓
... (tüm aşamalar için tekrar)
    ↓
Son aşama tamamlandı → DELIVERED (Teslim Edildi)
    ↓
Alıcı teslimi onayla → COMPLETED (Tamamlandı)
    ↓
Değerlendirme (Rating/Review)
```

## 🗄️ Backend Değişiklikleri

### 1. User Entity - IBAN Desteği

**Dosya**: `marifetbul-backend/src/main/java/com/marifetbul/api/domain/user/entity/User.java`

```java
/**
 * IBAN for manual payment reception (Turkish IBAN format)
 * Format: TR + 24 digits (e.g., TR330006100519786457841326)
 * Used for manual payment workflow until integrated payment system is activated
 */
@Column(name = "iban", length = 26)
private String iban;
```

### 2. User DTOs - IBAN Eklendi

- `UserResponse.java` - `private String iban;`
- `UserDetailResponse.java` - `private String iban;`
- `UpdateUserRequest.java` - IBAN validation ile birlikte

```java
@Pattern(regexp = "^TR\\d{24}$", message = "IBAN must be in Turkish format (TR + 24 digits)")
private String iban;
```

### 3. Order Response - Milestone ve IBAN Desteği

**Dosya**: `OrderResponse.java`

```java
@Schema(description = "Order milestones (for milestone-based projects)")
private List<MilestoneResponse> milestones;

@Schema(description = "Seller's IBAN for manual payment (visible only to buyer after project started)")
private String sellerIban;
```

### 4. Manuel Ödeme Onaylama

#### DTO Eklendi
**Dosya**: `ConfirmManualPaymentRequest.java`

```java
@NotBlank(message = "Payment reference is required")
private String paymentReference;

private String notes;
```

#### Controller Endpoint
**Dosya**: `OrderController.java`

```java
@PutMapping("/{orderId}/confirm-manual-payment")
@PreAuthorize("hasRole('FREELANCER')")
public ResponseEntity<ApiResponse<OrderResponse>> confirmManualPayment(
    @PathVariable UUID orderId,
    @Valid @RequestBody ConfirmManualPaymentRequest request,
    @AuthenticationPrincipal UserPrincipal userDetails)
```

#### Service Layer
**Dosya**: `OrderStatusService.java`

```java
public Order confirmManualPayment(UUID orderId, UUID userId, 
    String paymentReference, String notes) {
    // Validates seller
    // Checks PENDING_PAYMENT status
    // Adds payment confirmation notes
    // Transitions to PAID
    // Publishes event for notifications
}
```

### 5. Order Mapper - Milestone ve IBAN Mapping

**Dosya**: `OrderMapper.java`

```java
.milestones(order.getMilestones() != null && !order.getMilestones().isEmpty() 
    ? order.getMilestones().stream()
        .map(milestoneMapper::toResponse)
        .collect(Collectors.toList())
    : null)
.sellerIban(order.getSeller().getIban())
```

## 🎨 Frontend Değişiklikleri

### 1. Type Definitions

#### IBAN User Type'a Eklendi
**Dosya**: `types/core/base.ts`

```typescript
export interface User {
  // ... existing fields
  iban?: string; // IBAN for manual payment (service providers)
  // ... rest of fields
}
```

#### Milestone Types
**Dosya**: `types/backend-aligned.ts`

```typescript
export type MilestoneStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'DELIVERED'
  | 'REVISION_REQUESTED'
  | 'ACCEPTED'
  | 'CANCELED';

export interface MilestoneResponse {
  id: string;
  orderId: string;
  orderNumber: string;
  sequence: number;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  status: MilestoneStatus;
  statusDisplay?: string;
  dueDate?: string;
  isOverdue?: boolean;
  deliveryNotes?: string;
  attachments?: string;
  deliveredAt?: string;
  acceptedAt?: string;
  paymentReleasedAt?: string;
  canceledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMilestoneRequest {
  sequence: number;
  title: string;
  description?: string;
  amount: number;
  dueDate?: string;
}

export interface DeliverMilestoneRequest {
  deliveryNotes: string;
  attachments?: string;
}
```

#### Order Response Güncellemesi

```typescript
export interface OrderResponse {
  // ... existing fields
  milestones?: MilestoneResponse[];
  sellerIban?: string;
}
```

### 2. API Client

#### Endpoint Eklendi
**Dosya**: `lib/api/endpoints.ts`

```typescript
CONFIRM_MANUAL_PAYMENT: (orderId: string) => 
  `/orders/${orderId}/confirm-manual-payment`,
```

#### Service Method
**Dosya**: `lib/infrastructure/services/api/orderService.ts`

```typescript
export interface ConfirmManualPaymentRequest {
  paymentReference: string;
  notes?: string;
}

async confirmManualPayment(
  orderId: string,
  request: ConfirmManualPaymentRequest
): Promise<ApiResponse<OrderResponse>> {
  return apiClient.put<ApiResponse<OrderResponse>>(
    ORDER_ENDPOINTS.CONFIRM_MANUAL_PAYMENT(orderId),
    request
  );
}
```

#### API Export
**Dosya**: `lib/api/orders.ts`

```typescript
export const confirmManualPayment = orderApi.confirmManualPayment;
```

## 📊 Database Migration

### User Table - IBAN Column

```sql
ALTER TABLE users 
ADD COLUMN iban VARCHAR(26);

-- Optional: Add comment
COMMENT ON COLUMN users.iban IS 'Turkish IBAN for manual payment reception (TR + 24 digits)';
```

## 🔐 Güvenlik Kontrolleri

### Backend Validations

1. **IBAN Format Validation**
   - Pattern: `^TR\\d{24}$`
   - Sadece Türk IBAN'ları kabul edilir

2. **Authorization**
   - Manuel ödeme onayı: Sadece satıcı (FREELANCER)
   - IBAN görüntüleme: Sadece alıcı (proje başladıktan sonra)

3. **Status Validation**
   - Manuel ödeme onayı: Sadece PENDING_PAYMENT durumunda
   - Her durum geçişi için iş kuralları kontrol edilir

## 🧪 Test Senaryoları

### Manuel Ödeme Akışı

1. ✅ **Sipariş Oluşturma**
   ```
   POST /api/v1/orders/custom
   Status: PENDING_PAYMENT
   ```

2. ✅ **IBAN Görüntüleme**
   ```
   GET /api/v1/orders/{orderId}
   Response.sellerIban: "TR330006100519786457841326"
   ```

3. ✅ **Manuel Ödeme Onaylama**
   ```
   PUT /api/v1/orders/{orderId}/confirm-manual-payment
   Body: {
     "paymentReference": "REF123456789",
     "notes": "Payment received via bank transfer"
   }
   Status: PENDING_PAYMENT → PAID
   ```

4. ✅ **İşe Başlama**
   ```
   PUT /api/v1/orders/{orderId}/start
   Status: PAID → IN_PROGRESS
   ```

### Milestone Akışı

1. ✅ **Milestone Oluşturma**
   ```
   POST /api/v1/milestones
   Body: {
     "orderId": "...",
     "sequence": 1,
     "title": "İlk Tasarım",
     "amount": 500.00,
     "dueDate": "2025-11-20T00:00:00"
   }
   ```

2. ✅ **Milestone Teslim**
   ```
   PUT /api/v1/milestones/{milestoneId}/deliver
   Body: {
     "deliveryNotes": "İlk tasarım tamamlandı",
     "attachments": "https://..."
   }
   ```

3. ✅ **Milestone Onaylama**
   ```
   PUT /api/v1/milestones/{milestoneId}/accept
   ```

## 📱 UI Components (Geliştirilecek)

### Öncelikli Componentler

1. **IBANDisplay Component**
   - Satıcı IBAN'ını görüntüler
   - Kopyalama butonu
   - Ödeme talimatları

2. **ManualPaymentConfirmation Component**
   - Ödeme referansı girişi
   - Not ekleme alanı
   - Onaylama butonu

3. **MilestoneList Component**
   - Tüm milestone'ları listeler
   - Durum göstergesi (progress bar)
   - Her milestone için aksiyon butonları

4. **MilestoneDetail Component**
   - Milestone detaylarını gösterir
   - Teslim/Onaylama formları
   - Revizyon isteme

5. **ProjectTimeline Component**
   - Tüm milestone'ların timeline görünümü
   - Durum geçişleri
   - Tarih bilgileri

6. **RatingModal Component**
   - Proje tamamlandığında otomatik açılır
   - Yıldız derecelendirmesi
   - Yorum alanı

## 🔔 Bildirim Entegrasyonu (Planlandı)

### Bildirim Tetikleme Noktaları

1. Manuel ödeme onaylandığında
2. Her milestone durumu değiştiğinde
3. Milestone teslim edildiğinde
4. Milestone onaylandığında
5. Revizyon istendiğinde
6. Proje tamamlandığında

### Bildirim Tipleri

- **Sistem İçi Bildirim**: WebSocket üzerinden anlık
- **E-posta Bildirimi**: Önemli durum değişiklikleri için
- **Push Notification**: Mobil uygulama için (gelecek)

## 🎯 Sonraki Adımlar

### Fase 1: UI Componentleri (Acil)
- [ ] IBAN Display Component
- [ ] Manual Payment Confirmation Form
- [ ] Milestone List Component
- [ ] Milestone Detail/Action Component

### Fase 2: Milestone Yönetimi
- [ ] Milestone Create/Edit Component
- [ ] Milestone Timeline Visualization
- [ ] Progress Tracking Dashboard

### Fase 3: Rating Sistemi
- [ ] Auto-open Rating Modal
- [ ] Review Submission Form
- [ ] Rating Display in Profiles

### Fase 4: Admin Panel
- [ ] Workflow Monitoring Dashboard
- [ ] Status Logs Viewer
- [ ] Manual Payment Audit Trail

### Fase 5: Bildirimler
- [ ] Email Templates
- [ ] WebSocket Event Handlers
- [ ] Notification Preferences

## 📄 API Dokümantasyonu

### Manual Payment Confirmation

**Endpoint**: `PUT /api/v1/orders/{orderId}/confirm-manual-payment`

**Authorization**: Bearer Token (Seller only)

**Request Body**:
```json
{
  "paymentReference": "REF123456789",
  "notes": "Payment received on 2025-11-10 via bank transfer"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "orderNumber": "ORD-20251110-00001",
    "status": "PAID",
    "sellerIban": "TR330006100519786457841326",
    "notes": "[MANUAL PAYMENT CONFIRMED]\nReference: REF123456789\n...",
    ...
  },
  "message": "Manual payment confirmed successfully"
}
```

### Get Order with Milestones

**Endpoint**: `GET /api/v1/orders/{orderId}`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "orderNumber": "ORD-20251110-00001",
    "status": "IN_PROGRESS",
    "sellerIban": "TR330006100519786457841326",
    "milestones": [
      {
        "id": "...",
        "sequence": 1,
        "title": "İlk Tasarım",
        "amount": 500.00,
        "status": "ACCEPTED",
        "dueDate": "2025-11-20T00:00:00",
        "deliveredAt": "2025-11-15T10:00:00",
        "acceptedAt": "2025-11-16T09:00:00"
      },
      {
        "id": "...",
        "sequence": 2,
        "title": "Revizyon",
        "amount": 300.00,
        "status": "IN_PROGRESS",
        "dueDate": "2025-11-25T00:00:00"
      }
    ]
  }
}
```

## 🔄 Mevcut Ödeme Sistemi

**ÖNEMLİ**: Mevcut ödeme altyapısı (iyzico/PayTR entegrasyonu) korunmuştur ve silinmemiştir. Backend'de:

- `PaymentService` ve ilgili servisler aktif
- Ödeme webhook'ları çalışır durumda
- Escrow sistemi mevcut
- Gelecekte bu sistem frontend'e entegre edilebilir

Manuel ödeme sistemi, entegre ödeme sistemi aktif hale gelene kadar **geçici bir çözüm** olarak tasarlanmıştır.

## 📚 Referanslar

- **Backend Entity**: `OrderMilestone.java` - Zaten mevcut, kullanıma hazır
- **Milestone Service**: `MilestoneServiceImpl.java` - Tam implementasyon mevcut
- **Milestone Controller**: `MilestoneController.java` - REST endpoints hazır
- **Milestone Mapper**: `MilestoneMapper.java` - DTO mapping hazır

---

**Geliştirici Notları**:
- Backend tam olarak milestone destekli
- Frontend type definitions güncellendi
- API client hazır
- UI componentleri bekleniyor
- Bildirim sistemi entegrasyonu planlandı

**Son Güncelleme**: 2025-11-10
**Versiyon**: 1.0.0
**Geliştirici**: MarifetBul Development Team
