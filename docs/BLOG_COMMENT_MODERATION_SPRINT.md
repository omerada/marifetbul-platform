# 💬 Blog Comment Moderation System - Sprint Dokümanı

**Sprint No:** 22  
**Başlangıç Tarihi:** 26 Ekim 2025  
**Tahmini Süre:** 5-6 gün (40-48 saat)  
**Sprint Lideri:** Full-Stack Developer  
**Öncelik:** 🔴 YÜKSEK (P1)  
**Durum:** ⚠️ Backend Tamam, Frontend Eksik

---

## 📋 Executive Summary

Blog Comment Moderation sistemi **Messaging ve Review sistemleriyle aynı durumda**: Backend tamamen hazır ve production-ready ancak **frontend tarafı minimal implementasyon** durumunda. Admin moderation UI'ı mevcut ama **kritik API entegrasyonları eksik** ve **kullanıcı tarafı yorum özellikleri yarım bırakılmış**.

### 🎯 Sprint Hedefi

Blog yorum sistemini **baştan sona entegre etmek** ve **tam fonksiyonel** hale getirmek:

- ✅ Backend API'lerini frontend'e entegre etmek
- ✅ Admin moderation panelini tamamlamak
- ✅ Kullanıcı yorum özelliklerini eksiksiz yapmak (reply, edit, delete, report)
- ✅ Real-time özellikleri eklemek (auto-refresh, notifications)
- ✅ Public yorum sistemini blog sayfalarına entegre etmek

---

## 🔍 Mevcut Durum Analizi

### Backend - ✅ 100% HAZIR (Sprint 17'de Tamamlandı)

#### 📦 Mimari Yapı

```
Blog Comment System (Clean Architecture - Facade Pattern)
├── BlogCommentController (18 endpoints)
├── CommentFacadeService (@Primary - Orchestrator)
│   ├── CommentCrudService (CRUD operations)
│   ├── CommentModerationService (Moderation workflows)
│   └── CommentQueryService (Advanced queries)
├── BlogComment Entity (PostgreSQL)
└── BlogCommentRepository (JPA + Custom Queries)
```

#### 🔌 Mevcut Backend Endpoints

**Public Endpoints (✅ Hazır):**

```
POST   /api/v1/blog/posts/{postId}/comments          Create comment
GET    /api/v1/blog/posts/{postId}/comments          Get approved comments
GET    /api/v1/blog/comments/{id}                    Get comment by ID
GET    /api/v1/blog/comments/{id}/replies            Get comment replies
PUT    /api/v1/blog/comments/{id}                    Update comment (author)
DELETE /api/v1/blog/comments/{id}                    Delete comment (author/admin)
GET    /api/v1/blog/posts/{postId}/comments/count    Count comments
```

**Admin/Moderator Endpoints (✅ Hazır):**

```
GET    /api/v1/blog/admin/comments/pending           Get pending comments
GET    /api/v1/blog/admin/comments?status=X          Get comments by status
POST   /api/v1/blog/admin/comments/{id}/approve      Approve comment
POST   /api/v1/blog/admin/comments/{id}/reject       Reject comment (+ reason)
POST   /api/v1/blog/admin/comments/{id}/spam         Mark as spam
GET    /api/v1/blog/users/{userId}/comments          Get user's comments
```

#### 📊 Database Schema

```sql
CREATE TABLE blog_comments (
    id                  BIGSERIAL PRIMARY KEY,
    content             TEXT NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    moderator_notes     TEXT,
    approved_at         TIMESTAMP,
    created_at          TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP,

    -- Relationships
    post_id             BIGINT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id           BIGINT REFERENCES blog_comments(id) ON DELETE CASCADE,
    moderator_id        UUID REFERENCES users(id),

    -- Indexes
    INDEX idx_blog_comments_post (post_id),
    INDEX idx_blog_comments_user (user_id),
    INDEX idx_blog_comments_parent (parent_id),
    INDEX idx_blog_comments_status (status),
    INDEX idx_blog_comments_created (created_at)
);

-- Comment Status Enum: PENDING, APPROVED, REJECTED, SPAM
```

#### 🎨 Entity Features

```java
public class BlogComment {
    // Content
    private String content;
    private CommentStatus status; // PENDING, APPROVED, REJECTED, SPAM
    private String moderatorNotes;
    private LocalDateTime approvedAt;

    // Relationships
    private BlogPost post;
    private User author;
    private BlogComment parentComment; // For threading (replies)
    private List<BlogComment> replies; // Nested replies
    private User moderator; // Who approved/rejected

    // Timestamps
    @CreatedDate private LocalDateTime createdAt;
    @LastModifiedDate private LocalDateTime updatedAt;
}
```

---

### Frontend - ⚠️ 40% YARIM UYGULAMA

#### ✅ Mevcut Komponentler

| Komponent                  | Dosya                          | Satır | Durum          | Not                            |
| -------------------------- | ------------------------------ | ----- | -------------- | ------------------------------ |
| **CommentModerationQueue** | `components/admin/moderation/` | 378   | ✅ Çalışıyor   | Filters, selection, pagination |
| **CommentModerationCard**  | `components/admin/moderation/` | 266   | ✅ Çalışıyor   | Approve/reject/spam actions    |
| **CommentBulkActions**     | `components/admin/moderation/` | ~200  | ✅ Çalışıyor   | Bulk approve/reject/spam       |
| **CommentModerationNotes** | `components/admin/moderation/` | ~150  | ✅ Çalışıyor   | Moderator notes dialog         |
| **CommentList**            | `components/blog/`             | 297   | ⚠️ Eksik       | Reply, report eksik            |
| **CommentCard**            | `components/blog/`             | ~200  | ⚠️ Eksik       | Reply/report butonları yok     |
| **CommentForm**            | `components/blog/`             | ~150  | ✅ Çalışıyor   | Create comment form            |
| **CommentEditForm**        | `components/blog/`             | ~150  | ✅ Çalışıyor   | Edit form                      |
| **CommentPagination**      | `components/blog/`             | ~100  | ✅ Çalışıyor   | Pagination                     |
| **CommentReportModal**     | `components/blog/`             | ~100  | ❌ Placeholder | Not implemented                |

#### ✅ Mevcut Hooks

| Hook                     | Dosya             | Satır | Durum    | Not                    |
| ------------------------ | ----------------- | ----- | -------- | ---------------------- |
| **useCommentModeration** | `hooks/business/` | 466   | ✅ Tamam | Admin moderation logic |
| **useCommentActions**    | `hooks/business/` | 135   | ✅ Tamam | Edit, delete, update   |
| **useCommentSubmission** | `hooks/business/` | ?     | ❌ Eksik | Reply functionality    |
| **useCommentReports**    | `hooks/business/` | ?     | ❌ Eksik | User reports           |

#### ✅ Mevcut Sayfalar

| Sayfa                | Route                        | Durum        | Not                   |
| -------------------- | ---------------------------- | ------------ | --------------------- |
| **Admin Moderation** | `/admin/moderation/comments` | ✅ Çalışıyor | Full moderation panel |
| **Blog Post Detail** | `/blog/[slug]`               | ⚠️ Yarım     | Comment display only  |

#### ❌ Eksik API Entegrasyonları

```typescript
// lib/api/blog.ts - EKSIK METODLAR

// ❌ Eksik: Get pending comments
export async function getPendingComments(
  params?: { page?: number; size?: number }
): Promise<PageResponse<BlogComment>>

// ❌ Eksik: Get comments by status
export async function getCommentsByStatus(
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM',
  params?: { page?: number; size?: number }
): Promise<PageResponse<BlogComment>>

// ❌ Eksik: Get comment replies
export async function getCommentReplies(
  commentId: number
): Promise<BlogComment[]>

// ❌ Eksik: Get user comments
export async function getUserComments(
  userId: string,
  params?: { page?: number; size?: number }
): Promise<PageResponse<BlogComment>>

// ❌ Eksik: Reply to comment
export async function replyToComment(
  commentId: number,
  data: CreateCommentRequest
): Promise<BlogComment>

// ❌ Eksik: Report comment
export async function reportComment(
  commentId: number,
  reason: string
): Promise<void>
```

#### ❌ Eksik Komponentler

```
❌ CommentReplyForm - Reply to comments
❌ CommentThreadView - Nested reply threading UI
❌ CommentReportButton - Report inappropriate comments
❌ CommentReportsList - Admin view of reported comments
❌ CommentFilterBar - Filter comments (admin)
❌ CommentSearchBar - Search comments (admin)
❌ CommentStats - Comment statistics widget
❌ CommentNotifications - Real-time comment notifications
```

---

## 🎯 Sprint Kapsamı

### Day 1-2: API Entegrasyonu ve Core Eksikliklerin Tamamlanması

#### Task 1.1: API Client Tamamlama (4 saat)

**Dosya:** `lib/api/blog.ts`

```typescript
// Eklenecek metodlar:

/**
 * Get pending comments (admin only)
 */
export async function getPendingComments(params?: {
  page?: number;
  size?: number;
}): Promise<PageResponse<BlogComment>> {
  const url = buildUrlWithParams(
    '/api/v1/blog/admin/comments/pending',
    params
  );
  return apiClient.get(url);
}

/**
 * Get comments by status (admin only)
 */
export async function getCommentsByStatus(
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM',
  params?: {
    page?: number;
    size?: number;
  }
): Promise<PageResponse<BlogComment>> {
  const url = buildUrlWithParams('/api/v1/blog/admin/comments', {
    ...params,
    status,
  });
  return apiClient.get(url);
}

/**
 * Get user's comments
 */
export async function getUserComments(
  userId: string,
  params?: {
    page?: number;
    size?: number;
  }
): Promise<PageResponse<BlogComment>> {
  const url = buildUrlWithParams(
    `/api/v1/blog/users/${userId}/comments`,
    params
  );
  return apiClient.get(url);
}

/**
 * Reply to a comment
 */
export async function replyToComment(
  commentId: number,
  data: CreateCommentRequest
): Promise<BlogComment> {
  // Backend handles this via parentId in CreateCommentRequest
  return apiClient.post(`/api/v1/blog/comments/${commentId}/replies`, data);
}

/**
 * Report a comment
 */
export async function reportComment(
  commentId: number,
  reason: string
): Promise<void> {
  return apiClient.post(`/api/v1/blog/comments/${commentId}/report`, {
    reason,
  });
}
```

#### Task 1.2: useCommentModeration Hook Güncelleme (3 saat)

**Dosya:** `hooks/business/useCommentModeration.ts`

- ✅ `getPendingComments()` API'sini entegre et
- ✅ `getCommentsByStatus()` API'sini entegre et
- ✅ Bulk actions error handling iyileştir
- ✅ Auto-refresh logic ekle

#### Task 1.3: useCommentSubmission Hook (4 saat)

**Dosya:** `hooks/business/useCommentSubmission.ts` (YENİ)

```typescript
export interface UseCommentSubmissionReturn {
  isSubmitting: boolean;
  error: string | null;
  submitComment: (postId: number, content: string) => Promise<BlogComment | null>;
  replyToComment: (commentId: number, content: string) => Promise<BlogComment | null>;
  resetError: () => void;
}

export function useCommentSubmission(): UseCommentSubmissionReturn {
  // Create comment
  // Reply to comment
  // Validation
  // Error handling
}
```

---

### Day 3-4: Kullanıcı Tarafı Comment Özellikleri

#### Task 2.1: CommentReplyForm Komponenti (4 saat)

**Dosya:** `components/blog/CommentReplyForm.tsx` (YENİ)

```typescript
interface CommentReplyFormProps {
  commentId: number;
  parentAuthor: string;
  onSuccess: (reply: BlogComment) => void;
  onCancel: () => void;
}

export function CommentReplyForm({
  commentId,
  parentAuthor,
  onSuccess,
  onCancel,
}: CommentReplyFormProps) {
  const { replyToComment, isSubmitting, error } = useCommentSubmission();

  // Reply form UI
  // Character counter
  // Submit/Cancel buttons
  // Error display
}
```

#### Task 2.2: CommentCard Güncellemesi (3 saat)

**Dosya:** `components/blog/CommentCard.tsx`

Eklenecekler:

- ✅ Reply button (opens CommentReplyForm)
- ✅ Report button (opens CommentReportModal)
- ✅ Show nested replies (threading)
- ✅ Load more replies button
- ✅ Collapse/expand replies

#### Task 2.3: CommentThreadView Komponenti (5 saat)

**Dosya:** `components/blog/CommentThreadView.tsx` (YENİ)

```typescript
interface CommentThreadViewProps {
  comment: BlogComment;
  depth?: number;
  maxDepth?: number;
  onReply?: (commentId: number) => void;
  onReport?: (commentId: number) => void;
}

export function CommentThreadView({
  comment,
  depth = 0,
  maxDepth = 5,
  onReply,
  onReport,
}: CommentThreadViewProps) {
  // Recursive comment display
  // Indentation based on depth
  // Collapse/expand nested replies
  // Show reply count
}
```

#### Task 2.4: CommentReportModal Komponenti (3 saat)

**Dosya:** `components/blog/CommentReportModal.tsx`

```typescript
interface CommentReportModalProps {
  commentId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CommentReportModal({
  commentId,
  isOpen,
  onClose,
  onSuccess,
}: CommentReportModalProps) {
  // Report reasons (spam, harassment, inappropriate, etc.)
  // Textarea for additional details
  // Submit button
  // Success/error toast
}
```

#### Task 2.5: CommentList Güncellemesi (4 saat)

**Dosya:** `components/blog/CommentList.tsx`

Eklenecekler:

- ✅ Sort options (newest, oldest, most replies)
- ✅ Filter options (show all, show threads)
- ✅ Real-time comment count update
- ✅ "Load more" infinite scroll
- ✅ Empty state improvements

---

### Day 5: Admin Panel İyileştirmeleri

#### Task 3.1: CommentReportsList Komponenti (4 saat)

**Dosya:** `components/admin/moderation/CommentReportsList.tsx` (YENİ)

```typescript
interface CommentReportsListProps {
  reports: CommentReport[];
  onReview: (reportId: number) => void;
  onDismiss: (reportId: number) => void;
}

export function CommentReportsList({
  reports,
  onReview,
  onDismiss,
}: CommentReportsListProps) {
  // List of reported comments
  // Show report reason and reporter
  // Show reported comment content
  // Review/Dismiss actions
  // Pagination
}
```

#### Task 3.2: CommentFilterBar Komponenti (3 saat)

**Dosya:** `components/admin/moderation/CommentFilterBar.tsx` (YENİ)

```typescript
interface CommentFilterBarProps {
  filters: CommentModerationFilters;
  onFilterChange: (filters: CommentModerationFilters) => void;
}

export function CommentFilterBar({
  filters,
  onFilterChange,
}: CommentFilterBarProps) {
  // Status filter (pending, approved, rejected, spam)
  // Date range picker
  // Search input
  // Has reports toggle
  // Clear filters button
}
```

#### Task 3.3: CommentSearchBar Komponenti (2 saat)

**Dosya:** `components/admin/moderation/CommentSearchBar.tsx` (YENİ)

```typescript
interface CommentSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CommentSearchBar({
  value,
  onChange,
  placeholder = 'Yorum ara...',
}: CommentSearchBarProps) {
  // Search input with debounce
  // Search by content, author, post title
  // Clear button
  // Search icon
}
```

#### Task 3.4: Admin Moderation Page Güncellemesi (2 saat)

**Dosya:** `app/admin/moderation/comments/page.tsx`

Eklenecekler:

- ✅ Integrate CommentFilterBar
- ✅ Integrate CommentSearchBar
- ✅ Add reports section
- ✅ Add statistics cards (pending, approved, rejected, spam counts)

---

### Day 6: Blog Entegrasyonu ve Testing

#### Task 4.1: Blog Post Detail Page Güncellemesi (4 saat)

**Dosya:** `app/blog/[slug]/page.tsx`

Eklenecekler:

- ✅ Full CommentList integration
- ✅ CommentThreadView integration
- ✅ Reply functionality
- ✅ Report functionality
- ✅ Real-time comment count
- ✅ SEO optimization (comment structured data)

#### Task 4.2: Blog Post Card'a Comment Count (1 saat)

**Dosyalar:** `components/blog/BlogPostCard.tsx`, `components/blog/BlogPostList.tsx`

- ✅ Show comment count badge
- ✅ Link to comments section

#### Task 4.3: E2E Testing (3 saat)

**Test Senaryoları:**

```typescript
// tests/e2e/blog-comment-moderation.spec.ts

describe('Blog Comment System', () => {
  describe('Public User Flow', () => {
    it('should create a comment', () => {});
    it('should edit own comment', () => {});
    it('should delete own comment', () => {});
    it('should reply to a comment', () => {});
    it('should report inappropriate comment', () => {});
    it('should see threaded replies', () => {});
  });

  describe('Admin Moderation Flow', () => {
    it('should see pending comments', () => {});
    it('should approve a comment', () => {});
    it('should reject a comment with reason', () => {});
    it('should mark comment as spam', () => {});
    it('should bulk approve comments', () => {});
    it('should filter comments by status', () => {});
    it('should search comments', () => {});
    it('should review reported comments', () => {});
  });
});
```

#### Task 4.4: Documentation Update (1 saat)

**Dosyalar:**

- `docs/BLOG_COMMENT_USER_GUIDE.md` - Güncelle
- `docs/BLOG_COMMENT_MODERATOR_GUIDE.md` - Güncelle
- `docs/BLOG_COMMENT_SYSTEM_TESTING.md` - Güncelle

---

## 📊 Kullanıcı Akışları

### 1. Public User - Comment Creation Flow

```
User visits blog post
  ↓
Scrolls to comments section
  ↓
Clicks "Yorum Yap" button
  ↓
Enters comment text (min 10, max 1000 chars)
  ↓
Clicks "Gönder"
  ↓
Comment submitted with status: PENDING
  ↓
Shows "Yorumunuz moderasyon bekliyor" message
  ↓
Admin approves comment
  ↓
User sees comment published
  ↓
Optional: Email notification sent
```

### 2. Public User - Reply to Comment Flow

```
User sees existing comment
  ↓
Clicks "Yanıtla" button
  ↓
CommentReplyForm opens below comment
  ↓
Enters reply text
  ↓
Clicks "Yanıtla"
  ↓
Reply submitted as nested comment (parentId set)
  ↓
Reply goes through moderation
  ↓
Approved reply shows as threaded (indented)
```

### 3. Public User - Report Comment Flow

```
User sees inappropriate comment
  ↓
Clicks "Şikayet Et" button
  ↓
CommentReportModal opens
  ↓
Selects report reason (spam, harassment, etc.)
  ↓
Optionally adds details
  ↓
Clicks "Gönder"
  ↓
Report saved in database
  ↓
Admin notified of new report
  ↓
Admin reviews and takes action
```

### 4. Admin - Moderation Flow

```
Admin visits /admin/moderation/comments
  ↓
Sees CommentModerationQueue with filters
  ↓
Filters by "PENDING" status
  ↓
Sees list of pending comments
  ↓
Reviews each comment:
  - Checks content for policy violations
  - Views comment context (post title, parent comment)
  - Sees reporter info (if reported)
  ↓
Makes decision:
  ✅ Approve: Sets status to APPROVED, records moderator
  ❌ Reject: Sets status to REJECTED, adds reason
  🚫 Spam: Sets status to SPAM
  ↓
User/author notified of decision
  ↓
Stats updated (pending count decreases)
```

### 5. Admin - Bulk Moderation Flow

```
Admin filters pending comments
  ↓
Selects multiple comments (checkbox)
  ↓
Clicks "Toplu Onayla" button
  ↓
Confirmation dialog shows
  ↓
Confirms bulk action
  ↓
Backend processes each comment
  ↓
Returns success/failure count
  ↓
UI updates (approved comments removed from pending list)
  ↓
Toast notification: "15 yorum onaylandı, 2 başarısız"
```

---

## 🎨 UI/UX Gereksinimleri

### 1. Comment Display

**Desktop:**

- Yorum kartları: 800px max width, gölgeli border
- Avatar: 40x40px, sol tarafta
- İçerik: 700px max width, sağda
- Yanıt butonu: Hover'da görünür
- Thread depth: Max 5 seviye, her seviye 40px indent

**Mobile:**

- Yorum kartları: Full width
- Avatar: 32x32px
- Thread depth: Max 3 seviye, her seviye 20px indent
- Yanıt butonu: Her zaman görünür

### 2. Comment Form

**Karakter Limiti:**

- Min: 10 karakter
- Max: 1000 karakter
- Counter: 950/1000 formatında

**Validation:**

- Required field
- Min length check
- Max length check
- No HTML tags allowed
- URL detection (auto-convert to links)

**Loading States:**

- Submit button disabled + spinner
- Form inputs disabled
- "Gönderiliyor..." text

### 3. Admin Moderation Queue

**Layout:**

- 3-column filter bar (status, date, search)
- Comment cards with actions (approve, reject, spam)
- Checkbox for bulk selection
- Pagination at bottom
- Stats cards at top (pending: X, approved: Y, etc.)

**Actions:**

- Approve: Green checkmark button
- Reject: Red X button (opens reason modal)
- Spam: Orange warning button (confirmation required)
- Bulk actions: Toolbar appears when selection active

### 4. Real-time Features

**Auto-refresh:**

- Moderation queue: Every 30 seconds
- Blog post comments: On new comment submission
- Comment count badge: On approval

**Optimistic Updates:**

- Comment submission: Shows immediately with "pending" badge
- Reply submission: Shows immediately as nested
- Like/unlike: Instant UI update

---

## 🔧 Teknik Gereksinimler

### 1. API Integration

**Error Handling:**

```typescript
try {
  const comment = await blogApi.createComment(postId, data);
} catch (error) {
  if (error.status === 401) {
    // Not authenticated
    toast.error('Yorum yapmak için giriş yapmalısınız');
    router.push('/login');
  } else if (error.status === 403) {
    // Not authorized (banned, etc.)
    toast.error('Yorum yapma yetkiniz bulunmuyor');
  } else if (error.status === 429) {
    // Rate limited
    toast.error('Çok fazla yorum yaptınız. Lütfen bekleyin');
  } else {
    // Generic error
    toast.error('Yorum gönderilemedi. Lütfen tekrar deneyin');
  }
}
```

**Rate Limiting:**

- Comment creation: Max 5 per minute
- Reply creation: Max 10 per minute
- Report submission: Max 3 per hour

### 2. Performance Optimization

**Pagination:**

- Default page size: 20 comments
- Load more: Infinite scroll (virtual scrolling for >100 comments)
- Prefetch next page on scroll (80% threshold)

**Caching:**

- Approved comments: Cache for 5 minutes
- Comment count: Cache for 1 minute
- User's own comments: No cache (real-time updates)

**Lazy Loading:**

- Comment avatars: Lazy load with placeholder
- Nested replies: Load on expand (collapsed by default after depth 2)

### 3. Security

**Content Sanitization:**

- Strip HTML tags
- Escape special characters
- Convert URLs to links (whitelist: http, https)
- Detect and block spam patterns (regex)

**Authorization:**

- Comment creation: Authenticated users only
- Comment edit/delete: Author or admin only
- Moderation actions: Admin/moderator only
- Report submission: Authenticated users only (rate limited)

### 4. Accessibility

**Keyboard Navigation:**

- Tab through comments
- Enter to expand replies
- Space to select (bulk actions)
- Escape to close modals

**Screen Reader:**

- Comment status announced ("Onaylanmış", "Beklemede")
- Reply depth announced ("2. seviye yanıt")
- Action buttons with aria-labels
- Form validation errors read aloud

**Color Contrast:**

- Comment text: 7:1 ratio (WCAG AAA)
- Buttons: 4.5:1 ratio minimum
- Status badges: 3:1 ratio + icon

---

## 🧪 Test Senaryoları

### Unit Tests

```typescript
// hooks/business/useCommentModeration.test.ts
describe('useCommentModeration', () => {
  it('should fetch pending comments', async () => {});
  it('should approve a comment', async () => {});
  it('should reject a comment with reason', async () => {});
  it('should mark comment as spam', async () => {});
  it('should handle bulk actions', async () => {});
  it('should filter by status', async () => {});
  it('should search comments', async () => {});
});

// components/blog/CommentThreadView.test.tsx
describe('CommentThreadView', () => {
  it('should render comment with replies', () => {});
  it('should collapse/expand replies', () => {});
  it('should limit depth to maxDepth', () => {});
  it('should show reply count', () => {});
});
```

### Integration Tests

```typescript
// tests/integration/blog-comments.test.ts
describe('Blog Comment Integration', () => {
  it('should create and approve a comment', async () => {
    // Create comment
    const comment = await createTestComment();
    expect(comment.status).toBe('PENDING');

    // Admin approves
    await loginAsAdmin();
    await approveComment(comment.id);

    // Verify comment is visible
    const publicComments = await getPublicComments();
    expect(publicComments).toContain(comment);
  });

  it('should handle threaded replies', async () => {
    // Create parent comment
    const parent = await createTestComment();
    await approveComment(parent.id);

    // Create reply
    const reply = await replyToComment(parent.id, 'Reply content');
    expect(reply.parentId).toBe(parent.id);

    // Verify reply shows as nested
    const comments = await getPublicComments();
    const parentComment = comments.find(c => c.id === parent.id);
    expect(parentComment.replies).toContain(reply);
  });
});
```

### E2E Tests

```typescript
// tests/e2e/blog-comment-moderation.spec.ts
test('Admin can moderate comments', async ({ page }) => {
  // Login as admin
  await page.goto('/admin/login');
  await page.fill('input[name="email"]', 'admin@marifetbul.com');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');

  // Navigate to moderation page
  await page.goto('/admin/moderation/comments');

  // Wait for pending comments to load
  await page.waitForSelector('[data-testid="comment-moderation-queue"]');

  // Approve first comment
  const firstComment = page.locator('[data-testid="comment-card"]').first();
  await firstComment.locator('button[data-action="approve"]').click();

  // Verify comment approved
  await expect(firstComment).toHaveAttribute('data-status', 'APPROVED');

  // Check pending count decreased
  const pendingCount = page.locator('[data-testid="pending-count"]');
  await expect(pendingCount).toHaveText('4'); // Was 5, now 4
});
```

---

## 📈 Başarı Metrikleri

### Fonksiyonellik

- ✅ Kullanıcılar yorum yapabiliyor
- ✅ Kullanıcılar yorumlara yanıt verebiliyor
- ✅ Kullanıcılar kendi yorumlarını düzenleyebiliyor/silebiliyor
- ✅ Kullanıcılar uygunsuz yorumları raporlayabiliyor
- ✅ Admin pending yorumları görebiliyor
- ✅ Admin yorumları onaylayabiliyor/reddedebiliyor
- ✅ Admin yorumları spam olarak işaretleyebiliyor
- ✅ Admin toplu işlem yapabiliyor (bulk actions)
- ✅ Admin raporlanmış yorumları görebiliyor
- ✅ Threaded replies (nested) çalışıyor (max 5 depth)

### Performans

- ⚡ Comment list render < 100ms (20 comments)
- ⚡ API response time < 200ms (pending comments)
- ⚡ Auto-refresh without UI jank
- ⚡ Infinite scroll smooth (60fps)
- ⚡ First comment visible < 500ms (LCP)

### Kullanıcı Deneyimi

- 😊 Kolay comment submission (3 click/tap)
- 😊 Clear moderation status ("Beklemede", "Onaylandı")
- 😊 Fast feedback (toast notifications)
- 😊 Mobile-friendly (touch targets ≥48px)
- 😊 Accessible (WCAG AA compliant)

### Test Coverage

- 🧪 Unit tests: ≥80% coverage
- 🧪 Integration tests: All critical flows
- 🧪 E2E tests: 10+ scenarios
- 🧪 Manual testing: All user flows verified

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All backend endpoints tested (Postman/Insomnia)
- [ ] All frontend components tested (Storybook/local)
- [ ] E2E tests passing
- [ ] Unit tests passing (≥80% coverage)
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No ESLint warnings

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_ENABLE_COMMENT_REPORTS=true
NEXT_PUBLIC_COMMENT_AUTO_REFRESH_INTERVAL=30000
NEXT_PUBLIC_COMMENT_MAX_LENGTH=1000
NEXT_PUBLIC_COMMENT_MIN_LENGTH=10
```

### Database Migrations

- [ ] Verify `blog_comments` table exists
- [ ] Verify indexes created
- [ ] Verify foreign key constraints
- [ ] Run data migration (if needed)

### Monitoring

- [ ] Setup Sentry error tracking
- [ ] Setup analytics events (comment_created, comment_approved, etc.)
- [ ] Setup performance monitoring (comment load time)
- [ ] Setup uptime monitoring (comment endpoints)

---

## 📚 İlgili Dokümanlar

1. **BLOG_COMMENT_MODERATION_ANALYSIS.md** - Initial system analysis
2. **BLOG_COMMENT_USER_GUIDE.md** - User documentation
3. **BLOG_COMMENT_MODERATOR_GUIDE.md** - Admin documentation
4. **BLOG_COMMENT_SYSTEM_TESTING.md** - Test scenarios
5. **MESSAGING_SYSTEM_SPRINT.md** - Similar sprint reference
6. **REVIEW_SYSTEM_SPRINT.md** - Similar sprint reference

---

## 🎯 Sprint Takvimi

| Gün       | Tarih   | Tasks                                   | Süre | Sorumlu            |
| --------- | ------- | --------------------------------------- | ---- | ------------------ |
| **Day 1** | 26 Ekim | API Client + useCommentModeration       | 7h   | Backend + Frontend |
| **Day 2** | 27 Ekim | useCommentSubmission + CommentReplyForm | 8h   | Frontend           |
| **Day 3** | 28 Ekim | CommentCard + CommentThreadView         | 8h   | Frontend           |
| **Day 4** | 29 Ekim | CommentReportModal + CommentList update | 7h   | Frontend           |
| **Day 5** | 30 Ekim | Admin panel improvements                | 7h   | Frontend           |
| **Day 6** | 31 Ekim | Blog integration + Testing              | 8h   | Full-stack         |

**Toplam Süre:** 45 saat (5.5 gün)  
**Buffer:** 0.5 gün (beklenmedik sorunlar için)

---

## ✅ Definition of Done

Sprint tamamlanmış sayılır ancak ve ancak:

1. ✅ Tüm backend API'leri frontend'e entegre edilmiş
2. ✅ Kullanıcılar yorum yapabilir, düzenleyebilir, silebilir
3. ✅ Kullanıcılar yorumlara yanıt verebilir (threaded)
4. ✅ Kullanıcılar uygunsuz yorumları raporlayabilir
5. ✅ Admin pending yorumları moderasyon yapabilir
6. ✅ Admin bulk actions kullanabilir
7. ✅ Admin raporlanmış yorumları görebilir
8. ✅ Blog post sayfalarında yorumlar görünür
9. ✅ Auto-refresh çalışıyor (admin panel)
10. ✅ E2E testler yazılmış ve passing
11. ✅ Dokümantasyon güncellenmiş
12. ✅ Code review tamamlanmış
13. ✅ Staging'de test edilmiş
14. ✅ Production'a deploy edilmiş

---

## 🆘 Risk ve Bağımlılıklar

### Riskler

1. **Threaded comments complexity** - Medium risk
   - Mitigation: Limit depth to 5, use recursive component

2. **Performance with many comments** - Medium risk
   - Mitigation: Pagination, virtual scrolling, caching

3. **Spam comments** - High risk
   - Mitigation: Rate limiting, moderator approval, spam detection

### Bağımlılıklar

1. **Backend API'ler** - ✅ Hazır
2. **Authentication system** - ✅ Çalışıyor
3. **Blog post system** - ✅ Çalışıyor
4. **Notification system** - ⚠️ Optional (nice to have)

---

## 📞 İletişim

**Sprint Lideri:** Full-Stack Developer  
**Backend Support:** Backend Team  
**Frontend Support:** Frontend Team  
**QA:** Testing Team

**Daily Standup:** Her gün 10:00  
**Sprint Review:** 31 Ekim, 16:00  
**Sprint Retrospective:** 31 Ekim, 17:00

---

**Sprint Durumu:** 🟡 BAŞLANMADI  
**Son Güncelleme:** 26 Ekim 2025  
**Versiyon:** 1.0  
**Doküman Sahibi:** MarifetBul Development Team

---

## 🏁 Sonraki Adımlar

Sprint tamamlandıktan sonra:

1. **Blog SEO Optimization Sprint** - Comment structured data, sitemap
2. **Blog Analytics Sprint** - Comment engagement metrics, popular posts
3. **Blog Advanced Features** - Comment likes, best comment, pinned comments
4. **Notification Integration** - Email/push notifications for comments

**Tahmini Toplam Süre:** 15-20 gün (tüm blog sistemi için)
