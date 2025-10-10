# Domain Modelleri - Entity & DTO Patterns

> **Dokümantasyon**: 06 - Domain Models  
> **Versiyon**: 1.0.0  
> **Tarih**: Ekim 2025

---

## 🎯 Domain-Driven Design Approach

### Domain Organization

```
com.marifetbul.domain/
├── user/        # Kullanıcı domain'i
├── job/         # İş ilanları
├── package/     # Hizmet paketleri
├── proposal/    # Teklifler
├── order/       # Siparişler
├── payment/     # Ödemeler
├── message/     # Mesajlaşma
├── review/      # İncelemeler
├── blog/        # Blog
└── support/     # Destek
```

### Layering per Domain

```
domain/
└── job/
    ├── entity/
    │   └── Job.java
    ├── dto/
    │   ├── request/
    │   │   ├── CreateJobRequest.java
    │   │   └── UpdateJobRequest.java
    │   └── response/
    │       ├── JobResponse.java
    │       └── JobDetailResponse.java
    ├── repository/
    │   ├── JobRepository.java
    │   └── JobSpecification.java
    ├── service/
    │   ├── JobService.java
    │   └── JobEventHandler.java
    ├── controller/
    │   └── JobController.java
    └── mapper/
        └── JobMapper.java
```

---

## 📦 Entity Examples

### Base Entity (Abstract)

```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public abstract class BaseEntity implements Serializable {

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Version
    private Long version; // Optimistic locking
}
```

### Job Entity (Simplified)

```java
@Entity
@Table(name = "jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String title;

    @Lob
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    private Category category;

    @ElementCollection
    private List<String> skills;

    @Embedded
    private JobBudget budget;

    @Enumerated(EnumType.STRING)
    private JobStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    private User employer;
}
```

---

## 📝 DTO Patterns

### Request DTOs

```java
// Create
@Getter
@Setter
public class CreateJobRequest {
    @NotBlank
    @Size(max = 100)
    private String title;

    @NotBlank
    private String description;

    @NotNull
    private UUID categoryId;

    private List<String> skills;

    @Valid
    private BudgetRequest budget;
}

// Update
@Getter
@Setter
public class UpdateJobRequest {
    private String title;
    private String description;
    private BudgetRequest budget;
    // Partial update - all fields optional
}

// Filter
@Getter
@Setter
public class JobFilterRequest {
    private UUID categoryId;
    private List<String> skills;
    private BigDecimal minBudget;
    private BigDecimal maxBudget;
    private Boolean isRemote;
}
```

### Response DTOs

```java
// Summary (for lists)
@Getter
@Builder
public class JobResponse {
    private UUID id;
    private String title;
    private CategoryResponse category;
    private BudgetResponse budget;
    private JobStatus status;
    private Integer proposalsCount;
    private UserSummaryResponse employer;
    private LocalDateTime createdAt;
}

// Detail (for single item)
@Getter
@Builder
public class JobDetailResponse {
    private UUID id;
    private String title;
    private String description;
    private CategoryResponse category;
    private List<String> skills;
    private BudgetResponse budget;
    private String timeline;
    private LocalDateTime deadline;
    private JobStatus status;
    private UserDetailResponse employer;
    private List<ProposalSummaryResponse> proposals;
    private LocalDateTime createdAt;
}
```

---

## 🗺️ MapStruct Mappers

```java
@Mapper(componentModel = "spring")
public interface JobMapper {

    // Entity -> Response
    JobResponse toResponse(Job job);

    JobDetailResponse toDetailResponse(Job job);

    List<JobResponse> toResponseList(List<Job> jobs);

    // Request -> Entity
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    Job toEntity(CreateJobRequest request);

    // Partial update
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(UpdateJobRequest dto, @MappingTarget Job entity);
}
```

---

## 📚 Domain Service Pattern

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class JobService {

    private final JobRepository jobRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final JobMapper jobMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public Job createJob(CreateJobRequest request, UUID employerId) {
        // 1. Validation
        validateJobCreation(request, employerId);

        // 2. Build entity
        Job job = buildJobEntity(request, employerId);

        // 3. Save
        job = jobRepository.save(job);

        // 4. Publish event
        eventPublisher.publishEvent(new JobCreatedEvent(this, job));

        // 5. Return
        return job;
    }

    public Page<Job> findJobs(JobFilterRequest filter, Pageable pageable) {
        Specification<Job> spec = JobSpecification.withFilters(filter);
        return jobRepository.findAll(spec, pageable);
    }

    private void validateJobCreation(CreateJobRequest request, UUID employerId) {
        User employer = userRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (employer.getUserType() != UserType.EMPLOYER) {
            throw new BusinessException("Only employers can create jobs");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private Job buildJobEntity(CreateJobRequest request, UUID employerId) {
        return Job.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(JobStatus.OPEN)
                .build();
    }
}
```

---

## 🎯 Repository Pattern

```java
@Repository
public interface JobRepository extends JpaRepository<Job, UUID>,
                                       JpaSpecificationExecutor<Job> {

    // Query methods
    List<Job> findByEmployerId(UUID employerId);

    Page<Job> findByStatus(JobStatus status, Pageable pageable);

    @Query("SELECT j FROM Job j WHERE j.category.id = :categoryId AND j.status = 'OPEN'")
    List<Job> findActiveByCategoryId(@Param("categoryId") UUID categoryId);

    // Count methods
    long countByEmployerIdAndStatus(UUID employerId, JobStatus status);

    // Exists methods
    boolean existsByIdAndEmployerId(UUID jobId, UUID employerId);
}
```

---

## 🔍 Specification Pattern (Dynamic Queries)

```java
public class JobSpecification {

    public static Specification<Job> withFilters(JobFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getCategoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("id"), filter.getCategoryId()));
            }

            if (filter.getSkills() != null && !filter.getSkills().isEmpty()) {
                Join<Job, String> skillsJoin = root.join("skills");
                predicates.add(skillsJoin.in(filter.getSkills()));
            }

            if (filter.getMinBudget() != null) {
                predicates.add(cb.greaterThanOrEqualTo(
                    root.get("budget").get("amount"), filter.getMinBudget()));
            }

            if (filter.getMaxBudget() != null) {
                predicates.add(cb.lessThanOrEqualTo(
                    root.get("budget").get("amount"), filter.getMaxBudget()));
            }

            if (filter.getIsRemote() != null) {
                predicates.add(cb.equal(root.get("isRemote"), filter.getIsRemote()));
            }

            // Always show only OPEN jobs for public listing
            predicates.add(cb.equal(root.get("status"), JobStatus.OPEN));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
```

---

## 📊 Value Objects (Embedded)

```java
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JobBudget {

    @Enumerated(EnumType.STRING)
    @Column(name = "budget_type")
    private BudgetType type;

    @Column(name = "budget_amount", precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "budget_max_amount", precision = 10, scale = 2)
    private BigDecimal maxAmount;

    public enum BudgetType {
        FIXED, HOURLY
    }
}
```

---

## 🎭 Event-Driven Architecture

```java
// Event
@Getter
public class JobCreatedEvent extends ApplicationEvent {
    private final Job job;

    public JobCreatedEvent(Object source, Job job) {
        super(source);
        this.job = job;
    }
}

// Event Handler
@Component
@RequiredArgsConstructor
@Slf4j
public class JobEventHandler {

    private final NotificationService notificationService;
    private final AnalyticsService analyticsService;

    @EventListener
    @Async
    public void handleJobCreated(JobCreatedEvent event) {
        Job job = event.getJob();
        log.info("Job created event received: {}", job.getId());

        // Send notifications to matching freelancers
        notificationService.notifyMatchingFreelancers(job);

        // Track analytics
        analyticsService.trackJobCreation(job);
    }

    @EventListener
    @Async
    public void handleJobCompleted(JobCompletedEvent event) {
        // Update statistics, send notifications, etc.
    }
}
```

---

## ✅ Domain Validation

```java
@Entity
public class Job extends BaseEntity {

    // Business logic methods
    public void assignFreelancer(User freelancer) {
        if (this.status != JobStatus.OPEN) {
            throw new BusinessException("Can only assign freelancer to open jobs");
        }
        if (freelancer.getUserType() != UserType.FREELANCER) {
            throw new BusinessException("Can only assign freelancers");
        }
        this.freelancer = freelancer;
        this.status = JobStatus.IN_PROGRESS;
    }

    public void complete() {
        if (this.status != JobStatus.IN_PROGRESS) {
            throw new BusinessException("Can only complete jobs in progress");
        }
        if (this.freelancer == null) {
            throw new BusinessException("Job must have assigned freelancer");
        }
        this.status = JobStatus.COMPLETED;
    }

    public boolean canAcceptProposals() {
        return this.status == JobStatus.OPEN
            && (this.deadline == null || this.deadline.isAfter(LocalDateTime.now()));
    }
}
```

---

**Doküman Durumu**: ✅ Tamamlandı  
**Sonraki Adım**: Test Strategy - [07-TEST-STRATEGY.md](./07-TEST-STRATEGY.md)

---

## 📚 Additional Domain Examples

### User Domain (Complete)

#### User Entity

```java
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_email", columnList = "email", unique = true),
    @Index(name = "idx_username", columnList = "username", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(length = 500)
    private String avatar;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_type", nullable = false, length = 20)
    private UserType userType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private UserStatus status;

    @Column(name = "email_verified")
    private boolean emailVerified = false;

    @Column(name = "email_verification_token")
    private String emailVerificationToken;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    // Relationships
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Freelancer freelancer;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Employer employer;

    // Business Methods
    public void verifyEmail() {
        this.emailVerified = true;
        this.emailVerificationToken = null;
    }

    public void updateLastLogin() {
        this.lastLoginAt = LocalDateTime.now();
    }

    public boolean isFreelancer() {
        return this.userType == UserType.FREELANCER;
    }

    public boolean isEmployer() {
        return this.userType == UserType.EMPLOYER;
    }

    public boolean isActive() {
        return this.status == UserStatus.ACTIVE;
    }

    public enum UserType {
        FREELANCER, EMPLOYER, ADMIN
    }

    public enum UserStatus {
        ACTIVE, SUSPENDED, BANNED, DELETED
    }
}
```

#### Freelancer Entity

```java
@Entity
@Table(name = "freelancers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Freelancer extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "hourly_rate", precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Enumerated(EnumType.STRING)
    @Column(name = "experience_level", length = 20)
    private ExperienceLevel experienceLevel;

    @Column(length = 100)
    private String location;

    @ElementCollection
    @CollectionTable(name = "freelancer_skills", joinColumns = @JoinColumn(name = "freelancer_id"))
    @Column(name = "skill")
    private List<String> skills = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "freelancer_languages")
    private List<Language> languages = new ArrayList<>();

    @OneToMany(mappedBy = "freelancer", cascade = CascadeType.ALL)
    private List<Portfolio> portfolios = new ArrayList<>();

    @OneToMany(mappedBy = "freelancer", cascade = CascadeType.ALL)
    private List<Education> educations = new ArrayList<>();

    @OneToMany(mappedBy = "freelancer", cascade = CascadeType.ALL)
    private List<Experience> experiences = new ArrayList<>();

    // Statistics
    @Column(name = "total_earnings", precision = 12, scale = 2)
    private BigDecimal totalEarnings = BigDecimal.ZERO;

    @Column(name = "completed_jobs")
    private Integer completedJobs = 0;

    @Column(name = "rating", precision = 2, scale = 1)
    private BigDecimal rating;

    @Column(name = "total_reviews")
    private Integer totalReviews = 0;

    @Column(name = "response_time_hours")
    private Integer responseTimeHours;

    @Column(name = "is_available")
    private boolean available = true;

    @Embedded
    private Availability availability;

    public enum ExperienceLevel {
        BEGINNER, INTERMEDIATE, EXPERT
    }

    @Embeddable
    @Getter
    @Setter
    public static class Language {
        private String language;

        @Enumerated(EnumType.STRING)
        private ProficiencyLevel proficiency;

        public enum ProficiencyLevel {
            BASIC, CONVERSATIONAL, FLUENT, NATIVE
        }
    }

    @Embeddable
    @Getter
    @Setter
    public static class Availability {
        @Column(name = "hours_per_week")
        private Integer hoursPerWeek;

        @Column(name = "available_from")
        private LocalDate availableFrom;

        @Enumerated(EnumType.STRING)
        @Column(name = "availability_type")
        private AvailabilityType type;

        public enum AvailabilityType {
            FULL_TIME, PART_TIME, PROJECT_BASED
        }
    }
}
```

#### Portfolio Entity

```java
@Entity
@Table(name = "portfolios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Portfolio extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancer_id", nullable = false)
    private Freelancer freelancer;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "project_url", length = 500)
    private String projectUrl;

    @ElementCollection
    @CollectionTable(name = "portfolio_images", joinColumns = @JoinColumn(name = "portfolio_id"))
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "portfolio_tags", joinColumns = @JoinColumn(name = "portfolio_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    @Column(name = "completion_date")
    private LocalDate completionDate;

    @Column(name = "client_name", length = 100)
    private String clientName;

    @Column(name = "view_count")
    private Integer viewCount = 0;

    @Column(name = "is_featured")
    private boolean featured = false;
}
```

---

### Order Domain (Complete)

#### Order Entity

```java
@Entity
@Table(name = "orders", indexes = {
    @Index(name = "idx_order_status", columnList = "status"),
    @Index(name = "idx_order_employer", columnList = "employer_id"),
    @Index(name = "idx_order_freelancer", columnList = "freelancer_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "order_number", unique = true, length = 20)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false)
    private User employer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancer_id", nullable = false)
    private User freelancer;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", nullable = false)
    private OrderType orderType;

    // References
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id")
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id")
    private Package servicePackage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposal_id")
    private Proposal proposal;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status;

    @Embedded
    private OrderAmount amount;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(name = "delivery_time_days")
    private Integer deliveryTimeDays;

    @Column(name = "deadline")
    private LocalDateTime deadline;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderMilestone> milestones = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderDelivery> deliveries = new ArrayList<>();

    @Column(name = "revision_count")
    private Integer revisionCount = 0;

    @Column(name = "max_revisions")
    private Integer maxRevisions;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    // Business Methods
    public void startWork() {
        validateStatusTransition(OrderStatus.IN_PROGRESS);
        this.status = OrderStatus.IN_PROGRESS;
    }

    public void deliver(List<Deliverable> deliverables) {
        validateStatusTransition(OrderStatus.DELIVERED);

        OrderDelivery delivery = OrderDelivery.builder()
            .order(this)
            .deliverables(deliverables)
            .deliveredAt(LocalDateTime.now())
            .build();

        this.deliveries.add(delivery);
        this.status = OrderStatus.DELIVERED;
    }

    public void requestRevision(String reason) {
        if (this.status != OrderStatus.DELIVERED) {
            throw new BusinessException("Can only request revision on delivered orders");
        }
        if (this.revisionCount >= this.maxRevisions) {
            throw new BusinessException("Maximum revision count reached");
        }
        this.status = OrderStatus.IN_REVISION;
        this.revisionCount++;
    }

    public void complete() {
        validateStatusTransition(OrderStatus.COMPLETED);
        this.status = OrderStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
    }

    public void cancel(String reason) {
        if (this.status == OrderStatus.COMPLETED) {
            throw new BusinessException("Cannot cancel completed orders");
        }
        this.status = OrderStatus.CANCELLED;
        this.cancelledAt = LocalDateTime.now();
        this.cancellationReason = reason;
    }

    private void validateStatusTransition(OrderStatus newStatus) {
        // Status transition validation logic
        if (!isValidTransition(this.status, newStatus)) {
            throw new BusinessException(
                String.format("Invalid status transition from %s to %s", this.status, newStatus)
            );
        }
    }

    private boolean isValidTransition(OrderStatus from, OrderStatus to) {
        // Implementation of valid state transitions
        return switch (from) {
            case PENDING -> to == OrderStatus.IN_PROGRESS || to == OrderStatus.CANCELLED;
            case IN_PROGRESS -> to == OrderStatus.DELIVERED || to == OrderStatus.CANCELLED;
            case DELIVERED -> to == OrderStatus.IN_REVISION || to == OrderStatus.COMPLETED;
            case IN_REVISION -> to == OrderStatus.DELIVERED || to == OrderStatus.COMPLETED;
            default -> false;
        };
    }

    public enum OrderType {
        JOB_BASED, PACKAGE_BASED
    }

    public enum OrderStatus {
        PENDING, IN_PROGRESS, DELIVERED, IN_REVISION, COMPLETED, CANCELLED, DISPUTED
    }
}
```

#### Order Embedded Values

```java
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderAmount {

    @Column(name = "amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "platform_fee", precision = 10, scale = 2)
    private BigDecimal platformFee;

    @Column(name = "freelancer_amount", precision = 10, scale = 2)
    private BigDecimal freelancerAmount;

    @Column(name = "currency", length = 3)
    private String currency = "TRY";

    public void calculateAmounts(BigDecimal feePercentage) {
        this.platformFee = amount.multiply(feePercentage).setScale(2, RoundingMode.HALF_UP);
        this.freelancerAmount = amount.subtract(platformFee);
    }
}

@Entity
@Table(name = "order_deliveries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDelivery {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ElementCollection
    @CollectionTable(name = "order_deliverables", joinColumns = @JoinColumn(name = "delivery_id"))
    private List<Deliverable> deliverables = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Deliverable {
        @Column(name = "file_name")
        private String fileName;

        @Column(name = "file_url")
        private String fileUrl;

        @Column(name = "file_type")
        private String fileType;

        @Column(name = "file_size")
        private Long fileSize;
    }
}
```

---

### Messaging Domain (Complete)

#### Conversation Entity

```java
@Entity
@Table(name = "conversations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private ConversationType type;

    @ManyToMany
    @JoinTable(
        name = "conversation_participants",
        joinColumns = @JoinColumn(name = "conversation_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> participants = new HashSet<>();

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL)
    private List<Message> messages = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_order_id")
    private Order relatedOrder;

    @Column(name = "is_archived")
    private boolean archived = false;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    public enum ConversationType {
        DIRECT, GROUP, ORDER_RELATED
    }

    public void addMessage(Message message) {
        this.messages.add(message);
        this.lastMessageAt = LocalDateTime.now();
    }

    public boolean hasParticipant(User user) {
        return participants.contains(user);
    }
}
```

#### Message Entity

```java
@Entity
@Table(name = "messages", indexes = {
    @Index(name = "idx_conversation", columnList = "conversation_id"),
    @Index(name = "idx_sender", columnList = "sender_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private MessageType type;

    @ElementCollection
    @CollectionTable(name = "message_attachments", joinColumns = @JoinColumn(name = "message_id"))
    private List<Attachment> attachments = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reply_to_id")
    private Message replyTo;

    @ElementCollection
    @CollectionTable(name = "message_read_receipts", joinColumns = @JoinColumn(name = "message_id"))
    private List<ReadReceipt> readReceipts = new ArrayList<>();

    @Column(name = "is_edited")
    private boolean edited = false;

    @Column(name = "edited_at")
    private LocalDateTime editedAt;

    @Column(name = "is_deleted")
    private boolean deleted = false;

    public enum MessageType {
        TEXT, IMAGE, FILE, SYSTEM
    }

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Attachment {
        @Column(name = "file_name")
        private String fileName;

        @Column(name = "file_url")
        private String fileUrl;

        @Column(name = "file_type")
        private String fileType;

        @Column(name = "file_size")
        private Long fileSize;
    }

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReadReceipt {
        @Column(name = "user_id")
        private UUID userId;

        @Column(name = "read_at")
        private LocalDateTime readAt;
    }

    public void markAsRead(UUID userId) {
        ReadReceipt receipt = new ReadReceipt(userId, LocalDateTime.now());
        this.readReceipts.add(receipt);
    }

    public boolean isReadBy(UUID userId) {
        return readReceipts.stream()
            .anyMatch(r -> r.getUserId().equals(userId));
    }
}
```

---

### Review Domain (Complete)

```java
@Entity
@Table(name = "reviews", indexes = {
    @Index(name = "idx_target", columnList = "target_type,target_id"),
    @Index(name = "idx_reviewer", columnList = "reviewer_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type")
    private TargetType targetType;

    @Column(name = "target_id")
    private UUID targetId;

    @Column(name = "rating", nullable = false)
    @Min(1) @Max(5)
    private Integer rating;

    @Column(length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Embedded
    private DetailedRatings detailedRatings;

    @ElementCollection
    @CollectionTable(name = "review_images", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();

    @Column(name = "helpful_count")
    private Integer helpfulCount = 0;

    @Column(columnDefinition = "TEXT")
    private String response;

    @Column(name = "response_at")
    private LocalDateTime responseAt;

    @Column(name = "is_verified_purchase")
    private boolean verifiedPurchase = true;

    public enum TargetType {
        USER, PACKAGE, JOB
    }

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetailedRatings {
        @Column(name = "quality_rating")
        private Integer qualityRating;

        @Column(name = "communication_rating")
        private Integer communicationRating;

        @Column(name = "delivery_rating")
        private Integer deliveryRating;

        @Column(name = "professionalism_rating")
        private Integer professionalismRating;
    }

    public void addResponse(String responseText) {
        this.response = responseText;
        this.responseAt = LocalDateTime.now();
    }

    public void incrementHelpfulCount() {
        this.helpfulCount++;
    }
}
```

---

**Doküman Durumu**: ✅ Tamamlandı ve Genişletildi  
**Sonraki Adım**: Test Strategy - [07-TEST-STRATEGY.md](./07-TEST-STRATEGY.md)
