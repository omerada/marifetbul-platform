# Review Notification System Integration Guide

## Overview

Review bildirim sistemi kullanıcılara review ile ilgili önemli olaylar hakkında bildirim gönderir. Bu döküman sistemin nasıl entegre edileceğini açıklar.

## Components

### 1. useReviewNotifications Hook

Review bildirimlerini yöneten React hook.

**Features:**

- Otomatik bildirim çekme
- Polling desteği (varsayılan: 60 saniye)
- Okundu işaretleme
- Hata yönetimi

**Usage:**

```tsx
import { useReviewNotifications } from '@/hooks';

function MyComponent() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useReviewNotifications({
    autoFetch: true,
    pollingInterval: 60000, // 1 dakika
  });

  return (
    <div>
      {unreadCount > 0 && <Badge>{unreadCount} yeni</Badge>}
      {/* Notification list */}
    </div>
  );
}
```

### 2. ReviewNotificationItem Component

Tek bir bildirimi görüntüler.

**Props:**

- `notification`: ReviewNotificationData
- `onClick`: () => void
- `onMarkAsRead`: () => void

### 3. ReviewNotificationList Component

Bildirim listesi konteyner bileşeni.

**Props:**

- `notifications`: ReviewNotificationData[]
- `onNotificationClick`: (notification) => void
- `onMarkAsRead`: (notificationId) => void
- `onMarkAllAsRead`: () => void

### 4. ReviewNotificationBadge Component

Okunmamış bildirim sayısını gösteren badge.

**Props:**

- `count`: number
- `onClick`: () => void

## Notification Types

```typescript
type ReviewNotificationType =
  | 'REVIEW_REMINDER'        // Review yazma hatırlatması
  | 'SELLER_RESPONSE'        // Satıcı review'a yanıt verdi
  | 'HELPFUL_VOTE'           // Review'ınıza "faydalı" oyu geldi
  | 'REVIEW_FLAGGED'         // Review'ınız şikayet edildi
  | 'REVIEW_APPROVED'        // Review'ınız admin tarafından onaylandı
  | 'REVIEW_REJECTED';       // Review'ınız admin tarafından reddedildi
```

## Backend Integration

### Required Endpoints

#### 1. Get Review Notifications

```
GET /api/v1/notifications/reviews
```

**Response:**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif123",
        "type": "REVIEW_REMINDER",
        "title": "Sipariş Değerlendirmesi",
        "message": "Tamamlanan siparişinizi değerlendirin",
        "reviewId": null,
        "orderId": "order123",
        "packageTitle": "Logo Tasarımı",
        "sellerName": "Ahmet Yılmaz",
        "createdAt": "2024-01-20T10:00:00Z",
        "read": false,
        "actionUrl": "/dashboard/employer/orders/order123/review"
      }
    ],
    "unreadCount": 3
  }
}
```

#### 2. Mark Notification as Read

```
POST /api/v1/notifications/{notificationId}/read
```

**Response:**

```json
{
  "success": true,
  "message": "Bildirim okundu olarak işaretlendi"
}
```

#### 3. Mark All Review Notifications as Read

```
POST /api/v1/notifications/reviews/read-all
```

**Response:**

```json
{
  "success": true,
  "message": "Tüm bildirimler okundu olarak işaretlendi"
}
```

## Integration Examples

### Example 1: Header Notification Dropdown

```tsx
import { useReviewNotifications } from '@/hooks';
import { ReviewNotificationBadge, ReviewNotificationList } from '@/components/domains/reviews/ReviewNotificationItem';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/Popover';

function HeaderNotifications() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useReviewNotifications();

  const [open, setOpen] = useState(false);

  const handleNotificationClick = (notification: ReviewNotificationData) => {
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <ReviewNotificationBadge count={unreadCount} />
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0">
        <ReviewNotificationList
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
        />
      </PopoverContent>
    </Popover>
  );
}
```

### Example 2: Dedicated Notifications Page

```tsx
import { useReviewNotifications } from '@/hooks';
import { ReviewNotificationList } from '@/components/domains/reviews/ReviewNotificationItem';

function NotificationsPage() {
  const {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
  } = useReviewNotifications();

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">Bildirimler</h1>
      <ReviewNotificationList
        notifications={notifications}
        onNotificationClick={(notif) => {
          if (notif.actionUrl) {
            router.push(notif.actionUrl);
          }
        }}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />
    </div>
  );
}
```

## Backend Webhook Integration

Backend'de review oluşturma/güncelleme event'lerinde bildirim gönderilmesi için:

### Review Created Event

```java
@EventListener
public void onReviewCreated(ReviewCreatedEvent event) {
    Review review = event.getReview();
    Order order = orderService.findById(review.getOrderId());

    // Satıcıya bildirim gönder
    notificationService.createNotification(
        order.getSellerId(),
        NotificationType.NEW_REVIEW,
        "Yeni Değerlendirme",
        "Bir müşteriniz siparişi değerlendirdi",
        Map.of(
            "reviewId", review.getId(),
            "orderId", order.getId(),
            "packageTitle", order.getPackageTitle(),
            "actionUrl", "/dashboard/freelancer/reviews"
        )
    );
}
```

### Review Response Event

```java
@EventListener
public void onReviewResponse(ReviewResponseEvent event) {
    Review review = event.getReview();

    // Review yazarına bildirim gönder
    notificationService.createNotification(
        review.getBuyerId(),
        NotificationType.SELLER_RESPONSE,
        "Satıcı Yanıtı",
        review.getSellerName() + " değerlendirmenize yanıt verdi",
        Map.of(
            "reviewId", review.getId(),
            "sellerName", review.getSellerName(),
            "actionUrl", "/profile/" + review.getSellerId()
        )
    );
}
```

### Review Reminder Job

```java
@Scheduled(cron = "0 0 10 * * *") // Her gün saat 10:00
public void sendReviewReminders() {
    List<Order> completedOrders = orderService.findCompletedOrdersWithoutReview();

    completedOrders.forEach(order -> {
        if (isEligibleForReviewReminder(order)) {
            notificationService.createNotification(
                order.getBuyerId(),
                NotificationType.REVIEW_REMINDER,
                "Sipariş Değerlendirmesi",
                "Tamamlanan siparişinizi değerlendirin ve deneyiminizi paylaşın",
                Map.of(
                    "orderId", order.getId(),
                    "packageTitle", order.getPackageTitle(),
                    "sellerName", order.getSellerName(),
                    "actionUrl", "/dashboard/employer/orders/" + order.getId() + "/review"
                )
            );
        }
    });
}
```

## Best Practices

1. **Polling Interval**: Production'da 60-120 saniye arası kullanın
2. **WebSocket Alternative**: Yüksek trafikte polling yerine WebSocket kullanılabilir
3. **Notification Cleanup**: Eski bildirimleri periyodik olarak temizleyin (30 gün+)
4. **Rate Limiting**: Bildirim endpoint'lerinde rate limiting uygulayın
5. **Caching**: Unread count gibi sık erişilen verileri cache'leyin

## Testing

```typescript
// Mock data for testing
const mockNotifications: ReviewNotificationData[] = [
  {
    id: '1',
    type: 'REVIEW_REMINDER',
    title: 'Sipariş Değerlendirmesi',
    message: 'Logo tasarımı siparişinizi değerlendirebilirsiniz',
    orderId: 'order123',
    packageTitle: 'Logo Tasarımı',
    sellerName: 'Ahmet Yılmaz',
    createdAt: new Date(),
    read: false,
    actionUrl: '/dashboard/employer/orders/order123/review',
  },
  // ... more notifications
];
```

## Sprint Checklist

- [x] ✅ useReviewNotifications hook created
- [x] ✅ ReviewNotificationItem component (already exists)
- [x] ✅ ReviewNotificationList component (already exists)
- [x] ✅ ReviewNotificationBadge component (already exists)
- [ ] ⏳ Backend notification endpoints
- [ ] ⏳ Backend event listeners (webhook integration)
- [ ] ⏳ Header integration
- [ ] ⏳ Notifications page
- [ ] ⏳ Review reminder job (scheduled task)

## API Contract Notes

Backend ekibine iletilmesi gerekenler:

1. `/api/v1/notifications/reviews` endpoint'i oluşturulmalı
2. `/api/v1/notifications/{id}/read` endpoint'i oluşturulmalı
3. `/api/v1/notifications/reviews/read-all` endpoint'i oluşturulmalı
4. Review created/updated event'lerinde bildirim oluşturma
5. Scheduled job ile günlük review reminder gönderme
