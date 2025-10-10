# Test Stratejisi - Unit, Integration & E2E Tests

> **Dokümantasyon**: 07 - Test Strategy  
> **Versiyon**: 1.0.0  
> **Tarih**: Ekim 2025

---

## 🎯 Test Pyramid

```
       /\          E2E Tests (10%)
      /__\         - Critical user journeys
     /____\        - UI + API + DB
    /      \
   /________\      Integration Tests (30%)
  /__________\     - API endpoints
 /____________\    - Database interactions
/              \
\______________/   Unit Tests (60%)
                   - Business logic
                   - Services, mappers, validators
```

### Coverage Goals

- **Unit Tests**: 80%+
- **Integration Tests**: 60%+
- **E2E Tests**: Critical paths

---

## 🧪 Unit Tests

### Dependencies

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-core</artifactId>
    <scope>test</scope>
</dependency>
```

### Service Layer Tests

```java
@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private JobService jobService;

    @Test
    @DisplayName("Should create job when valid request and employer")
    void createJob_ValidRequest_ShouldCreateJob() {
        // Given
        UUID employerId = UUID.randomUUID();
        CreateJobRequest request = CreateJobRequest.builder()
                .title("Test Job")
                .description("Test Description")
                .categoryId(UUID.randomUUID())
                .build();

        User employer = new User();
        employer.setId(employerId);
        employer.setUserType(UserType.EMPLOYER);

        Category category = new Category();
        category.setId(request.getCategoryId());

        when(userRepository.findById(employerId)).thenReturn(Optional.of(employer));
        when(categoryRepository.findById(request.getCategoryId())).thenReturn(Optional.of(category));
        when(jobRepository.save(any(Job.class))).thenAnswer(i -> i.getArgument(0));

        // When
        Job result = jobService.createJob(request, employerId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Test Job");
        assertThat(result.getStatus()).isEqualTo(JobStatus.OPEN);

        verify(jobRepository).save(any(Job.class));
        verify(eventPublisher).publishEvent(any(JobCreatedEvent.class));
    }

    @Test
    @DisplayName("Should throw exception when non-employer tries to create job")
    void createJob_NonEmployer_ShouldThrowException() {
        // Given
        UUID freelancerId = UUID.randomUUID();
        CreateJobRequest request = new CreateJobRequest();

        User freelancer = new User();
        freelancer.setUserType(UserType.FREELANCER);

        when(userRepository.findById(freelancerId)).thenReturn(Optional.of(freelancer));

        // When & Then
        assertThatThrownBy(() -> jobService.createJob(request, freelancerId))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Only employers can create jobs");

        verify(jobRepository, never()).save(any());
    }
}
```

### Mapper Tests

```java
@ExtendWith(MockitoExtension.class)
class JobMapperTest {

    private JobMapper jobMapper = Mappers.getMapper(JobMapper.class);

    @Test
    void toResponse_ShouldMapCorrectly() {
        // Given
        Job job = Job.builder()
                .id(UUID.randomUUID())
                .title("Test Job")
                .status(JobStatus.OPEN)
                .build();

        // When
        JobResponse response = jobMapper.toResponse(job);

        // Then
        assertThat(response.getId()).isEqualTo(job.getId());
        assertThat(response.getTitle()).isEqualTo(job.getTitle());
        assertThat(response.getStatus()).isEqualTo(job.getStatus());
    }
}
```

---

## 🔗 Integration Tests

### Dependencies

```xml
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>testcontainers</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <scope>test</scope>
</dependency>
```

### Base Test Configuration

```java
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@ActiveProfiles("test")
public abstract class IntegrationTestBase {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void setProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;
}
```

### Controller Integration Tests

```java
class JobControllerIntegrationTest extends IntegrationTestBase {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        jobRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @WithMockUser(authorities = "ROLE_EMPLOYER")
    void createJob_ValidRequest_ShouldReturn201() throws Exception {
        // Given
        CreateJobRequest request = CreateJobRequest.builder()
                .title("Integration Test Job")
                .description("Test Description")
                .categoryId(UUID.randomUUID())
                .budget(new BudgetRequest(BudgetType.FIXED, BigDecimal.valueOf(5000)))
                .build();

        String requestJson = objectMapper.writeValueAsString(request);

        // When & Then
        mockMvc.perform(post("/api/v1/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Integration Test Job"))
                .andExpect(jsonPath("$.data.status").value("OPEN"));

        // Verify database
        List<Job> jobs = jobRepository.findAll();
        assertThat(jobs).hasSize(1);
        assertThat(jobs.get(0).getTitle()).isEqualTo("Integration Test Job");
    }

    @Test
    void getJobs_ShouldReturnPagedResults() throws Exception {
        // Given - Create test data
        createTestJobs(15);

        // When & Then
        mockMvc.perform(get("/api/v1/jobs")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(10))
                .andExpect(jsonPath("$.pagination.total").value(15))
                .andExpect(jsonPath("$.pagination.totalPages").value(2));
    }

    private void createTestJobs(int count) {
        for (int i = 0; i < count; i++) {
            Job job = Job.builder()
                    .title("Test Job " + i)
                    .description("Description " + i)
                    .status(JobStatus.OPEN)
                    .build();
            jobRepository.save(job);
        }
    }
}
```

### Repository Tests

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class JobRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine");

    @Autowired
    private JobRepository jobRepository;

    @Test
    void findByStatus_ShouldReturnMatchingJobs() {
        // Given
        Job openJob1 = Job.builder().status(JobStatus.OPEN).build();
        Job openJob2 = Job.builder().status(JobStatus.OPEN).build();
        Job closedJob = Job.builder().status(JobStatus.CLOSED).build();

        jobRepository.saveAll(List.of(openJob1, openJob2, closedJob));

        // When
        List<Job> result = jobRepository.findByStatus(JobStatus.OPEN, Pageable.unpaged()).getContent();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).allMatch(job -> job.getStatus() == JobStatus.OPEN);
    }
}
```

---

## 🌐 E2E Tests

### REST Assured Configuration

```xml
<dependency>
    <groupId>io.rest-assured</groupId>
    <artifactId>rest-assured</artifactId>
    <scope>test</scope>
</dependency>
```

### E2E Test Example

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class JobE2ETest {

    @LocalServerPort
    private int port;

    private String baseUrl;

    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port + "/api/v1";
        RestAssured.port = port;
    }

    @Test
    void completeJobWorkflow_ShouldSucceed() {
        // 1. Register employer
        RegisterRequest employerRequest = new RegisterRequest(
                "employer@test.com", "password", "John", "Doe", UserType.EMPLOYER);

        String employerToken = given()
                .contentType(ContentType.JSON)
                .body(employerRequest)
                .when()
                .post(baseUrl + "/auth/register")
                .then()
                .statusCode(201)
                .extract()
                .path("data.token");

        // 2. Create job
        CreateJobRequest jobRequest = CreateJobRequest.builder()
                .title("E2E Test Job")
                .description("Test Description")
                .build();

        String jobId = given()
                .header("Authorization", "Bearer " + employerToken)
                .contentType(ContentType.JSON)
                .body(jobRequest)
                .when()
                .post(baseUrl + "/jobs")
                .then()
                .statusCode(201)
                .extract()
                .path("data.id");

        // 3. Get job details
        given()
                .when()
                .get(baseUrl + "/jobs/" + jobId)
                .then()
                .statusCode(200)
                .body("success", equalTo(true))
                .body("data.title", equalTo("E2E Test Job"));

        // 4. Register freelancer
        RegisterRequest freelancerRequest = new RegisterRequest(
                "freelancer@test.com", "password", "Jane", "Smith", UserType.FREELANCER);

        String freelancerToken = given()
                .contentType(ContentType.JSON)
                .body(freelancerRequest)
                .when()
                .post(baseUrl + "/auth/register")
                .then()
                .statusCode(201)
                .extract()
                .path("data.token");

        // 5. Submit proposal
        CreateProposalRequest proposalRequest = CreateProposalRequest.builder()
                .jobId(UUID.fromString(jobId))
                .coverLetter("I'm interested")
                .proposedRate(BigDecimal.valueOf(4000))
                .deliveryTime(20)
                .build();

        given()
                .header("Authorization", "Bearer " + freelancerToken)
                .contentType(ContentType.JSON)
                .body(proposalRequest)
                .when()
                .post(baseUrl + "/proposals")
                .then()
                .statusCode(201);

        // 6. Verify job has proposals
        given()
                .when()
                .get(baseUrl + "/jobs/" + jobId)
                .then()
                .statusCode(200)
                .body("data.proposalsCount", equalTo(1));
    }
}
```

---

## 🛠️ Test Utilities

### Test Data Builders

```java
public class TestDataBuilder {

    public static User createTestEmployer() {
        return User.builder()
                .id(UUID.randomUUID())
                .email("employer@test.com")
                .firstName("John")
                .lastName("Doe")
                .userType(UserType.EMPLOYER)
                .build();
    }

    public static Job createTestJob(User employer) {
        return Job.builder()
                .id(UUID.randomUUID())
                .title("Test Job")
                .description("Test Description")
                .employer(employer)
                .status(JobStatus.OPEN)
                .build();
    }
}
```

### Custom Annotations

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@WithMockUser(authorities = "ROLE_EMPLOYER")
public @interface WithMockEmployer {
}

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@WithMockUser(authorities = "ROLE_FREELANCER")
public @interface WithMockFreelancer {
}

// Usage
@Test
@WithMockEmployer
void createJob_ShouldSucceed() {
    // Test logic
}
```

---

## 📊 Test Execution

### Run All Tests

```bash
mvn test
```

### Run Specific Test Class

```bash
mvn test -Dtest=JobServiceTest
```

### Run Integration Tests Only

```bash
mvn test -Dtest=*IntegrationTest
```

### With Coverage Report

```bash
mvn test jacoco:report
```

---

## ✅ Best Practices

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **One assertion per test** (when possible)
3. **Clear test names**: `methodName_scenario_expectedResult`
4. **Use @DisplayName** for readability
5. **Clean up test data** in @BeforeEach/@AfterEach
6. **Mock external dependencies**
7. **Test edge cases and error scenarios**
8. **Keep tests independent**
9. **Use test containers for realistic integration tests**
10. **Maintain test coverage above 80%**

---

**Doküman Durumu**: ✅ Tamamlandı  
**Sonraki Adım**: DevOps - [08-DEVOPS.md](./08-DEVOPS.md)
