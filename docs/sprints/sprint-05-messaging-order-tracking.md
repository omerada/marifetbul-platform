# Sprint 5: Gerçek Zamanlı Mesajlaşma & Sipariş Takip Sistemi - 2 hafta

## 🎯 Sprint Hedefleri

- WebSocket tabanlı gerçek zamanlı mesajlaşma altyapısı
- Employer ve freelancer arasında birebir sohbet ekranı
- Sipariş (order) takip ve yönetim ekranları
- Dosya paylaşımı, okundu bilgisi, yazıyor göstergesi
- Mesaj arama ve arşivleme özellikleri
- Sipariş detayında teslimat, revizyon, onay akışları

## 📱 Geliştirilecek Ekranlar

### Mesajlaşma Ana Ekranı

**Rol**: Both  
**Özellikler**:

- Sohbet listesi (son konuşmalar, okunmamış mesajlar)
- Arama çubuğu ile mesaj/kişi arama
- Yeni sohbet başlatma
- Responsive (mobile, tablet, desktop)

### Sohbet Detay Ekranı

**Rol**: Both
**Özellikler**:

- Gerçek zamanlı mesaj gönderme/alma (WebSocket)
- Dosya ve görsel paylaşımı
- Yazıyor göstergesi, okundu bilgisi
- Mesaj silme, arşivleme
- Mesaj arama (anahtar kelime ile)
- Kullanıcı profiline hızlı erişim
- Siparişe bağlanmış sohbetler için sipariş durumu gösterimi

### Sipariş Takip Ekranı

**Rol**: Both
**Özellikler**:

- Sipariş detayları (paket, iş, fiyat, teslimat tarihi)
- Teslimat dosyası yükleme/indirme
- Revizyon talebi, teslim onayı
- Sipariş durumu timeline (açık, teslim edildi, revizyonda, tamamlandı)
- Mesajlaşmaya hızlı geçiş
- Ödeme durumu ve fatura görüntüleme

## 🎨 UI/UX Tasarım Gereksinimleri

### Component'lar

- **Yeni Component'lar**:
  - `MessagesList` - Sohbet listesi
  - `ChatWindow` - Aktif sohbet ekranı
  - `MessageBubble` - Mesaj balonları
  - `TypingIndicator` - Yazıyor göstergesi
  - `FileAttachment` - Dosya paylaşım alanı
  - `OrderTimeline` - Sipariş durum akışı
  - `OrderDetailCard` - Sipariş özet kartı
  - `SearchBar` - Mesaj arama
  - `ArchiveButton` - Sohbet arşivleme

- **Güncellenecek Component'lar**:
  - `Avatar`, `Badge`, `Button` (mesajlaşma için varyantlar)
  - `Modal`, `Dialog` (dosya önizleme, silme onayı)

- **UI Library Integration**:
  - `ScrollArea`, `Tooltip`, `Sheet` (Shadcn/ui)
  - `Progress`, `Tabs`, `Accordion`

### User Flow

- **Freelancer Flow**: Dashboard → Mesajlar → Sipariş Sohbeti → Dosya Gönder → Teslimat → Onay
- **Employer Flow**: Dashboard → Mesajlar → Sipariş Sohbeti → Revizyon Talebi → Onay → Ödeme

### States & Interactions

- **Loading States**: Mesaj yükleme, dosya gönderme
- **Error Handling**: Bağlantı kopması, dosya yükleme hatası
- **Empty States**: Hiç mesaj yok, arama sonucu yok
- **Success States**: Mesaj gönderildi, dosya yüklendi
- **Interactive Elements**: Dosya önizleme, mesaj silme, arşivleme

### Accessibility

- ARIA labels for chat inputs
- Keyboard navigation for message list
- Screen reader support for chat bubbles
- Focus management on new message

## ⚙️ Fonksiyonel Özellikler

### Real-time Messaging System

**Açıklama**: WebSocket ile gerçek zamanlı birebir mesajlaşma
**Employer Perspective**: Freelancer ile sipariş bazlı iletişim
**Freelancer Perspective**: Employer ile proje detaylarını konuşma
**Acceptance Criteria**:

- [ ] Mesajlar anlık iletiliyor ve okunma bilgisi güncelleniyor
- [ ] Dosya/görsel paylaşımı sorunsuz
- [ ] Yazıyor ve çevrim içi göstergeleri çalışıyor
- [ ] Sohbet arşivleme ve silme fonksiyonel
- [ ] Mesaj arama hızlı ve doğru sonuç veriyor

### Order Tracking System

**Açıklama**: Siparişlerin adım adım takibi ve yönetimi
**Employer Perspective**: Sipariş durumu, teslimat, revizyon, ödeme
**Freelancer Perspective**: Teslimat yükleme, revizyon yanıtı, onay bekleme
**Acceptance Criteria**:

- [ ] Sipariş detayları eksiksiz gösteriliyor
- [ ] Teslimat dosyası yükleme/indirme çalışıyor
- [ ] Revizyon ve onay akışı sorunsuz
- [ ] Sipariş timeline ve status badge'leri doğru
- [ ] Ödeme ve fatura bilgisi erişilebilir

## 🔌 Mock API Servisleri

### Endpoint Pattern: `/api/v1/messages`, `/api/v1/orders`

#### GET /api/v1/messages

```typescript
interface GetMessagesRequest {
  conversationId: string;
  page?: number;
  pageSize?: number;
}

interface GetMessagesResponse {
  data: Message[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const mockMessages = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-1',
    receiverId: 'user-2',
    content: 'Merhaba, projenizle ilgileniyorum!',
    type: 'text',
    sentAt: '2025-09-10T10:00:00Z',
    readAt: '2025-09-10T10:01:00Z',
    attachments: [],
  },
  // ...
];
```

#### POST /api/v1/messages

```typescript
interface SendMessageRequest {
  conversationId: string;
  content: string;
  type: 'text' | 'file' | 'image';
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
}

interface SendMessageResponse {
  success: boolean;
  data?: Message;
  error?: string;
}

const mockSendMessageResponse = {
  success: true,
  data: {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'user-1',
    receiverId: 'user-2',
    content: 'Dosyayı ekledim.',
    type: 'file',
    sentAt: new Date().toISOString(),
    readAt: null,
    attachments: [
      {
        name: 'teklif.pdf',
        url: '/uploads/messages/teklif.pdf',
        type: 'application/pdf',
      },
    ],
  },
};
```

#### GET /api/v1/orders/:id

```typescript
interface GetOrderDetailResponse {
  success: boolean;
  data?: {
    id: string;
    packageId: string;
    jobId?: string;
    buyerId: string;
    sellerId: string;
    status: 'open' | 'delivered' | 'revision' | 'completed' | 'cancelled';
    price: number;
    deliveryDate: string;
    files: {
      id: string;
      name: string;
      url: string;
      type: string;
      uploadedAt: string;
    }[];
    timeline: {
      status: string;
      date: string;
      description: string;
    }[];
    messages: Message[];
    invoiceUrl: string;
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
}

const mockOrderDetail = {
  id: 'order-123',
  packageId: 'pkg-789',
  buyerId: 'user-1',
  sellerId: 'user-2',
  status: 'delivered',
  price: 1200,
  deliveryDate: '2025-09-20T00:00:00Z',
  files: [
    {
      id: 'file-1',
      name: 'teslimat.zip',
      url: '/uploads/orders/teslimat.zip',
      type: 'application/zip',
      uploadedAt: '2025-09-18T12:00:00Z',
    },
  ],
  timeline: [
    {
      status: 'open',
      date: '2025-09-10T10:00:00Z',
      description: 'Sipariş oluşturuldu',
    },
    {
      status: 'delivered',
      date: '2025-09-18T12:00:00Z',
      description: 'Teslimat yapıldı',
    },
  ],
  messages: mockMessages,
  invoiceUrl: '/invoices/order-123.pdf',
  createdAt: '2025-09-10T10:00:00Z',
  updatedAt: '2025-09-18T12:00:00Z',
};
```

### MSW Handler Implementation

```typescript
// lib/msw/handlers/messaging.ts
export const messagingHandlers = [
  http.get('/api/v1/messages', ({ request }) => {
    // Query parse, pagination logic
    return HttpResponse.json({ data: mockMessages, pagination: { ... } });
  }),
  http.post('/api/v1/messages', ({ request }) => {
    // Message send logic
    return HttpResponse.json(mockSendMessageResponse);
  }),
  http.get('/api/v1/orders/:id', ({ params }) => {
    // Order detail logic
    return HttpResponse.json({ success: true, data: mockOrderDetail });
  }),
];
```

## 💻 Teknik Implementation

### State Management (Zustand)

```typescript
interface MessagingStore {
  conversations: Conversation[];
  messages: Message[];
  activeConversationId: string | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (data: SendMessageRequest) => Promise<void>;
  setActiveConversation: (id: string) => void;
  archiveConversation: (id: string) => Promise<void>;
  clearError: () => void;
}

interface OrderStore {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  fetchOrderDetail: (orderId: string) => Promise<void>;
  uploadDelivery: (orderId: string, file: File) => Promise<void>;
  requestRevision: (orderId: string, message: string) => Promise<void>;
  approveDelivery: (orderId: string) => Promise<void>;
  clearError: () => void;
}
```

### Custom Hooks

```typescript
// hooks/useMessaging.ts
export function useMessaging() {
  // State, fetch, send, archive logic
}

// hooks/useOrder.ts
export function useOrder(orderId: string) {
  // State, fetch, delivery, revision, approve logic
}
```

### Form Validation (Zod)

```typescript
// lib/validations/messaging.ts
export const messageSchema = z.object({
  conversationId: z.string().min(1, 'Sohbet ID gereklidir'),
  content: z.string().min(1, 'Mesaj boş olamaz').max(2000, 'Mesaj çok uzun'),
  type: z.enum(['text', 'file', 'image']),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url(),
        type: z.string(),
      })
    )
    .optional(),
});

export type MessageFormData = z.infer<typeof messageSchema>;
```

### Component Structure

```typescript
// components/messaging/ChatWindow.tsx
interface ChatWindowProps {
  conversationId: string;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const { messages, sendMessage, isSending, error } = useMessaging();
  // ...
}
```

## 🚀 Sprint Deliverables

### Functional Deliverables

- [ ] Gerçek zamanlı mesajlaşma sistemi (WebSocket) implemented
- [ ] Sohbet listesi ve detay ekranı responsive
- [ ] Dosya/görsel paylaşımı ve preview
- [ ] Sipariş takip ekranı ve timeline
- [ ] Revizyon ve teslimat akışı
- [ ] Mesaj arama ve arşivleme

### Technical Deliverables

- [ ] MessagingStore ve OrderStore Zustand stores
- [ ] useMessaging, useOrder custom hooks
- [ ] TypeScript types ve Zod şemaları
- [ ] MSW handlers for messaging/order endpoints
- [ ] Unit tests for chat/order components
- [ ] Integration tests for messaging flows

### Quality Deliverables

- [ ] Accessibility (WCAG 2.1 AA) for chat/order screens
- [ ] Cross-browser compatibility
- [ ] Performance optimized (chat latency <300ms)
- [ ] Code review completed
- [ ] Documentation updated

## ✅ Test Scenarios

### User Journey Tests

- **Freelancer Journey**:
  1. Dashboard → Mesajlar → Sipariş Sohbeti → Dosya Gönder → Teslimat → Onay
  2. Mesaj arama → Eski konuşma bulma
  3. Sipariş detayında revizyon talebi

- **Employer Journey**:
  1. Dashboard → Mesajlar → Sipariş Sohbeti → Revizyon Talebi → Onay → Ödeme
  2. Mesaj arama → Sohbet arşivleme
  3. Sipariş detayında teslimat onayı

### Edge Cases

- **Bağlantı kopması**: Otomatik yeniden bağlanma, uyarı gösterimi
- **Büyük dosya gönderimi**: Progress bar, dosya boyut limiti
- **Çoklu cihazdan giriş**: Mesaj senkronizasyonu
- **Arşivlenmiş sohbet**: Geri alma, silme işlemleri
- **Yanlışlıkla silinen mesaj**: Geri alma opsiyonu

### Performance Tests

- Mesaj gönderme/görünme gecikmesi <300ms
- Dosya yükleme süresi <10s (5MB dosya)
- Sipariş detay yüklenme süresi <1.5s

## 🔍 Kabul Kriterleri

### Functional Acceptance

- [ ] Mesajlar anlık ve doğru iletiliyor
- [ ] Dosya/görsel paylaşımı sorunsuz
- [ ] Sipariş durumu ve timeline eksiksiz
- [ ] Revizyon ve teslimat akışı problemsiz
- [ ] Mesaj arama ve arşivleme fonksiyonel

### Design Acceptance

- [ ] Chat ve order ekranları responsive
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
