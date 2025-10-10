# Mimari Tasarım - Spring Boot Backend

> **Dokümantasyon**: 02 - Mimari Tasarım  
> **Versiyon**: 1.0.0  
> **Tarih**: Ekim 2025

---

## 📋 İçindekiler

1. [Genel Mimari Yaklaşım](#genel-mimari-yaklaşım)
2. [Katmanlı Mimari (Layered Architecture)](#katmanlı-mimari)
3. [Spring Boot Modülleri](#spring-boot-modülleri)
4. [Domain-Driven Design](#domain-driven-design)
5. [Design Patterns](#design-patterns)
6. [Configuration Management](#configuration-management)
7. [Exception Handling](#exception-handling)
8. [Logging Strategy](#logging-strategy)
9. [Validation](#validation)
10. [CORS Configuration](#cors-configuration)

---

## 🏗️ Genel Mimari Yaklaşım

### Seçilen Mimari: **Layered Architecture with Domain-Driven Design**

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│                    (REST Controllers)                        │
│  - API Endpoints                                            │
│  - Request/Response DTOs                                    │
│  - Input Validation                                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                      SERVICE LAYER                           │
│                   (Business Logic)                           │
│  - Business Rules                                           │
│  - Transaction Management                                   │
│  - DTO ↔ Entity Mapping                                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                   PERSISTENCE LAYER                          │
│              (Data Access & Repositories)                    │
│  - JPA Repositories                                         │
│  - Custom Queries                                           │
│  - Database Operations                                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                      DOMAIN LAYER                            │
│                  (Core Business Models)                      │
│  - Entities                                                 │
│  - Value Objects                                            │
│  - Domain Services                                          │
└─────────────────────────────────────────────────────────────┘

                    CROSS-CUTTING CONCERNS
┌─────────────────────────────────────────────────────────────┐
│  Security | Logging | Exception Handling | Validation       │
│  Caching | Monitoring | Configuration                       │
└─────────────────────────────────────────────────────────────┘
```

### Mimari Prensipler

#### 1. **Separation of Concerns (SoC)**

Her katman kendi sorumluluğuna odaklanır:

- **Presentation**: HTTP isteklerini karşılar
- **Service**: İş mantığını yönetir
- **Persistence**: Veri erişimini sağlar
- **Domain**: İş modellerini tanımlar

#### 2. **Dependency Rule**

```
Presentation → Service → Persistence → Domain
(Dıştan içe bağımlılık, içten dışa asla)
```

#### 3. **Single Responsibility Principle**

Her sınıf tek bir sorumluluğa sahip olmalı.

#### 4. **Open/Closed Principle**

Genişletmeye açık, değişikliğe kapalı.

---

## 🎯 Katmanlı Mimari

### 1. Presentation Layer (Controller)

**Sorumluluklar:**

- HTTP isteklerini kabul etme
- Input validation
- DTO dönüşümleri
- HTTP response oluşturma
- API dokümantasyonu (Swagger)

**Örnek Yapı:**

```java
package com.marifetbul.domain.job.controller;

@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
@Tag(name = "Jobs", description = "Job management endpoints")
@Validated
public class JobController {

    private final JobService jobService;
    private final JobMapper jobMapper;

    /**
     * Create a new job posting
     * @param request Job creation request
     * @return Created job details
     */
    @PostMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Create job", description = "Create a new job posting")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Job created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<JobResponse>> createJob(
            @Valid @RequestBody CreateJobRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Job job = jobService.createJob(request, currentUser.getId());
        JobResponse response = jobMapper.toResponse(job);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Job created successfully"));
    }

    /**
     * Get jobs with filtering and pagination
     */
    @GetMapping
    @Operation(summary = "List jobs", description = "Get jobs with filters")
    public ResponseEntity<ApiResponse<PageResponse<JobResponse>>> getJobs(
            @Valid @ModelAttribute JobFilterRequest filter,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {

        Page<Job> jobs = jobService.getJobs(filter, pageable);
        PageResponse<JobResponse> response = PageResponse.of(
            jobs.map(jobMapper::toResponse)
        );

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get job by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get job", description = "Get job details by ID")
    public ResponseEntity<ApiResponse<JobDetailResponse>> getJob(
            @PathVariable @NotNull UUID id) {

        Job job = jobService.getJobById(id);
        JobDetailResponse response = jobMapper.toDetailResponse(job);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Update job
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Update job", description = "Update job details")
    public ResponseEntity<ApiResponse<JobResponse>> updateJob(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateJobRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Job job = jobService.updateJob(id, request, currentUser.getId());
        JobResponse response = jobMapper.toResponse(job);

        return ResponseEntity.ok(ApiResponse.success(response, "Job updated successfully"));
    }

    /**
     * Delete job
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Delete job", description = "Delete job posting")
    public ResponseEntity<ApiResponse<Void>> deleteJob(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        jobService.deleteJob(id, currentUser.getId());

        return ResponseEntity.ok(ApiResponse.success(null, "Job deleted successfully"));
    }

    /**
     * Close job posting
     */
    @PostMapping("/{id}/close")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Close job", description = "Close job to new proposals")
    public ResponseEntity<ApiResponse<JobResponse>> closeJob(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Job job = jobService.closeJob(id, currentUser.getId());
        JobResponse response = jobMapper.toResponse(job);

        return ResponseEntity.ok(ApiResponse.success(response, "Job closed successfully"));
    }
}
```

**Controller Best Practices:**

- ✅ Sadece HTTP işlemleri
- ✅ İnce controller (logic service'te)
- ✅ DTO kullanımı
- ✅ Validation annotations
- ✅ Swagger documentation
- ✅ Consistent response format
- ❌ Business logic yok
- ❌ Direct entity exposure yok

---

### 2. Service Layer (Business Logic)

**Sorumluluklar:**

- İş kurallarını uygulama
- Transaction yönetimi
- Domain logic koordinasyonu
- Entity ↔ DTO mapping
- Event publishing

**Örnek Yapı:**

```java
package com.marifetbul.domain.job.service;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final JobMapper jobMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final CacheManager cacheManager;

    /**
     * Create a new job posting
     */
    @Transactional
    public Job createJob(CreateJobRequest request, UUID employerId) {
        log.info("Creating job for employer: {}", employerId);

        // Validate employer
        User employer = userRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found"));

        if (!employer.getUserType().equals(UserType.EMPLOYER)) {
            throw new BusinessException("Only employers can create jobs");
        }

        // Validate category
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        // Create job entity
        Job job = Job.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(category)
                .subcategory(request.getSubcategory())
                .skills(request.getSkills())
                .budget(createBudget(request.getBudget()))
                .timeline(request.getTimeline())
                .deadline(request.getDeadline())
                .experienceLevel(request.getExperienceLevel())
                .isRemote(request.getIsRemote())
                .location(request.getLocation())
                .requirements(request.getRequirements())
                .tags(request.getTags())
                .employer(employer)
                .status(JobStatus.OPEN)
                .proposalsCount(0)
                .viewsCount(0)
                .build();

        // Save job
        job = jobRepository.save(job);

        // Publish event
        eventPublisher.publishEvent(new JobCreatedEvent(this, job));

        log.info("Job created successfully: {}", job.getId());
        return job;
    }

    /**
     * Get jobs with filtering
     */
    public Page<Job> getJobs(JobFilterRequest filter, Pageable pageable) {
        log.debug("Fetching jobs with filter: {}", filter);

        // Build specification
        Specification<Job> spec = JobSpecification.builder()
                .categoryId(filter.getCategoryId())
                .skills(filter.getSkills())
                .minBudget(filter.getMinBudget())
                .maxBudget(filter.getMaxBudget())
                .experienceLevel(filter.getExperienceLevel())
                .isRemote(filter.getIsRemote())
                .location(filter.getLocation())
                .status(JobStatus.OPEN)
                .build();

        return jobRepository.findAll(spec, pageable);
    }

    /**
     * Get job by ID with view count increment
     */
    @Transactional
    public Job getJobById(UUID id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + id));

        // Increment view count
        job.incrementViewCount();
        jobRepository.save(job);

        return job;
    }

    /**
     * Update job
     */
    @Transactional
    public Job updateJob(UUID jobId, UpdateJobRequest request, UUID employerId) {
        log.info("Updating job: {} by employer: {}", jobId, employerId);

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        // Validate ownership
        if (!job.getEmployer().getId().equals(employerId)) {
            throw new ForbiddenException("You don't have permission to update this job");
        }

        // Validate status
        if (job.getStatus() == JobStatus.COMPLETED || job.getStatus() == JobStatus.CANCELLED) {
            throw new BusinessException("Cannot update completed or cancelled job");
        }

        // Update fields
        if (request.getTitle() != null) {
            job.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            job.setDescription(request.getDescription());
        }
        if (request.getBudget() != null) {
            job.setBudget(createBudget(request.getBudget()));
        }
        // ... other fields

        job = jobRepository.save(job);

        // Clear cache
        cacheManager.getCache("jobs").evict(jobId);

        // Publish event
        eventPublisher.publishEvent(new JobUpdatedEvent(this, job));

        log.info("Job updated successfully: {}", jobId);
        return job;
    }

    /**
     * Delete job
     */
    @Transactional
    public void deleteJob(UUID jobId, UUID employerId) {
        log.info("Deleting job: {} by employer: {}", jobId, employerId);

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        // Validate ownership
        if (!job.getEmployer().getId().equals(employerId)) {
            throw new ForbiddenException("You don't have permission to delete this job");
        }

        // Validate can delete
        if (job.getStatus() == JobStatus.IN_PROGRESS) {
            throw new BusinessException("Cannot delete job in progress");
        }

        // Soft delete
        job.setStatus(JobStatus.CANCELLED);
        jobRepository.save(job);

        // Or hard delete
        // jobRepository.delete(job);

        // Clear cache
        cacheManager.getCache("jobs").evict(jobId);

        // Publish event
        eventPublisher.publishEvent(new JobDeletedEvent(this, jobId));

        log.info("Job deleted successfully: {}", jobId);
    }

    /**
     * Close job to new proposals
     */
    @Transactional
    public Job closeJob(UUID jobId, UUID employerId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getEmployer().getId().equals(employerId)) {
            throw new ForbiddenException("You don't have permission to close this job");
        }

        job.setStatus(JobStatus.CLOSED);
        job = jobRepository.save(job);

        eventPublisher.publishEvent(new JobClosedEvent(this, job));

        return job;
    }

    // Helper methods
    private JobBudget createBudget(BudgetRequest request) {
        return JobBudget.builder()
                .type(request.getType())
                .amount(request.getAmount())
                .maxAmount(request.getMaxAmount())
                .currency("TRY")
                .build();
    }
}
```

**Service Best Practices:**

- ✅ Business logic burada
- ✅ Transaction yönetimi
- ✅ Validation rules
- ✅ Event publishing
- ✅ Cache management
- ✅ Logging
- ❌ HTTP concerns yok
- ❌ Direct DTO kullanımı minimal

---

### 3. Persistence Layer (Repository)

**Sorumluluklar:**

- Database CRUD operations
- Custom queries
- Specifications
- Projections

**Örnek Yapı:**

```java
package com.marifetbul.domain.job.repository;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID>,
                                       JpaSpecificationExecutor<Job> {

    /**
     * Find jobs by employer
     */
    @Query("SELECT j FROM Job j WHERE j.employer.id = :employerId AND j.status != 'CANCELLED'")
    Page<Job> findByEmployerId(@Param("employerId") UUID employerId, Pageable pageable);

    /**
     * Find active jobs by category
     */
    List<Job> findByCategoryIdAndStatusOrderByCreatedAtDesc(
            UUID categoryId,
            JobStatus status
    );

    /**
     * Find jobs with proposals count
     */
    @Query("SELECT j, COUNT(p) as proposalCount " +
           "FROM Job j LEFT JOIN Proposal p ON p.job.id = j.id " +
           "WHERE j.status = :status " +
           "GROUP BY j " +
           "ORDER BY proposalCount DESC")
    Page<Object[]> findJobsWithProposalCount(
            @Param("status") JobStatus status,
            Pageable pageable
    );

    /**
     * Find jobs expiring soon
     */
    @Query("SELECT j FROM Job j WHERE j.deadline BETWEEN :now AND :expiryDate AND j.status = 'OPEN'")
    List<Job> findJobsExpiringSoon(
            @Param("now") LocalDateTime now,
            @Param("expiryDate") LocalDateTime expiryDate
    );

    /**
     * Count active jobs by employer
     */
    long countByEmployerIdAndStatus(UUID employerId, JobStatus status);

    /**
     * Check if job exists
     */
    boolean existsByIdAndEmployerId(UUID jobId, UUID employerId);

    /**
     * Find jobs by skills (contains any)
     */
    @Query("SELECT DISTINCT j FROM Job j JOIN j.skills s WHERE s IN :skills AND j.status = 'OPEN'")
    List<Job> findBySkillsIn(@Param("skills") List<String> skills);

    /**
     * Find jobs with budget range
     */
    @Query("SELECT j FROM Job j WHERE " +
           "j.budget.amount BETWEEN :minBudget AND :maxBudget " +
           "AND j.status = 'OPEN'")
    Page<Job> findByBudgetRange(
            @Param("minBudget") BigDecimal minBudget,
            @Param("maxBudget") BigDecimal maxBudget,
            Pageable pageable
    );

    /**
     * Custom projection for list view
     */
    @Query("SELECT new com.marifetbul.domain.job.dto.JobSummaryProjection(" +
           "j.id, j.title, j.budget.amount, j.status, j.proposalsCount, j.createdAt) " +
           "FROM Job j WHERE j.status = 'OPEN'")
    List<JobSummaryProjection> findJobSummaries();
}
```

**Custom Specification:**

```java
package com.marifetbul.domain.job.repository;

@Slf4j
public class JobSpecification {

    public static Specification<Job> withFilters(JobFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Category filter
            if (filter.getCategoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("id"), filter.getCategoryId()));
            }

            // Skills filter (contains any)
            if (filter.getSkills() != null && !filter.getSkills().isEmpty()) {
                Join<Job, String> skillsJoin = root.join("skills");
                predicates.add(skillsJoin.in(filter.getSkills()));
            }

            // Budget range
            if (filter.getMinBudget() != null) {
                predicates.add(cb.greaterThanOrEqualTo(
                    root.get("budget").get("amount"),
                    filter.getMinBudget()
                ));
            }
            if (filter.getMaxBudget() != null) {
                predicates.add(cb.lessThanOrEqualTo(
                    root.get("budget").get("amount"),
                    filter.getMaxBudget()
                ));
            }

            // Experience level
            if (filter.getExperienceLevel() != null) {
                predicates.add(cb.equal(root.get("experienceLevel"), filter.getExperienceLevel()));
            }

            // Remote filter
            if (filter.getIsRemote() != null) {
                predicates.add(cb.equal(root.get("isRemote"), filter.getIsRemote()));
            }

            // Location
            if (filter.getLocation() != null) {
                predicates.add(cb.like(
                    cb.lower(root.get("location")),
                    "%" + filter.getLocation().toLowerCase() + "%"
                ));
            }

            // Status (default: OPEN)
            predicates.add(cb.equal(root.get("status"), JobStatus.OPEN));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
```

---

### 4. Domain Layer (Entities)

**Sorumluluklar:**

- Business models
- Domain logic
- Value objects
- Entity relationships

**Örnek Entity:**

```java
package com.marifetbul.domain.job.entity;

@Entity
@Table(name = "jobs", indexes = {
    @Index(name = "idx_job_employer", columnList = "employer_id"),
    @Index(name = "idx_job_category", columnList = "category_id"),
    @Index(name = "idx_job_status", columnList = "status"),
    @Index(name = "idx_job_created", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Job extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String title;

    @Column(nullable = false, length = 5000)
    @Lob
    @NotBlank(message = "Description is required")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @NotNull(message = "Category is required")
    private Category category;

    @Column(length = 100)
    private String subcategory;

    @ElementCollection
    @CollectionTable(name = "job_skills", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "skill")
    private List<String> skills = new ArrayList<>();

    @Embedded
    @NotNull
    private JobBudget budget;

    @Column(length = 50)
    private String timeline;

    @Column(name = "deadline")
    private LocalDateTime deadline;

    @Enumerated(EnumType.STRING)
    @Column(name = "experience_level", length = 20)
    private ExperienceLevel experienceLevel;

    @Column(name = "is_remote")
    private Boolean isRemote;

    @Column(length = 100)
    private String location;

    @ElementCollection
    @CollectionTable(name = "job_requirements", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "requirement", length = 500)
    private List<String> requirements = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "job_tags", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false)
    @NotNull
    private User employer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancer_id")
    private User freelancer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private JobStatus status = JobStatus.OPEN;

    @Column(name = "proposals_count")
    @Builder.Default
    private Integer proposalsCount = 0;

    @Column(name = "views_count")
    @Builder.Default
    private Integer viewsCount = 0;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Proposal> proposals = new ArrayList<>();

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    // Audit fields (from BaseEntity)
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    // Business methods
    public void incrementViewCount() {
        this.viewsCount++;
    }

    public void incrementProposalCount() {
        this.proposalsCount++;
    }

    public void decrementProposalCount() {
        if (this.proposalsCount > 0) {
            this.proposalsCount--;
        }
    }

    public boolean isOwnedBy(UUID userId) {
        return this.employer.getId().equals(userId);
    }

    public boolean canAcceptProposals() {
        return this.status == JobStatus.OPEN &&
               (this.deadline == null || this.deadline.isAfter(LocalDateTime.now()));
    }

    public boolean canBeUpdated() {
        return this.status != JobStatus.COMPLETED &&
               this.status != JobStatus.CANCELLED;
    }

    public void assignFreelancer(User freelancer) {
        this.freelancer = freelancer;
        this.status = JobStatus.IN_PROGRESS;
    }

    public void complete() {
        if (this.status != JobStatus.IN_PROGRESS) {
            throw new IllegalStateException("Can only complete jobs in progress");
        }
        this.status = JobStatus.COMPLETED;
    }

    public void cancel() {
        if (this.status == JobStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel completed job");
        }
        this.status = JobStatus.CANCELLED;
    }
}
```

**Value Object (Embedded):**

```java
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobBudget {

    @Enumerated(EnumType.STRING)
    @Column(name = "budget_type", nullable = false, length = 10)
    private BudgetType type;

    @Column(name = "budget_amount", nullable = false, precision = 10, scale = 2)
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal amount;

    @Column(name = "budget_max_amount", precision = 10, scale = 2)
    private BigDecimal maxAmount;

    @Column(name = "budget_currency", length = 3)
    @Builder.Default
    private String currency = "TRY";

    public enum BudgetType {
        FIXED, HOURLY
    }

    public boolean isHourly() {
        return type == BudgetType.HOURLY;
    }

    public boolean isFixed() {
        return type == BudgetType.FIXED;
    }
}
```

---

## 🔧 Spring Boot Modülleri

### 1. Spring Web (REST APIs)

**pom.xml:**

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

**Configuration:**

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "https://marifetbul.com")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer
                .favorParameter(false)
                .ignoreAcceptHeader(false)
                .defaultContentType(MediaType.APPLICATION_JSON)
                .mediaType("json", MediaType.APPLICATION_JSON);
    }

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(30))
                .build();
    }
}
```

### 2. Spring Data JPA (Database)

**pom.xml:**

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

**Configuration:**

```java
@Configuration
@EnableJpaRepositories(basePackages = "com.marifetbul")
@EnableJpaAuditing
public class JpaConfig {

    @Bean
    public AuditorAware<UUID> auditorProvider() {
        return new AuditorAwareImpl();
    }
}

class AuditorAwareImpl implements AuditorAware<UUID> {
    @Override
    public Optional<UUID> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return Optional.of(principal.getId());
    }
}
```

### 3. Spring Security (Authentication & Authorization)

**pom.xml:**

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
```

### 4. Validation

**pom.xml:**

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

### 5. Lombok (Boilerplate Reduction)

**pom.xml:**

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```

### 6. MapStruct (DTO Mapping)

**pom.xml:**

```xml
<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
    <version>1.5.5.Final</version>
</dependency>
<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct-processor</artifactId>
    <version>1.5.5.Final</version>
    <scope>provided</scope>
</dependency>
```

**Mapper Example:**

```java
@Mapper(componentModel = "spring", uses = {UserMapper.class, CategoryMapper.class})
public interface JobMapper {

    JobResponse toResponse(Job job);

    @Mapping(target = "employer", source = "job.employer")
    @Mapping(target = "proposals", source = "job.proposals")
    JobDetailResponse toDetailResponse(Job job);

    List<JobResponse> toResponseList(List<Job> jobs);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Job toEntity(CreateJobRequest request);
}
```

### 7. OpenAPI / Swagger (API Documentation)

**pom.xml:**

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.2.0</version>
</dependency>
```

**Configuration:**

```java
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("MarifetBul API")
                        .version("1.0.0")
                        .description("MarifetBul Freelance Platform API Documentation")
                        .contact(new Contact()
                                .name("MarifetBul Team")
                                .email("support@marifetbul.com")
                                .url("https://marifetbul.com"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://marifetbul.com/terms")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication", createAPIKeyScheme()));
    }

    private SecurityScheme createAPIKeyScheme() {
        return new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .bearerFormat("JWT")
                .scheme("bearer");
    }
}
```

### 8. Caching (Redis)

**pom.xml:**

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
```

**Configuration:**

```java
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(
                                new StringRedisSerializer()))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(
                                new GenericJackson2JsonRedisSerializer()));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(config)
                .build();
    }
}
```

### 9. Actuator (Monitoring)

**pom.xml:**

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

**application.yml:**

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when-authorized
  metrics:
    export:
      prometheus:
        enabled: true
```

---

## 🎨 Design Patterns

### 1. Repository Pattern

```java
// Already shown above
```

### 2. Service Layer Pattern

```java
// Already shown above
```

### 3. DTO Pattern

```java
// Request DTO
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateJobRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 100)
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 5000)
    private String description;

    @NotNull
    private UUID categoryId;

    private String subcategory;

    private List<String> skills;

    @NotNull
    @Valid
    private BudgetRequest budget;

    // ... other fields
}

// Response DTO
@Getter
@Setter
@Builder
public class JobResponse {
    private UUID id;
    private String title;
    private String description;
    private CategoryResponse category;
    private List<String> skills;
    private BudgetResponse budget;
    private JobStatus status;
    private Integer proposalsCount;
    private LocalDateTime createdAt;
    private UserSummaryResponse employer;
}
```

### 4. Builder Pattern (Lombok)

```java
Job job = Job.builder()
        .title("Web Development")
        .description("Need a developer")
        .budget(budget)
        .status(JobStatus.OPEN)
        .build();
```

### 5. Factory Pattern

```java
@Component
public class NotificationFactory {

    public Notification createNotification(NotificationType type, Map<String, Object> data) {
        return switch (type) {
            case NEW_MESSAGE -> createMessageNotification(data);
            case NEW_PROPOSAL -> createProposalNotification(data);
            case ORDER_CREATED -> createOrderNotification(data);
            default -> throw new IllegalArgumentException("Unknown notification type");
        };
    }

    private Notification createMessageNotification(Map<String, Object> data) {
        // Implementation
    }
}
```

### 6. Strategy Pattern

```java
public interface PaymentStrategy {
    PaymentResult processPayment(Payment payment);
}

@Service
public class CreditCardPaymentStrategy implements PaymentStrategy {
    @Override
    public PaymentResult processPayment(Payment payment) {
        // Credit card logic
    }
}

@Service
public class BankTransferPaymentStrategy implements PaymentStrategy {
    @Override
    public PaymentResult processPayment(Payment payment) {
        // Bank transfer logic
    }
}

@Service
public class PaymentService {
    private final Map<PaymentMethod, PaymentStrategy> strategies;

    public PaymentResult process(Payment payment) {
        PaymentStrategy strategy = strategies.get(payment.getMethod());
        return strategy.processPayment(payment);
    }
}
```

---

## ⚙️ Configuration Management

### application.yml Structure

```yaml
# Main configuration
spring:
  application:
    name: marifetbul-api

  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}

  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/marifetbul}
    username: ${DATABASE_USERNAME:postgres}
    password: ${DATABASE_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000

  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
        use_sql_comments: true

  redis:
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}
    password: ${REDIS_PASSWORD:}
    timeout: 2000ms

  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 20MB

# Application specific
app:
  jwt:
    secret: ${JWT_SECRET:your-secret-key-change-in-production}
    expiration: 604800000 # 7 days
    refresh-expiration: 2592000000 # 30 days

  cors:
    allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:3000}

  file:
    upload-dir: ${FILE_UPLOAD_DIR:./uploads}
    max-size: 10485760 # 10MB

  pagination:
    default-size: 20
    max-size: 100

# Logging
logging:
  level:
    root: INFO
    com.marifetbul: DEBUG
    org.springframework.web: DEBUG
    org.hibernate.SQL: DEBUG
  pattern:
    console: '%d{yyyy-MM-dd HH:mm:ss} - %msg%n'
    file: '%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n'
  file:
    name: logs/marifetbul.log
    max-size: 10MB
    max-history: 30
```

### Environment-specific configs

**application-dev.yml:**

```yaml
spring:
  jpa:
    show-sql: true
    hibernate:
      ddl-auto: update

logging:
  level:
    root: DEBUG
```

**application-test.yml:**

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: create-drop
```

**application-prod.yml:**

```yaml
spring:
  jpa:
    show-sql: false
    hibernate:
      ddl-auto: validate

logging:
  level:
    root: WARN
    com.marifetbul: INFO
```

---

## 🚨 Exception Handling

### Global Exception Handler

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(
            ResourceNotFoundException ex, WebRequest request) {
        log.error("Resource not found: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(
                        ErrorCode.RESOURCE_NOT_FOUND,
                        ex.getMessage()
                ));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(
            BusinessException ex, WebRequest request) {
        log.error("Business exception: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(
                        ErrorCode.BUSINESS_ERROR,
                        ex.getMessage()
                ));
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiResponse<Void>> handleForbiddenException(
            ForbiddenException ex, WebRequest request) {
        log.error("Forbidden: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(
                        ErrorCode.FORBIDDEN,
                        ex.getMessage()
                ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(
            MethodArgumentNotValidException ex) {
        log.error("Validation error: {}", ex.getMessage());

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage())
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(
                        ErrorCode.VALIDATION_ERROR,
                        "Validation failed",
                        errors
                ));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolation(
            DataIntegrityViolationException ex) {
        log.error("Data integrity violation: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(
                        ErrorCode.DATA_INTEGRITY_VIOLATION,
                        "Data integrity violation occurred"
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(
            Exception ex, WebRequest request) {
        log.error("Unexpected error", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(
                        ErrorCode.INTERNAL_SERVER_ERROR,
                        "An unexpected error occurred"
                ));
    }
}
```

### Custom Exceptions

```java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue));
    }
}

public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}

public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
```

---

## 📝 Logging Strategy

### Logging Configuration

```java
@Slf4j
@Service
public class JobService {

    public Job createJob(CreateJobRequest request, UUID employerId) {
        log.info("Creating job for employer: {}", employerId);
        log.debug("Job details: {}", request);

        try {
            // Business logic
            Job job = // ...

            log.info("Job created successfully: {}", job.getId());
            return job;
        } catch (Exception e) {
            log.error("Error creating job for employer: {}", employerId, e);
            throw e;
        }
    }
}
```

### Log Levels

- **ERROR**: Errors and exceptions
- **WARN**: Warnings
- **INFO**: Important business events
- **DEBUG**: Detailed debug information
- **TRACE**: Very detailed trace information

---

## ✅ Validation

### Field Validation

```java
public class CreateJobRequest {
    @NotBlank(message = "Title is required")
    @Size(min = 10, max = 100, message = "Title must be between 10 and 100 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 50, max = 5000, message = "Description must be between 50 and 5000 characters")
    private String description;

    @NotNull(message = "Category is required")
    private UUID categoryId;

    @NotNull(message = "Budget is required")
    @Valid
    private BudgetRequest budget;

    @Email(message = "Invalid email format")
    private String contactEmail;

    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Invalid phone number")
    private String phone;
}
```

### Custom Validators

```java
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = BudgetValidator.class)
public @interface ValidBudget {
    String message() default "Invalid budget";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class BudgetValidator implements ConstraintValidator<ValidBudget, BudgetRequest> {
    @Override
    public boolean isValid(BudgetRequest budget, ConstraintValidatorContext context) {
        if (budget == null) return true;

        if (budget.getType() == BudgetType.HOURLY && budget.getMaxAmount() == null) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Max amount is required for hourly budget")
                   .addConstraintViolation();
            return false;
        }

        return true;
    }
}
```

---

## 🌐 CORS Configuration

```java
@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowCredentials(true);
        config.setAllowedOriginPatterns(Arrays.asList(allowedOrigins));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setMaxAge(3600L);

        source.registerCorsConfiguration("/api/**", config);

        return new CorsFilter(source);
    }
}
```

---

## 🎯 Sonraki Adımlar

1. ✅ **Mimari Tasarım Tamamlandı**
2. ➡️ **Veritabanı Tasarımı** - [03-DATABASE-DESIGN.md](./03-DATABASE-DESIGN.md)
3. ⏭️ **API Tasarımı** - [04-API-DESIGN.md](./04-API-DESIGN.md)

---

**Doküman Durumu**: ✅ Tamamlandı  
**Son Güncelleme**: Ekim 2025  
**Sonraki Adım**: Veritabanı şeması ve ERD tasarımı
