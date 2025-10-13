# Task 1.2: Blog System API - Development Plan

## 📋 Genel Bakış

**Hedef:** Blog sistemi için tam özellikli REST API geliştirip frontend ile entegre etmek.

**Frontend:** `/app/blog/` route'ları mevcut, mock data kullanıyor.

**Backend:** Sıfırdan Blog domain'i oluşturulacak.

---

## 🎯 Gereksinimler (Frontend'den)

### Frontend API Beklentileri

```typescript
// Blog Post Type
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: { id: string; name: string; slug: string };
  author: { id: string; name: string };
  publishedAt: string;
  tags: string[];
  views: number;
  featured: boolean;
}

// Endpoints
GET  /api/v1/blog/posts?page=1&limit=10&category=kariyer&search=keyword
POST /api/v1/blog/posts
GET  /api/v1/blog/posts/{slug}
PUT  /api/v1/blog/posts/{slug}
DELETE /api/v1/blog/posts/{slug}
GET  /api/v1/blog/categories
POST /api/v1/blog/posts/{id}/comments
GET  /api/v1/blog/posts/{id}/comments
```

---

## 📐 Veritabanı Şeması

### 1. blog_posts (Ana tablo)

```sql
- id BIGSERIAL PRIMARY KEY
- slug VARCHAR(255) UNIQUE NOT NULL
- title VARCHAR(500) NOT NULL
- excerpt TEXT
- content TEXT NOT NULL
- category_id BIGINT FK
- author_id UUID FK (users.id)
- published_at TIMESTAMP
- status VARCHAR(20) (DRAFT, PUBLISHED, ARCHIVED)
- featured BOOLEAN DEFAULT false
- views BIGINT DEFAULT 0
- meta_title VARCHAR(255)
- meta_description TEXT
- created_at, updated_at
- Indexes: slug, category_id, author_id, status, published_at, featured
```

### 2. blog_categories

```sql
- id BIGSERIAL PRIMARY KEY
- name VARCHAR(100) UNIQUE NOT NULL
- slug VARCHAR(100) UNIQUE NOT NULL
- description TEXT
- post_count INT DEFAULT 0
- created_at, updated_at
- Indexes: slug, name
```

### 3. blog_comments

```sql
- id BIGSERIAL PRIMARY KEY
- post_id BIGINT FK (blog_posts.id) CASCADE
- user_id UUID FK (users.id)
- parent_id BIGINT FK (self-reference for replies)
- content TEXT NOT NULL
- status VARCHAR(20) (PENDING, APPROVED, REJECTED)
- created_at, updated_at
- Indexes: post_id, user_id, parent_id, status
```

### 4. blog_tags (Many-to-Many)

```sql
- id BIGSERIAL PRIMARY KEY
- name VARCHAR(50) UNIQUE NOT NULL
- slug VARCHAR(50) UNIQUE NOT NULL
- created_at
```

### 5. blog_post_tags (Junction table)

```sql
- post_id BIGINT FK (blog_posts.id) CASCADE
- tag_id BIGINT FK (blog_tags.id) CASCADE
- PRIMARY KEY (post_id, tag_id)
```

---

## 🏗️ Backend Yapısı

### Entity Layer (5 entity)

1. **BlogPost.java** - Main blog post entity
2. **BlogCategory.java** - Post categories
3. **BlogComment.java** - Post comments (threaded)
4. **BlogTag.java** - Tags for posts
5. **BlogPostStatus.java** - Enum (DRAFT, PUBLISHED, ARCHIVED)
6. **CommentStatus.java** - Enum (PENDING, APPROVED, REJECTED)

### DTO Layer (12 DTO)

**Response DTOs:**

1. **BlogPostDTO.java** - Full post with category, author, tags
2. **BlogPostSummaryDTO.java** - List view (without content)
3. **BlogCategoryDTO.java** - Category with post count
4. **BlogCommentDTO.java** - Comment with user info
5. **BlogTagDTO.java** - Tag info
6. **AuthorSummaryDTO.java** - Author info

**Request DTOs:** 7. **CreateBlogPostRequest.java** - Validation: title, content, categoryId 8. **UpdateBlogPostRequest.java** - Partial update 9. **CreateCommentRequest.java** - Validation: content (10-5000 chars) 10. **CreateCategoryRequest.java** - name, slug, description 11. **UpdateCategoryRequest.java** - Partial 12. **PublishPostRequest.java** - publishedAt

### Repository Layer (5 repositories)

1. **BlogPostRepository.java** - 20+ custom queries
   - findBySlug, findByCategory, findByAuthor
   - findPublishedPosts, findFeaturedPosts
   - searchPosts (title/content), findByTag
   - incrementViews, countByCategory
2. **BlogCategoryRepository.java** - 8 queries
   - findBySlug, findAll sorted
   - updatePostCount, findWithPostCount
3. **BlogCommentRepository.java** - 10 queries
   - findByPostId, findByUserId
   - findRootComments, findReplies
   - countByPostId, countByStatus
4. **BlogTagRepository.java** - 6 queries
   - findBySlug, findByName
   - findPopularTags, searchTags
5. **BlogPostTagRepository.java** (optional - Spring Data handles it)

### Service Layer (4 services)

1. **BlogPostService.java** + Impl (600+ lines)
   - CRUD operations
   - Slug generation (unique)
   - Publish/unpublish logic
   - View count increment
   - Featured post management
   - Search & filter
   - SEO metadata
2. **BlogCategoryService.java** + Impl (200 lines)
   - CRUD operations
   - Post count maintenance
   - Slug validation
3. **BlogCommentService.java** + Impl (300 lines)
   - CRUD operations
   - Threaded comments (parent/child)
   - Comment moderation (approve/reject)
   - Spam detection (future)
4. **BlogTagService.java** + Impl (150 lines)
   - Tag CRUD
   - Tag suggestions
   - Popular tags

### Controller Layer (3 controllers)

1. **BlogPostController.java** (15 endpoints)
   - GET /posts (list with filters)
   - GET /posts/{slug}
   - POST /posts (ADMIN)
   - PUT /posts/{slug} (ADMIN/AUTHOR)
   - DELETE /posts/{slug} (ADMIN)
   - POST /posts/{slug}/publish (ADMIN)
   - GET /posts/featured
   - GET /posts/search
   - POST /posts/{postId}/increment-view
   - GET /posts/author/{userId}
   - GET /posts/category/{categorySlug}
   - GET /posts/tag/{tagSlug}
   - GET /posts/{postId}/related
   - GET /posts/statistics (ADMIN)
2. **BlogCategoryController.java** (6 endpoints)
   - GET /categories
   - GET /categories/{slug}
   - POST /categories (ADMIN)
   - PUT /categories/{id} (ADMIN)
   - DELETE /categories/{id} (ADMIN)
   - GET /categories/statistics (ADMIN)
3. **BlogCommentController.java** (8 endpoints)
   - GET /posts/{postId}/comments
   - POST /posts/{postId}/comments
   - PUT /comments/{id}
   - DELETE /comments/{id}
   - POST /comments/{id}/approve (ADMIN)
   - POST /comments/{id}/reject (ADMIN)
   - GET /comments/moderation (ADMIN)
   - GET /comments/user/{userId}

### Database Migration (3 SQL files)

1. **V29\_\_create_blog_categories_table.sql**
2. **V30\_\_create_blog_posts_table.sql**
3. **V31\_\_create_blog_comments_and_tags_tables.sql**

---

## 📊 Kod Metrikleri (Tahmin)

| Katman     | Dosya  | Satır     | Açıklama                            |
| ---------- | ------ | --------- | ----------------------------------- |
| Entity     | 5      | ~700      | Blog, Category, Comment, Tag, Enums |
| DTO        | 12     | ~600      | Request/Response DTOs               |
| Repository | 5      | ~400      | Custom JPQL queries                 |
| Service    | 8      | ~1400     | Business logic + Impl               |
| Controller | 3      | ~700      | REST endpoints                      |
| Migration  | 3      | ~300      | SQL DDL                             |
| **TOPLAM** | **36** | **~4100** |                                     |

---

## 🎯 Backend Features

### Core Features ✅

- ✅ Blog CRUD (title, content, excerpt, slug)
- ✅ Category management
- ✅ Comment system (threaded)
- ✅ Tag system (many-to-many)
- ✅ Draft/Publish workflow
- ✅ Featured posts
- ✅ View counter
- ✅ Search & filtering
- ✅ Author management
- ✅ SEO metadata

### Advanced Features 🔄

- 🔄 Rich text content (Markdown/HTML)
- 🔄 Image upload (separate feature)
- 🔄 Comment moderation
- 🔄 Comment spam detection
- 🔄 Related posts algorithm
- 🔄 RSS feed generation
- 🔄 Sitemap generation
- 🔄 Reading time calculation

### Admin Features ✅

- ✅ Post management (CRUD)
- ✅ Category management
- ✅ Comment moderation
- ✅ Statistics dashboard
- ✅ Featured post selection

---

## 🔒 Security & Authorization

### Role-Based Access:

- **PUBLIC**: Read published posts, categories, approved comments
- **USER**: Create comments on own posts, edit own comments
- **AUTHOR**: Create/edit own blog posts, manage own post comments
- **ADMIN**: Full access (all posts, categories, moderation)

### Validation:

- Title: 5-500 chars
- Content: 50-50000 chars
- Excerpt: 10-500 chars
- Slug: unique, URL-safe
- Comment: 10-5000 chars

---

## 🚀 Implementation Order

### Phase 1: Entity & Migration (30 min)

1. Create entity classes
2. Create enum classes
3. Create migration SQL files
4. Test compilation

### Phase 2: DTO Layer (20 min)

1. Response DTOs
2. Request DTOs with validation
3. Mapper interfaces

### Phase 3: Repository Layer (25 min)

1. BlogPostRepository (complex queries)
2. CategoryRepository
3. CommentRepository
4. TagRepository

### Phase 4: Service Layer (60 min)

1. BlogPostService (main logic)
2. CategoryService
3. CommentService
4. TagService

### Phase 5: Controller Layer (30 min)

1. BlogPostController
2. CategoryController
3. CommentController

### Phase 6: Frontend Integration (20 min)

1. Update frontend API calls
2. Replace mock data
3. Test end-to-end

**Total Estimated Time: ~3 hours**

---

## 🧪 Testing Strategy

- ✅ Repository tests (H2 database)
- ✅ Service unit tests (Mockito)
- ✅ Controller integration tests
- ✅ End-to-end with frontend

---

## 📝 Notes

1. **Slug Generation:** Title → lowercase → replace spaces → unique check
2. **View Counter:** Atomic increment to avoid race conditions
3. **Comment Threading:** Use parent_id for nested comments
4. **SEO:** meta_title, meta_description for each post
5. **Featured Posts:** Boolean flag + admin selection
6. **Draft Workflow:** Create as DRAFT, publish separately
7. **Soft Delete:** Optional for posts/comments

---

## ✅ Success Criteria

- [ ] All entities compile and migrate
- [ ] All repositories have custom queries
- [ ] All services implement business logic
- [ ] All controllers have Swagger docs
- [ ] Frontend can fetch real blog data
- [ ] Admin can CRUD posts/categories
- [ ] Users can comment on posts
- [ ] Search & filter work correctly

---

**Ready to Start!** 🚀

Başlangıç: Entity Layer → Migration → DTO → Repository → Service → Controller → Frontend
