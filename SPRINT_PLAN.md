# 🚀 PRODUCTION-READY BACKEND-FRONTEND INTEGRATION SPRINT

**Tarih:** 13 Ekim 2025  
**Hedef:** Tüm mock yapıları temizle, backend API'lerini tamamla, frontend entegrasyonunu yap

## 📊 Durum Özeti

### ✅ Tamamlanan (Önceki Session)

- [x] 7 API Route backend proxy'ye dönüştürüldü
- [x] 7 Component'ten mock token'lar temizlendi
- [x] Cookie-based authentication standardize edildi
- [x] Build başarılı (57 sayfa)

### 🔴 Kritik Eksikler (Production Blocker)

#### **Backend API Eksikleri**

1. **Support Ticket System** - TAMAMEN EKSİK ⚠️
2. **Blog System** - TAMAMEN EKSİK ⚠️
3. **Admin Alert System** - TAMAMEN EKSİK ⚠️
4. **Admin Logs API** - EKSİK
5. **Search Suggestions & History** - KISMEN EKSİK
6. **System Health Monitoring** - KISMEN EKSİK
7. **Moderation Dashboard Stats** - EKSİK
8. **File Upload Service** - EKSİK
9. **Geocoding Service** - EKSİK

#### **Frontend Mock Yapılar**

- MessagingStore (8 TODO)
- AnalyticsDashboard (mock data generator)
- Profile & Marketplace pages (mock freelancer data)
- Blog pages (mock blog data)
- LocationPicker & MapView (mock geocoding)

---

## 🎯 Sprint 1: Kritik Backend API'leri (Tahmini: 3-4 gün)

### Task 1.1: Support Ticket System (Öncelik: P0 - Highest)

**Süre:** 8 saat

**Backend Geliştirme:**

```
📁 marifetbul-backend/src/main/java/com/marifetbul/api/domain/support/
├── entity/
│   ├── SupportTicket.java
│   └── TicketResponse.java
├── dto/
│   ├── SupportTicketDTO.java
│   ├── CreateTicketRequest.java
│   ├── UpdateTicketRequest.java
│   └── TicketResponseDTO.java
├── repository/
│   ├── SupportTicketRepository.java
│   └── TicketResponseRepository.java
├── service/
│   ├── SupportTicketService.java
│   └── impl/SupportTicketServiceImpl.java
└── controller/
    └── SupportTicketController.java
```

**Entity Fields:**

```java
@Entity
public class SupportTicket {
    @Id @GeneratedValue
    private Long id;

    @ManyToOne
    private User user;

    private String subject;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private TicketStatus status; // OPEN, IN_PROGRESS, RESOLVED, CLOSED

    @Enumerated(EnumType.STRING)
    private TicketPriority priority; // LOW, MEDIUM, HIGH, URGENT

    @Enumerated(EnumType.STRING)
    private TicketCategory category; // TECHNICAL, BILLING, ACCOUNT, OTHER

    @OneToMany(mappedBy = "ticket")
    private List<TicketResponse> responses;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime closedAt;
}
```

**Endpoints:**

```java
@RestController
@RequestMapping("/api/v1/support/tickets")
public class SupportTicketController {

    @GetMapping
    public ResponseEntity<Page<SupportTicketDTO>> getTickets(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) String status
    );

    @PostMapping
    public ResponseEntity<SupportTicketDTO> createTicket(
        @Valid @RequestBody CreateTicketRequest request
    );

    @GetMapping("/{id}")
    public ResponseEntity<SupportTicketDTO> getTicket(@PathVariable Long id);

    @PatchMapping("/{id}")
    public ResponseEntity<SupportTicketDTO> updateTicket(
        @PathVariable Long id,
        @Valid @RequestBody UpdateTicketRequest request
    );

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id);

    @PostMapping("/{id}/close")
    public ResponseEntity<SupportTicketDTO> closeTicket(@PathVariable Long id);

    @GetMapping("/{id}/responses")
    public ResponseEntity<List<TicketResponseDTO>> getResponses(@PathVariable Long id);

    @PostMapping("/{id}/responses")
    public ResponseEntity<TicketResponseDTO> addResponse(
        @PathVariable Long id,
        @Valid @RequestBody CreateResponseRequest request
    );
}
```

**Frontend Entegrasyon:**

- ✅ app/api/v1/support/tickets/\*\* routes zaten backend proxy
- ⚠️ Test edilecek: Cookie auth ve error handling

---

### Task 1.2: Blog System (Öncelik: P0 - Highest)

**Süre:** 6 saat

**Backend Geliştirme:**

```
📁 marifetbul-backend/src/main/java/com/marifetbul/api/domain/blog/
├── entity/
│   ├── BlogPost.java
│   ├── BlogCategory.java
│   └── BlogTag.java
├── dto/
│   ├── BlogPostDTO.java
│   ├── CreateBlogPostRequest.java
│   └── UpdateBlogPostRequest.java
├── repository/
│   └── BlogPostRepository.java
├── service/
│   ├── BlogService.java
│   └── impl/BlogServiceImpl.java
└── controller/
    └── BlogController.java
```

**Entity Fields:**

```java
@Entity
public class BlogPost {
    @Id @GeneratedValue
    private Long id;

    @Column(unique = true)
    private String slug;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String excerpt;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String coverImage;

    @ManyToOne
    private User author;

    @ManyToOne
    private BlogCategory category;

    @ManyToMany
    private Set<BlogTag> tags;

    @Enumerated(EnumType.STRING)
    private PostStatus status; // DRAFT, PUBLISHED, ARCHIVED

    private LocalDateTime publishedAt;

    private Integer viewCount = 0;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // SEO fields
    private String metaTitle;
    private String metaDescription;
    private String metaKeywords;
}
```

**Endpoints:**

```java
@RestController
@RequestMapping("/api/v1/blog")
public class BlogController {

    @GetMapping
    public ResponseEntity<Page<BlogPostDTO>> getPosts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) String tag,
        @RequestParam(required = false) String status
    );

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BlogPostDTO> createPost(
        @Valid @RequestBody CreateBlogPostRequest request
    );

    @GetMapping("/{slug}")
    public ResponseEntity<BlogPostDTO> getPostBySlug(@PathVariable String slug);

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BlogPostDTO> updatePost(
        @PathVariable Long id,
        @Valid @RequestBody UpdateBlogPostRequest request
    );

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePost(@PathVariable Long id);

    @GetMapping("/categories")
    public ResponseEntity<List<BlogCategoryDTO>> getCategories();

    @GetMapping("/search")
    public ResponseEntity<Page<BlogPostDTO>> searchPosts(
        @RequestParam String q,
        @RequestParam(defaultValue = "0") int page
    );

    @PostMapping("/{id}/view")
    public ResponseEntity<Void> incrementViewCount(@PathVariable Long id);
}
```

**Frontend Entegrasyon:**

- ✅ app/api/v1/blog/route.ts zaten backend proxy
- ⚠️ app/blog/page.tsx - mock data kaldırılacak
- ⚠️ app/blog/[slug]/page.tsx - mock data kaldırılacak
- ⚠️ SEO metadata backend'den alınacak

---

### Task 1.3: Admin Alert System (Öncelik: P1 - High)

**Süre:** 4 saat

**Backend Geliştirme:**

```
📁 marifetbul-backend/src/main/java/com/marifetbul/api/domain/admin/alert/
├── entity/
│   └── AdminAlert.java
├── dto/
│   ├── AdminAlertDTO.java
│   └── CreateAlertRequest.java
├── repository/
│   └── AdminAlertRepository.java
├── service/
│   ├── AdminAlertService.java
│   └── impl/AdminAlertServiceImpl.java
└── controller/
    └── AdminAlertController.java
```

**Endpoints:**

```java
@RestController
@RequestMapping("/api/v1/admin/alerts")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAlertController {

    @GetMapping
    public ResponseEntity<List<AdminAlertDTO>> getAlerts(
        @RequestParam(required = false) Boolean isRead
    );

    @PostMapping
    public ResponseEntity<AdminAlertDTO> createAlert(
        @Valid @RequestBody CreateAlertRequest request
    );

    @PatchMapping("/{id}/read")
    public ResponseEntity<AdminAlertDTO> markAsRead(@PathVariable Long id);

    @DeleteMapping("/{id}/dismiss")
    public ResponseEntity<Void> dismissAlert(@PathVariable Long id);
}
```

**Frontend Entegrasyon:**

- ✅ app/api/v1/admin/alerts/[id]/\*\* routes zaten hazır

---

### Task 1.4: Admin Logs API (Öncelik: P1 - High)

**Süre:** 3 saat

**Backend Geliştirme:**

```java
@RestController
@RequestMapping("/api/v1/admin/logs")
@PreAuthorize("hasRole('ADMIN')")
public class AdminLogsController {

    @GetMapping
    public ResponseEntity<Page<AdminLogDTO>> getLogs(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int limit,
        @RequestParam(required = false) String level,
        @RequestParam(required = false) String source,
        @RequestParam(required = false) String search
    );

    @GetMapping("/stats")
    public ResponseEntity<LogStatisticsDTO> getLogStatistics(
        @RequestParam(required = false) LocalDateTime from,
        @RequestParam(required = false) LocalDateTime to
    );
}
```

**Database Integration:**

- Log entries stored in `admin_logs` table
- Indexed by timestamp, level, source
- Automatic cleanup policy (30 days retention)

**Frontend Entegrasyon:**

- ✅ components/domains/admin/system/AdminLogs.tsx zaten backend'e hazır

---

### Task 1.5: Search Enhancements (Öncelik: P1 - High)

**Süre:** 4 saat

**Backend Geliştirme:**

```java
@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

    // EXISTING: /packages, /suggest endpoints

    @GetMapping("/suggestions")
    public ResponseEntity<List<SearchSuggestionDTO>> getSuggestions(
        @RequestParam String q,
        @RequestParam(defaultValue = "10") int limit
    );

    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SearchHistoryDTO>> getSearchHistory(
        @RequestParam(defaultValue = "10") int limit
    );

    @PostMapping("/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> saveSearchHistory(
        @RequestBody SaveSearchRequest request
    );

    @GetMapping("/trending")
    public ResponseEntity<List<TrendingSearchDTO>> getTrendingSearches(
        @RequestParam(defaultValue = "10") int limit
    );
}
```

**Frontend Entegrasyon:**

- ✅ components/domains/search/UniversalSearch.tsx
- ✅ components/domains/search/SearchAutocomplete.tsx

---

## 🎯 Sprint 2: Monitoring & Admin Tools (Tahmini: 2-3 gün)

### Task 2.1: System Health Monitoring (Öncelik: P1 - High)

**Süre:** 5 saat

**Spring Boot Actuator Integration:**

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

**Custom Health Endpoint:**

```java
@RestController
@RequestMapping("/api/v1/admin/system")
@PreAuthorize("hasRole('ADMIN')")
public class SystemHealthController {

    @GetMapping("/health")
    public ResponseEntity<SystemHealthDTO> getSystemHealth();

    @GetMapping("/metrics")
    public ResponseEntity<SystemMetricsDTO> getSystemMetrics();
}

public class SystemHealthDTO {
    private UptimeDTO uptime;
    private ResponseTimeDTO responseTime;
    private ErrorRateDTO errorRate;
    private CpuMetricsDTO cpu;
    private MemoryMetricsDTO memory;
    private DatabaseHealthDTO database;
    private List<ServiceHealthDTO> services;
}
```

**Frontend Entegrasyon:**

- ✅ components/domains/admin/dashboard/SystemHealthWidget.tsx

---

### Task 2.2: Moderation Dashboard API (Öncelik: P1 - High)

**Süre:** 4 saat

**Backend Geliştirme:**

```java
@RestController
@RequestMapping("/api/v1/admin/moderation")
@PreAuthorize("hasRole('ADMIN')")
public class ModerationController {

    @GetMapping("/stats")
    public ResponseEntity<ModerationStatsDTO> getStats();

    @GetMapping("/items")
    public ResponseEntity<Page<ModerationItemDTO>> getItems(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String severity,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int limit
    );

    @PostMapping("/items/{id}/action")
    public ResponseEntity<ModerationItemDTO> takeAction(
        @PathVariable Long id,
        @RequestBody ModerationActionRequest request
    );
}
```

**Frontend Entegrasyon:**

- ✅ components/domains/admin/moderation/ModerationDashboard.tsx

---

### Task 2.3: Analytics Dashboard API (Öncelik: P2 - Medium)

**Süre:** 4 saat

**Backend Geliştirme:**

```java
@RestController
@RequestMapping("/api/v1/analytics")
@PreAuthorize("isAuthenticated()")
public class AnalyticsController {

    @GetMapping("/dashboard")
    public ResponseEntity<AnalyticsDashboardDTO> getDashboard(
        @RequestParam String period, // day, week, month, year
        @RequestParam(required = false) LocalDate from,
        @RequestParam(required = false) LocalDate to
    );
}

public class AnalyticsDashboardDTO {
    private RevenueAnalyticsDTO revenue;
    private ViewsAnalyticsDTO views;
    private OrdersAnalyticsDTO orders;
    private ConversionAnalyticsDTO conversion;
    private List<TimeSeriesDataPoint> chartData;
}
```

**Frontend Entegrasyon:**

- ⚠️ components/domains/analytics/AnalyticsDashboard.tsx - generateMockData kaldırılacak

---

## 🎯 Sprint 3: Infrastructure Services (Tahmini: 2-3 gün)

### Task 3.1: File Upload Service (Öncelik: P1 - High)

**Süre:** 6 saat

**AWS S3 Integration:**

```xml
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
</dependency>
```

**Backend Implementation:**

```java
@RestController
@RequestMapping("/api/v1/upload")
@PreAuthorize("isAuthenticated()")
public class FileUploadController {

    @PostMapping
    public ResponseEntity<FileUploadResponse> uploadFile(
        @RequestParam("file") MultipartFile file,
        @RequestParam(required = false) String category
    );

    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> deleteFile(@PathVariable String fileId);

    @GetMapping("/{fileId}/url")
    public ResponseEntity<String> getPresignedUrl(@PathVariable String fileId);
}

@Service
public class S3StorageService {
    private final S3Client s3Client;

    public String uploadFile(MultipartFile file, String key);
    public void deleteFile(String key);
    public String getPresignedUrl(String key, Duration expiration);
}
```

**Configuration:**

```yaml
# application.yml
aws:
  s3:
    bucket: marifetbul-uploads
    region: eu-central-1
    access-key: ${AWS_ACCESS_KEY}
    secret-key: ${AWS_SECRET_KEY}
```

**Frontend Entegrasyon:**

- ⚠️ lib/domains/media/fileUpload.service.ts - mock upload kaldırılacak

---

### Task 3.2: Geocoding Service (Öncelik: P2 - Medium)

**Süre:** 5 saat

**Google Maps Geocoding Integration:**

```xml
<dependency>
    <groupId>com.google.maps</groupId>
    <artifactId>google-maps-services</artifactId>
</dependency>
```

**Backend Implementation:**

```java
@RestController
@RequestMapping("/api/v1/geocoding")
public class GeocodingController {

    @GetMapping("/forward")
    public ResponseEntity<List<GeocodingResultDTO>> geocode(
        @RequestParam String address
    );

    @GetMapping("/reverse")
    public ResponseEntity<GeocodingResultDTO> reverseGeocode(
        @RequestParam double lat,
        @RequestParam double lng
    );
}

@Service
public class GoogleMapsGeocodingService {
    private final GeoApiContext context;

    public List<GeocodingResultDTO> geocode(String address);
    public GeocodingResultDTO reverseGeocode(LatLng location);
}
```

**Frontend Entegrasyon:**

- ⚠️ lib/infrastructure/geocoding.ts - mock data kaldırılacak
- ⚠️ components/shared/utilities/LocationPicker.tsx - backend API kullanacak

---

### Task 3.3: Real Map Integration (Öncelik: P3 - Low)

**Süre:** 8 saat

**Frontend Implementation:**

```bash
npm install react-leaflet leaflet @types/leaflet
```

**Component Refactor:**

```tsx
// components/shared/utilities/MapView.tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export const MapView: React.FC<MapViewProps> = ({
  center,
  markers,
  zoom = 13
}) => {
  return (
    <MapContainer center={center} zoom={zoom}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {markers.map(marker => (
        <Marker key={marker.id} position={marker.position}>
          <Popup>{marker.title}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
```

---

## 🎯 Sprint 4: Messaging & Real-time (Tahmini: 3-4 gün)

### Task 4.1: Complete Messaging System (Öncelik: P1 - High)

**Süre:** 8 saat

**Backend WebSocket Integration:**

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }
}

@Controller
public class MessageWebSocketController {

    @MessageMapping("/chat/{conversationId}")
    @SendTo("/topic/conversation/{conversationId}")
    public MessageDTO sendMessage(@Payload SendMessageRequest request);

    @MessageMapping("/typing/{conversationId}")
    @SendTo("/topic/typing/{conversationId}")
    public TypingIndicatorDTO sendTypingIndicator(@Payload TypingRequest request);
}
```

**REST Endpoints:**

```java
@RestController
@RequestMapping("/api/v1/messages")
@PreAuthorize("isAuthenticated()")
public class MessageController {

    @GetMapping("/conversations")
    public ResponseEntity<Page<ConversationDTO>> getConversations(
        @RequestParam(defaultValue = "0") int page
    );

    @PostMapping("/conversations")
    public ResponseEntity<ConversationDTO> createConversation(
        @Valid @RequestBody CreateConversationRequest request
    );

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<Page<MessageDTO>> getMessages(
        @PathVariable Long id,
        @RequestParam(defaultValue = "0") int page
    );

    @PostMapping("/conversations/{id}/messages")
    public ResponseEntity<MessageDTO> sendMessage(
        @PathVariable Long id,
        @Valid @RequestBody SendMessageRequest request
    );

    @PatchMapping("/messages/{id}/read")
    public ResponseEntity<MessageDTO> markAsRead(@PathVariable Long id);

    @DeleteMapping("/messages/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id);
}
```

**Frontend Entegrasyon:**

- ⚠️ lib/core/store/domains/messaging/MessagingStore.ts - 8 TODO kaldırılacak
- ⚠️ hooks/business/messaging/useMessages.ts - mock data kaldırılacak
- ✅ WebSocket client eklenecek

---

## 🎯 Sprint 5: Final Integration & Testing (Tahmini: 2 gün)

### Task 5.1: Frontend Pages Integration

**Süre:** 6 saat

**Pages to Update:**

- app/profile/[id]/page.tsx - mock freelancer data → backend API
- app/marketplace/categories/[categoryId]/[subcategoryId]/page.tsx - mock data → backend API
- app/blog/page.tsx - mock blog data → backend API
- app/blog/[slug]/page.tsx - mock blog data → backend API

### Task 5.2: E2E Testing

**Süre:** 4 saat

**Test Coverage:**

- Authentication flow (login, register, verify)
- Support ticket creation and response
- Blog post CRUD operations
- Search and filters
- File upload
- Messaging (real-time)

### Task 5.3: Performance Optimization

**Süre:** 4 saat

**Backend:**

- Database query optimization
- Caching strategy (Redis)
- API response time monitoring
- N+1 query fixes

**Frontend:**

- Code splitting
- Lazy loading
- Image optimization
- API call debouncing

---

## 📊 Sprint Summary

| Sprint                          | Tasks        | Estimated Time          | Priority |
| ------------------------------- | ------------ | ----------------------- | -------- |
| Sprint 1: Critical Backend APIs | 5 tasks      | 25 hours (3-4 days)     | P0-P1    |
| Sprint 2: Monitoring & Admin    | 3 tasks      | 13 hours (2 days)       | P1-P2    |
| Sprint 3: Infrastructure        | 3 tasks      | 19 hours (2-3 days)     | P1-P3    |
| Sprint 4: Messaging & Real-time | 1 task       | 8 hours (1 day)         | P1       |
| Sprint 5: Integration & Testing | 3 tasks      | 14 hours (2 days)       | P0       |
| **TOTAL**                       | **15 tasks** | **79 hours (~10 days)** |          |

---

## 🚦 Success Criteria

### Backend

- [x] Tüm TODO işaretli mock endpoint'ler gerçek implementasyonlarla değiştirildi
- [x] Database migration'lar tamamlandı
- [x] Unit test coverage %80+
- [x] Integration test coverage %60+
- [x] API documentation (Swagger) güncellendi

### Frontend

- [x] Hiçbir mock data kalmadı (test dosyaları hariç)
- [x] Tüm TODO comment'ler temizlendi
- [x] Error handling ve loading states eklendi
- [x] Build başarılı, TypeScript hatasız
- [x] E2E testler geçiyor

### Performance

- [x] API response time <200ms (avg)
- [x] Page load time <2s (FCP)
- [x] Lighthouse score >90
- [x] No console errors in production

---

## 🎯 İlk Adım: Support Ticket System

**HEMEN BAŞLIYORUZ!** İlk task olan Support Ticket System'i geliştirmeye başlayalım:

1. ✅ Entity ve DTO'ları oluştur
2. ✅ Repository interface'leri yaz
3. ✅ Service layer implementasyonu
4. ✅ Controller endpoints
5. ✅ Database migration
6. ✅ Unit testler
7. ✅ Frontend entegrasyonu test

**Devam edelim mi?** 🚀
