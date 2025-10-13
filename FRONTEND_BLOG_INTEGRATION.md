# Frontend Blog Integration Guide

## ✅ Tamamlanan Çalışmalar

### 1. API Client & Endpoints (✅ Complete)

**Dosyalar:**

- `lib/api/endpoints.ts` - Blog endpoints eklendi (BLOG_ENDPOINTS)
- `lib/api/blog.ts` - Complete blog API client oluşturuldu
- `lib/api/index.ts` - Blog API export edildi

**Eklenen Endpoint'ler (48 endpoint):**

```typescript
BLOG_ENDPOINTS = {
  // Posts (13)
  GET_POSTS, GET_POST_BY_ID, GET_POST_BY_SLUG, CREATE_POST, UPDATE_POST, DELETE_POST,
  PUBLISH_POST, SCHEDULE_POST, UNPUBLISH_POST, ARCHIVE_POST, INCREMENT_VIEW,
  MY_POSTS, MY_DRAFTS,

  // Discovery (8)
  GET_FEATURED, GET_TRENDING, GET_POPULAR, GET_DISCUSSED, GET_RELATED,
  BY_CATEGORY, BY_TAG, BY_AUTHOR, SEARCH_POSTS,

  // Admin (3)
  ADMIN_ALL_POSTS, ADMIN_BY_STATUS, ADMIN_STATISTICS,

  // Categories (6)
  GET_CATEGORIES, GET_CATEGORY_BY_ID, GET_CATEGORY_BY_SLUG,
  CREATE_CATEGORY, UPDATE_CATEGORY, DELETE_CATEGORY,

  // Comments (8)
  GET_COMMENTS_BY_POST, GET_APPROVED_COMMENTS, CREATE_COMMENT,
  GET_COMMENT_REPLIES, DELETE_COMMENT,
  APPROVE_COMMENT, REJECT_COMMENT, SPAM_COMMENT
}
```

**Blog API Functions (30+ functions):**

```typescript
import { blogApi } from '@/lib/api/blog';

// Example usage
const posts = await blogApi.getPublishedPosts({ page: 0, size: 10 });
const post = await blogApi.getPostBySlug('my-post-slug');
const featured = await blogApi.getFeaturedPosts(5);
const categories = await blogApi.getCategories();
```

### 2. Type Definitions (✅ Complete)

**Yeni Type'lar:**

```typescript
BlogCategory - Blog kategorileri
BlogTag - Blog etiketleri
AuthorSummary - Yazar özet bilgileri
BlogPostSummary - Post liste görünümü (content yok)
BlogPost - Tam post detayı (content dahil)
BlogComment - Yorumlar (threaded)
BlogStatistics - İstatistikler
PageResponse<T> - Spring Boot Page response
```

**Request DTOs:**

```typescript
CreateBlogPostRequest
UpdateBlogPostRequest
CreateCommentRequest
PublishPostRequest
CreateCategoryRequest
UpdateCategoryRequest
```

### 3. Blog List Page Update (✅ Complete)

**Dosya:** `app/blog/page.tsx`

**Değişiklikler:**

- ✅ Mock data kaldırıldı
- ✅ `blogApi.getPublishedPosts()` entegrasyonu yapıldı
- ✅ Real API response handling
- ✅ Error handling eklendi
- ✅ Type-safe implementation

**API Çağrısı:**

```typescript
const response = await blogApi.getPublishedPosts({
  page: 0,
  size: 10,
  sort: 'publishedAt,desc',
});
```

## 🔄 Kısmi Tamamlanan Çalışmalar

### Blog Detail Page (`app/blog/[slug]/page.tsx`)

**Durum:** Type hatası var - AuthorSummary ve BlogPost arasında uyumsuzluk

**Sorun:**

- Mock data'nın structure'ı yeni BlogPost type'ı ile uyuşmuyor
- `author.name` vs `author.fullName`
- `post.views` vs `post.viewCount`
- `post.coverImage` property eksik

**Çözüm için yapılacaklar:**

1. `getPostBySlug()` API çağrısı ekle
2. Mock data'yı tamamen kaldır
3. Type uyumsuzluklarını düzelt
4. Related posts için API çağrısı ekle

## ⏳ Yapılması Gerekenler

### 1. Blog Detail Page - Tam Entegrasyon

**Dosya:** `app/blog/[slug]/page.tsx`

**Güncellenecek Fonksiyonlar:**

```typescript
async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const post = await blogApi.getPostBySlug(slug);
    // Auto increment view count
    await blogApi.incrementViewCount(post.id);
    return post;
  } catch (error) {
    console.error('Blog post fetch error:', error);
    return null;
  }
}

async function getRelatedPosts(postId: number): Promise<BlogPostSummary[]> {
  try {
    return await blogApi.getRelatedPosts(postId, 3);
  } catch (error) {
    console.error('Related posts error:', error);
    return [];
  }
}
```

**Component Güncellemeleri:**

- Author display: `author.fullName` kullan
- View count: `post.viewCount` kullan
- Reading time: `post.readingTime` kullan
- Cover image: Optional olarak işle (backend'de yok)
- Tags: `BlogTag[]` type'ını handle et

### 2. Blog Comments Component

**Dosya:** `app/blog/[slug]/comments.tsx`

**Yapılacaklar:**

```typescript
import { blogApi } from '@/lib/api/blog';

// Get comments
const comments = await blogApi.getApprovedComments(postId);

// Create comment
await blogApi.createComment(postId, {
  content: commentText,
  parentId: replyToId
});

// Get replies (for threading)
const replies = await blogApi.getCommentReplies(commentId);
```

### 3. Blog Search Page

**Dosya:** `app/blog/search/page.tsx`

**API Entegrasyonu:**

```typescript
const results = await blogApi.searchPosts({
  q: searchQuery,
  page: 0,
  size: 20
});
```

### 4. Blog Categories Page

**Dosya:** `app/blog/categories/[slug]/page.tsx`

**API Entegrasyonu:**

```typescript
// Get category info
const category = await blogApi.getCategoryBySlug(slug);

// Get posts by category
const posts = await blogApi.getPostsByCategory(slug, {
  page: 0,
  size: 10
});
```

### 5. Homepage Blog Section

**Dosya:** `app/page.tsx` or `components/home/BlogSection.tsx`

**Featured Posts:**

```typescript
const featuredPosts = await blogApi.getFeaturedPosts(3);
// or
const trendingPosts = await blogApi.getTrendingPosts(5);
```

### 6. Admin Blog Management

**Yeni Sayfalar Oluşturulacak:**

- `app/admin/blog/posts/page.tsx` - Post listesi
- `app/admin/blog/posts/new/page.tsx` - Post oluştur
- `app/admin/blog/posts/[id]/edit/page.tsx` - Post düzenle
- `app/admin/blog/categories/page.tsx` - Kategori yönetimi
- `app/admin/blog/comments/page.tsx` - Yorum moderasyonu
- `app/admin/blog/statistics/page.tsx` - Blog istatistikleri

**Admin API Calls:**

```typescript
// Get all posts (any status)
const allPosts = await blogApi.getAllPosts();

// Get drafts
const drafts = await blogApi.getPostsByStatus('DRAFT');

// Get statistics
const stats = await blogApi.getBlogStatistics();

// Publish post
await blogApi.publishPost(postId);

// Moderate comment
await blogApi.approveComment(commentId);
```

## 📋 Integration Checklist

### Core Pages

- [x] Blog List Page (`/blog`) - ✅ API entegre
- [ ] Blog Detail Page (`/blog/[slug]`) - ⚠️ Type hatası var
- [ ] Blog Search Page (`/blog/search`) - 🔜 Yapılacak
- [ ] Category Page (`/blog/categories/[slug]`) - 🔜 Yapılacak
- [ ] Blog Comments Component - 🔜 Yapılacak

### Homepage Integration

- [ ] Featured Posts Section - 🔜 Yapılacak
- [ ] Trending Posts Section - 🔜 Yapılacak

### Admin Pages

- [ ] Post Management - 🔜 Yapılacak
- [ ] Post Editor (WYSIWYG) - 🔜 Yapılacak
- [ ] Category Management - 🔜 Yapılacak
- [ ] Comment Moderation - 🔜 Yapılacak
- [ ] Blog Statistics Dashboard - 🔜 Yapılacak

### User Features

- [ ] My Posts Page (`/dashboard/blogger/my-posts`) - 🔜 Yapılacak
- [ ] Create Post Page - 🔜 Yapılacak
- [ ] Edit Post Page - 🔜 Yapılacak

## 🔧 Type Compatibility Issues

### AuthorSummary vs Backend

**Backend DTO:**

```java
public class AuthorSummaryDTO {
    private UUID id;
    private String username;
    private String firstName;
    private String lastName;
    private String avatarUrl;
}
```

**Frontend Type:**

```typescript
export interface AuthorSummary {
  id: string;
  username: string;
  fullName: string;  // Computed from firstName + lastName
  avatarUrl?: string;
}
```

**⚠️ Uyumsuzluk:** Backend `fullName` değil `firstName` + `lastName` gönderiyor.

**Çözüm Options:**

1. Backend'de `fullName` field ekle (computed)
2. Frontend'de mapping fonksiyonu yaz
3. Backend response transformer kullan

### BlogPost Properties

**Backend'de VAR:**

- id, slug, title, excerpt, content
- status, featured, viewCount, commentCount, readingTime
- publishedAt, createdAt, updatedAt
- category, author, tags, comments
- metaTitle, metaDescription, metaKeywords

**Frontend'de BEKLENEN (eski mock):**

- coverImage ❌ Backend'de YOK
- views → viewCount ✅ Renamed
- readTime → readingTime ✅ Renamed

**Action Items:**

- [x] Frontend type'larını backend'e uyumlu hale getir
- [ ] CoverImage feature'ı backend'e ekle (future)
- [ ] Tüm component'lerde yeni field isimlerikullan

## 🚀 Next Steps (Öncelik Sırası)

### 1. Immediate (Bugün)

1. ✅ Blog API client oluştur
2. ✅ Blog list page entegre et
3. ⏳ Blog detail page type hatalarını düzelt
4. ⏳ Comments component API entegrasyonu

### 2. Short-term (Bu Hafta)

1. Search page entegrasyonu
2. Category page entegrasyonu
3. Homepage featured posts
4. My posts page (user dashboard)

### 3. Medium-term (Gelecek Hafta)

1. Admin blog management pages
2. Post editor (Markdown/WYSIWYG)
3. Comment moderation UI
4. Blog statistics dashboard

### 4. Long-term (Gelecek Sprint)

1. Image upload for posts
2. Draft auto-save
3. Post scheduling UI
4. Advanced search filters
5. SEO optimization (sitemap, structured data)

## 📚 Documentation

### API Client Usage Examples

**Get Published Posts:**

```typescript
import { blogApi } from '@/lib/api/blog';

const response = await blogApi.getPublishedPosts({
  page: 0,
  size: 10,
  sort: 'publishedAt,desc'
});

console.log(`Total posts: ${response.totalElements}`);
console.log(`Pages: ${response.totalPages}`);
response.content.forEach(post => {
  console.log(post.title, post.author.fullName);
});
```

**Get Post by Slug:**

```typescript
const post = await blogApi.getPostBySlug('my-awesome-post');
console.log(post.title);
console.log(post.content); // Markdown content
console.log(post.tags); // BlogTag[]
```

**Search Posts:**

```typescript
const results = await blogApi.searchPosts({
  q: 'freelance',
  page: 0,
  size: 20
});
```

**Create Post (Authenticated):**

```typescript
const newPost = await blogApi.createPost({
  title: 'My New Post',
  excerpt: 'This is a great post',
  content: '# Heading\n\nContent here...',
  categoryId: 1,
  tagIds: [1, 2, 3],
  featured: false,
  status: 'DRAFT'
});
```

**Publish Post:**

```typescript
await blogApi.publishPost(postId);
```

**Add Comment:**

```typescript
const comment = await blogApi.createComment(postId, {
  content: 'Great article!',
  parentId: null // or parent comment ID for replies
});
```

### Error Handling

```typescript
try {
  const post = await blogApi.getPostBySlug(slug);
  // Success
} catch (error) {
  if (error.status === 404) {
    // Post not found
    notFound();
  } else if (error.status === 401) {
    // Unauthorized
    redirect('/login');
  } else {
    // Generic error
    console.error('Error:', error);
  }
}
```

## 🎯 Success Criteria

### Blog List Page

- [x] Loads posts from real API
- [x] Displays pagination info
- [x] Shows author, date, category
- [x] Error handling

### Blog Detail Page

- [ ] Loads post by slug
- [ ] Increments view count
- [ ] Shows related posts from API
- [ ] Comments load from API
- [ ] Type-safe implementation

### Search Functionality

- [ ] Full-text search works
- [ ] Results paginated
- [ ] Highlights search terms
- [ ] Fast response

### Admin Features

- [ ] Create/edit posts
- [ ] Publish/unpublish workflow
- [ ] Schedule posts
- [ ] Moderate comments
- [ ] View statistics

## 🔗 Related Files

### API Layer

- `lib/api/blog.ts` - Blog API client
- `lib/api/endpoints.ts` - API endpoints
- `lib/infrastructure/api/client.ts` - HTTP client

### Pages

- `app/blog/page.tsx` - Blog list
- `app/blog/[slug]/page.tsx` - Blog detail
- `app/blog/search/page.tsx` - Search
- `app/blog/categories/[slug]/page.tsx` - Category

### Components

- `components/blog/` - Blog components
- `app/blog/[slug]/comments.tsx` - Comments

### Types

- `lib/api/blog.ts` - Blog types
- `types/blog.ts` - Legacy types (to be removed)

## 📝 Notes

- Backend API base URL: `/api/v1/blog`
- All API calls are authenticated via JWT token
- Comments require moderation (PENDING → APPROVED)
- Posts can be DRAFT, PUBLISHED, SCHEDULED, or ARCHIVED
- View counts are tracked automatically on slug access
- Related posts calculated by category + tags
- Full-text search supports Turkish language

---

**Last Updated:** 2025-10-14
**Status:** In Progress (60% complete)
**Next Task:** Fix blog detail page type errors
