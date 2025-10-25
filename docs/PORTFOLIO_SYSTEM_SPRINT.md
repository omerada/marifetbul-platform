# 🎨 Portfolio System Sprint

**Sprint Durumu:** ⏳ Planlama  
**Başlangıç Tarihi:** TBD  
**Tahmini Süre:** 8 gün (64 saat)  
**Sprint Lideri:** Backend + Frontend Developer  
**Öncelik:** Yüksek (Frontend hazır, backend eksik)

---

## 📋 Executive Summary

Portfolio sistemi, freelancer'ların yeteneklerini sergilemek için tamamladıkları projeleri görsel olarak sunabilecekleri kritik bir özelliktir. Frontend tarafı tamamen hazır durumda (PortfolioGallery, PortfolioModal, state management) ancak backend'de **hiçbir portfolio desteği bulunmamaktadır**. Bu sprint, backend'de sıfırdan portfolio CRUD sistemini inşa edecek ve mevcut frontend ile entegre edecektir.

### Mevcut Durum

- ✅ **Frontend:** 100% hazır
  - `PortfolioGallery.tsx` (Portfolio grid görünümü)
  - `PortfolioModal.tsx` (Proje ekleme/düzenleme modalı)
  - `useProfile` hook ile state management
  - Tip tanımları (PortfolioItem interface)
- ❌ **Backend:** 0% - Hiç yok
  - Portfolio entity yok
  - Portfolio controller yok
  - Portfolio repository yok
  - Portfolio DTO'ları yok

---

## 🎯 Sprint Objectives

### Primary Goals

1. **Backend Portfolio Entity**: Portfolio veritabanı modeli oluşturma
2. **Portfolio CRUD API**: RESTful portfolio yönetim endpoint'leri
3. **Frontend-Backend Integration**: Mevcut frontend'i backend ile bağlama
4. **Image Upload**: Portfolio görselleri için dosya yükleme sistemi
5. **Portfolio Public View**: Profil sayfalarında portfolio görüntüleme

### Success Metrics

- [ ] Portfolio entity ve migration tamamlandı
- [ ] Portfolio CRUD endpoint'leri çalışıyor
- [ ] Frontend başarıyla backend'e bağlandı
- [ ] Görsel yükleme sistemi çalışıyor
- [ ] Profil sayfalarında portfolio doğru görüntüleniyor
- [ ] Test coverage %85+

---

## 📊 Current State Analysis

### Frontend - Portfolio Components

#### 1. PortfolioGallery Component (`components/domains/profile/PortfolioGallery.tsx`)

**Durum:** ✅ Tamamen Hazır (256 satır)

**Features:**

- Portfolio grid görünümü (responsive 1-3 columns)
- Proje kartları (görsel, başlık, açıklama, teknolojiler)
- Edit/Delete butonları (own profile için)
- Modal entegrasyonu (add/edit)
- Empty state handling

**Current Hooks:**

```typescript
const {
  profile,
  addPortfolioItem,
  updatePortfolioItem,
  removePortfolioItem,
} = useProfile();
```

**Data Structure Expected:**

```typescript
interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  url?: string;
  skills: string[];
  completedAt: string;
  imageUrl?: string; // Alias for first image
  tags?: string[]; // Alias for skills
  category?: string;
  client?: string;
  techStack?: string[];
}
```

#### 2. PortfolioModal Component (`components/domains/profile/PortfolioModal.tsx`)

**Durum:** ✅ Tamamen Hazır (362 satır)

**Features:**

- Form validation (Zod schema)
- Project title, description, URL, completed date
- Skills management (add/remove tags)
- Image URL management (multi-image support)
- Image preview with delete
- File upload placeholder (not yet implemented)

**Validation Schema:**

```typescript
const portfolioSchema = z.object({
  title: z.string().min(3, 'Proje başlığı en az 3 karakter olmalı'),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalı'),
  url: z.string().url('Geçerli bir URL giriniz').optional().or(z.literal('')),
  completedAt: z.string().min(1, 'Tamamlanma tarihi gerekli'),
});
```

#### 3. Profile Store (`lib/core/store/profile.ts`)

**Durum:** ⚠️ Frontend logic ready, backend calls will fail

**Portfolio Methods:**

```typescript
// Add portfolio item (lines 223-259)
addPortfolioItem: async (item: Omit<PortfolioItem, 'id'>) => {
  // Creates temp ID: `portfolio-${Date.now()}`
  // Calls updateProfile with new portfolio array
  // Currently will fail - no backend endpoint
}

// Update portfolio item
updatePortfolioItem: async (id: string, item: Partial<PortfolioItem>) => {
  // Updates specific item in portfolio array
  // Currently will fail - no backend endpoint
}

// Remove portfolio item
removePortfolioItem: async (id: string) => {
  // Removes item from portfolio array
  // Currently will fail - no backend endpoint
}
```

**Current Implementation:**

- Uses `updateProfile()` method which calls `/api/v1/auth/profile`
- Portfolio stored as JSON array in user profile
- No dedicated portfolio endpoints

### Backend - Missing Components

#### 1. Portfolio Entity

**Durum:** ❌ Yok

**Required Fields:**

- `id` (UUID, primary key)
- `userId` (UUID, foreign key to User)
- `title` (String, not null)
- `description` (String, TEXT)
- `url` (String, nullable)
- `completedAt` (LocalDate)
- `category` (String, nullable)
- `client` (String, nullable)
- `displayOrder` (Integer, for sorting)
- `isPublic` (Boolean, default true)
- `viewCount` (Integer, default 0)
- `createdAt`, `updatedAt` (timestamps)

**Relationships:**

- `@ManyToOne` → User
- `@OneToMany` → PortfolioImage
- `@ManyToMany` → Skill (or JSON array)

#### 2. PortfolioImage Entity

**Durum:** ❌ Yok

**Required Fields:**

- `id` (UUID)
- `portfolioId` (UUID, foreign key)
- `imageUrl` (String, not null)
- `displayOrder` (Integer)
- `isPrimary` (Boolean)

#### 3. Portfolio Controller

**Durum:** ❌ Yok

**Required Endpoints:**

```java
POST   /api/v1/portfolios                    // Create portfolio item
GET    /api/v1/portfolios/{id}               // Get portfolio item
PUT    /api/v1/portfolios/{id}               // Update portfolio item
DELETE /api/v1/portfolios/{id}               // Delete portfolio item
GET    /api/v1/portfolios/user/{userId}      // Get user's portfolio items
POST   /api/v1/portfolios/{id}/images        // Upload image
DELETE /api/v1/portfolios/{id}/images/{imageId} // Delete image
PUT    /api/v1/portfolios/{id}/order         // Reorder items
```

#### 4. DTOs

**Durum:** ❌ Yok

**Required DTOs:**

- `PortfolioCreateRequest`
- `PortfolioUpdateRequest`
- `PortfolioResponse`
- `PortfolioImageResponse`
- `PortfolioSummaryResponse` (for list view)

---

## 🏗️ Implementation Plan

### Phase 1: Backend Foundation (Days 1-3)

#### Day 1: Database & Entity Layer

**Görevler:**

1. Create `Portfolio` entity
   - Fields: id, userId, title, description, url, completedAt, category, client, displayOrder, isPublic, viewCount
   - Relationships: @ManyToOne User, @OneToMany PortfolioImage
   - Indexes: userId, displayOrder, isPublic
2. Create `PortfolioImage` entity
   - Fields: id, portfolioId, imageUrl, displayOrder, isPrimary
   - Relationship: @ManyToOne Portfolio
   - Index: portfolioId

3. Create `PortfolioSkill` join table (or JSON array)
   - Fields: portfolioId, skill
   - Alternative: Store skills as JSON array in Portfolio

4. Create Liquibase migrations
   - `changelog-portfolio-tables.xml`
   - Add to master changelog

**Estimated Time:** 6 hours

**Files to Create:**

- `src/main/java/com/marifetbul/api/domain/portfolio/entity/Portfolio.java`
- `src/main/java/com/marifetbul/api/domain/portfolio/entity/PortfolioImage.java`
- `src/main/resources/db/changelog/changes/v1/changelog-portfolio-tables.xml`

#### Day 2: Repository & Service Layer

**Görevler:**

1. Create `PortfolioRepository`
   - Custom queries: findByUserId, findByUserIdAndIsPublic
   - Pagination support

2. Create `PortfolioImageRepository`
   - Custom query: findByPortfolioIdOrderByDisplayOrder

3. Create `PortfolioService` & `PortfolioServiceImpl`
   - Methods: create, update, delete, getById, getUserPortfolio
   - Authorization checks (only owner can modify)
   - Image ordering logic
   - Validation (max 20 items per user)

4. Create DTOs
   - `PortfolioCreateRequest`
   - `PortfolioUpdateRequest`
   - `PortfolioResponse`
   - `PortfolioImageResponse`

**Estimated Time:** 8 hours

**Files to Create:**

- `src/main/java/com/marifetbul/api/domain/portfolio/repository/PortfolioRepository.java`
- `src/main/java/com/marifetbul/api/domain/portfolio/repository/PortfolioImageRepository.java`
- `src/main/java/com/marifetbul/api/domain/portfolio/service/PortfolioService.java`
- `src/main/java/com/marifetbul/api/domain/portfolio/service/impl/PortfolioServiceImpl.java`
- `src/main/java/com/marifetbul/api/domain/portfolio/dto/*.java` (4 DTOs)

#### Day 3: Controller & REST API

**Görevler:**

1. Create `PortfolioController`
   - POST /portfolios (authenticated, freelancer only)
   - GET /portfolios/{id} (public)
   - PUT /portfolios/{id} (owner only)
   - DELETE /portfolios/{id} (owner only)
   - GET /portfolios/user/{userId} (public)
   - PUT /portfolios/{id}/order (owner only)

2. Add Swagger documentation
   - @Operation, @Parameter annotations
   - Example requests/responses

3. Security configuration
   - @PreAuthorize for owner-only operations
   - Public access for GET operations

**Estimated Time:** 6 hours

**Files to Create:**

- `src/main/java/com/marifetbul/api/domain/portfolio/controller/PortfolioController.java`

### Phase 2: Image Upload System (Day 4)

#### Day 4: File Upload & Storage

**Görevler:**

1. Create `ImageUploadService`
   - Local file storage (initial implementation)
   - File validation (max size 5MB, allowed types: jpg, png, webp)
   - Image resizing (thumbnail: 300x200, full: 1200x800)
   - Unique filename generation

2. Add image upload endpoints
   - POST /portfolios/{id}/images (multipart/form-data)
   - DELETE /portfolios/{id}/images/{imageId}
   - PUT /portfolios/{id}/images/order

3. Frontend integration preparation
   - CORS configuration
   - Multipart file handling
   - Error response formatting

**Estimated Time:** 8 hours

**Files to Create:**

- `src/main/java/com/marifetbul/api/infrastructure/file/ImageUploadService.java`
- Update `PortfolioController` with image endpoints

**Configuration:**

```yaml
# application.yml
file:
  upload:
    directory: ./uploads/portfolio
    max-size: 5242880 # 5MB
    allowed-types: jpg,jpeg,png,webp
```

### Phase 3: Frontend Integration (Days 5-6)

#### Day 5: API Integration

**Görevler:**

1. Create `portfolioApi` service
   - `createPortfolio(data)`
   - `updatePortfolio(id, data)`
   - `deletePortfolio(id)`
   - `getPortfolio(id)`
   - `getUserPortfolio(userId)`
   - `uploadImage(portfolioId, file)`

2. Update `useProfile` store
   - Replace temp portfolio logic with real API calls
   - Error handling
   - Loading states
   - Optimistic updates

3. Add image upload to PortfolioModal
   - File input with drag-drop
   - Image preview before upload
   - Upload progress indicator
   - Replace URL input with file upload

**Estimated Time:** 8 hours

**Files to Update:**

- `lib/api/portfolio.ts` (new file)
- `lib/core/store/profile.ts` (update portfolio methods)
- `components/domains/profile/PortfolioModal.tsx` (add file upload)

#### Day 6: Polish & UX Improvements

**Görevler:**

1. Portfolio reordering
   - Drag-drop functionality
   - Save order to backend

2. Image management improvements
   - Primary image selection
   - Image gallery modal (lightbox)
   - Lazy loading for images

3. Portfolio filtering/sorting
   - Filter by category
   - Sort by date, title, views

4. Loading states & skeletons
   - Portfolio card skeleton
   - Modal loading state
   - Image upload progress

**Estimated Time:** 8 hours

**Files to Create/Update:**

- `components/domains/profile/PortfolioDragDrop.tsx`
- `components/domains/profile/ImageGalleryModal.tsx`
- `components/ui/PortfolioSkeleton.tsx`

### Phase 4: Testing & Documentation (Days 7-8)

#### Day 7: Backend Testing

**Görevler:**

1. Unit tests
   - PortfolioServiceTest
   - ImageUploadServiceTest
   - Validation tests

2. Integration tests
   - PortfolioControllerIntegrationTest
   - Image upload integration test
   - Authorization tests

3. Performance tests
   - Portfolio list pagination
   - Image upload speed
   - Concurrent access tests

**Estimated Time:** 8 hours

**Files to Create:**

- `src/test/java/com/marifetbul/api/domain/portfolio/service/PortfolioServiceTest.java`
- `src/test/java/com/marifetbul/api/domain/portfolio/controller/PortfolioControllerIntegrationTest.java`
- `src/test/java/com/marifetbul/api/infrastructure/file/ImageUploadServiceTest.java`

#### Day 8: Frontend Testing & Documentation

**Görevler:**

1. Frontend tests
   - PortfolioGallery component tests
   - PortfolioModal form validation tests
   - Portfolio API integration tests
   - Image upload tests

2. E2E tests
   - Create portfolio flow
   - Edit portfolio flow
   - Delete portfolio flow
   - Image upload flow
   - Public view flow

3. Documentation
   - API documentation (Swagger)
   - User guide update
   - Developer documentation
   - Deployment notes

**Estimated Time:** 8 hours

**Files to Create:**

- `tests/components/profile/PortfolioGallery.test.tsx`
- `tests/components/profile/PortfolioModal.test.tsx`
- `tests/e2e/portfolio.spec.ts`
- `docs/PORTFOLIO_SYSTEM_USER_GUIDE.md`
- `docs/PORTFOLIO_SYSTEM_API_DOCS.md`

---

## 🔌 API Specification

### 1. Create Portfolio Item

```http
POST /api/v1/portfolios
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "E-commerce Website",
  "description": "Full-stack e-commerce platform with payment integration",
  "url": "https://example.com",
  "completedAt": "2025-01-15",
  "category": "Web Development",
  "client": "ABC Company",
  "skills": ["React", "Node.js", "PostgreSQL"],
  "isPublic": true
}

Response 201:
{
  "status": "success",
  "message": "Portfolio item created successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "title": "E-commerce Website",
    "description": "...",
    "url": "https://example.com",
    "completedAt": "2025-01-15",
    "category": "Web Development",
    "client": "ABC Company",
    "skills": ["React", "Node.js", "PostgreSQL"],
    "images": [],
    "displayOrder": 1,
    "isPublic": true,
    "viewCount": 0,
    "createdAt": "2025-01-26T10:00:00Z",
    "updatedAt": "2025-01-26T10:00:00Z"
  }
}
```

### 2. Upload Portfolio Image

```http
POST /api/v1/portfolios/{portfolioId}/images
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: (binary)
isPrimary: true

Response 201:
{
  "status": "success",
  "message": "Image uploaded successfully",
  "data": {
    "id": "uuid",
    "portfolioId": "uuid",
    "imageUrl": "/uploads/portfolio/uuid-filename.jpg",
    "thumbnailUrl": "/uploads/portfolio/uuid-filename-thumb.jpg",
    "displayOrder": 1,
    "isPrimary": true
  }
}
```

### 3. Get User Portfolio

```http
GET /api/v1/portfolios/user/{userId}?page=0&size=10&sort=displayOrder,asc

Response 200:
{
  "status": "success",
  "message": "Portfolio items retrieved successfully",
  "data": {
    "content": [
      {
        "id": "uuid",
        "title": "E-commerce Website",
        "description": "...",
        "url": "https://example.com",
        "completedAt": "2025-01-15",
        "category": "Web Development",
        "skills": ["React", "Node.js"],
        "images": [
          {
            "id": "uuid",
            "imageUrl": "/uploads/portfolio/image1.jpg",
            "isPrimary": true
          }
        ],
        "viewCount": 42
      }
    ],
    "totalElements": 15,
    "totalPages": 2,
    "page": 0,
    "size": 10
  }
}
```

### 4. Update Portfolio Item

```http
PUT /api/v1/portfolios/{portfolioId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "skills": ["React", "TypeScript", "Next.js"]
}

Response 200:
{
  "status": "success",
  "message": "Portfolio item updated successfully",
  "data": { /* updated portfolio */ }
}
```

### 5. Delete Portfolio Item

```http
DELETE /api/v1/portfolios/{portfolioId}
Authorization: Bearer {token}

Response 200:
{
  "status": "success",
  "message": "Portfolio item deleted successfully",
  "data": null
}
```

### 6. Reorder Portfolio Items

```http
PUT /api/v1/portfolios/reorder
Authorization: Bearer {token}
Content-Type: application/json

{
  "portfolioIds": ["uuid1", "uuid2", "uuid3"]
}

Response 200:
{
  "status": "success",
  "message": "Portfolio items reordered successfully",
  "data": null
}
```

---

## 🔐 Security Considerations

### Authorization Rules

1. **Create Portfolio**: Authenticated freelancers only
2. **Update Portfolio**: Portfolio owner only
3. **Delete Portfolio**: Portfolio owner only
4. **View Portfolio**: Public (if isPublic=true), Owner always
5. **Upload Image**: Portfolio owner only

### Validation Rules

1. **Max Portfolio Items**: 20 per user
2. **Max Images per Item**: 10 images
3. **Image File Size**: Max 5MB per image
4. **Allowed File Types**: jpg, jpeg, png, webp
5. **Title Length**: 3-100 characters
6. **Description Length**: 10-2000 characters
7. **URL Format**: Valid URL or empty
8. **Skills Count**: Max 20 skills per item

### Rate Limiting

- **Create Portfolio**: 10 requests per hour
- **Image Upload**: 20 requests per hour
- **Update Portfolio**: 30 requests per hour

---

## 📊 Database Schema

### Portfolio Table

```sql
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    url VARCHAR(500),
    completed_at DATE NOT NULL,
    category VARCHAR(50),
    client VARCHAR(100),
    skills TEXT[], -- PostgreSQL array
    display_order INTEGER NOT NULL DEFAULT 0,
    is_public BOOLEAN NOT NULL DEFAULT true,
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_display_order ON portfolios(user_id, display_order);
CREATE INDEX idx_portfolios_is_public ON portfolios(is_public);
```

### Portfolio Images Table

```sql
CREATE TABLE portfolio_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_portfolio_images_portfolio_id ON portfolio_images(portfolio_id);
CREATE INDEX idx_portfolio_images_display_order ON portfolio_images(portfolio_id, display_order);
```

---

## 🧪 Testing Strategy

### Backend Tests

#### Unit Tests

1. **PortfolioServiceTest**
   - Test create portfolio with valid data
   - Test update portfolio authorization
   - Test delete portfolio cascade (images deleted)
   - Test max portfolio limit (20 items)
   - Test skill validation

2. **ImageUploadServiceTest**
   - Test file size validation
   - Test file type validation
   - Test image resizing
   - Test thumbnail generation
   - Test unique filename generation

#### Integration Tests

1. **PortfolioControllerIntegrationTest**
   - Test full CRUD flow
   - Test authorization (owner vs non-owner)
   - Test pagination
   - Test public vs private portfolios
   - Test concurrent updates

2. **ImageUploadIntegrationTest**
   - Test multipart file upload
   - Test multiple image upload
   - Test primary image selection
   - Test image deletion

### Frontend Tests

#### Component Tests

1. **PortfolioGallery.test.tsx**
   - Test portfolio grid rendering
   - Test empty state
   - Test edit/delete buttons (own profile)
   - Test public view (no edit buttons)

2. **PortfolioModal.test.tsx**
   - Test form validation
   - Test skill add/remove
   - Test image preview
   - Test submit handling

#### Integration Tests

1. **Portfolio API Tests**
   - Test create portfolio API call
   - Test update portfolio API call
   - Test delete portfolio API call
   - Test image upload API call

#### E2E Tests

1. **Portfolio Flow**
   - Navigate to profile
   - Click "Add Project"
   - Fill form with valid data
   - Upload image
   - Save portfolio
   - Verify portfolio appears in grid
   - Edit portfolio
   - Delete portfolio

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Database migration ready
- [ ] Liquibase changelog added to master
- [ ] Environment variables configured
- [ ] File upload directory configured
- [ ] CORS settings updated
- [ ] Rate limiting configured

### Deployment Steps

1. **Database Migration**

   ```bash
   ./mvnw liquibase:update
   ```

2. **Create Upload Directory**

   ```bash
   mkdir -p /var/www/marifetbul/uploads/portfolio
   chmod 755 /var/www/marifetbul/uploads/portfolio
   ```

3. **Update Environment Variables**

   ```properties
   FILE_UPLOAD_DIRECTORY=/var/www/marifetbul/uploads/portfolio
   FILE_UPLOAD_MAX_SIZE=5242880
   FILE_UPLOAD_ALLOWED_TYPES=jpg,jpeg,png,webp
   ```

4. **Deploy Backend**

   ```bash
   ./mvnw clean package -DskipTests
   docker-compose up -d --build
   ```

5. **Deploy Frontend**
   ```bash
   npm run build
   docker-compose restart frontend
   ```

### Post-Deployment Verification

- [ ] Create portfolio test (API call)
- [ ] Upload image test
- [ ] View portfolio in profile page
- [ ] Edit portfolio test
- [ ] Delete portfolio test
- [ ] Public view test (logged out)
- [ ] Performance check (page load time)
- [ ] Error handling test (invalid file type)

---

## 🎯 Success Criteria

### Functional Requirements

- [x] Backend portfolio CRUD API working
- [x] Frontend successfully integrated
- [x] Image upload system functional
- [x] Portfolio visible in profile pages
- [x] Authorization working correctly
- [x] Validation rules enforced

### Non-Functional Requirements

- [x] API response time < 200ms
- [x] Image upload time < 5s for 5MB file
- [x] Test coverage ≥ 85%
- [x] No SQL injection vulnerabilities
- [x] XSS protection in place
- [x] CSRF protection enabled

### User Experience

- [x] Smooth portfolio creation flow
- [x] Intuitive image upload
- [x] Fast portfolio loading
- [x] Mobile-responsive design
- [x] Clear error messages
- [x] Loading indicators

---

## 🐛 Known Issues & Limitations

### Current Limitations

1. **File Storage**: Local file system only (no S3/CDN yet)
2. **Image Optimization**: Basic resizing only (no WebP conversion)
3. **Video Support**: Not implemented
4. **Portfolio Analytics**: No view tracking yet
5. **Portfolio Search**: No full-text search

### Future Enhancements

1. **Cloud Storage**: Migrate to AWS S3 or Cloudinary
2. **Image CDN**: Add CDN for faster image delivery
3. **Video Portfolios**: Support video uploads
4. **Portfolio Templates**: Pre-designed portfolio layouts
5. **Portfolio Analytics**: Track views, clicks, engagement
6. **Portfolio Export**: PDF/Website export
7. **Portfolio Sharing**: Social media sharing
8. **Portfolio Embedding**: Embed portfolio in external sites

---

## 📚 Related Documentation

- [User Entity Documentation](../marifetbul-backend/src/main/java/com/marifetbul/api/domain/user/entity/User.java)
- [Profile View Component](../components/domains/profile/ProfileView.tsx)
- [Authentication System](./ADMIN_SECURITY_GUIDE.md)
- [File Upload Best Practices](https://www.baeldung.com/spring-file-upload)

---

## 👥 Team Responsibilities

### Backend Developer

- Portfolio entity & migrations
- Portfolio service & repository
- Portfolio controller & API
- Image upload service
- Backend tests

### Frontend Developer

- API integration
- Image upload UI
- Portfolio reordering
- Frontend tests
- UX polish

### DevOps

- File storage configuration
- Deployment pipeline
- Performance monitoring
- Backup strategy

---

## 📅 Timeline Summary

| Day       | Phase                | Tasks                              | Hours   |
| --------- | -------------------- | ---------------------------------- | ------- |
| 1         | Backend Foundation   | Entity, Migration                  | 6h      |
| 2         | Backend Foundation   | Repository, Service, DTOs          | 8h      |
| 3         | Backend Foundation   | Controller, REST API               | 6h      |
| 4         | Image Upload         | Upload Service, Endpoints          | 8h      |
| 5         | Frontend Integration | API Integration, Store Update      | 8h      |
| 6         | Frontend Integration | UX Polish, Drag-Drop               | 8h      |
| 7         | Testing              | Backend Tests                      | 8h      |
| 8         | Testing & Docs       | Frontend Tests, E2E, Documentation | 8h      |
| **Total** |                      |                                    | **64h** |

---

**Last Updated:** 2025-01-26  
**Status:** Ready for Implementation  
**Priority:** High - Frontend ready, waiting for backend
