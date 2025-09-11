# Sprint 9: Mobile İyileştirmeleri, PWA & Push Notifications - 2 hafta

## 🎯 Sprint Hedefleri

- Mobile-first responsive design iyileştirmeleri
- Progressive Web App (PWA) özellikleri
- Push notification sistemi (browser & mobile)
- Offline functionality ve data caching
- Mobile navigation ve gesture optimizasyonu
- Touch-friendly UI components
- App-like user experience

## 📱 Geliştirilecek Ekranlar

### Mobile Navigation & Layout

**Rol**: Both  
**Özellikler**:

- Bottom navigation bar (Ana Sayfa, Arama, Mesajlar, Profil)
- Hamburger menu ile extended navigation
- Pull-to-refresh gestures
- Swipe navigation (cards, lists)
- Touch-optimized buttons ve inputs
- Mobile drawer/sidebar
- Sticky headers ve floating action buttons

### PWA Features

**Rol**: Both
**Özellikler**:

- App install prompt
- Splash screen ve app icons
- Offline mode detection
- Service worker for caching
- Background sync
- Share API integration
- Full-screen mode support

### Push Notifications

**Rol**: Both
**Özellikler**:

- Browser notification permission
- Real-time push notifications
- Notification categories (mesaj, sipariş, payment)
- Notification history ve settings
- Badge count updates
- Silent notifications for data sync

### Mobile Optimizations

**Rol**: Both
**Özellikler**:

- Touch-friendly card layouts
- Improved form inputs (number pads, autocomplete)
- Image optimization ve lazy loading
- Gesture-based interactions
- Mobile search with voice input
- Location services integration

## 🎨 UI/UX Tasarım Gereksinimleri

### Component'lar

- **Yeni Component'lar**:
  - `BottomNavigation` - Alt navigasyon çubuğu
  - `MobileDrawer` - Mobile sidebar
  - `PWAInstallPrompt` - App yükleme önergesi
  - `PushNotificationToggle` - Notification ayarları
  - `OfflineIndicator` - Offline durum göstergesi
  - `PullToRefresh` - Yenileme gesture'ı
  - `TouchCard` - Touch-optimized card
  - `FloatingActionButton` - FAB button
  - `MobileSearch` - Mobile arama
- **Güncellenecek Component'lar**:
  - `Layout` - Mobile layout optimizasyonu
  - `Header` - Mobile header
  - `Navigation` - Responsive navigation
  - `Card`, `Button`, `Input` (mobile varyantları)
- **UI Library Integration**:
  - `Sheet`, `Drawer`, `NavigationMenu` (Shadcn/ui)

### User Flow

- **Mobile First Flow**: Landing → Install App → Login → Navigate → Notifications
- **PWA Flow**: Browser Visit → Install Prompt → App Mode → Push Permission

### States & Interactions

- **Touch States**: Touch feedback, haptic responses
- **Gesture States**: Swipe animations, pull-to-refresh
- **Network States**: Online/offline, slow connection
- **Installation States**: Install prompt, app installed
- **Notification States**: Permission granted/denied, notification received

### Accessibility

- Touch target minimum 44px
- Voice over support for gestures
- High contrast mode support
- Reduced motion preferences
- Focus indicators for keyboard navigation

## ⚙️ Fonksiyonel Özellikler

### Mobile Navigation & UX

**Açıklama**: Mobile-first navigation ve touch-optimized user experience
**Employer Perspective**: Touch-friendly job posting, mobile notifications
**Freelancer Perspective**: Swipe-friendly browsing, quick actions
**Acceptance Criteria**:

- [ ] Bottom navigation ile ana sayfalara erişim
- [ ] Pull-to-refresh tüm listelerde çalışıyor
- [ ] Touch gestures (swipe, pinch, tap) implemented
- [ ] Mobile keyboard ve input optimizasyonu
- [ ] Floating action buttons kritik aksiyonlarda

### Progressive Web App (PWA)

**Açıklama**: App-like experience ile native mobile app hissi
**Employer Perspective**: Desktop ve mobile'da tutarlı deneyim
**Freelancer Perspective**: Hızlı erişim, offline capability
**Acceptance Criteria**:

- [ ] PWA manifest ve service worker configured
- [ ] App install prompt working
- [ ] Offline pages ve basic functionality
- [ ] App icons ve splash screen
- [ ] Share API integration

### Push Notification System

**Açıklama**: Real-time browser ve mobile push notifications
**Employer Perspective**: Teklif bildirimleri, proje güncellemeleri
**Freelancer Perspective**: İş fırsatları, mesaj bildirimleri
**Acceptance Criteria**:

- [ ] Browser notification permission flow
- [ ] Real-time push notifications working
- [ ] Notification categories ve settings
- [ ] Badge count updates
- [ ] Background sync for offline actions

### Mobile Performance

**Açıklama**: Mobile cihazlarda hızlı ve smooth performans
**Employer Perspective**: Hızlı iş ilanı oluşturma
**Freelancer Perspective**: Smooth browsing ve quick actions
**Acceptance Criteria**:

- [ ] Page load times <3s on 3G
- [ ] 60fps animations ve transitions
- [ ] Image lazy loading ve optimization
- [ ] Bundle size optimized for mobile
- [ ] Memory usage optimized

## 🔌 Mock API Servisleri

### Endpoint Pattern: `/api/v1/notifications`, `/api/v1/pwa`

#### POST /api/v1/notifications/subscribe

```typescript
interface NotificationSubscribeRequest {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId: string;
}

interface NotificationSubscribeResponse {
  success: boolean;
  subscriptionId?: string;
  error?: string;
}

const mockSubscribeResponse = {
  success: true,
  subscriptionId: 'sub-123',
};
```

#### POST /api/v1/notifications/send

```typescript
interface SendNotificationRequest {
  userId: string;
  title: string;
  body: string;
  category: 'message' | 'order' | 'payment' | 'job';
  data?: any;
  badge?: number;
}

interface SendNotificationResponse {
  success: boolean;
  notificationId?: string;
  error?: string;
}

const mockSendResponse = {
  success: true,
  notificationId: 'notif-123',
};
```

#### GET /api/v1/notifications/history

```typescript
interface NotificationHistoryResponse {
  data: Notification[];
}

const mockNotifications = [
  {
    id: 'notif-123',
    title: 'Yeni Mesaj',
    body: 'Ali Veli size mesaj gönderdi',
    category: 'message',
    createdAt: '2025-09-11T10:00:00Z',
    read: false,
    data: { messageId: 'msg-123' },
  },
  // ...
];
```

#### GET /api/v1/pwa/manifest

```typescript
interface PWAManifestResponse {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: string;
  background_color: string;
  theme_color: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
  }>;
}

const mockManifest = {
  name: 'Marifet Bul',
  short_name: 'Marifet',
  description: 'Freelancer & İşveren Marketplace',
  start_url: '/',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#3b82f6',
  icons: [
    {
      src: '/icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: '/icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
    },
  ],
};
```

### MSW Handler Implementation

```typescript
// lib/msw/handlers/mobile-pwa.ts
export const mobilePWAHandlers = [
  http.post('/api/v1/notifications/subscribe', ({ request }) => {
    return HttpResponse.json(mockSubscribeResponse);
  }),
  http.post('/api/v1/notifications/send', ({ request }) => {
    return HttpResponse.json(mockSendResponse);
  }),
  http.get('/api/v1/notifications/history', () => {
    return HttpResponse.json({ data: mockNotifications });
  }),
  http.get('/api/v1/pwa/manifest', () => {
    return HttpResponse.json(mockManifest);
  }),
];
```

## 💻 Teknik Implementation

### State Management (Zustand)

```typescript
interface MobileStore {
  isBottomNavVisible: boolean;
  currentTab: string;
  isDrawerOpen: boolean;
  isPullToRefreshing: boolean;
  setBottomNavVisible: (visible: boolean) => void;
  setCurrentTab: (tab: string) => void;
  toggleDrawer: () => void;
  setPullToRefreshing: (refreshing: boolean) => void;
}

interface PWAStore {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  installPromptEvent: any;
  showInstallPrompt: () => void;
  setOnlineStatus: (online: boolean) => void;
}

interface NotificationStore {
  isSupported: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  notifications: Notification[];
  requestPermission: () => Promise<void>;
  subscribe: () => Promise<void>;
  sendNotification: (data: SendNotificationRequest) => Promise<void>;
  fetchNotifications: () => Promise<void>;
}
```

### Custom Hooks

```typescript
// hooks/useMobile.ts
export function useMobile() {
  // Mobile detection, viewport, orientation
}

// hooks/usePWA.ts
export function usePWA() {
  // PWA installation, offline detection
}

// hooks/usePushNotifications.ts
export function usePushNotifications() {
  // Push notification permission, subscription
}

// hooks/usePullToRefresh.ts
export function usePullToRefresh(onRefresh: () => void) {
  // Pull-to-refresh gesture
}

// hooks/useGestures.ts
export function useGestures() {
  // Touch gestures (swipe, pinch)
}
```

### PWA Configuration

```typescript
// public/sw.js (Service Worker)
const CACHE_NAME = 'marifet-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/marketplace',
  '/static/css/main.css',
  '/static/js/main.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    badge: '/icons/badge-72x72.png',
    icon: '/icons/icon-192x192.png',
  };

  event.waitUntil(self.registration.showNotification('Marifet Bul', options));
});
```

### Component Structure

```typescript
// components/mobile/BottomNavigation.tsx
interface BottomNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({
  currentTab,
  onTabChange,
}: BottomNavigationProps) {
  // Implementation
}

// components/features/PWAManager.tsx
export function PWAManager() {
  // PWA install prompt management
}
```

## 🚀 Sprint Deliverables

### Functional Deliverables

- [ ] Mobile-first responsive design implemented
- [ ] Bottom navigation ve mobile drawer
- [ ] PWA manifest ve service worker configured
- [ ] Push notification sistemi working
- [ ] Pull-to-refresh ve touch gestures
- [ ] Offline mode ve basic caching
- [ ] Mobile performance optimizations

### Technical Deliverables

- [ ] MobileStore, PWAStore, NotificationStore
- [ ] useMobile, usePWA, usePushNotifications hooks
- [ ] Service worker implementation
- [ ] PWA manifest configuration
- [ ] Touch gesture handlers
- [ ] Mobile-specific components

### Quality Deliverables

- [ ] Mobile accessibility (touch targets, voice over)
- [ ] Cross-device compatibility
- [ ] Performance optimized (<3s load on 3G)
- [ ] PWA audit score >90
- [ ] Touch interaction testing

## ✅ Test Scenarios

### Mobile User Journey Tests

- **Installation Journey**:
  1. Mobile browser → Install prompt → App install → Native experience
  2. Offline browsing → Online sync

- **Notification Journey**:
  1. Permission request → Grant → Receive notification → Tap action
  2. Notification settings → Category toggle

- **Navigation Journey**:
  1. Bottom nav → Tab switching → Drawer menu
  2. Pull-to-refresh → Content update
  3. Swipe gestures → Card navigation

### Edge Cases

- **Network issues**: Offline mode, slow connection, connection loss
- **Permission denial**: Notification blocked, location denied
- **Device limitations**: Low memory, old browser, touch issues
- **Installation issues**: Already installed, unsupported browser

### Performance Tests

- Page load time <3s on 3G
- Touch response time <100ms
- Animation frame rate 60fps
- Memory usage <50MB

## 🔍 Kabul Kriterleri

### Functional Acceptance

- [ ] Mobile navigation smooth ve intuitive
- [ ] PWA install working on all supported browsers
- [ ] Push notifications delivered reliably
- [ ] Offline mode basic functionality sağlıyor
- [ ] Touch gestures natural ve responsive

### Design Acceptance

- [ ] Mobile-first design consistent
- [ ] Touch targets minimum 44px
- [ ] Animations smooth (60fps)
- [ ] Loading states user-friendly

### Technical Acceptance

- [ ] PWA audit score >90
- [ ] Performance budget karşılandı
- [ ] Service worker düzgün çalışıyor
- [ ] Console error/warning yok
- [ ] Cross-browser mobile compatibility

## 📊 Definition of Done

- [ ] Tüm mobile özellikler implemented
- [ ] PWA requirements karşılandı
- [ ] Push notification system tested
- [ ] Performance targets achieved
- [ ] Mobile accessibility audit passed
- [ ] Cross-device testing completed
