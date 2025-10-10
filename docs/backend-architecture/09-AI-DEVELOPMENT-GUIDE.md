# AI Development Guide - Coding Standards for AI Agents

> **Dokümantasyon**: 09 - AI Agent Development Standards  
> **Versiyon**: 1.0.0  
> **Amaç**: AI ajanlarının backend'i bağımsız olarak geliştirebilmesi için standartlar

---

## 🤖 AI Agent Development Principles

### Core Philosophy

```
1. READABILITY FIRST: Kod okunabilir olmalı, her AI ajanı anlayabilmeli
2. CONSISTENCY: Tüm modüller aynı pattern'leri kullanmalı
3. DOCUMENTATION: Her sınıf, method ve karmaşık logic dokümante edilmeli
4. TESTABILITY: Her kod parçası test edilebilir olmalı
5. MODULARITY: Loosely coupled, highly cohesive modüller
```

---

## 📁 File & Package Structure

### Package Naming Convention

```
com.marifetbul.api
├── domain
│   ├── user           (Domain: User, Freelancer, Employer)
│   │   ├── entity
│   │   ├── dto
│   │   ├── repository
│   │   ├── service
│   │   └── controller
│   ├── job            (Domain: Job postings)
│   ├── package        (Domain: Service packages)
│   ├── order          (Domain: Orders & contracts)
│   └── [domain-name]  (Her domain aynı yapıya sahip)
├── shared
│   ├── config         (Spring configurations)
│   ├── security       (Security components)
│   ├── exception      (Custom exceptions)
│   ├── util           (Utility classes)
│   └── dto            (Shared DTOs)
└── infrastructure     (External services)
```

### File Naming Rules

```
Entity:          User.java, Job.java
DTO Request:     CreateUserRequest.java, UpdateJobRequest.java
DTO Response:    UserResponse.java, JobDetailResponse.java
Repository:      UserRepository.java
Service:         UserService.java
Controller:      UserController.java
Mapper:          UserMapper.java
Exception:       UserNotFoundException.java
Test:            UserServiceTest.java, UserControllerTest.java
```

---

## 🏗️ Code Organization Template

### 1. Entity Class Structure

```java
package com.marifetbul.api.domain.user.entity;

import com.marifetbul.api.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * User entity representing system users
 *
 * @author AI Agent
 * @since 1.0.0
 */
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_email", columnList = "email"),
    @Index(name = "idx_username", columnList = "username")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    // SECTION 1: Basic Fields
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    // SECTION 2: Relationships
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Freelancer freelancer;

    // SECTION 3: Enums & Status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    // SECTION 4: Business Methods
    public boolean isFreelancer() {
        return role == UserRole.FREELANCER;
    }

    public void activate() {
        this.status = Status.ACTIVE;
    }
}
```

### 2. DTO Structure

```java
package com.marifetbul.api.domain.user.dto;

import jakarta.validation.constraints.*;
import lombok.*;

/**
 * Request DTO for user registration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3-50 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
             message = "Password must contain uppercase, lowercase, and digit")
    private String password;

    @NotNull(message = "Role is required")
    private UserRole role;
}
```

### 3. Service Layer Structure

```java
package com.marifetbul.api.domain.user.service;

import com.marifetbul.api.domain.user.entity.User;
import com.marifetbul.api.domain.user.dto.*;
import com.marifetbul.api.domain.user.repository.UserRepository;
import com.marifetbul.api.domain.user.mapper.UserMapper;
import com.marifetbul.api.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service layer for User domain
 * Handles business logic and orchestration
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    /**
     * Create a new user
     *
     * @param request CreateUserRequest with user data
     * @return UserResponse with created user data
     * @throws DuplicateResourceException if email/username exists
     */
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        log.info("Creating user with email: {}", request.getEmail());

        // 1. Validation
        validateUniqueEmail(request.getEmail());
        validateUniqueUsername(request.getUsername());

        // 2. Business Logic
        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.activate();

        // 3. Persistence
        User savedUser = userRepository.save(user);

        // 4. Return Response
        log.info("User created successfully with ID: {}", savedUser.getId());
        return userMapper.toResponse(savedUser);
    }

    /**
     * Find user by ID
     *
     * @param id User ID
     * @return UserResponse
     * @throws ResourceNotFoundException if user not found
     */
    public UserResponse getUserById(Long id) {
        User user = findUserByIdOrThrow(id);
        return userMapper.toResponse(user);
    }

    // PRIVATE HELPER METHODS
    private User findUserByIdOrThrow(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    private void validateUniqueEmail(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email already exists: " + email);
        }
    }
}
```

### 4. Controller Structure

```java
package com.marifetbul.api.domain.user.controller;

import com.marifetbul.api.domain.user.dto.*;
import com.marifetbul.api.domain.user.service.UserService;
import com.marifetbul.api.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST API endpoints for User management
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "User CRUD operations")
public class UserController {

    private final UserService userService;

    /**
     * Create a new user
     */
    @PostMapping
    @Operation(summary = "Create user", description = "Register a new user")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody CreateUserRequest request) {

        UserResponse user = userService.createUser(request);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success(user, "User created successfully"));
    }

    /**
     * Get user by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @Operation(summary = "Get user", description = "Retrieve user by ID")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}
```

---

## 📋 Coding Standards

### 1. Javadoc Requirements

```java
/**
 * Brief description of class/method purpose
 *
 * Longer explanation if needed (optional)
 *
 * @param paramName Description of parameter
 * @return Description of return value
 * @throws ExceptionType When this exception is thrown
 * @author AI Agent
 * @since 1.0.0
 */
```

### 2. Method Naming

```java
// GOOD ✅
public UserResponse getUserById(Long id)
public List<JobResponse> findActiveJobs()
public void validateUserEmail(String email)
public boolean isUserActive(Long userId)

// BAD ❌
public UserResponse get(Long id)           // Too generic
public List<JobResponse> getJobs()         // Unclear what kind of jobs
public void validate(String email)         // Validate what?
```

### 3. Variable Naming

```java
// GOOD ✅
Long userId
String userEmail
List<JobResponse> activeJobs
BigDecimal totalAmount

// BAD ❌
Long id              // Too generic in service/controller context
String email         // Ambiguous - whose email?
List<JobResponse> list   // Non-descriptive
BigDecimal amount    // What amount?
```

### 4. Exception Handling

```java
// ALWAYS throw specific exceptions with clear messages
throw new ResourceNotFoundException(
    String.format("User not found with id: %d", userId)
);

throw new InvalidOperationException(
    "Cannot delete user with active orders"
);

// NEVER throw generic exceptions
throw new Exception("Error");  // ❌
throw new RuntimeException();   // ❌
```

### 5. Logging Standards

```java
// INFO: Business operations
log.info("Creating order for user: {} with amount: {}", userId, amount);
log.info("Payment processed successfully: {}", paymentId);

// DEBUG: Technical details
log.debug("Executing query with filters: {}", filters);

// WARN: Recoverable issues
log.warn("User {} attempted to access restricted resource", userId);

// ERROR: Exceptions
log.error("Failed to process payment for order: {}", orderId, exception);
```

---

## 🧪 Testing Requirements

### 1. Unit Test Template

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private CreateUserRequest testRequest;

    @BeforeEach
    void setUp() {
        // Arrange: Setup test data
        testUser = User.builder()
            .id(1L)
            .email("test@example.com")
            .username("testuser")
            .build();

        testRequest = CreateUserRequest.builder()
            .email("test@example.com")
            .username("testuser")
            .password("Password123")
            .build();
    }

    @Test
    @DisplayName("Should create user successfully")
    void shouldCreateUserSuccessfully() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userMapper.toEntity(any())).thenReturn(testUser);
        when(userRepository.save(any())).thenReturn(testUser);

        // Act
        UserResponse result = userService.createUser(testRequest);

        // Assert
        assertNotNull(result);
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when email exists")
    void shouldThrowExceptionWhenEmailExists() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // Act & Assert
        assertThrows(DuplicateResourceException.class,
            () -> userService.createUser(testRequest));
    }
}
```

### 2. Test Coverage Requirements

```
- Unit Tests: 80%+ coverage
- Integration Tests: Critical paths
- E2E Tests: Main user workflows
- Test ALL:
  ✓ Success scenarios
  ✓ Validation errors
  ✓ Business rule violations
  ✓ Not found scenarios
  ✓ Permission checks
```

---

## 🔐 Security Best Practices

### 1. Input Validation

```java
// ALWAYS validate input at controller level
@Valid @RequestBody CreateUserRequest request

// ALWAYS validate in service for internal calls
if (userId == null || userId <= 0) {
    throw new InvalidRequestException("Invalid user ID");
}
```

### 2. Authorization Checks

```java
// Controller level
@PreAuthorize("hasRole('ADMIN')")

// Service level (when dynamic)
if (!authService.canAccessResource(userId, resourceId)) {
    throw new ForbiddenException("Access denied to this resource");
}
```

### 3. Sensitive Data

```java
// NEVER log sensitive data
log.info("User logged in: {}", user.getEmail());  // ✅
log.info("Password: {}", password);  // ❌ NEVER!

// NEVER return sensitive data
public UserResponse toResponse(User user) {
    return UserResponse.builder()
        .id(user.getId())
        .email(user.getEmail())
        // .password(user.getPassword())  ❌ NEVER!
        .build();
}
```

---

## 🔄 Git Workflow for AI Agents

### Commit Message Format

```
type(domain): brief description

Detailed explanation if needed

Types:
- feat: New feature
- fix: Bug fix
- refactor: Code restructuring
- test: Adding tests
- docs: Documentation
- chore: Maintenance

Examples:
feat(user): implement user registration
fix(job): resolve duplicate job posting issue
test(order): add unit tests for order service
```

### Branch Naming

```
feature/user-registration
fix/payment-validation-bug
refactor/job-service-optimization
test/order-integration-tests
```

---

## 📊 Development Workflow

### Step-by-Step for Each Feature

```
1. CREATE ENTITY
   - Define database table structure
   - Add JPA annotations
   - Implement business methods

2. CREATE DTOs
   - CreateRequest (with validation)
   - UpdateRequest (with validation)
   - Response
   - DetailResponse (if needed)

3. CREATE REPOSITORY
   - Extend JpaRepository
   - Add custom query methods
   - Add JPA Specifications for complex queries

4. CREATE MAPPER
   - MapStruct interface
   - Entity ↔ DTO conversions

5. CREATE SERVICE
   - Implement business logic
   - Add transaction management
   - Add logging
   - Handle exceptions

6. CREATE CONTROLLER
   - Define REST endpoints
   - Add validation
   - Add authorization
   - Add Swagger documentation

7. WRITE TESTS
   - Unit tests for service
   - Integration tests for repository
   - E2E tests for controller

8. UPDATE DOCUMENTATION
   - Update API documentation
   - Add to CHANGELOG.md
```

---

## ✅ Code Review Checklist (AI Self-Check)

Before considering a feature complete, AI agents should verify:

- [ ] Code follows naming conventions
- [ ] All public methods have Javadoc
- [ ] Input validation is present
- [ ] Exceptions are specific and meaningful
- [ ] Logging is appropriate (INFO/DEBUG/ERROR)
- [ ] No sensitive data in logs/responses
- [ ] Authorization checks are present
- [ ] Transaction management is correct
- [ ] Tests are written and passing
- [ ] No hardcoded values (use configuration)
- [ ] DTOs are used (not entities in responses)
- [ ] Mapper is implemented
- [ ] Swagger annotations are present
- [ ] Follows single responsibility principle
- [ ] No code duplication

---

## 🚨 Common Pitfalls to Avoid

```
❌ Returning entities from controllers → ✅ Return DTOs
❌ Direct field access → ✅ Use getters/setters
❌ No transaction management → ✅ @Transactional on write operations
❌ Generic exceptions → ✅ Specific custom exceptions
❌ Missing validation → ✅ @Valid on DTOs
❌ No logging → ✅ Log business operations
❌ Hardcoded values → ✅ Use application.yml
❌ Missing authorization → ✅ @PreAuthorize annotations
❌ No tests → ✅ Write tests for each layer
❌ Exposing sensitive data → ✅ Filter in DTOs
```

---

**Doküman Durumu**: ✅ Tamamlandı  
**Sonraki Adım**: Development Roadmap - [10-ROADMAP.md](./10-ROADMAP.md)
