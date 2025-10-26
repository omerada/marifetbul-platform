# 🔍 MarifetBul Projesi - Sprint 2 Analiz Raporu ve Plan

**Tarih:** 26 Ekim 2025  
**Sprint:** Sprint 2 - Notification System Integration  
**Önceki Sprint:** Sprint 1 - User Follow/Unfollow System ✅ TAMAMLANDI

---

## 📊 Executive Summary

Sprint 1'de User Follow/Unfollow sistemi başarıyla tamamlandı (100%). Sistem production-ready durumda.

**Sprint 2 Odak Noktası**: **Notification System Integration & Real-time Events**

### Tespit Edilen Ana Sorunlar:

1. ✅ **WebSocket Infrastructure** - MEVCUT ama entegrasyon eksik
2. ⚠️ **Notification System** - Backend var, Follow event integration YOK
3. ⚠️ **Real-time Events** - Follow notifications eksik
4. ⚠️ **Email Notifications** - Template var, trigger logic eksik
5. ⚠️ **Frontend WebSocket** - Client hazır, hook entegrasyonu eksik

---

## 🎯 SPRINT 2: Notification System Integration

### Mevcut Durum Analizi

#### Backend - Notification Infrastructure (70% Complete)

**✅ MEVCUT:**

- `NotificationService` - Notification CRUD operations
- `MessageNotificationService` - Message notifications
- `WebSocketService` - WebSocket message sending
- `WebSocketEventListener` - Connection/disconnection tracking
- Database schema (notifications table)
- Email template system

**❌ EKSİK:**

- Follow event listener (`@EventListener` for UserFollow)
- Follow notification creation logic
- Review notification integration
- Order notification triggers
- Payment notification triggers
- Notification preference management
- Read/unread notification tracking

#### Frontend - Notification System (40% Complete)

**✅ MEVCUT:**

- `WebSocketManager` - Client infrastructure
- `WebSocketClient` - Connection management
- Notification types defined
- Toast notification system (sonner)

**❌ EKSİK:**

- `useNotifications` hook - Frontend notification state
- Real-time notification listener
- Notification center UI
- Notification badge counter
- Sound/vibration alerts
- Notification preferences UI
- Mark as read functionality

---

## 📋 DETAYLI ANALİZ BULGULARI

### 1. 🔴 Kritik Eksiklikler (Sprint 2 Scope)

#### A. **Follow Event Notifications**

**Durum:**

- ✅ UserFollow entity ve service var
- ✅ WebSocket infrastructure hazır
- ❌ Follow event listener YOK
- ❌ Notification creation logic YOK
- ❌ Real-time push YOK

**Gereken İşlemler:**

```java
// Backend
@EventListener
public void handleFollowEvent(UserFollowEvent event) {
    // 1. Create notification
    // 2. Send WebSocket message
    // 3. (Optional) Send email if user offline
}
```

**Frontend:**

```tsx
// useNotifications hook
const { notifications, unreadCount, markAsRead } = useNotifications();

// Real-time listener
useEffect(() => {
  const unsubscribe = webSocket.on('notification', handleNotification);
  return () => unsubscribe();
}, []);
```

#### B. **Notification Center UI**

**Durum:**

- ❌ Notification dropdown component YOK
- ❌ Notification list page YOK
- ❌ Badge counter YOK
- ❌ Mark as read UI YOK

**Gereken Componentler:**

1. `NotificationDropdown` - Header'da bell icon dropdown
2. `NotificationList` - Full list page
3. `NotificationItem` - Individual notification card
4. `NotificationBadge` - Unread count indicator

#### C. **Real-time Event System**

**Durum:**

- ✅ WebSocket bağlantısı var
- ✅ Message notifications çalışıyor
- ❌ Follow notifications entegre değil
- ❌ Order update notifications eksik
- ❌ Payment notifications eksik
- ❌ Review notifications eksik

**Event Types to Implement:**

```typescript
type NotificationEvent =
  | 'FOLLOW' // User X followed you
  | 'UNFOLLOW' // User X unfollowed you (optional)
  | 'ORDER_PLACED' // New order received
  | 'ORDER_COMPLETED' // Order completed
  | 'PAYMENT_RECEIVED' // Payment received
  | 'REVIEW_RECEIVED' // New review received
  | 'MESSAGE_RECEIVED' // New message (ALREADY EXISTS)
```

---

## 🚀 SPRINT 2 PLAN: Notification System Integration

### Timeline: 5 iş günü (26 Ekim - 1 Kasım 2025)

### Phase 1: Backend Event Listeners (2 gün)

#### Task 1.1: Create Event Infrastructure

- [ ] Create `@Event` classes:
  - `UserFollowEvent`
  - `UserUnfollowEvent`
  - `OrderPlacedEvent`
  - `PaymentReceivedEvent`
  - `ReviewReceivedEvent`

**Files to Create:**

```
marifetbul-backend/src/main/java/com/marifetbul/api/domain/
  user/event/UserFollowEvent.java
  user/event/UserUnfollowEvent.java
  order/event/OrderPlacedEvent.java
  payment/event/PaymentReceivedEvent.java
  review/event/ReviewReceivedEvent.java
```

#### Task 1.2: Create Event Publishers

- [ ] Publish events from services:
  - `UserFollowServiceImpl` → publish UserFollowEvent
  - `OrderServiceImpl` → publish OrderPlacedEvent
  - `PaymentServiceImpl` → publish PaymentReceivedEvent
  - `ReviewServiceImpl` → publish ReviewReceivedEvent

**Code Pattern:**

```java
@Service
public class UserFollowServiceImpl {
    private final ApplicationEventPublisher eventPublisher;

    public void followUser(UUID followerId, UUID followingId) {
        // ... create follow
        eventPublisher.publishEvent(new UserFollowEvent(follower, following));
    }
}
```

#### Task 1.3: Create Notification Event Listeners

- [ ] Create `NotificationEventListener` class
- [ ] Implement handlers for all events:
  - `@EventListener(UserFollowEvent.class)`
  - `@EventListener(OrderPlacedEvent.class)`
  - `@EventListener(PaymentReceivedEvent.class)`
  - `@EventListener(ReviewReceivedEvent.class)`

**File:**

```
marifetbul-backend/src/main/java/com/marifetbul/api/domain/notification/
  event/NotificationEventListener.java
```

**Implementation:**

```java
@Component
@RequiredArgsConstructor
public class NotificationEventListener {
    private final NotificationService notificationService;
    private final WebSocketService webSocketService;

    @EventListener
    @Async
    public void handleFollowEvent(UserFollowEvent event) {
        // 1. Create notification
        Notification notification = notificationService.createNotification(
            event.getFollowing().getId(), // recipient
            NotificationType.FOLLOW,
            event.getFollower().getId(), // actor
            "sizi takip etmeye başladı"
        );

        // 2. Send WebSocket message
        webSocketService.sendToUser(
            event.getFollowing().getId(),
            WebSocketMessage.notification(notification)
        );
    }
}
```

### Phase 2: Backend Notification Enhancement (1 gün)

#### Task 2.1: Enhance NotificationService

- [ ] Add `getUnreadCount(userId)` method
- [ ] Add `markAsRead(notificationId)` method
- [ ] Add `markAllAsRead(userId)` method
- [ ] Add pagination support for notifications

#### Task 2.2: Create Notification REST Endpoints

- [ ] GET `/api/v1/notifications` - Get user notifications (paginated)
- [ ] GET `/api/v1/notifications/unread-count` - Get unread count
- [ ] POST `/api/v1/notifications/{id}/read` - Mark as read
- [ ] POST `/api/v1/notifications/mark-all-read` - Mark all as read

**File:**

```
marifetbul-backend/src/main/java/com/marifetbul/api/domain/notification/
  controller/NotificationController.java
```

### Phase 3: Frontend Hooks (1 gün)

#### Task 3.1: Create useNotifications Hook

- [ ] Fetch notifications with SWR
- [ ] Real-time WebSocket listener
- [ ] Unread count state
- [ ] Mark as read functionality
- [ ] Pagination support

**File:**

```typescript
// hooks/business/useNotifications.ts
export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const { data, mutate } = useSWR('/api/v1/notifications', fetcher);

  // WebSocket listener
  useEffect(() => {
    const ws = getWebSocketManager();
    const unsubscribe = ws.on('notification', (notification) => {
      mutate(); // Refresh list
      setUnreadCount(prev => prev + 1);
      toast.success(notification.message);
    });
    return () => unsubscribe();
  }, []);

  return { notifications, unreadCount, markAsRead, refetch };
}
```

#### Task 3.2: Create useNotificationPermission Hook

- [ ] Browser notification permission request
- [ ] Show desktop notifications
- [ ] Sound/vibration alerts

### Phase 4: Frontend UI Components (1 gün)

#### Task 4.1: Create NotificationDropdown

- [ ] Bell icon with badge
- [ ] Dropdown with latest 5 notifications
- [ ] "See all" link
- [ ] Mark as read on click

**File:**

```
components/layout/header/NotificationDropdown.tsx
```

#### Task 4.2: Create NotificationList Page

- [ ] Full list of notifications
- [ ] Infinite scroll
- [ ] Filter by type
- [ ] Mark all as read button

**File:**

```
app/notifications/page.tsx
components/domains/notifications/NotificationList.tsx
components/domains/notifications/NotificationItem.tsx
```

#### Task 4.3: Create NotificationBadge Component

- [ ] Reusable badge for unread count
- [ ] Auto-update via WebSocket

---

## 📊 Dosya Yapısı (Sprint 2)

### Backend (9 Yeni Dosya)

```
marifetbul-backend/src/main/java/com/marifetbul/api/
├── domain/
│   ├── user/
│   │   └── event/
│   │       ├── UserFollowEvent.java (NEW)
│   │       └── UserUnfollowEvent.java (NEW)
│   ├── order/
│   │   └── event/
│   │       └── OrderPlacedEvent.java (NEW)
│   ├── payment/
│   │   └── event/
│   │       └── PaymentReceivedEvent.java (NEW)
│   ├── review/
│   │   └── event/
│   │       └── ReviewReceivedEvent.java (NEW)
│   └── notification/
│       ├── controller/
│       │   └── NotificationController.java (NEW)
│       └── event/
│           └── NotificationEventListener.java (NEW)
├── Modified Files:
│   ├── UserFollowServiceImpl.java (add event publishing)
│   ├── NotificationService.java (add new methods)
│   └── NotificationServiceImpl.java (implement new methods)
```

### Frontend (8 Yeni Dosya)

```
├── hooks/business/
│   ├── useNotifications.ts (NEW)
│   └── useNotificationPermission.ts (NEW)
├── components/
│   ├── layout/header/
│   │   └── NotificationDropdown.tsx (NEW)
│   └── domains/notifications/
│       ├── NotificationList.tsx (NEW)
│       ├── NotificationItem.tsx (NEW)
│       ├── NotificationBadge.tsx (NEW)
│       └── NotificationFilter.tsx (NEW)
├── app/notifications/
│   └── page.tsx (NEW)
├── Modified Files:
│   ├── components/layout/AppHeader.tsx (add NotificationDropdown)
│   └── types/core/base.ts (add Notification type)
```

---

## 🎯 Sprint 2 Acceptance Criteria

### Backend

- [ ] Follow event triggers notification creation
- [ ] WebSocket sends real-time notification
- [ ] Notification REST API endpoints work
- [ ] Unread count API works
- [ ] Mark as read API works
- [ ] All 5 event types implemented
- [ ] Email fallback for offline users (bonus)

### Frontend

- [ ] Bell icon shows unread count badge
- [ ] Dropdown shows latest notifications
- [ ] Click opens notification detail
- [ ] Mark as read works
- [ ] Real-time updates via WebSocket
- [ ] Toast notification on new event
- [ ] Full notification list page works

### Integration

- [ ] Follow user → Notification appears in real-time
- [ ] Badge count updates automatically
- [ ] Click notification → marks as read
- [ ] WebSocket reconnects after disconnect

---

## 📈 Sprint 2 Metrics

**Backend:**

- 9 yeni dosya
- 5 event class
- 1 event listener
- 1 controller (4 endpoint)
- ~800 satır kod

**Frontend:**

- 8 yeni dosya
- 2 custom hook
- 5 UI component
- 1 page
- ~600 satır kod

**Toplam:**

- 17 yeni dosya
- ~1,400 satır kod
- 5 iş günü

---

## 🔄 Sprint 2 Execution Order

### Day 1: Backend Events

1. ✅ Create Event classes (UserFollowEvent, etc.)
2. ✅ Add event publishing to services
3. ✅ Create NotificationEventListener
4. ✅ Test event flow

### Day 2: Backend API

1. ✅ Enhance NotificationService
2. ✅ Create NotificationController
3. ✅ Add Swagger documentation
4. ✅ Test API endpoints

### Day 3: Frontend Hooks

1. ✅ Create useNotifications hook
2. ✅ Integrate WebSocket listener
3. ✅ Add unread count state
4. ✅ Test real-time updates

### Day 4: Frontend UI

1. ✅ Create NotificationDropdown
2. ✅ Create NotificationList page
3. ✅ Create NotificationItem component
4. ✅ Add to AppHeader

### Day 5: Testing & Polish

1. ✅ End-to-end testing
2. ✅ Fix bugs
3. ✅ Performance optimization
4. ✅ Documentation

---

## 📚 Technical Implementation Details

### Event Publishing Pattern

```java
@Service
public class UserFollowServiceImpl {
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public FollowStatusResponse toggleFollow(UUID followerId, UUID followingId) {
        // ... business logic

        if (isNowFollowing) {
            // Publish event
            eventPublisher.publishEvent(
                UserFollowEvent.builder()
                    .follower(follower)
                    .following(following)
                    .timestamp(LocalDateTime.now())
                    .build()
            );
        }

        return response;
    }
}
```

### Notification Event Listener Pattern

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {
    private final NotificationService notificationService;
    private final WebSocketService webSocketService;
    private final UserRepository userRepository;

    @EventListener
    @Async
    @Transactional
    public void handleFollowEvent(UserFollowEvent event) {
        try {
            User follower = event.getFollower();
            User following = event.getFollowing();

            // 1. Create notification
            Notification notification = notificationService.createNotification(
                NotificationRequest.builder()
                    .recipientId(following.getId())
                    .type(NotificationType.FOLLOW)
                    .actorId(follower.getId())
                    .actorName(follower.getFullName())
                    .actorAvatar(follower.getAvatarUrl())
                    .message(follower.getFullName() + " sizi takip etmeye başladı")
                    .actionUrl("/profile/" + follower.getUsername())
                    .build()
            );

            // 2. Send WebSocket notification
            WebSocketMessage<Notification> wsMessage = WebSocketMessage.<Notification>builder()
                .type(WebSocketMessage.MessageType.NOTIFICATION)
                .data(notification)
                .timestamp(LocalDateTime.now())
                .build();

            webSocketService.sendToUser(following.getId(), wsMessage);

            log.info("Follow notification sent: {} -> {}", follower.getId(), following.getId());

        } catch (Exception e) {
            log.error("Failed to send follow notification", e);
        }
    }
}
```

### Frontend Hook Pattern

```typescript
export function useNotifications() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const { data: notifications, mutate } = useSWR<Notification[]>(
    user ? '/api/v1/notifications' : null,
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30s
  );

  // Fetch unread count
  const { data: countData } = useSWR<{ count: number }>(
    user ? '/api/v1/notifications/unread-count' : null,
    fetcher
  );

  useEffect(() => {
    if (countData) {
      setUnreadCount(countData.count);
    }
  }, [countData]);

  // Real-time WebSocket listener
  useEffect(() => {
    if (!user) return;

    const ws = getWebSocketManager();

    const unsubscribe = ws.on<Notification>('notification', (notification) => {
      // Add to list
      mutate();

      // Update count
      setUnreadCount(prev => prev + 1);

      // Show toast
      toast.success(notification.message, {
        action: {
          label: 'Görüntüle',
          onClick: () => router.push(notification.actionUrl || '/notifications')
        }
      });
    });

    return () => unsubscribe();
  }, [user, mutate]);

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.post(`/notifications/${notificationId}/read`);
      mutate();
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  return {
    notifications: notifications || [],
    unreadCount,
    markAsRead,
    refetch: mutate,
  };
}
```

---

## 🎊 Sprint 2 Success Criteria

### Functional Requirements

- ✅ User follows someone → Notification created
- ✅ Notification appears in real-time (WebSocket)
- ✅ Badge count shows unread notifications
- ✅ Click notification → opens detail page
- ✅ Mark as read → count decreases
- ✅ WebSocket auto-reconnects

### Non-Functional Requirements

- ✅ Notifications load in <500ms
- ✅ WebSocket latency <100ms
- ✅ No memory leaks (WebSocket cleanup)
- ✅ Works on mobile devices
- ✅ Accessible (keyboard navigation)

---

## 📝 Next Steps After Sprint 2

### Sprint 3 Candidates:

1. **Email Notifications** - Send emails for offline users
2. **Notification Preferences** - User settings for notification types
3. **Push Notifications** - Browser push notifications
4. **Order Update Notifications** - Real-time order status updates
5. **Payment Notifications** - Payment confirmation alerts

---

**Sprint 2 Başlatmaya Hazır! 🚀**

Tüm analiz tamamlandı, implementation plan net, dosya yapısı belirli.
Şimdi geliştirmeye başlayabilirsiniz!
