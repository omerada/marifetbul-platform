# 🎯 SPRINT PLAN: Portfolio Sistemi - Production Ready

**Proje:** MarifetBul Freelance Platform  
**Sprint Odağı:** Portfolio Yönetim Sistemi  
**Öncelik:** HIGH  
**Tahmini Süre:** 2-3 gün  
**Durum:** READY TO START

---

## 📊 Sistem Analizi Özeti

### ✅ Mevcut Durum

- **Backend:** Portfolio API endpoints mevcut (`/api/v1/portfolios`)
- **Frontend:** Temel portfolyo görüntüleme var
- **Admin Panel:** Portfolio approval panel mevcut ANCAK backend entegrasyonu EKSİK
- **Database:** Portfolio entity ve migrations hazır

### ❌ Tespit Edilen Sorunlar

#### 1. **CRITICAL: Backend Admin Endpoints Eksik**

```java
// ❌ EKSIK - Admin portfolio approval endpoints
POST   /api/v1/admin/portfolio/{id}/approve
POST   /api/v1/admin/portfolio/{id}/reject
GET    /api/v1/admin/portfolio/pending
POST   /api/v1/admin/portfolio/bulk-approve
```

**Sorun:** Frontend'de `PortfolioApprovalPanel.tsx` bu endpoint'leri çağırıyor ama backend'de YOK!

#### 2. **Missing: Kullanıcı Portfolio CRUD İşlemleri**

```typescript
// Frontend'de eksik sayfalar:
/dashboard/portfolio/create  ❌ YOK
/dashboard/portfolio/edit/[id]  ❌ YOK
```

#### 3. **Duplicate Kod: Portfolio Görüntüleme**

```typescript
// Birden fazla yerde benzer portfolio display logic
- components/domains/portfolio/PortfolioCard.tsx
- components/domains/portfolio/PortfolioGrid.tsx
- components/domains/profile/PortfolioGallery.tsx (LazyComponents'te)
```

#### 4. **Missing: Moderation Workflow**

- Portfolio'lar otomatik PUBLIC oluyor (approval yok)
- Admin panel sadece görüntülüyor, işlem yapamıyor
- Notification sistemi eksik (onay/red bildirimleri)

#### 5. **Incomplete: Portfolio Search & Filter**

- Admin panelde arama var AMA backend'de advanced filtering yok
- Public portfolio listing'de kategori filtresi yok

---

## 🚀 SPRINT BACKLOG

### **Sprint Goal**

Portfolio sistemini end-to-end çalışır hale getirmek. Kullanıcılar portfolio ekleyebilmeli, admin onaylayabilmeli, sistem bildirimleri gönderebilmeli.

---

### 📋 User Stories & Tasks

---

## **Story 1: Backend Admin Portfolio Moderation API**

**Priority:** CRITICAL  
**Points:** 8

### ✅ Acceptance Criteria

- [ ] Admin portfolio onaylayabilir
- [ ] Admin portfolio reddedebilir (sebep ile)
- [ ] Bekleyen portfolyolar listelenebilir
- [ ] Toplu onaylama yapılabilir
- [ ] Portfolio status değişikliği notification gönderir

### 🛠 Technical Tasks

#### Task 1.1: Create PortfolioAdminController

```java
// File: marifetbul-backend/src/main/java/com/marifetbul/api/domain/portfolio/controller/PortfolioAdminController.java

@RestController
@RequestMapping("/api/v1/admin/portfolio")
@RequiredArgsConstructor
public class PortfolioAdminController {

    // GET /pending - Bekleyen portfolyolar
    @GetMapping("/pending")
    public ResponseEntity<PageResponse<PortfolioResponse>> getPendingPortfolios(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    );

    // POST /{id}/approve - Portfolio onayla
    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<PortfolioResponse>> approvePortfolio(
        @PathVariable UUID id
    );

    // POST /{id}/reject - Portfolio reddet
    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<PortfolioResponse>> rejectPortfolio(
        @PathVariable UUID id,
        @RequestBody @Valid RejectPortfolioRequest request
    );

    // POST /bulk-approve - Toplu onay
    @PostMapping("/bulk-approve")
    public ResponseEntity<ApiResponse<BulkActionResult>> bulkApprovePortfolios(
        @RequestBody @Valid BulkPortfolioRequest request
    );

    // GET /statistics - Admin istatistikleri
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<PortfolioStatistics>> getStatistics();
}
```

#### Task 1.2: Create DTOs

```java
// RejectPortfolioRequest.java
public class RejectPortfolioRequest {
    @NotBlank(message = "Reddetme sebebi zorunludur")
    @Size(min = 10, max = 500)
    private String reason;
}

// BulkPortfolioRequest.java
public class BulkPortfolioRequest {
    @NotEmpty
    @Size(max = 50, message = "Maksimum 50 portfolyo seçilebilir")
    private List<UUID> portfolioIds;
}

// PortfolioStatistics.java
public class PortfolioStatistics {
    private Long totalPortfolios;
    private Long pendingPortfolios;
    private Long approvedPortfolios;
    private Long rejectedPortfolios;
    private Long publicPortfolios;
    private Double approvalRate;
}
```

#### Task 1.3: Implement Service Methods

```java
// PortfolioService.java additions

@Transactional
public PortfolioResponse approvePortfolio(UUID portfolioId, UUID adminId) {
    Portfolio portfolio = findById(portfolioId);

    portfolio.setStatus(PortfolioStatus.APPROVED);
    portfolio.setIsPublic(true);
    portfolio.setApprovedAt(LocalDateTime.now());
    portfolio.setApprovedBy(adminId);

    Portfolio saved = portfolioRepository.save(portfolio);

    // Send notification to user
    notificationService.sendPortfolioApprovedNotification(
        portfolio.getUserId(),
        portfolio.getId()
    );

    return portfolioMapper.toResponse(saved);
}

@Transactional
public PortfolioResponse rejectPortfolio(UUID portfolioId, String reason, UUID adminId) {
    Portfolio portfolio = findById(portfolioId);

    portfolio.setStatus(PortfolioStatus.REJECTED);
    portfolio.setIsPublic(false);
    portfolio.setRejectionReason(reason);
    portfolio.setRejectedAt(LocalDateTime.now());
    portfolio.setRejectedBy(adminId);

    Portfolio saved = portfolioRepository.save(portfolio);

    // Send notification with reason
    notificationService.sendPortfolioRejectedNotification(
        portfolio.getUserId(),
        portfolio.getId(),
        reason
    );

    return portfolioMapper.toResponse(saved);
}

public BulkActionResult bulkApprove(List<UUID> portfolioIds, UUID adminId) {
    int successCount = 0;
    List<String> errors = new ArrayList<>();

    for (UUID id : portfolioIds) {
        try {
            approvePortfolio(id, adminId);
            successCount++;
        } catch (Exception e) {
            errors.add(id + ": " + e.getMessage());
        }
    }

    return BulkActionResult.builder()
        .totalProcessed(portfolioIds.size())
        .successCount(successCount)
        .failureCount(errors.size())
        .errors(errors)
        .build();
}
```

#### Task 1.4: Database Migration

```sql
-- Add new columns to portfolio table
ALTER TABLE portfolios
ADD COLUMN status VARCHAR(20) DEFAULT 'PENDING',
ADD COLUMN approved_at TIMESTAMP,
ADD COLUMN approved_by UUID,
ADD COLUMN rejected_at TIMESTAMP,
ADD COLUMN rejected_by UUID,
ADD COLUMN rejection_reason TEXT;

-- Create index for pending portfolios query
CREATE INDEX idx_portfolio_status ON portfolios(status);
CREATE INDEX idx_portfolio_user_status ON portfolios(user_id, status);
```

**Estimated Time:** 4 hours

---

## **Story 2: Kullanıcı Portfolio CRUD Sayfaları**

**Priority:** HIGH  
**Points:** 5

### ✅ Acceptance Criteria

- [ ] Kullanıcı yeni portfolio ekleyebilir
- [ ] Portfolio düzenlenebilir
- [ ] Portfolio silinebilir
- [ ] Görsel upload çalışır (max 10 image)
- [ ] Form validasyonu aktif

### 🛠 Technical Tasks

#### Task 2.1: Create Portfolio Dashboard Page

```typescript
// File: app/dashboard/portfolio/page.tsx

'use client';

import { useState } from 'react';
import { usePortfolio } from '@/hooks/business/portfolio';
import { PortfolioCard } from '@/components/domains/portfolio';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPortfolioPage() {
  const { portfolios, isLoading, deletePortfolio } = usePortfolio();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolyolarım</h1>
          <p className="text-gray-600">
            Çalışmalarınızı sergileyerek profilinizi güçlendirin
          </p>
        </div>

        <Link href="/dashboard/portfolio/create">
          <Button variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Portfolio Ekle
          </Button>
        </Link>
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((portfolio) => (
          <PortfolioCard
            key={portfolio.id}
            portfolio={portfolio}
            showActions
            onEdit={() => router.push(`/dashboard/portfolio/edit/${portfolio.id}`)}
            onDelete={() => handleDelete(portfolio.id)}
          />
        ))}
      </div>

      {portfolios.length === 0 && !isLoading && (
        <EmptyState
          title="Henüz portfolio eklemediniz"
          description="İlk portfolyonuzu ekleyerek başlayın"
          action={
            <Link href="/dashboard/portfolio/create">
              <Button>Portfolio Ekle</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
```

#### Task 2.2: Create Portfolio Form Page

```typescript
// File: app/dashboard/portfolio/create/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { portfolioSchema } from '@/lib/validation/portfolio';
import { ImageUpload } from '@/components/shared';
import { toast } from 'sonner';

export default function CreatePortfolioPage() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(portfolioSchema)
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await portfolioApi.create({
        ...data,
        images: images.map((url, index) => ({
          imageUrl: url,
          displayOrder: index,
        }))
      });

      toast.success('Portfolio eklendi', {
        description: 'Admin onayından sonra profilinizde görünecek'
      });

      router.push('/dashboard/portfolio');
    } catch (error) {
      toast.error('Portfolio eklenirken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Yeni Portfolio Ekle</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Proje Başlığı *
          </label>
          <input
            {...register('title')}
            className="w-full rounded-lg border px-4 py-2"
            placeholder="Örn: E-ticaret Website Tasarımı"
          />
          {errors.title && (
            <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Açıklama *
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full rounded-lg border px-4 py-2"
            placeholder="Projeniz hakkında detaylı bilgi verin..."
          />
          {errors.description && (
            <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Proje Görselleri (Max 10)
          </label>
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            maxImages={10}
            aspectRatio="16/9"
          />
        </div>

        {/* Project URL (Optional) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Proje Linki (Opsiyonel)
          </label>
          <input
            {...register('url')}
            type="url"
            className="w-full rounded-lg border px-4 py-2"
            placeholder="https://..."
          />
        </div>

        {/* Completion Date */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Tamamlanma Tarihi
          </label>
          <input
            {...register('completedAt')}
            type="date"
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || images.length === 0}
            className="flex-1"
          >
            {isSubmitting ? 'Kaydediliyor...' : 'Portfolio Ekle'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            İptal
          </Button>
        </div>

        <p className="text-sm text-gray-600">
          * Portfolio'nuz admin onayından sonra profilinizde görünecektir.
        </p>
      </form>
    </div>
  );
}
```

#### Task 2.3: Create Edit Page

```typescript
// File: app/dashboard/portfolio/edit/[id]/page.tsx
// Similar to create, but with usePortfolio({ id }) hook to load existing data
```

**Estimated Time:** 3 hours

---

## **Story 3: Notification Sistemi Entegrasyonu**

**Priority:** MEDIUM  
**Points:** 3

### ✅ Acceptance Criteria

- [ ] Portfolio onaylandığında kullanıcıya bildirim gider
- [ ] Portfolio reddedildiğinde sebep ile bildirim gider
- [ ] Bildirime tıklanınca portfolio sayfasına yönlenir

### 🛠 Technical Tasks

#### Task 3.1: Backend Notification Templates

```java
// NotificationService.java additions

public void sendPortfolioApprovedNotification(UUID userId, UUID portfolioId) {
    Notification notification = Notification.builder()
        .userId(userId)
        .type(NotificationType.PORTFOLIO_APPROVED)
        .title("Portfolio Onaylandı 🎉")
        .message("Portfolio'nuz incelendi ve onaylandı. Artık profilinizde görünüyor!")
        .relatedEntityType("PORTFOLIO")
        .relatedEntityId(portfolioId)
        .actionUrl("/dashboard/portfolio")
        .build();

    notificationRepository.save(notification);

    // Send push notification
    pushNotificationService.sendToUser(userId, notification);
}

public void sendPortfolioRejectedNotification(UUID userId, UUID portfolioId, String reason) {
    Notification notification = Notification.builder()
        .userId(userId)
        .type(NotificationType.PORTFOLIO_REJECTED)
        .title("Portfolio Reddedildi")
        .message("Portfolio'nuz incelendi ancak onaylanmadı. Sebep: " + reason)
        .relatedEntityType("PORTFOLIO")
        .relatedEntityId(portfolioId)
        .actionUrl("/dashboard/portfolio/edit/" + portfolioId)
        .build();

    notificationRepository.save(notification);
    pushNotificationService.sendToUser(userId, notification);
}
```

**Estimated Time:** 1.5 hours

---

## **Story 4: Admin Panel İyileştirmeleri**

**Priority:** MEDIUM  
**Points:** 3

### ✅ Acceptance Criteria

- [ ] Bulk actions çalışıyor (toplu onay/red)
- [ ] Quick filters: Pending / Approved / Rejected
- [ ] Pagination çalışıyor
- [ ] Search by user name/email

### 🛠 Technical Tasks

#### Task 4.1: Update Admin Portfolio Page

```typescript
// File: app/admin/portfolio/page.tsx

// Add bulk selection state
const [selectedIds, setSelectedIds] = useState<string[]>([]);

// Add bulk actions
const handleBulkApprove = async () => {
  await portfolioApi.bulkApprove(selectedIds);
  toast.success(`${selectedIds.length} portfolio onaylandı`);
  setSelectedIds([]);
  refreshPortfolios();
};

// Add status filter tabs
const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

// Update table with checkboxes
<td className="px-4 py-4">
  <input
    type="checkbox"
    checked={selectedIds.includes(portfolio.id)}
    onChange={(e) => {
      if (e.target.checked) {
        setSelectedIds([...selectedIds, portfolio.id]);
      } else {
        setSelectedIds(selectedIds.filter(id => id !== portfolio.id));
      }
    }}
  />
</td>
```

**Estimated Time:** 2 hours

---

## **Story 5: Portfolio Search & Filter**

**Priority:** LOW  
**Points:** 2

### ✅ Acceptance Criteria

- [ ] Public portfolio listing sayfası var
- [ ] Kategori filtresi çalışıyor
- [ ] Skill-based search var
- [ ] Pagination var

### 🛠 Technical Tasks

#### Task 5.1: Create Public Portfolio Page

```typescript
// File: app/portfolio/page.tsx

export default function PublicPortfolioPage() {
  const [filters, setFilters] = useState({
    category: null,
    skills: [],
    search: ''
  });

  const { data, isLoading } = useQuery({
    queryKey: ['public-portfolios', filters],
    queryFn: () => portfolioApi.search(filters)
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Portfolyolar</h1>

      {/* Filters */}
      <PortfolioFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Grid */}
      <PortfolioGrid portfolios={data?.items || []} />

      {/* Pagination */}
      <Pagination {...data?.pagination} />
    </div>
  );
}
```

**Estimated Time:** 2 hours

---

## 📈 Success Metrics

### Definition of Done

- [ ] Tüm backend endpoints implement edildi
- [ ] Unit tests yazıldı (>80% coverage)
- [ ] Integration tests çalışıyor
- [ ] Frontend sayfalar responsive
- [ ] Accessibility standartlarına uygun (WCAG 2.1 AA)
- [ ] Error handling tüm akışlarda var
- [ ] Loading states tüm formlarda var
- [ ] Success/Error toasts gösteriliyor

### Performance Targets

- [ ] Portfolio listing < 500ms
- [ ] Image upload < 3s (per image)
- [ ] Search response < 300ms
- [ ] Admin bulk operations < 2s

### Security Checklist

- [ ] RBAC doğru çalışıyor (Admin-only endpoints)
- [ ] Portfolio ownership validation var
- [ ] XSS protection (description sanitization)
- [ ] File upload validation (type, size, malware)
- [ ] Rate limiting active (upload: 10/min)

---

## 🔄 Migration & Rollout Plan

### Phase 1: Backend (Day 1)

1. ✅ Create database migration
2. ✅ Implement PortfolioAdminController
3. ✅ Add notification methods
4. ✅ Write unit tests
5. ✅ Test with Postman

### Phase 2: Frontend (Day 2)

1. ✅ Create CRUD pages
2. ✅ Update admin panel
3. ✅ Add notifications UI
4. ✅ End-to-end testing

### Phase 3: QA & Polish (Day 3)

1. ✅ Manual testing
2. ✅ Fix bugs
3. ✅ Performance optimization
4. ✅ Documentation update

### Rollback Plan

- Database migration reversible
- Feature flag: `PORTFOLIO_APPROVAL_ENABLED`
- Old approval flow preserved (auto-approve)

---

## 📚 Documentation Updates Needed

- [ ] API Documentation (Swagger)
- [ ] User Guide: "How to Add Portfolio"
- [ ] Admin Guide: "Portfolio Moderation"
- [ ] Changelog update
- [ ] README.md update

---

## 🧪 Testing Strategy

### Unit Tests

```java
// PortfolioAdminControllerTest.java
@Test
void shouldApprovePortfolio() {
    // Given
    UUID portfolioId = UUID.randomUUID();
    when(portfolioService.approvePortfolio(portfolioId, adminId))
        .thenReturn(approvedPortfolio);

    // When
    ResponseEntity<ApiResponse<PortfolioResponse>> response =
        controller.approvePortfolio(portfolioId);

    // Then
    assertEquals(HttpStatus.OK, response.getStatusCode());
    verify(notificationService).sendPortfolioApprovedNotification(any(), any());
}

@Test
void shouldRejectPortfolioWithReason() {
    // Test rejection flow
}

@Test
void shouldBulkApprovePortfolios() {
    // Test bulk approval
}
```

### Integration Tests

```java
@SpringBootTest
@AutoConfigureMockMvc
class PortfolioApprovalIntegrationTest {

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldApprovePortfolioEndToEnd() {
        // Create portfolio
        // Call approve endpoint
        // Verify status changed
        // Verify notification sent
    }
}
```

### E2E Tests (Playwright)

```typescript
test('Admin can approve portfolio', async ({ page }) => {
  await page.goto('/admin/portfolio');
  await page.click('text=Bekleyen Portfolyolar');
  await page.click('[data-testid="approve-btn"]');
  await expect(page.locator('.toast-success')).toBeVisible();
});
```

---

## 🚨 Risks & Mitigations

| Risk                        | Impact | Probability | Mitigation                              |
| --------------------------- | ------ | ----------- | --------------------------------------- |
| Backend endpoints geç biter | HIGH   | MEDIUM      | Backend'i önceliklendir, parallel çalış |
| Image upload slow           | MEDIUM | LOW         | CDN kullan, lazy load, compression      |
| Admin onay gecikmesi        | LOW    | HIGH        | Email notification ekle, SLA belirle    |
| Duplicate portfolio upload  | MEDIUM | MEDIUM      | Hash-based duplicate detection          |

---

## 📞 Support & Resources

### Team

- **Backend:** 1 developer
- **Frontend:** 1 developer (sen)
- **QA:** Shared
- **DevOps:** On-call

### External Dependencies

- Cloudinary API (image upload)
- Notification service
- Email service (SendGrid)

---

## 🎉 Sprint Başarı Kriterleri

Sprint başarılı sayılacak eğer:

1. ✅ Kullanıcı portfolio ekleyebiliyor
2. ✅ Admin portfolioları onaylayıp reddedebiliyor
3. ✅ Notification sistemi çalışıyor
4. ✅ Tüm testler geçiyor
5. ✅ Production'a deploy edilebilir durumda

---

**Sprint Sahibi:** Development Team  
**Son Güncelleme:** 20 Kasım 2025  
**Next Review:** Sprint sonunda retrospektif

---

## 🔗 İlgili Dökümanlar

- [Backend Dev Talimat](./BACKEND%20DEV%20TALIMAT%20PROMPT.md)
- [API Reference](./API_QUICK_REFERENCE.md)
- [Portfolio API Spec](./marifetbul-backend/docs/api/portfolio-api.md)
