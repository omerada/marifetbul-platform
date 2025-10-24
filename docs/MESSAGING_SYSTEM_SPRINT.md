# Messaging System - Production-Ready Sprint Documentation

**Sprint:** Real-Time Messaging System Complete Implementation  
**Duration:** 3 Weeks (15 Working Days)  
**Priority:** High  
**Created:** October 24, 2025  
**Status:** Planning

---

## Executive Summary

Bu sprint, Marifet platformundaki messaging (mesajlaşma) sisteminin production-ready hale getirilmesini hedeflemektedir. Backend'de temel yapı mevcut ancak frontend tamamen stub/placeholder durumunda. WebSocket entegrasyonu mevcut fakat messaging için kullanılmamış. Bu sprint'te tam bir real-time mesajlaşma sistemi oluşturulacak.

### Mevcut Durum Analizi

#### ✅ Mevcut Özellikler (Backend)

**Database & Entities:**

- ✅ Message entity (full-featured, soft delete support)
- ✅ Conversation entity (two-user conversations)
- ✅ MessageType enum (TEXT, ATTACHMENT, SYSTEM)
- ✅ Soft delete mechanism (sender & recipient independent)
- ✅ Indexes and optimizations
- ✅ Related entity support (JOB, PROPOSAL linkage)

**Services:**

- ✅ MessageService (CRUD, send, read, delete, search)
- ✅ ConversationService (conversation management)
- ✅ Rate limiting (50 messages/minute)
- ✅ Message validation
- ✅ Attachment metadata support
- ✅ System message support

**Controllers:**

- ✅ MessageController (authenticated endpoints)
- ✅ ConversationController (conversation management)

**Features:**

- ✅ Send/receive text messages
- ✅ Mark messages as read
- ✅ Unread message count
- ✅ Search messages
- ✅ Soft delete (per user)
- ✅ Message attachments metadata
- ✅ Related entity linkage
- ✅ Rate limiting

**WebSocket Infrastructure:**

- ✅ STOMP over WebSocket configured
- ✅ JWT authentication for WebSocket
- ✅ WebSocketService with sendChatMessage()
- ✅ WebSocketController with message handlers
- ✅ TypingIndicatorMessage DTO
- ✅ ChatMessageDTO structure
- ✅ Connection lifecycle management

#### ❌ Eksik Özellikler

**Backend:**

- ❌ File upload & attachment storage implementation
- ❌ Image compression and optimization
- ❌ Typing indicator backend handler
- ❌ Message delivery status tracking
- ❌ Message edit capability
- ❌ Message reactions (emoji reactions)
- ❌ Voice message support
- ❌ Bulk message operations
- ❌ Message export/archive
- ❌ Spam/abuse detection
- ❌ Conversation mute/unmute
- ❌ Message forwarding

**Frontend:**

- ❌ ChatInterface component is incomplete (placeholder UI only)
- ❌ MessagesList component is stub (shows "under development" message)
- ❌ Real-time message receiving (WebSocket integration)
- ❌ Typing indicators UI
- ❌ File upload UI and handling
- ❌ Image preview and gallery
- ❌ Audio player for voice messages
- ❌ Message reactions UI
- ❌ Message edit UI
- ❌ Search UI in conversations
- ❌ Conversation filtering
- ❌ Unread badge display
- ❌ Push notifications on new messages
- ❌ Mobile responsive optimizations
- ❌ Emoji picker
- ❌ Message formatting (markdown support)

**Hooks & State Management:**

- ❌ useConversation hook (referenced but not implemented)
- ❌ useMessages hook (referenced but not implemented)
- ❌ useMessaging hook (referenced but not implemented)
- ❌ useMessageStore integration
- ❌ Real-time message sync
- ❌ Optimistic UI updates

**User Experience:**

- ❌ Notification on new message
- ❌ Sound notifications
- ❌ Message delivery indicators (sent, delivered, read)
- ❌ Online/offline user status in chat
- ❌ Last seen timestamp
- ❌ Message timestamps (grouping by day)
- ❌ "Jump to latest" button
- ❌ Message reply/quote functionality
- ❌ Conversation archive
- ❌ Message report/block functionality

---

## Sprint Goals

### Primary Goals

1. **Complete Frontend Implementation** - ChatInterface ve MessagesList component'lerini tam özellikli hale getirme
2. **WebSocket Real-Time Integration** - Mesajların gerçek zamanlı alınması ve gönderilmesi
3. **File Upload System** - Dosya ve resim yükleme altyapısının oluşturulması
4. **Hooks & State Management** - useConversation, useMessages, useMessaging hooks'larının implementasyonu
5. **Typing Indicators** - Yazıyor göstergesinin backend ve frontend entegrasyonu
6. **Context-Based Messaging** - Order, Job, Proposal, Package detay sayfalarından mesaj başlatma
7. **Role-Based Access Control** - Freelancer, Employer, Admin için mesajlaşma yetkilendirmeleri

### Secondary Goals

8. **Message Status Indicators** - Gönderildi, okundu göstergeleri
9. **Online Status** - Kullanıcı online/offline durumu gösterimi
10. **Notification System** - Yeni mesaj bildirimleri
11. **Quick Message Actions** - Dashboard'lardan hızlı mesaj gönderme
12. **Mobile Optimization** - Mobil cihazlarda sorunsuz çalışma
13. **Testing & QA** - Comprehensive testing ve bug fixes

---

## Application-Wide Messaging Integration Analysis

### Role-Based Panels & Screens

#### 🔵 **Freelancer Panel** (`/dashboard/freelancer`)

**Current Screens:**

- Dashboard Overview (`/dashboard/freelancer`)
- Orders Management (`/dashboard/freelancer/orders`)
- Packages Management (`/dashboard/freelancer/packages`)
- Proposals Sent (`/dashboard/freelancer/proposals`)
- Analytics (`/dashboard/freelancer/analytics`)
- Reviews (`/dashboard/freelancer/reviews`)

**Messaging Integration Points:**

1. **Orders Page** - ⚠️ Missing
   - "Message Buyer" button for each order
   - Quick message for requirements clarification
   - Message thread link in order detail
   - Context: Order ID, Order Number

2. **Proposals Page** - ⚠️ Missing
   - "Message Employer" button next to each proposal
   - Quick follow-up after proposal submission
   - Context: Job ID, Proposal ID

3. **Dashboard Overview** - ⚠️ Missing
   - Unread messages widget
   - Recent conversations preview
   - Quick reply from dashboard

4. **Reviews Page** - ⚠️ Missing
   - Message reviewer option
   - Context-aware messaging

#### 🟢 **Employer Panel** (`/dashboard/employer`)

**Current Screens:**

- Dashboard Overview (`/dashboard/employer`)
- Jobs Posted (`/dashboard/employer/jobs`)
- Orders Management (`/dashboard/employer/orders`)
- Proposals Received (`/dashboard/employer/proposals`)
- Freelancers List (`/dashboard/employer/freelancers`)
- Reviews (`/dashboard/employer/reviews`)

**Messaging Integration Points:**

1. **Proposals Page** - ✅ Partially Implemented
   - Current: `router.push(\`/messages?userId=\${freelancerId}\`)`
   - Missing: Actual conversation creation
   - Missing: Context passing (Job ID, Proposal ID)
   - Missing: Pre-filled message template

2. **Orders Page** - ⚠️ Missing
   - "Message Freelancer" button
   - Order status discussion
   - Revision requests via messages

3. **Jobs Page** - ⚠️ Missing
   - Message applicants (freelancers who proposed)
   - Bulk message to all applicants
   - Job clarification messages

4. **Freelancers List** - ⚠️ Missing
   - Direct message to freelancers
   - Invitation messages
   - Network building

#### 🔴 **Admin Panel** (`/admin`)

**Current Screens:**

- Dashboard (`/admin`)
- User Management (`/admin/users`)
- Blog Management (`/admin/blog`)
- Analytics (`/admin/analytics`)
- Moderation (`/admin/moderation`)
- Settings (`/admin/settings`)

**Messaging Integration Points:**

1. **User Management** - ⚠️ Missing
   - Message users directly (support/admin messages)
   - Send announcements
   - Dispute resolution messaging

2. **Moderation** - ⚠️ Missing
   - Message senders of flagged messages
   - Moderation notifications
   - Warning messages

3. **Dispute Resolution** - ⚠️ Missing
   - Three-way messaging (buyer, seller, admin)
   - Case discussion threads
   - Evidence submission via messages

### Context-Aware Messaging Flows

#### Flow 1: Job → Proposal → Message

```
User sees Job Detail
    ↓
User sends Proposal
    ↓
Employer receives Proposal
    ↓
Employer clicks "Message" on Proposal
    ↓
System creates Conversation with context:
  - jobId: UUID
  - proposalId: UUID
  - relatedEntityType: "PROPOSAL"
    ↓
System pre-fills first message template
    ↓
Employer sends message
    ↓
Freelancer receives notification
    ↓
Real-time conversation begins
```

#### Flow 2: Package → Order → Message

```
Buyer purchases Package
    ↓
Order created (PENDING_REQUIREMENTS)
    ↓
Seller needs requirements from Buyer
    ↓
Seller clicks "Request Requirements" (auto-creates message)
    ↓
System creates Conversation with context:
  - orderId: UUID
  - packageId: UUID
  - relatedEntityType: "ORDER"
    ↓
Pre-filled message: "Please provide requirements for: [Package Name]"
    ↓
Buyer responds with requirements
    ↓
Seller starts work
```

#### Flow 3: Order → Revision → Message

```
Freelancer delivers work
    ↓
Buyer reviews delivery
    ↓
Buyer clicks "Request Revision"
    ↓
System adds message to existing Order conversation:
  - orderRevision: true
  - revisionNumber: 1
    ↓
Pre-filled message template with revision form
    ↓
Freelancer receives revision request
    ↓
Discussion in message thread
    ↓
Freelancer submits revision
```

#### Flow 4: Review → Response → Message (Optional)

```
Buyer leaves Review
    ↓
Freelancer sees review
    ↓
Freelancer adds public response to review
    ↓
(Optional) Freelancer clicks "Discuss Privately"
    ↓
System creates/opens Conversation
    ↓
Context: reviewId, can reference review in message
```

### Messaging Entry Points Map

| Screen/Page                         | Entry Point          | Context Data                | Status |
| ----------------------------------- | -------------------- | --------------------------- | ------ |
| `/marketplace/jobs/[id]`            | "Contact Poster"     | jobId                       | ❌     |
| `/marketplace/packages/[id]`        | "Message Seller"     | packageId                   | ❌     |
| `/dashboard/employer/proposals`     | "Message" button     | jobId, proposalId           | ⚠️     |
| `/dashboard/employer/orders/[id]`   | "Message Freelancer" | orderId                     | ❌     |
| `/dashboard/freelancer/orders/[id]` | "Message Buyer"      | orderId                     | ❌     |
| `/dashboard/freelancer/proposals`   | "Message Employer"   | jobId, proposalId           | ❌     |
| `/profile/[id]`                     | "Send Message"       | userId                      | ❌     |
| `/dashboard/employer/freelancers`   | "Message" button     | userId                      | ❌     |
| `/admin/users/[id]`                 | "Send Admin Message" | userId, isAdminMessage:true | ❌     |
| `/dashboard/*/reviews`              | "Discuss Privately"  | reviewId                    | ❌     |

### Required Backend Enhancements

#### New Endpoints Needed

```java
// Context-aware conversation creation
POST /api/v1/conversations/create-with-context
Body: {
  recipientId: UUID,
  relatedEntityType: "JOB" | "ORDER" | "PROPOSAL" | "PACKAGE" | "REVIEW",
  relatedEntityId: UUID,
  initialMessage?: string
}

// Get conversation by context
GET /api/v1/conversations/by-context
Query: {
  userId1: UUID,
  userId2: UUID,
  relatedEntityType?: string,
  relatedEntityId?: UUID
}

// Quick message templates
GET /api/v1/messages/templates
Query: {
  context: "ORDER_REQUIREMENTS" | "REVISION_REQUEST" | "PROPOSAL_FOLLOWUP"
}
```

#### ConversationService Enhancements

```java
public class ConversationService {

    /**
     * Create or get conversation with business context
     */
    @Transactional
    public ConversationResponse createConversationWithContext(
        UUID user1Id,
        UUID user2Id,
        String relatedEntityType,
        UUID relatedEntityId,
        String initialMessage
    ) {
        // Check if conversation exists for this context
        Optional<Conversation> existing = conversationRepository
            .findByParticipantsAndContext(user1Id, user2Id, relatedEntityType, relatedEntityId);

        if (existing.isPresent()) {
            return mapper.toResponse(existing.get());
        }

        // Create new conversation
        Conversation conversation = Conversation.builder()
            .user1(userRepository.findById(user1Id).orElseThrow())
            .user2(userRepository.findById(user2Id).orElseThrow())
            .relatedEntityType(relatedEntityType)
            .relatedEntityId(relatedEntityId)
            .build();

        conversation = conversationRepository.save(conversation);

        // Send initial message if provided
        if (initialMessage != null && !initialMessage.isBlank()) {
            messageService.sendMessage(user1Id, CreateMessageRequest.builder()
                .recipientId(user2Id)
                .content(initialMessage)
                .relatedEntityType(relatedEntityType)
                .relatedEntityId(relatedEntityId)
                .build());
        }

        return mapper.toResponse(conversation);
    }
}
```

#### Database Schema Updates Needed

```sql
-- Add context fields to conversations table
ALTER TABLE conversations
ADD COLUMN related_entity_type VARCHAR(50),
ADD COLUMN related_entity_id UUID;

-- Add index for context-based lookups
CREATE INDEX idx_conversations_context
ON conversations(user1_id, user2_id, related_entity_type, related_entity_id);

-- Add message templates table
CREATE TABLE message_templates (
  id UUID PRIMARY KEY,
  template_key VARCHAR(100) NOT NULL UNIQUE,
  template_name VARCHAR(200) NOT NULL,
  content_template TEXT NOT NULL,
  variables JSONB, -- List of variables that can be replaced
  context_type VARCHAR(50), -- ORDER, JOB, PROPOSAL, etc.
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Sample templates
INSERT INTO message_templates (id, template_key, template_name, content_template, variables, context_type) VALUES
(gen_random_uuid(), 'ORDER_REQUIREMENTS', 'Request Order Requirements',
 'Hi {{buyerName}},\n\nI''ve started working on your order "{{orderTitle}}".\n\nCould you please provide the following requirements:\n\n1. \n2. \n3. \n\nLooking forward to delivering great work!\n\nBest regards,\n{{sellerName}}',
 '["buyerName", "orderTitle", "sellerName"]', 'ORDER'),

(gen_random_uuid(), 'REVISION_REQUEST', 'Request Revision',
 'Hi {{sellerName}},\n\nThank you for the delivery on order "{{orderTitle}}".\n\nI would like to request the following revisions:\n\n1. \n2. \n\nPlease let me know if you have any questions.\n\nBest regards,\n{{buyerName}}',
 '["sellerName", "orderTitle", "buyerName"]', 'ORDER'),

(gen_random_uuid(), 'PROPOSAL_FOLLOWUP', 'Proposal Follow-up',
 'Hi {{employerName}},\n\nI submitted a proposal for your job "{{jobTitle}}".\n\nI''d love to discuss how I can help you achieve your goals. Do you have any questions about my proposal?\n\nBest regards,\n{{freelancerName}}',
 '["employerName", "jobTitle", "freelancerName"]', 'PROPOSAL');
```

### Frontend Component Requirements

#### New Components Needed

```typescript
// Context-aware message button
<MessageButton
  recipientId={freelancerId}
  context={{
    type: 'ORDER',
    id: orderId,
    title: orderTitle
  }}
  variant="primary"
  label="Message Freelancer"
/>

// Quick message modal
<QuickMessageModal
  isOpen={isOpen}
  onClose={onClose}
  recipientId={recipientId}
  context={messageContext}
  templates={availableTemplates}
  onSend={handleSend}
/>

// Message thread sidebar (for detail pages)
<MessageThreadSidebar
  conversationId={conversationId}
  orderId={orderId}
  minimized={true}
  position="right"
/>

// Unread messages badge
<UnreadMessagesBadge
  count={unreadCount}
  variant="notification"
/>

// Recent conversations widget (dashboard)
<RecentConversationsWidget
  userId={currentUserId}
  limit={5}
  showQuickReply={true}
/>
```

#### New Hooks Needed

```typescript
// Hook for context-aware messaging
function useContextMessage(context: MessageContext) {
  const createConversation = async (recipientId: string, initialMessage?: string) => {
    // Creates conversation with context
  };

  const getOrCreateConversation = async (recipientId: string) => {
    // Gets existing or creates new
  };

  return { createConversation, getOrCreateConversation, isLoading };
}

// Hook for message templates
function useMessageTemplates(contextType: string) {
  const { templates, isLoading } = useQuery(['templates', contextType],
    () => fetchTemplates(contextType)
  );

  const fillTemplate = (templateKey: string, variables: Record<string, string>) => {
    // Fills template with actual values
  };

  return { templates, fillTemplate, isLoading };
}

// Hook for quick messaging
function useQuickMessage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recipient, setRecipient] = useState<User | null>(null);
  const [context, setContext] = useState<MessageContext | null>(null);

  const openQuickMessage = (recipientId: string, messageContext: MessageContext) => {
    // Opens modal with pre-filled context
  };

  return { openQuickMessage, isModalOpen, closeModal };
}
```

---

## User Stories

### Epic 1: Context-Aware Messaging

#### US-1.1: Employer olarak proposal sayfasından freelancer'a mesaj göndermek istiyorum

**Priority:** P0 (Must Have)

**Acceptance Criteria:**

- [ ] Proposal card'da "Mesaj Gönder" butonu görünür
- [ ] Butona tıklayınca QuickMessageModal açılır
- [ ] Modal'da freelancer bilgisi ve proposal context'i gösterilir
- [ ] Template seçebilirim (Proposal Follow-up, Custom)
- [ ] Template değişkenleri otomatik doldurulur (freelancerName, jobTitle)
- [ ] Mesaj gönderilince conversation açılır veya oluşturulur
- [ ] Mesaj gönderimi başarılı olduğunda toast notification gösterilir
- [ ] Conversation'a yönlendirebilirim (optional)

**Technical Tasks:**

- [ ] MessageButton component (context-aware)
- [ ] QuickMessageModal component
- [ ] POST /api/v1/conversations/create-with-context endpoint
- [ ] useContextMessage hook
- [ ] useMessageTemplates hook
- [ ] Template variable replacement logic
- [ ] Navigation to conversation after send

---

#### US-1.2: Freelancer olarak order sayfasından buyer'a requirement mesajı göndermek istiyorum

**Priority:** P0 (Must Have)

**Acceptance Criteria:**

- [ ] Order detail sayfasında "İhtiyaçları İste" butonu var
- [ ] Butona tıklayınca pre-filled template modal açılır
- [ ] Template: "Order Requirements" otomatik seçili
- [ ] Order bilgileri (title, deadline) template'e otomatik eklenir
- [ ] Custom requirement listesi ekleyebilirim
- [ ] Mesaj gönderilince order status'e not düşer
- [ ] Buyer'a notification gider

**Technical Tasks:**

- [ ] Order detail page'e MessageButton integration
- [ ] "ORDER_REQUIREMENTS" template implementation
- [ ] Context data passing (orderId, orderTitle, orderNumber)
- [ ] Notification trigger on requirement request
- [ ] Order timeline event (requirement requested)

---

#### US-1.3: Buyer olarak order revision request için mesaj göndermek istiyorum

**Priority:** P0 (Must Have)

**Acceptance Criteria:**

- [ ] Order teslim alındığında "Revizyon İste" butonu aktif
- [ ] Butona tıklayınca revision form + message modal açılır
- [ ] Revizyon detaylarını form ile girebilirim
- [ ] Mesaj template'i revizyon bilgileriyle doldurulur
- [ ] Freelancer mesaj + notification alır
- [ ] Order status REVISION_REQUESTED olur
- [ ] Revision count artar

**Technical Tasks:**

- [ ] RevisionRequestModal component
- [ ] "REVISION_REQUEST" template
- [ ] PUT /api/v1/orders/{id}/request-revision endpoint integration
- [ ] Order status update logic
- [ ] Revision tracking system

---

#### US-1.4: Admin olarak dispute cases için three-way messaging başlatmak istiyorum

**Priority:** P1 (Should Have)

**Acceptance Criteria:**

- [ ] Admin dispute case detail'da "Start Mediation Chat" butonu var
- [ ] Butona tıklayınca üç taraflı conversation oluşturulur (buyer, seller, admin)
- [ ] İlk mesaj otomatik gönderilir: "Admin mediation started"
- [ ] Her iki taraf da admin mesajlarını görür
- [ ] Admin tüm mesajları görebilir ve moderasyon yapabilir
- [ ] Case resolved olduğunda conversation arşivlenir

**Technical Tasks:**

- [ ] Multi-party conversation support (3+ users)
- [ ] Admin-only message type
- [ ] DisputeMediationChat component
- [ ] POST /api/v1/admin/disputes/{id}/start-chat endpoint
- [ ] Admin message visibility rules
- [ ] Case resolution workflow

---

### Epic 7: File Upload & Attachments

#### US-7.1: Kullanıcı olarak mesaja dosya eklemek istiyorum

**Priority:** P1 (Should Have)

**Acceptance Criteria:**

- [ ] Mesaj yazarken dosya ekle butonu var
- [ ] Drag & drop ile dosya yükleyebilirim
- [ ] Desteklenen formatlar: PDF, DOCX, ZIP, JPG, PNG (max 10MB)
- [ ] Yükleme sırasında progress bar gösterilir
- [ ] Yüklenen dosya mesaj ile birlikte gönderilir
- [ ] Dosya indirilebilir ve preview yapılabilir
- [ ] Birden fazla dosya eklenebilir (max 5)

**Technical Tasks:**

- [ ] File upload component
- [ ] POST /api/v1/messages/attachments endpoint
- [ ] S3/file storage integration
- [ ] File validation (type, size)
- [ ] Thumbnail generation (images)
- [ ] Download endpoint with auth check

---

#### US-7.2: Kullanıcı olarak gelen dosyaları güvenli şekilde indirmek istiyorum

**Priority:** P1 (Should Have)

**Acceptance Criteria:**

- [ ] Dosya ekleri mesajda görünür
- [ ] Dosya adı, boyutu, türü gösterilir
- [ ] Download butonu ile indirebilirim
- [ ] Resim dosyaları inline preview ile görünür
- [ ] PDF dosyaları tarayıcıda açılabilir
- [ ] Zararlı dosyalar engellenir (virus scan)

**Technical Tasks:**

- [ ] AttachmentPreview component
- [ ] GET /api/v1/messages/attachments/{id}/download endpoint
- [ ] Signed URL generation (temporary access)
- [ ] Virus scanning integration
- [ ] MIME type validation

---

### Epic 8: Search & Filtering

#### US-8.1: Kullanıcı olarak conversations arasında arama yapmak istiyorum

**Priority:** P1 (Should Have)

**Acceptance Criteria:**

- [ ] Conversation list üstünde search bar var
- [ ] Kullanıcı adına göre arama yapabilirim
- [ ] Mesaj içeriğine göre arama yapabilirim
- [ ] Arama sonuçları highlight edilir
- [ ] Arama debounce ile optimize edilmiş (300ms)
- [ ] Son aramalar önerisi gösterilir

**Technical Tasks:**

- [ ] ConversationSearchBar component
- [ ] GET /api/v1/conversations/search?q={query} endpoint
- [ ] Full-text search (PostgreSQL)
- [ ] Search result highlighting
- [ ] Recent searches localStorage
- [ ] Debounce implementation

---

#### US-8.2: Kullanıcı olarak message history içinde arama yapmak istiyorum

**Priority:** P2 (Nice to Have)

**Acceptance Criteria:**

- [ ] Conversation içinde search icon var
- [ ] Mesaj içeriğine göre arama yapabilirim
- [ ] Bulunan mesajlar highlight edilir
- [ ] Sonuçlar arasında geçiş yapabilirim (next/prev)
- [ ] Toplam sonuç sayısı gösterilir
- [ ] Bulunan mesaja scroll yapılır

**Technical Tasks:**

- [ ] InConversationSearch component
- [ ] Message text indexing
- [ ] Scroll to searched message
- [ ] Highlight animation

---

#### US-8.3: Kullanıcı olarak conversations'ı filter edebilmek istiyorum

**Priority:** P2 (Nice to Have)

**Acceptance Criteria:**

- [ ] Filter options:
  - [ ] Unread only
  - [ ] Archived
  - [ ] By date range
  - [ ] By user type (employer/freelancer)
  - [ ] Order-related only
- [ ] Multiple filters kombinasyonu
- [ ] Active filters chip olarak gösterilir
- [ ] "Clear all filters" butonu

**Technical Tasks:**

- [ ] ConversationFilters component
- [ ] Query parameter management
- [ ] GET /api/v1/conversations?filters={} endpoint
- [ ] Filter state management
- [ ] URL sync (shareable filtered views)

---

### Epic 9: Notification & Unread Management

#### US-9.1: Kullanıcı olarak yeni mesaj notification'ı almak istiyorum

**Priority:** P0 (Must Have)

**Acceptance Criteria:**

- [ ] Yeni mesaj geldiğinde browser notification alırım
- [ ] In-app notification toast gösterilir
- [ ] Notification'da sender adı ve mesaj preview var
- [ ] Click ile conversation'a gidilir
- [ ] Notification permission izni istenir
- [ ] Ayarlardan notifications kapatılabilir

**Technical Tasks:**

- [ ] Browser Notification API integration
- [ ] useNotification hook
- [ ] Notification permission request flow
- [ ] Toast notification component
- [ ] Notification settings in user preferences
- [ ] WebSocket new message listener

---

#### US-9.2: Kullanıcı olarak unread message count görmek istiyorum

**Priority:** P0 (Must Have)

**Acceptance Criteria:**

- [ ] Navbar'da messages icon'da unread badge var
- [ ] Total unread count gösterilir
- [ ] Conversation açıldığında unread count temizlenir
- [ ] Real-time güncellenir
- [ ] Browser tab title'da unread count gösterilir

**Technical Tasks:**

- [ ] GET /api/v1/conversations/unread-count endpoint
- [ ] Real-time count update (WebSocket)
- [ ] UnreadBadge component
- [ ] Mark as read on conversation open
- [ ] Tab title update hook

---

#### US-9.3: Kullanıcı olarak conversation'ı okundu/okunmadı işaretlemek istiyorum

**Priority:** P2 (Nice to Have)

**Acceptance Criteria:**

- [ ] Conversation context menu'de "Mark as unread" option var
- [ ] Manuel olarak okunmadı işaretleyebilirim
- [ ] Toplu işlem: "Mark all as read"
- [ ] Shortcut: CMD/CTRL + U

**Technical Tasks:**

- [ ] PUT /api/v1/conversations/{id}/mark-read endpoint
- [ ] PUT /api/v1/conversations/mark-all-read endpoint
- [ ] Context menu component
- [ ] Keyboard shortcut handler

---

### Epic 10: Message Templates & Quick Replies

#### US-10.1: Freelancer olarak sık kullanılan yanıtları template olarak kaydetmek istiyorum

**Priority:** P2 (Nice to Have)

**Acceptance Criteria:**

- [ ] Settings'te "Message Templates" section var
- [ ] Custom template oluşturabilirim
- [ ] Template kategorileri:
  - [ ] Greeting
  - [ ] Availability
  - [ ] Pricing
  - [ ] Deadline
  - [ ] Revision Policy
- [ ] Template'lerde placeholder var ({{name}}, {{job_title}})
- [ ] Template preview görünür
- [ ] Template düzenlenebilir/silinebilir

**Technical Tasks:**

- [ ] MessageTemplatesSettings component
- [ ] POST /api/v1/message-templates endpoint
- [ ] Template management CRUD
- [ ] Template variable system
- [ ] Template categories enum

---

#### US-10.2: Kullanıcı olarak mesaj yazarken template seçebilmek istiyorum

**Priority:** P2 (Nice to Have)

**Acceptance Criteria:**

- [ ] Message input'ta "/" komutu ile template menüsü açılır
- [ ] Template listesi filtrelenebilir (type to search)
- [ ] Template seçince input'a eklenir
- [ ] Placeholder'lar otomatik doldurulur
- [ ] Düzenleyebilirim gönderden önce

**Technical Tasks:**

- [ ] Slash command menu
- [ ] Template picker component
- [ ] Variable replacement logic
- [ ] Input integration

---

### Epic 11: Archive & Delete Management

#### US-11.1: Kullanıcı olarak conversation'ı arşivlemek istiyorum

**Priority:** P1 (Should Have)

**Acceptance Criteria:**

- [ ] Conversation context menu'de "Archive" option var
- [ ] Arşivlenen conversation listeden kaybolur
- [ ] "Archived" filter ile görüntülenebilir
- [ ] Unarchive yapabilir im
- [ ] Yeni mesaj gelince otomatik unarchive olur

**Technical Tasks:**

- [ ] PUT /api/v1/conversations/{id}/archive endpoint
- [ ] Archive state management
- [ ] Filter integration
- [ ] Auto-unarchive on new message

---

#### US-11.2: Kullanıcı olarak conversation'ı silebilmek istiyorum

**Priority:** P1 (Should Have)

**Acceptance Criteria:**

- [ ] Context menu'de "Delete" option var
- [ ] Confirmation modal gösterilir
- [ ] İki silme modu:
  - [ ] Delete for me (soft delete, sadece benim tarafımdan)
  - [ ] Delete for everyone (her iki taraf için - sadece kendi mesajlarım)
- [ ] Silinen conversation geri getirilemez (hard delete sonrası)

**Technical Tasks:**

- [ ] DELETE /api/v1/conversations/{id}?mode=for_me endpoint
- [ ] Soft delete implementation (deleted_for_user1, deleted_for_user2)
- [ ] Hard delete after both users delete
- [ ] Confirmation modal component

---

### Epic 12: Performance & Optimization

#### US-12.1: Kullanıcı olarak hızlı sayfa yüklenme süresi istiyorum

**Priority:** P1 (Should Have)

**Acceptance Criteria:**

- [ ] Conversation list 2 saniye içinde yüklenir
- [ ] Message history infinite scroll ile yüklenir (50 mesaj)
- [ ] Images lazy load
- [ ] WebSocket connection 1 saniye içinde kurulur
- [ ] Offline mode: cached messages gösterilir

**Technical Tasks:**

- [ ] Pagination implementation (50 per page)
- [ ] Lazy loading images
- [ ] React.lazy() for code splitting
- [ ] Service Worker for offline support
- [ ] IndexedDB message caching

---

#### US-12.2: Backend olarak message rate limiting uygulamak istiyorum

**Priority:** P0 (Must Have)

**Acceptance Criteria:**

- [ ] Per user: Max 50 mesaj/dakika
- [ ] Per conversation: Max 100 mesaj/saat
- [ ] Rate limit aşımında 429 hatası
- [ ] Retry-After header ile bekleme süresi
- [ ] Admin users rate limit'ten muaf

**Technical Tasks:**

- [ ] Spring rate limiter interceptor
- [ ] Redis-based rate limiting
- [ ] Rate limit exception handler
- [ ] Admin bypass logic

---

## 6. Technical Implementation Details

### 6.1 Backend Enhancements

#### Context-Aware Conversation Creation

```java
// ConversationService.java
public ConversationDTO createWithContext(CreateConversationRequest request) {
    // Validate context
    if (request.getContextType() != null) {
        validateContext(request.getContextType(), request.getContextId());
    }

    // Check existing conversation
    Optional<Conversation> existing = conversationRepository
        .findByContextTypeAndContextId(request.getContextType(), request.getContextId());

    if (existing.isPresent()) {
        return existing.get().toDTO();
    }

    // Create new conversation
    Conversation conversation = new Conversation();
    conversation.setUser1(userRepository.findById(request.getUser1Id())
        .orElseThrow(() -> new ResourceNotFoundException("User not found")));
    conversation.setUser2(userRepository.findById(request.getUser2Id())
        .orElseThrow(() -> new ResourceNotFoundException("User not found")));
    conversation.setContextType(request.getContextType());
    conversation.setContextId(request.getContextId());
    conversation.setContextData(request.getContextData()); // JSON

    conversation = conversationRepository.save(conversation);

    // Send initial template message if provided
    if (request.getInitialTemplate() != null) {
        sendTemplateMessage(conversation, request.getInitialTemplate(), request.getTemplateVars());
    }

    return conversation.toDTO();
}

private void validateContext(ContextType type, Long contextId) {
    switch (type) {
        case ORDER:
            orderRepository.findById(contextId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
            break;
        case PROPOSAL:
            proposalRepository.findById(contextId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal not found"));
            break;
        case JOB:
            jobRepository.findById(contextId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
            break;
    }
}
```

#### Message Templates System

```java
// MessageTemplate.java
@Entity
@Table(name = "message_templates")
public class MessageTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String code; // PROPOSAL_ACCEPT, ORDER_REQUIREMENTS, etc.

    @Column(nullable = false)
    private String category; // ORDER, PROPOSAL, GENERAL

    @Column(nullable = false, columnDefinition = "TEXT")
    private String templateText; // "Hi {{buyer_name}}, please provide requirements for {{order_title}}"

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Boolean isSystem = false; // System templates cannot be edited

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user; // null for system templates

    @Column(name = "variables", columnDefinition = "jsonb")
    private String variables; // ["buyer_name", "order_title", "deadline"]

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

// MessageTemplateService.java
public MessageDTO sendTemplateMessage(Long conversationId, String templateCode, Map<String, Object> variables) {
    MessageTemplate template = templateRepository.findByCode(templateCode)
        .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

    String messageText = replaceVariables(template.getTemplateText(), variables);

    Message message = new Message();
    message.setConversation(conversationRepository.findById(conversationId).orElseThrow());
    message.setSender(getCurrentUser());
    message.setContent(messageText);
    message.setTemplateCode(templateCode);

    message = messageRepository.save(message);

    // Send via WebSocket
    messagingTemplate.convertAndSendToUser(
        message.getRecipient().getUsername(),
        "/queue/messages",
        message.toDTO()
    );

    return message.toDTO();
}

private String replaceVariables(String template, Map<String, Object> variables) {
    String result = template;
    for (Map.Entry<String, Object> entry : variables.entrySet()) {
        result = result.replace("{{" + entry.getKey() + "}}", String.valueOf(entry.getValue()));
    }
    return result;
}
```

#### Database Schema Additions

```sql
-- Add context fields to conversations table
ALTER TABLE conversations ADD COLUMN context_type VARCHAR(50);
ALTER TABLE conversations ADD COLUMN context_id BIGINT;
ALTER TABLE conversations ADD COLUMN context_data JSONB;
ALTER TABLE conversations ADD CONSTRAINT unique_context UNIQUE (context_type, context_id);

CREATE INDEX idx_conversations_context ON conversations(context_type, context_id);

-- Create message_templates table
CREATE TABLE message_templates (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    template_text TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    user_id BIGINT REFERENCES users(id),
    variables JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_templates_code ON message_templates(code);
CREATE INDEX idx_templates_user ON message_templates(user_id);

-- Add template_code to messages
ALTER TABLE messages ADD COLUMN template_code VARCHAR(100);
ALTER TABLE messages ADD FOREIGN KEY (template_code) REFERENCES message_templates(code);

-- Insert system templates
INSERT INTO message_templates (code, category, template_text, is_system, variables) VALUES
('PROPOSAL_ACCEPT', 'PROPOSAL', 'Hi {{freelancer_name}}, I accepted your proposal for "{{job_title}}". Let''s discuss the details!', true, '["freelancer_name", "job_title"]'),
('ORDER_REQUIREMENTS', 'ORDER', 'Hi {{buyer_name}}, please provide the requirements for your order "{{order_title}}". Deadline: {{deadline}}', true, '["buyer_name", "order_title", "deadline"]'),
('REVISION_REQUEST', 'ORDER', 'Hi {{seller_name}}, I need revisions for order #{{order_number}}:\n\n{{revision_details}}', true, '["seller_name", "order_number", "revision_details"]'),
('ADMIN_DISPUTE_START', 'ADMIN', 'Hello, this is an admin mediation chat for dispute case #{{case_id}}. Please explain your concerns.', true, '["case_id"]');
```

### 6.2 Frontend Implementation

#### Context-Aware Message Button Component

```typescript
// components/domains/messaging/MessageButton.tsx
import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickMessageModal } from './QuickMessageModal';
import type { MessageContext } from '@/types/messaging';

interface MessageButtonProps {
  recipientId: string;
  recipientName: string;
  context?: MessageContext;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MessageButton({
  recipientId,
  recipientName,
  context,
  variant = 'default',
  size = 'md',
  className
}: MessageButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsModalOpen(true)}
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        Mesaj Gönder
      </Button>

      <QuickMessageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recipientId={recipientId}
        recipientName={recipientName}
        context={context}
      />
    </>
  );
}
```

```typescript
// components/domains/messaging/QuickMessageModal.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useContextMessage } from '@/hooks/business/messaging/useContextMessage';
import { useMessageTemplates } from '@/hooks/business/messaging/useMessageTemplates';
import type { MessageContext, MessageTemplate } from '@/types/messaging';

interface QuickMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  context?: MessageContext;
}

export function QuickMessageModal({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  context
}: QuickMessageModalProps) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const { sendContextMessage, isLoading } = useContextMessage();
  const { templates, getTemplateByContext } = useMessageTemplates();

  // Auto-select template based on context
  useEffect(() => {
    if (context && templates) {
      const contextTemplate = getTemplateByContext(context.type);
      if (contextTemplate) {
        setSelectedTemplate(contextTemplate.code);
        setMessage(contextTemplate.templateText); // Will be replaced with variables
      }
    }
  }, [context, templates]);

  const handleSend = async () => {
    try {
      const result = await sendContextMessage({
        recipientId,
        content: message,
        context,
        templateCode: selectedTemplate || undefined
      });

      // Navigate to conversation
      router.push(`/messages?conversationId=${result.conversationId}`);
      onClose();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{recipientName}'a Mesaj Gönder</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {context && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium">Bağlam:</p>
              <p className="text-muted-foreground">
                {context.type === 'ORDER' && `Sipariş: ${context.title}`}
                {context.type === 'PROPOSAL' && `Teklif: ${context.title}`}
                {context.type === 'JOB' && `İş İlanı: ${context.title}`}
              </p>
            </div>
          )}

          {templates && templates.length > 0 && (
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Mesaj şablonu seç (opsiyonel)" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.code} value={template.code}>
                    {template.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Textarea
            placeholder="Mesajınızı yazın..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="resize-none"
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
            >
              {isLoading ? 'Gönderiliyor...' : 'Gönder ve Sohbete Git'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

#### Context Message Hook

```typescript
// hooks/business/messaging/useContextMessage.ts
import { useState } from 'react';
import { apiClient } from '@/lib/api/client';
import type { MessageContext, CreateContextMessageRequest, CreateContextMessageResponse } from '@/types/messaging';

export function useContextMessage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendContextMessage = async (request: CreateContextMessageRequest): Promise<CreateContextMessageResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      // First, create or get conversation with context
      const conversationResponse = await apiClient.post<CreateContextMessageResponse>(
        '/api/v1/conversations/create-with-context',
        {
          recipientId: request.recipientId,
          contextType: request.context?.type,
          contextId: request.context?.id,
          contextData: request.context,
          initialMessage: request.content,
          templateCode: request.templateCode
        }
      );

      return conversationResponse.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send message');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendContextMessage,
    isLoading,
    error
  };
}
```

#### Message Templates Hook

```typescript
// hooks/business/messaging/useMessageTemplates.ts
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import type { MessageTemplate, ContextType } from '@/types/messaging';

export function useMessageTemplates() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await apiClient.get<MessageTemplate[]>('/api/v1/message-templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTemplateByContext = (contextType: ContextType): MessageTemplate | undefined => {
    const contextMap: Record<ContextType, string> = {
      ORDER: 'ORDER_REQUIREMENTS',
      PROPOSAL: 'PROPOSAL_ACCEPT',
      JOB: 'JOB_INQUIRY',
      PACKAGE: 'PACKAGE_INQUIRY'
    };

    const templateCode = contextMap[contextType];
    return templates.find(t => t.code === templateCode);
  };

  const getTemplateByCode = (code: string): MessageTemplate | undefined => {
    return templates.find(t => t.code === code);
  };

  return {
    templates,
    isLoading,
    getTemplateByContext,
    getTemplateByCode,
    refetch: fetchTemplates
  };
}
```

#### Type Definitions

```typescript
// types/messaging.ts
export type ContextType = 'ORDER' | 'PROPOSAL' | 'JOB' | 'PACKAGE';

export interface MessageContext {
  type: ContextType;
  id: string;
  title: string;
  additionalData?: Record<string, any>;
}

export interface MessageTemplate {
  id: string;
  code: string;
  category: string;
  templateText: string;
  description: string;
  isSystem: boolean;
  variables: string[];
}

export interface CreateContextMessageRequest {
  recipientId: string;
  content: string;
  context?: MessageContext;
  templateCode?: string;
}

export interface CreateContextMessageResponse {
  conversationId: string;
  messageId: string;
  createdAt: string;
}
```

### 6.3 Integration Examples

#### Employer Proposals Page

```typescript
// app/dashboard/employer/proposals/page.tsx - UPDATE
import { MessageButton } from '@/components/domains/messaging/MessageButton';

// Inside ProposalCard component:
<MessageButton
  recipientId={proposal.freelancer.id}
  recipientName={proposal.freelancer.name}
  context={{
    type: 'PROPOSAL',
    id: proposal.id,
    title: proposal.job.title,
    additionalData: {
      jobId: proposal.job.id,
      proposedPrice: proposal.price,
      proposedDeadline: proposal.deliveryTime
    }
  }}
  variant="outline"
  size="sm"
/>
```

#### Freelancer Orders Page

```typescript
// app/dashboard/freelancer/orders/[id]/page.tsx - NEW FILE
import { MessageButton } from '@/components/domains/messaging/MessageButton';

export default function FreelancerOrderDetailPage({ params }: { params: { id: string } }) {
  const { order } = useOrder(params.id);

  if (!order) return <OrderDetailSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1>Sipariş #{order.orderNumber}</h1>
        <MessageButton
          recipientId={order.buyer.id}
          recipientName={order.buyer.name}
          context={{
            type: 'ORDER',
            id: order.id,
            title: order.title,
            additionalData: {
              orderNumber: order.orderNumber,
              status: order.status,
              deadline: order.deadline
            }
          }}
        />
      </div>

      {order.status === 'PENDING_REQUIREMENTS' && (
        <MessageButton
          recipientId={order.buyer.id}
          recipientName={order.buyer.name}
          context={{
            type: 'ORDER',
            id: order.id,
            title: order.title
          }}
          variant="default"
          className="w-full"
        >
          <FileText className="w-4 h-4 mr-2" />
          İhtiyaçları İste
        </MessageButton>
      )}

      {/* Rest of order details */}
    </div>
  );
}
```

#### Profile Page

```typescript
// app/profile/[username]/page.tsx - UPDATE
import { MessageButton } from '@/components/domains/messaging/MessageButton';

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const { user } = useUserProfile(params.username);
  const { currentUser } = useAuth();

  if (!user) return <ProfileSkeleton />;

  const canMessage = currentUser && currentUser.id !== user.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar src={user.avatar} size="xl" />
        <div className="flex-1">
          <h1>{user.name}</h1>
          <p className="text-muted-foreground">{user.title}</p>
        </div>

        {canMessage && (
          <MessageButton
            recipientId={user.id}
            recipientName={user.name}
            variant="default"
          />
        )}
      </div>

      {/* Rest of profile */}
    </div>
  );
}
```

---

## 7. Development Timeline

### Phase 1: Foundation (Days 1-3)

**Backend:**

- [ ] Database schema migration (context fields + message_templates table)
- [ ] MessageTemplate entity and repository
- [ ] Update ConversationService.createWithContext()
- [ ] MessageTemplateService implementation
- [ ] Insert system templates
- [ ] Unit tests

**Frontend:**

- [ ] Create MessageButton component
- [ ] Create QuickMessageModal component
- [ ] Implement useContextMessage hook
- [ ] Implement useMessageTemplates hook
- [ ] Add messaging types (MessageContext, etc.)

### Phase 2: Core Features (Days 4-7)

**Backend:**

- [ ] Context validation logic for ORDER/PROPOSAL/JOB
- [ ] Template variable replacement system
- [ ] WebSocket enhancements for context messages
- [ ] Rate limiting per context type
- [ ] Admin three-way conversation support

**Frontend:**

- [ ] Update ChatInterface for context display
- [ ] Context badge/chip in conversation list
- [ ] Template selection UI in QuickMessageModal
- [ ] Real-time template variable preview
- [ ] Context data display in conversation header

### Phase 3: Panel Integration (Days 8-12)

**Freelancer Panel:**

- [ ] Orders page: Add MessageButton to each order card
- [ ] Create order detail page with "Request Requirements" button
- [ ] Proposals page: Quick message on proposals received
- [ ] Dashboard widget: Recent conversations

**Employer Panel:**

- [ ] Proposals page: Update existing router.push to use MessageButton
- [ ] Jobs page: Message applicants button
- [ ] Orders page: Message seller button
- [ ] Freelancers list: Message freelancer button

**Admin Panel:**

- [ ] Users page: Admin message button
- [ ] Disputes page: Start mediation chat
- [ ] Moderation page: Flagged messages management

### Phase 4: Advanced Features (Days 13-16)

- [ ] File attachments (Epic 7)
- [ ] Search & filtering (Epic 8)
- [ ] Notifications (Epic 9)
- [ ] Custom templates (Epic 10)
- [ ] Archive/delete (Epic 11)

### Phase 5: Optimization & Testing (Days 17-20)

- [ ] Performance optimization (Epic 12)
- [ ] Rate limiting tests
- [ ] End-to-end testing all flows
- [ ] Load testing (100+ concurrent users)
- [ ] Security audit
- [ ] Documentation updates

### Phase 6: Deployment (Days 21-22)

- [ ] Staging deployment
- [ ] User acceptance testing
- [ ] Production deployment
- [ ] Monitoring setup (Grafana dashboards)
- [ ] Post-deployment verification

---

## 8. Testing Strategy

### Unit Tests

- [ ] MessageTemplateService.replaceVariables()
- [ ] ConversationService.createWithContext()
- [ ] Context validation logic
- [ ] Rate limiting logic
- [ ] Template CRUD operations

### Integration Tests

- [ ] POST /api/v1/conversations/create-with-context
- [ ] POST /api/v1/message-templates
- [ ] WebSocket message flow with context
- [ ] Template message sending
- [ ] Context query filters

### E2E Tests

- [ ] Freelancer: Send requirement request from order page
- [ ] Employer: Message freelancer from proposals page
- [ ] Buyer: Request revision from order page
- [ ] Admin: Start three-way mediation chat
- [ ] Profile page: Send message to user

### Performance Tests

- [ ] 100 concurrent users sending messages
- [ ] 1000 conversations with context filtering
- [ ] Template rendering performance
- [ ] WebSocket connection scaling

---

## 9. Success Metrics

### Technical Metrics

- [ ] Message delivery time < 1 second (p95)
- [ ] Conversation creation time < 500ms
- [ ] Search response time < 200ms
- [ ] WebSocket uptime > 99.9%
- [ ] Zero data loss incidents

### Business Metrics

- [ ] 80%+ users send at least 1 message per week
- [ ] Average response time < 2 hours
- [ ] Context-aware messages 60%+ of total
- [ ] Template usage 40%+ of messages
- [ ] User satisfaction score > 4.5/5

### User Experience Metrics

- [ ] Message send success rate > 99%
- [ ] Real-time delivery success rate > 98%
- [ ] Notification delivery rate > 95%
- [ ] Mobile messaging usability score > 4.0/5

---

## 10. Risk Mitigation

### Technical Risks

1. **WebSocket connection drops**
   - Mitigation: Automatic reconnection with exponential backoff
   - Fallback: Polling mechanism for critical updates

2. **Database performance with large message history**
   - Mitigation: Pagination + indexing on (conversation_id, created_at)
   - Archival strategy for messages > 1 year old

3. **Spam and abuse**
   - Mitigation: Rate limiting + spam detection
   - User blocking + reporting system

### Business Risks

1. **Low adoption rate**
   - Mitigation: Onboarding tour + tooltips
   - In-app prompts for messaging opportunities

2. **Context mismatch (wrong order/proposal linked)**
   - Mitigation: Strict validation + user confirmation
   - Easy context editing for users

---

## 11. Post-Launch Roadmap

### Q2 2025

- [ ] Voice messages
- [ ] Video call integration
- [ ] Message translation (multi-language)
- [ ] AI-powered response suggestions
- [ ] Message scheduling

### Q3 2025

- [ ] Group conversations (team projects)
- [ ] Message reactions (emoji)
- [ ] Message forwarding
- [ ] Rich text formatting (bold, italic, lists)
- [ ] Code snippet support

### Q4 2025

- [ ] Desktop app (Electron)
- [ ] Mobile apps (React Native)
- [ ] Advanced analytics dashboard
- [ ] Message encryption (E2E)

---

## 12. Documentation Requirements

### Developer Documentation

- [ ] API endpoint documentation (OpenAPI spec)
- [ ] WebSocket protocol documentation
- [ ] Database schema documentation
- [ ] Component API documentation (Storybook)

### User Documentation

- [ ] Messaging user guide
- [ ] Template creation guide
- [ ] Context-aware messaging explainer
- [ ] FAQ section

### Operations Documentation

- [ ] Deployment runbook
- [ ] Monitoring and alerting guide
- [ ] Incident response procedures
- [ ] Backup and recovery procedures

---

## Appendix A: API Endpoints Summary

### Conversations

- `GET /api/v1/conversations` - List all conversations
- `GET /api/v1/conversations/{id}` - Get conversation details
- `POST /api/v1/conversations` - Create new conversation
- `POST /api/v1/conversations/create-with-context` - **NEW** Create context-aware conversation
- `PUT /api/v1/conversations/{id}/archive` - Archive conversation
- `DELETE /api/v1/conversations/{id}` - Delete conversation
- `GET /api/v1/conversations/unread-count` - Get unread count
- `GET /api/v1/conversations/search?q={query}` - Search conversations

### Messages

- `GET /api/v1/messages?conversationId={id}` - List messages
- `POST /api/v1/messages` - Send message
- `POST /api/v1/messages/attachments` - Upload attachment
- `GET /api/v1/messages/attachments/{id}/download` - Download attachment
- `DELETE /api/v1/messages/{id}` - Delete message

### Templates

- `GET /api/v1/message-templates` - **NEW** List templates
- `GET /api/v1/message-templates/{code}` - **NEW** Get template by code
- `POST /api/v1/message-templates` - **NEW** Create custom template
- `PUT /api/v1/message-templates/{id}` - **NEW** Update template
- `DELETE /api/v1/message-templates/{id}` - **NEW** Delete template

### Admin

- `POST /api/v1/admin/messages/send` - **NEW** Send admin message
- `GET /api/v1/admin/messages/flagged` - **NEW** Get flagged messages
- `PUT /api/v1/admin/messages/{id}/moderate` - **NEW** Moderate message
- `POST /api/v1/admin/disputes/{id}/start-chat` - **NEW** Start dispute mediation

---

## Appendix B: Database Schema Reference

```sql
-- conversations table (UPDATED)
CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    user1_id BIGINT NOT NULL REFERENCES users(id),
    user2_id BIGINT NOT NULL REFERENCES users(id),
    last_message_at TIMESTAMP,
    unread_count_user1 INTEGER DEFAULT 0,
    unread_count_user2 INTEGER DEFAULT 0,
    deleted_for_user1 BOOLEAN DEFAULT FALSE,
    deleted_for_user2 BOOLEAN DEFAULT FALSE,
    context_type VARCHAR(50),              -- NEW
    context_id BIGINT,                     -- NEW
    context_data JSONB,                    -- NEW
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_context UNIQUE (context_type, context_id)
);

CREATE INDEX idx_conversations_users ON conversations(user1_id, user2_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX idx_conversations_context ON conversations(context_type, context_id);

-- messages table (UPDATED)
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    attachment_url VARCHAR(500),
    attachment_filename VARCHAR(255),
    attachment_size BIGINT,
    attachment_mime_type VARCHAR(100),
    template_code VARCHAR(100),            -- NEW
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (template_code) REFERENCES message_templates(code)
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_read ON messages(conversation_id, is_read) WHERE is_deleted = FALSE;

-- message_templates table (NEW)
CREATE TABLE message_templates (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    template_text TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    user_id BIGINT REFERENCES users(id),
    variables JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_templates_code ON message_templates(code);
CREATE INDEX idx_templates_user ON message_templates(user_id);
CREATE INDEX idx_templates_category ON message_templates(category);
```

---

## Sprint Kapanış Kriterleri

### Definition of Done

- [ ] Tüm user story acceptance criteria karşılanmış
- [ ] Unit test coverage > 80%
- [ ] Integration testler pass
- [ ] E2E testler pass
- [ ] Code review tamamlanmış
- [ ] Documentation güncellenmiş
- [ ] Performance benchmarks karşılanmış
- [ ] Security audit pass
- [ ] Staging'de UAT tamamlanmış
- [ ] Production deployment başarılı
- [ ] Monitoring dashboards aktif

### Sprint Retrospective Topics

- Context-aware messaging pattern effectiveness
- Template system adoption
- WebSocket reliability
- Developer experience with new hooks
- User feedback on messaging UX
- Performance bottlenecks
- Technical debt introduced

---

**Sprint Hazırlanma Tarihi:** {{ CURRENT_DATE }}  
**Tahmini Tamamlanma:** 22 iş günü  
**Sprint Sahibi:** Backend + Frontend Team  
**Product Owner:** {{ PO_NAME }}  
**Scrum Master:** {{ SM_NAME }}

---

_Bu sprint dokümanı, Marifet mesajlaşma sisteminin application-wide entegrasyonunu, context-aware messaging pattern'ini ve tüm rollerin (Freelancer, Employer, Admin) ihtiyaçlarını kapsamaktadır. Clean, maintainable ve production-ready bir implementasyon için detaylı teknik spesifikasyonlar içermektedir._

- [ ] WebSocket typing subscription
- [ ] TypingIndicator component
- [ ] Debounce logic (3 seconds)
- [ ] Cleanup on unmount

---

### Epic 3: Dashboard Quick Actions

#### US-3.1: Freelancer olarak dashboard'dan unread messages görmek istiyorum

**Priority:** P1 (Should Have)

**Acceptance Criteria:**

- [ ] Dashboard'da "Messages" widget var
- [ ] Unread message count badge gösterilir
- [ ] Son 5 conversation preview gösterilir
- [ ] Her conversation için:
  - [ ] Sender avatar ve adı
  - [ ] Son mesaj preview (max 50 char)
  - [ ] Timestamp (relative)
  - [ ] Unread badge
- [ ] "See All Messages" linki /messages sayfasına yönlendirir
- [ ] Widget real-time güncellenir (WebSocket)

**Technical Tasks:**

- [ ] RecentConversationsWidget component
- [ ] GET /api/v1/conversations?limit=5&unreadOnly=true endpoint
- [ ] WebSocket conversation updates integration
- [ ] UnreadBadge component
- [ ] Dashboard layout integration (FreelancerDashboard.tsx)

---

#### US-3.2: Employer olarak proposals sayfasından quick reply yapabilmek istiyorum

**Priority:** P2 (Nice to Have)

**Acceptance Criteria:**

- [ ] Proposal card'da "Quick Reply" icon butonu var
- [ ] Hover'da mini message input görünür (inline)
- [ ] Quick message yazıp Enter ile gönderebilirim
- [ ] Gönderilen mesaj conversation'a eklenir
- [ ] Freelancer real-time bildirim alır
- [ ] Input expand olabilir (Shift+Enter ile multi-line)

**Technical Tasks:**

- [ ] QuickReplyInput component
- [ ] Inline message sending
- [ ] Optimistic UI update
- [ ] WebSocket message broadcast
- [ ] Keyboard shortcuts (Enter = send, Shift+Enter = new line)

---

### Epic 4: Profile & Discovery Messaging

#### US-4.1: Kullanıcı olarak profile sayfasından mesaj gönderebilmek istiyorum

**Priority:** P1 (Should Have)

**Acceptance Criteria:**

- [ ] User profile sayfasında "Send Message" butonu var
- [ ] Kendi profile'ımda buton görünmez
- [ ] Butona tıklayınca QuickMessageModal açılır
- [ ] Profile context ile conversation oluşturulur
- [ ] İlk mesaj gönderilebilir
- [ ] Conversation'a yönlendirme yapılır

**Technical Tasks:**

- [ ] Profile page'e MessageButton ekleme
- [ ] Profile context passing (profileUserId)
- [ ] GET /api/v1/users/{id}/can-message endpoint (spam prevention)
- [ ] Message rate limiting per recipient
- [ ] Blocked users check

---

#### US-4.2: Employer olarak job detail sayfasından poster'a mesaj göndermek istiyorum

**Priority:** P2 (Nice to Have)

**Acceptance Criteria:**

- [ ] Job detail'da "Contact Poster" butonu var (employer ise gösterme)
- [ ] Job sahibine mesaj gönderilebilir
- [ ] Job context ile conversation oluşturulur
- [ ] Template: "Job Inquiry"

**Technical Tasks:**

- [ ] Job detail page messaging integration
- [ ] "JOB_INQUIRY" template
- [ ] Job owner check (don't show to self)
- [ ] Inquiry tracking (prevent spam)

---

### Epic 5: Admin & Moderation Messaging

#### US-5.1: Admin olarak users management'tan kullanıcıya mesaj göndermek istiyorum

**Priority:** P1 (Should Have)

**Acceptance Criteria:**

- [ ] User detail sayfasında "Send Admin Message" butonu var
- [ ] Admin message modal açılır
- [ ] Message type seçebilirim:
  - [ ] Warning
  - [ ] Notification
  - [ ] Support Response
  - [ ] Account Issue
- [ ] Pre-defined templates var
- [ ] Kullanıcıya özel admin badge ile mesaj gider
- [ ] Kullanıcı admin mesajını conversation'da görür

**Technical Tasks:**

- [ ] AdminMessageModal component
- [ ] Message type enum (ADMIN_WARNING, ADMIN_NOTIFICATION, etc.)
- [ ] POST /api/v1/admin/messages/send endpoint
- [ ] Admin message styling (different color/badge)
- [ ] Admin message templates
- [ ] User notification (email + in-app)

---

#### US-5.2: Admin olarak flagged messages moderation yapmak istiyorum

**Priority:** P1 (Should Have)

**Acceptance Criteria:**

- [ ] Admin moderation panelinde "Flagged Messages" tab'ı var
- [ ] Flagged message'lar listelenir:
  - [ ] Message content
  - [ ] Sender/Receiver info
  - [ ] Flag reason
  - [ ] Flag count
  - [ ] Reporter info (opsiyonel anonim)
- [ ] Her message için actions:
  - [ ] Approve (clear flags)
  - [ ] Delete message
  - [ ] Warn sender
  - [ ] Ban sender (temporary/permanent)
- [ ] Bulk actions available
- [ ] Moderation history logged

**Technical Tasks:**

- [ ] /app/admin/moderation/messages page
- [ ] FlaggedMessagesTable component
- [ ] GET /api/v1/admin/messages/flagged endpoint
- [ ] PUT /api/v1/admin/messages/{id}/moderate endpoint
- [ ] Moderation log table (database)
- [ ] User warning/ban system integration

---

### Epic 6: Order Lifecycle Messaging

#### US-6.1: Order PENDING_REQUIREMENTS durumunda otomatik mesaj gönderilmesini istiyorum

**Priority:** P1 (Should Have)

**Acceptance Criteria:**

- [ ] Order created event trigger olduğunda
- [ ] Eğer order type PACKAGE ve status PENDING_REQUIREMENTS ise
- [ ] Otomatik template message buyer'a gönderilir
- [ ] Template: "Please provide requirements for your order"
- [ ] Buyer requirement form linki içerir
- [ ] 24 saat sonra reminder gönderilir (eğer hala pending)

**Technical Tasks:**

- [ ] Order creation event listener
- [ ] Automatic message sending service
- [ ] OrderRequirementReminderJob (scheduled)
- [ ] POST /api/v1/orders/{id}/send-requirement-request endpoint
- [ ] Order lifecycle messaging automation

---

#### US-6.2: Order DELIVERED durumunda buyer'a review + feedback mesajı gönderilmesini istiyorum

**Priority:** P2 (Nice to Have)

**Acceptance Criteria:**

- [ ] Order DELIVERED olduğunda
- [ ] 2 saat sonra otomatik mesaj gönderilir:
  - [ ] "Please review the delivery"
  - [ ] Review form linki
  - [ ] Revision request option
- [ ] 7 gün sonra final reminder
- [ ] Review yazılırsa mesaj durdurulur

**Technical Tasks:**

- [ ] Order delivery event listener
- [ ] DeliveryReviewReminderJob (scheduled)
- [ ] Order review integration
- [ ] Notification + message combination

---

### Epic 7: File Upload & Attachments

#### US-2.1: Kullanıcı olarak dosya ve resim göndermek istiyorum

**Priority:** P1 (Should Have)

**Acceptance Criteria:**

- [ ] Dosya ekle butonu ile dosya seçebilirim
- [ ] Drag & drop ile dosya yükleyebilirim
- [ ] Birden fazla dosya (max 3) ekleyebilirim
- [ ] Resimler otomatik önizleme gösterilir
- [ ] Dosya boyutu kontrolü yapılır (max 10MB)
- [ ] Dosya tipi kontrolü yapılır
- [ ] Yükleme progress bar'ı görürüm
- [ ] Yükleme tamamlandığında mesaj gönderilir
- [ ] Hata durumunda kullanıcıya bilgi verilir

**Technical Tasks:**

- [ ] FileUploadService implementation (backend)
- [ ] File storage (AWS S3 / local storage)
- [ ] Image compression (backend)
- [ ] POST /api/v1/files/upload endpoint
- [ ] FileUpload component (frontend)
- [ ] Image preview component
- [ ] File type validation (frontend & backend)
- [ ] Progress tracking
- [ ] Error handling

---

#### US-2.2: Kullanıcı olarak gönderilen dosyaları indirmek istiyorum

**Priority:** P1 (Should Have)

**Acceptance Criteria:**

- [ ] Resimleri büyütülmüş olarak görüntüleyebilirim
- [ ] Dosyaları indirebilirim
- [ ] Dosya tipi ikonları gösterilir
- [ ] Dosya boyutu gösterilir
- [ ] Güvenli indirme (virus scan)

**Technical Tasks:**

- [ ] GET /api/v1/files/{id} endpoint
- [ ] Image lightbox component
- [ ] File download handler
- [ ] Secure file serving
- [ ] File type icons
- [ ] Virus scanning integration (optional)

---

### Epic 3: Message Status & Read Receipts

#### US-3.1: Kullanıcı olarak mesajımın okunup okunmadığını görmek istiyorum

**Priority:** P1 (Should Have)

**Acceptance Criteria:**

- [ ] Gönderilen mesaj: Tek tik (sent)
- [ ] Ulaşan mesaj: Çift tik gri (delivered)
- [ ] Okunan mesaj: Çift tik mavi (read)
- [ ] Her mesajın altında durum gösterimi var
- [ ] Gerçek zamanlı güncellenir

**Technical Tasks:**

- [ ] Message delivery tracking (backend)
- [ ] PUT /api/v1/messages/{id}/mark-read integration
- [ ] WebSocket message status update
- [ ] MessageStatus component
- [ ] Read receipt icons
- [ ] Real-time status sync

---

#### US-3.2: Kullanıcı olarak mesaj gönderme durumunu görmek istiyorum

**Priority:** P1 (Should Have)

**Acceptance Criteria:**

- [ ] Mesaj gönderilirken loading spinner görürüm
- [ ] Başarılı gönderimde tick işareti görünür
- [ ] Hata durumunda kırmızı ünlem görürüm
- [ ] Tekrar gönder butonu görürüm (hata durumunda)

**Technical Tasks:**

- [ ] Optimistic UI state management
- [ ] Message sending status (SENDING, SENT, FAILED)
- [ ] Retry mechanism
- [ ] Error message display
- [ ] Status indicators UI

---

### Epic 4: Hooks & State Management

#### US-4.1: Developer olarak useConversation hook'u kullanmak istiyorum

**Priority:** P0 (Must Have)

**Acceptance Criteria:**

- [ ] useConversation(conversationId) - conversation detayı getirir
- [ ] Real-time conversation updates
- [ ] Loading states
- [ ] Error handling
- [ ] Caching support

**Technical Tasks:**

- [ ] Create hooks/useConversation.ts
- [ ] GET /api/v1/conversations/{id} integration
- [ ] WebSocket subscription for conversation updates
- [ ] React Query or Zustand integration
- [ ] Loading & error states
- [ ] Cache invalidation

---

#### US-4.2: Developer olarak useMessages hook'u kullanmak istiyorum

**Priority:** P0 (Must Have)

**Acceptance Criteria:**

- [ ] useMessages(conversationId) - mesajları getirir
- [ ] Pagination support
- [ ] Real-time message updates
- [ ] Optimistic updates
- [ ] Message deduplication

**Technical Tasks:**

- [ ] Create hooks/useMessages.ts
- [ ] GET /api/v1/conversations/{id}/messages integration
- [ ] Infinite scroll implementation
- [ ] WebSocket message subscription
- [ ] Optimistic update logic
- [ ] Message cache management

---

#### US-4.3: Developer olarak useMessaging hook'u kullanmak istiyorum

**Priority:** P0 (Must Have)

**Acceptance Criteria:**

- [ ] sendMessage(conversationId, content, files)
- [ ] markAsRead(messageId)
- [ ] deleteMessage(messageId)
- [ ] Loading states per operation
- [ ] Error handling

**Technical Tasks:**

- [ ] Create hooks/useMessaging.ts
- [ ] POST /api/v1/messages implementation
- [ ] PUT /api/v1/messages/{id}/mark-read
- [ ] DELETE /api/v1/messages/{id}
- [ ] Loading state management
- [ ] Error handling & toast notifications

---

### Epic 5: UI/UX Enhancements

#### US-5.1: Kullanıcı olarak kullanıcı online durumunu görmek istiyorum

**Priority:** P2 (Nice to Have)

**Acceptance Criteria:**

- [ ] Online kullanıcılar yeşil nokta ile gösterilir
- [ ] Offline kullanıcılar "Son görülme" zamanı gösterilir
- [ ] Durumlar gerçek zamanlı güncellenir
- [ ] Away (uzakta) durumu desteklenir

**Technical Tasks:**

- [ ] User presence tracking (backend)
- [ ] WebSocket user status messages
- [ ] OnlineStatus component
- [ ] Last seen timestamp
- [ ] Presence subscription

---

#### US-5.2: Kullanıcı olarak mesajlara emoji reaction vermek istiyorum

**Priority:** P3 (Nice to Have)

**Acceptance Criteria:**

- [ ] Mesaja uzun basarak emoji seçebilirim
- [ ] Emoji reaction mesajın altında görünür
- [ ] Birden fazla reaction ekleyebilirim
- [ ] Diğer kullanıcıların reaction'larını görebilirim
- [ ] Reaction'ımı geri alabilirim

**Technical Tasks:**

- [ ] Message reactions table (database)
- [ ] POST /api/v1/messages/{id}/reactions endpoint
- [ ] EmojiPicker component
- [ ] ReactionDisplay component
- [ ] WebSocket reaction updates

---

#### US-5.3: Kullanıcı olarak emoji picker ile emoji eklemek istiyorum

**Priority:** P2 (Nice to Have)

**Acceptance Criteria:**

- [ ] Emoji butonu ile picker açılır
- [ ] Kategorilere göre emoji'ler listelenir
- [ ] Arama yaparak emoji bulabilirim
- [ ] Son kullanılan emoji'ler gösterilir
- [ ] Emoji tıklandığında mesaj input'una eklenir

**Technical Tasks:**

- [ ] Emoji picker library integration (emoji-mart)
- [ ] EmojiPicker component
- [ ] Emoji search functionality
- [ ] Recent emojis storage (localStorage)
- [ ] Emoji insertion logic

---

### Epic 6: Notification System

#### US-6.1: Kullanıcı olarak yeni mesaj bildirimini görmek istiyorum

**Priority:** P1 (Should Have)

**Acceptance Criteria:**

- [ ] Yeni mesaj geldiğinde browser notification alırım
- [ ] Notification'a tıklayınca mesaj sayfası açılır
- [ ] Notification başlığı gönderenin adını içerir
- [ ] Notification içeriği mesaj önizlemesini içerir
- [ ] Sessiz mod varsa notification gelmez

**Technical Tasks:**

- [ ] Browser Notification API integration
- [ ] Notification permission request
- [ ] Notification service
- [ ] Click handler (navigate to conversation)
- [ ] Quiet hours check
- [ ] Notification preferences

---

#### US-6.2: Kullanıcı olarak sesli bildirim almak istiyorum

**Priority:** P2 (Nice to Have)

**Acceptance Criteria:**

- [ ] Yeni mesajda "ding" sesi duyarım
- [ ] Ses bildirimini ayarlardan kapatabilim
- [ ] Özel ses seçebilirim
- [ ] Sessiz modda ses gelmez

**Technical Tasks:**

- [ ] Sound notification implementation
- [ ] Audio files (ding.mp3)
- [ ] Sound preferences in settings
- [ ] Volume control
- [ ] Mute functionality

---

### Epic 7: Search & Filter

#### US-7.1: Kullanıcı olarak mesajlarda arama yapmak istiyorum

**Priority:** P2 (Nice to Have)

**Acceptance Criteria:**

- [ ] Conversation içinde arama yapabilirim
- [ ] Arama sonuçları highlight edilir
- [ ] Arama sonucuna tıklayınca o mesaja gider
- [ ] Arama geçmişi saklanır

**Technical Tasks:**

- [ ] Search input component
- [ ] GET /api/v1/messages/search integration
- [ ] Result highlighting
- [ ] Scroll to message functionality
- [ ] Search history (localStorage)

---

#### US-7.2: Kullanıcı olarak conversation'ları filtrelemek istiyorum

**Priority:** P2 (Nice to Have)

**Acceptance Criteria:**

- [ ] Okunmamış mesajları filtreleyebilirim
- [ ] Favorilere eklediğim conversation'ları görebilirim
- [ ] Arşivlenmiş conversation'ları görebilirim
- [ ] Job/Proposal ile ilişkili mesajları filtreleyebilirim

**Technical Tasks:**

- [ ] Filter UI component
- [ ] Conversation filtering logic
- [ ] Favorite toggle
- [ ] Archive functionality
- [ ] Related entity filter

---

## Technical Architecture

### Backend API Endpoints

#### Message Endpoints (Already Implemented ✅)

```
POST   /api/v1/messages                         Create message
GET    /api/v1/messages/{messageId}             Get message by ID
PUT    /api/v1/messages/{messageId}/mark-read   Mark as read
DELETE /api/v1/messages/{messageId}             Delete message (soft)
GET    /api/v1/messages/unread                  Get unread messages
GET    /api/v1/messages/unread-count            Get unread count
GET    /api/v1/messages/search                  Search messages
GET    /api/v1/messages/entity/{type}/{id}      Get messages by entity
```

#### Conversation Endpoints (Already Implemented ✅)

```
GET    /api/v1/conversations                    Get all conversations
POST   /api/v1/conversations                    Create conversation
GET    /api/v1/conversations/{id}               Get conversation by ID
GET    /api/v1/conversations/{id}/messages      Get conversation messages
PUT    /api/v1/conversations/{id}/mark-read     Mark all as read
DELETE /api/v1/conversations/{id}               Delete conversation (soft)
```

#### File Upload Endpoints (To Implement ❌)

```
POST   /api/v1/files/upload                     Upload file(s)
GET    /api/v1/files/{fileId}                   Download file
GET    /api/v1/files/{fileId}/preview           Get file preview
DELETE /api/v1/files/{fileId}                   Delete file
```

#### WebSocket Destinations (Partially Implemented ⚠️)

```
/app/chat/message                               Send chat message ✅
/app/chat/typing                                Send typing indicator ✅
/app/user/status                                Update user status ✅
/topic/conversation.{id}                        Subscribe to conversation ✅
/user/queue/messages                            Private message queue ✅
```

---

### Frontend Components Structure

```
components/
  domains/
    messaging/
      ├── MessagesList.tsx              ⚠️  (to complete)
      ├── ChatInterface.tsx             ⚠️  (to complete)
      ├── ConversationList.tsx          ❌ (to create)
      ├── ConversationCard.tsx          ❌ (to create)
      ├── MessageBubble.tsx             ✅ (basic, needs enhancement)
      ├── TypingIndicator.tsx           ❌ (to create)
      ├── FileUpload.tsx                ✅ (basic exists)
      ├── FilePreview.tsx               ❌ (to create)
      ├── ImageGallery.tsx              ❌ (to create)
      ├── EmojiPicker.tsx               ❌ (to create)
      ├── MessageInput.tsx              ❌ (to create)
      ├── MessageStatus.tsx             ❌ (to create)
      ├── OnlineStatus.tsx              ❌ (to create)
      └── MessageSearch.tsx             ❌ (to create)

hooks/
  business/
    messaging/
      ├── useConversation.ts            ❌ (to create)
      ├── useMessages.ts                ❌ (to create)
      ├── useMessaging.ts               ❌ (to create)
      ├── useTypingIndicator.ts         ❌ (to create)
      ├── useFileUpload.ts              ❌ (to create)
      └── useMessageNotifications.ts    ❌ (to create)

lib/
  infrastructure/
    services/
      ├── messaging.service.ts          ✅ (basic exists, needs enhancement)
      ├── file-upload.service.ts        ❌ (to create)
      └── notification.service.ts       ⚠️  (exists, needs message integration)
```

---

### Database Schema (Already Implemented ✅)

```sql
-- messages table (fully implemented)
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  sender_id UUID NOT NULL REFERENCES users(id),
  recipient_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(20) NOT NULL, -- TEXT, ATTACHMENT, SYSTEM
  content VARCHAR(2000) NOT NULL,
  attachment_url VARCHAR(500),
  attachment_name VARCHAR(200),
  attachment_size BIGINT,
  attachment_type VARCHAR(50),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP,
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  sender_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  recipient_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- conversations table (fully implemented)
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES users(id),
  user2_id UUID NOT NULL REFERENCES users(id),
  last_message_id UUID REFERENCES messages(id),
  user1_unread_count INT NOT NULL DEFAULT 0,
  user2_unread_count INT NOT NULL DEFAULT 0,
  user1_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  user2_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Additional Tables Needed ❌

```sql
-- file_attachments table (to create)
CREATE TABLE file_attachments (
  id UUID PRIMARY KEY,
  message_id UUID REFERENCES messages(id),
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  thumbnail_path VARCHAR(500),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP
);

-- message_reactions table (to create)
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES messages(id),
  user_id UUID NOT NULL REFERENCES users(id),
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  UNIQUE(message_id, user_id, emoji)
);

-- user_presence table (to create)
CREATE TABLE user_presence (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  status VARCHAR(20) NOT NULL, -- ONLINE, AWAY, BUSY, OFFLINE
  last_seen TIMESTAMP,
  updated_at TIMESTAMP NOT NULL
);
```

---

## Development Tasks Breakdown

### Week 1: Backend Enhancements & File Upload

#### Day 1-2: File Upload System

**Backend:**

- [ ] Create FileAttachment entity
- [ ] Create FileUploadService
- [ ] Implement POST /api/v1/files/upload
- [ ] Implement GET /api/v1/files/{id}
- [ ] Add file storage (AWS S3 / local)
- [ ] Image compression & thumbnail generation
- [ ] File validation (size, type)
- [ ] Write unit tests

**Frontend:**

- [ ] Create FileUploadService.ts
- [ ] Create useFileUpload hook
- [ ] Update FileUpload component
- [ ] Add drag & drop support
- [ ] Add progress tracking
- [ ] Add preview functionality

**Estimated Time:** 16 hours

---

#### Day 3-4: User Presence & Typing Indicators

**Backend:**

- [ ] Create UserPresence entity
- [ ] Create PresenceService
- [ ] Implement typing indicator handler
- [ ] Implement presence tracking
- [ ] WebSocket integration for presence
- [ ] Last seen timestamp logic

**Frontend:**

- [ ] Create useTypingIndicator hook
- [ ] Create TypingIndicator component
- [ ] Create OnlineStatus component
- [ ] Integrate with WebSocket
- [ ] Add debounce logic
- [ ] Add last seen display

**Estimated Time:** 16 hours

---

#### Day 5: Message Reactions

**Backend:**

- [ ] Create MessageReaction entity
- [ ] Create ReactionService
- [ ] Implement POST /api/v1/messages/{id}/reactions
- [ ] Implement DELETE /api/v1/messages/{id}/reactions/{reactionId}
- [ ] WebSocket integration

**Frontend:**

- [ ] Install emoji-mart library
- [ ] Create EmojiPicker component
- [ ] Create ReactionDisplay component
- [ ] Add reaction click handlers
- [ ] Real-time reaction updates

**Estimated Time:** 8 hours

---

### Week 2: Frontend Core Implementation

#### Day 6-7: Hooks Implementation

**Frontend:**

- [ ] Implement hooks/useConversation.ts
- [ ] Implement hooks/useMessages.ts
- [ ] Implement hooks/useMessaging.ts
- [ ] Implement hooks/useTypingIndicator.ts
- [ ] Add React Query integration
- [ ] Add cache management
- [ ] Add optimistic updates
- [ ] Write hook tests

**Estimated Time:** 16 hours

---

#### Day 8-9: ChatInterface Component

**Frontend:**

- [ ] Refactor ChatInterface.tsx
- [ ] Integrate useWebSocket for real-time
- [ ] Integrate useMessages hook
- [ ] Integrate useMessaging hook
- [ ] Add MessageInput component
- [ ] Add MessageStatus indicators
- [ ] Add typing indicator display
- [ ] Add auto-scroll logic
- [ ] Add file upload UI
- [ ] Add image preview
- [ ] Error handling & retries

**Estimated Time:** 16 hours

---

#### Day 10-11: ConversationList & Navigation

**Frontend:**

- [ ] Create ConversationList component
- [ ] Create ConversationCard component
- [ ] Integrate useConversations hook
- [ ] Add unread badge display
- [ ] Add last message preview
- [ ] Add online status display
- [ ] Add search functionality
- [ ] Add filter functionality
- [ ] Pagination or infinite scroll
- [ ] Real-time conversation updates

**Estimated Time:** 16 hours

---

### Week 3: Polish, Testing & Deployment

#### Day 12: Notification System

**Frontend:**

- [ ] Create useMessageNotifications hook
- [ ] Browser Notification API integration
- [ ] Request notification permissions
- [ ] Sound notifications
- [ ] Notification click handlers
- [ ] Notification preferences UI
- [ ] Quiet hours implementation

**Backend:**

- [ ] Integrate with NotificationService
- [ ] Create MESSAGE_RECEIVED notification type
- [ ] Email notifications for offline users

**Estimated Time:** 8 hours

---

#### Day 13: UI/UX Polish

**Frontend:**

- [ ] Mobile responsive design
- [ ] Touch gestures (swipe actions)
- [ ] Loading skeletons
- [ ] Error states UI
- [ ] Empty states UI
- [ ] Accessibility improvements (ARIA labels)
- [ ] Keyboard shortcuts
- [ ] Dark mode support
- [ ] Animation polish (message transitions)

**Estimated Time:** 8 hours

---

#### Day 14: Testing

**Testing:**

- [ ] E2E test: Send and receive message
- [ ] E2E test: File upload flow
- [ ] E2E test: Typing indicators
- [ ] E2E test: Mark as read
- [ ] E2E test: Conversation list updates
- [ ] Unit tests: Hooks
- [ ] Unit tests: Components
- [ ] Integration tests: WebSocket flow
- [ ] Performance testing (1000+ messages)
- [ ] Load testing (100 concurrent users)

**Estimated Time:** 8 hours

---

#### Day 15: Bug Fixes & Documentation

**Tasks:**

- [ ] Fix critical bugs
- [ ] Fix UI inconsistencies
- [ ] Update API documentation
- [ ] Update component storybook
- [ ] Write user guide
- [ ] Update README
- [ ] Code cleanup
- [ ] Performance optimization
- [ ] Security review

**Estimated Time:** 8 hours

---

## UI/UX Specifications

### ConversationList Design

```
┌────────────────────────────────────────┐
│  💬 Mesajlar              [🔍] [⚙️]   │
│  ────────────────────────────────────  │
│                                        │
│  ┌────────────────────────────────┐  │
│  │ [🟢] [👤 Avatar] Ahmet Y.      │  │
│  │      Merhaba, projeyi...  (2)  │  │
│  │      5 dakika önce             │  │
│  └────────────────────────────────┘  │
│                                        │
│  ┌────────────────────────────────┐  │
│  │ [⚫] [👤 Avatar] Mehmet K.     │  │
│  │      Teşekkürler!              │  │
│  │      2 saat önce               │  │
│  └────────────────────────────────┘  │
│                                        │
│  ┌────────────────────────────────┐  │
│  │ [🟢] [👤 Avatar] Ayşe D.       │  │
│  │      📎 Dosya gönderdi         │  │
│  │      Dün 18:30                 │  │
│  └────────────────────────────────┘  │
│                                        │
└────────────────────────────────────────┘
```

### ChatInterface Design

```
┌────────────────────────────────────────────────┐
│ [←] [👤 Avatar] Ahmet Y.  [🟢]   [📞] [⋮]    │
│     Freelancer • İstanbul                      │
│─────────────────────────────────────────────────│
│                                                │
│     ┌──────────────────────────┐              │
│     │ Merhaba! Proje hakkında  │              │
│     │ konuşabilir miyiz?       │  ✓✓          │
│     │ 14:30                    │              │
│     └──────────────────────────┘              │
│                                                │
│              ┌──────────────────────────┐     │
│              │ Tabii ki! Ne zaman      │     │
│              │ müsaitsiniz?            │  ✓✓ │
│              │ 14:35                   │     │
│              └──────────────────────────┘     │
│                                                │
│     [Ahmet yazıyor...]                        │
│                                                │
│─────────────────────────────────────────────────│
│ [📎] [😊] [───────────────────] [🎤] [📤]     │
│           Mesajınızı yazın...                  │
└────────────────────────────────────────────────┘
```

### Message Status Indicators

```
┌──────────────────────────────────┐
│ Merhaba!                         │
│ 14:30  [⏱]  Gönderiliyor...     │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ Merhaba!                         │
│ 14:30  [✓]   Gönderildi          │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ Merhaba!                         │
│ 14:30  [✓✓]  Ulaştı             │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ Merhaba!                         │
│ 14:30  [✓✓]  Okundu (mavi)      │
└──────────────────────────────────┘
```

### File Attachment Preview

```
┌──────────────────────────────────┐
│ [📎 dosya.pdf]                   │
│ 2.3 MB • PDF Belgesi             │
│ [⬇️ İndir] [👁️ Önizle]          │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ [🖼️ Resim Önizlemesi]           │
│ ┌────────────────────────────┐  │
│ │                            │  │
│ │      [Resim]               │  │
│ │                            │  │
│ └────────────────────────────┘  │
│ foto.jpg • 1.5 MB                │
└──────────────────────────────────┘
```

---

## Testing Strategy

### Unit Tests

**Backend:**

- [ ] FileUploadService tests
- [ ] PresenceService tests
- [ ] ReactionService tests
- [ ] Message validation tests
- [ ] WebSocket message handler tests

**Frontend:**

- [ ] useConversation hook tests
- [ ] useMessages hook tests
- [ ] useMessaging hook tests
- [ ] useTypingIndicator hook tests
- [ ] useFileUpload hook tests
- [ ] Component rendering tests
- [ ] WebSocket integration tests

### Integration Tests

- [ ] Message send/receive flow
- [ ] File upload flow
- [ ] Typing indicator flow
- [ ] Presence tracking flow
- [ ] Notification flow
- [ ] Mark as read flow
- [ ] Conversation creation flow

### E2E Tests

```typescript
// Example E2E test
describe('Messaging System', () => {
  it('should send and receive messages in real-time', async () => {
    // 1. User A logs in
    // 2. User B logs in (different browser)
    // 3. User A sends message to User B
    // 4. Verify User B receives message instantly (WebSocket)
    // 5. Verify unread count updates
    // 6. User B opens conversation
    // 7. Verify message marked as read
    // 8. Verify User A sees read receipt
  });

  it('should upload and display file attachments', async () => {
    // Test file upload flow
  });

  it('should show typing indicators', async () => {
    // Test typing indicator flow
  });
});
```

### Performance Tests

- [ ] Load test: 100 concurrent users
- [ ] Message rendering: 1000+ messages
- [ ] File upload: Large files (10MB)
- [ ] WebSocket reconnection stress test
- [ ] Memory leak detection
- [ ] Database query performance

---

## Success Metrics

### Quantitative Metrics

| Metric                        | Target  | Current | Status |
| ----------------------------- | ------- | ------- | ------ |
| Message Delivery Time         | < 500ms | N/A     | ❌     |
| WebSocket Connection Success  | > 99%   | 95%     | ⚠️     |
| File Upload Success Rate      | > 98%   | N/A     | ❌     |
| Average Messages Per User/Day | > 10    | 0       | ❌     |
| User Satisfaction             | > 4.5/5 | N/A     | ❌     |

### Qualitative Metrics

- [ ] Users can easily find and start conversations
- [ ] Real-time messaging feels instant
- [ ] File sharing is intuitive
- [ ] Typing indicators enhance user experience
- [ ] Notification system is effective but not intrusive
- [ ] Mobile experience is seamless

---

## Risk Assessment

### High Risk

1. **WebSocket Stability**
   - Risk: Connection drops in production
   - Mitigation: Auto-reconnect, fallback to polling, extensive testing

2. **File Upload Performance**
   - Risk: Large files cause server slowdown
   - Mitigation: File size limits, compression, CDN usage, async processing

3. **Database Performance**
   - Risk: Message queries become slow with scale
   - Mitigation: Proper indexing, pagination, caching, archiving old messages

### Medium Risk

4. **Real-Time Sync Issues**
   - Risk: Message duplication or loss
   - Mitigation: Idempotency keys, message deduplication, delivery confirmation

5. **Notification Spam**
   - Risk: Users overwhelmed with notifications
   - Mitigation: Notification preferences, quiet hours, batching

6. **Cross-Browser Compatibility**
   - Risk: WebSocket issues in some browsers
   - Mitigation: SockJS fallback, browser testing

### Low Risk

7. **Emoji Rendering**
   - Risk: Emoji display issues
   - Mitigation: Use emoji-mart library, Unicode normalization

---

## Rollout Plan

### Phase 1: Alpha Testing (Week 1)

- Deploy to staging environment
- Internal team testing
- Fix critical bugs
- Performance tuning

### Phase 2: Beta Testing (Week 2)

- Enable for 10% of users (feature flag)
- Monitor metrics:
  - Message delivery time
  - WebSocket connection stability
  - Error rates
  - User feedback
- Iterative bug fixes

### Phase 3: Full Release (Week 3)

- Enable for all users
- Marketing announcement
- User onboarding tutorial
- Monitor success metrics
- 24/7 on-call support

### Phase 4: Post-Release (Week 4+)

- Collect user feedback
- A/B testing for features
- Performance optimization
- Feature enhancements
- Bug fixes

---

## Post-Sprint Enhancements

### Future Features (Not in this sprint)

1. **Group Conversations**
   - Multi-user chat rooms
   - Group admin controls
   - Participant management

2. **Voice & Video Calls**
   - WebRTC integration
   - Call history
   - Screen sharing

3. **Message Translation**
   - Auto-translate messages
   - Multi-language support
   - Language detection

4. **Advanced Search**
   - Search within attachments
   - Date range filters
   - Advanced filters (sender, type, etc.)

5. **Message Scheduling**
   - Schedule messages to send later
   - Recurring messages
   - Reminder messages

6. **Chatbots & Automation**
   - Auto-reply when away
   - FAQ bot
   - Template messages

7. **Message Export**
   - Export conversation as PDF
   - Download all media
   - Backup to cloud

8. **End-to-End Encryption**
   - E2E encrypted messages
   - Secure file transfer
   - Privacy mode

---

## Dependencies

### External Dependencies

- WebSocket system (already implemented)
- User authentication system
- Notification system
- File storage (AWS S3 or local)
- Image processing library

### Internal Dependencies

- Backend: Spring Boot 3.4.1, PostgreSQL, WebSocket
- Frontend: Next.js 14, React 18, Zustand, React Query
- UI: Tailwind CSS, shadcn/ui
- Testing: Jest, Playwright, React Testing Library
- Libraries: emoji-mart, date-fns, react-dropzone

---

## Team Assignments

### Backend Developer

- File upload system
- User presence tracking
- Message reactions
- WebSocket handlers
- Database optimizations
- Unit & integration tests

### Frontend Developer

- Component development (ChatInterface, ConversationList, etc.)
- Hooks implementation
- State management
- WebSocket integration
- UI/UX implementation
- E2E tests

### Full-Stack Developer

- End-to-end features
- Bug fixes
- Performance optimization
- Code reviews
- Documentation

---

## Daily Standup Questions

1. What did I complete yesterday?
2. What will I work on today?
3. Any blockers or challenges?
4. Any dependency on other tasks?
5. WebSocket connectivity issues?

---

## Sprint Retrospective Topics

### To Discuss

- What went well?
- What could be improved?
- WebSocket challenges and learnings
- File upload performance insights
- Real-time sync edge cases
- What should we start doing?
- What should we stop doing?
- Action items for next sprint

---

## Appendix

### Useful Links

- [Backend README](../marifetbul-backend/README.md)
- [Frontend Architecture](../README.md)
- [WebSocket System Guide](./WEBSOCKET_SYSTEM_GUIDE.md)
- [API Documentation](https://api.marifetbul.com/swagger-ui)
- [Design System](https://www.figma.com/marifetbul-design)

### References

- Review System Sprint (reference implementation)
- WebSocket documentation
- STOMP Protocol: https://stomp.github.io/
- emoji-mart: https://github.com/missive/emoji-mart

### Code Style Guidelines

- Follow existing code patterns
- Write descriptive commit messages
- Add JSDoc/JavaDoc comments
- Keep functions small and focused
- Write tests for new features
- Use TypeScript types everywhere

---

**Document Version:** 1.0  
**Last Updated:** October 24, 2025  
**Next Review:** Start of Sprint  
**Owner:** Development Team

---

## Quick Start Checklist

### Before Starting Development

- [ ] Read this document thoroughly
- [ ] Review WebSocket System Guide
- [ ] Check existing Message & Conversation backend code
- [ ] Set up local environment
- [ ] Create feature branch
- [ ] Update project board

### Development Environment Setup

```bash
# Backend
cd marifetbul-backend
mvn clean install
mvn spring-boot:run

# Frontend
cd ..
npm install
npm run dev

# Open browser
http://localhost:3000/messages
```

### Testing WebSocket Connection

1. Open browser DevTools → Network → WS filter
2. Login to application
3. Navigate to /messages
4. Verify WebSocket connection: Status 101
5. Check console for connection logs
6. Send a test message
7. Verify real-time delivery

---

**Sistem şu anda yarım! Bu sprint ile production-ready hale getirilecek!** 🚀💬
