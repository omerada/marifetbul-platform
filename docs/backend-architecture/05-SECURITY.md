# Güvenlik Yapılandırması - Spring Security & JWT

> **Dokümantasyon**: 05 - Security  
> **Versiyon**: 1.0.0  
> **Tarih**: Ekim 2025

---

## 🔐 Security Architecture

### Security Layers

```
1. Network Layer (HTTPS, Firewall)
2. Authentication (JWT)
3. Authorization (RBAC)
4. Data Protection (Encryption)
5. Application Security (Input validation, XSS, CSRF)
6. Monitoring & Audit
```

---

## 🎫 JWT (JSON Web Token) Configuration

### JWT Structure

```
Header.Payload.Signature
```

**Example JWT:**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiJ1dWlkIiwidXNlclR5cGUiOiJGUkVFTEFOQ0VSIiwiaWF0IjoxNjMzMDI0ODAwLCJleHAiOjE2MzM2Mjk2MDB9.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### JWT Properties (application.yml)

```yaml
app:
  jwt:
    secret: ${JWT_SECRET:your-256-bit-secret-key-change-in-production}
    expiration: 604800000 # 7 days in milliseconds
    refresh-expiration: 2592000000 # 30 days
    issuer: marifetbul-api
    audience: marifetbul-web
```

### JWT Token Provider Implementation

```java
@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private long jwtExpiration;

    @Value("${app.jwt.refresh-expiration}")
    private long refreshExpiration;

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generate access token
     */
    public String generateToken(UserPrincipal userPrincipal) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
                .setSubject(userPrincipal.getId().toString())
                .claim("email", userPrincipal.getEmail())
                .claim("userType", userPrincipal.getUserType())
                .claim("roles", userPrincipal.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toList()))
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .setIssuer("marifetbul-api")
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Generate refresh token
     */
    public String generateRefreshToken(UUID userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshExpiration);

        return Jwts.builder()
                .setSubject(userId.toString())
                .claim("type", "refresh")
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Extract user ID from token
     */
    public UUID getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return UUID.fromString(claims.getSubject());
    }

    /**
     * Validate token
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty");
        }
        return false;
    }
}
```

---

## 🔒 Spring Security Configuration

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService userDetailsService;
    private final AuthenticationEntryPoint unauthorizedHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CSRF
            .csrf(csrf -> csrf.disable())

            // CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Session management
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Exception handling
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(unauthorizedHandler))

            // Authorization rules
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/categories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/jobs/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/packages/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/users/{id}").permitAll()

                // Swagger / OpenAPI
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                // Actuator (admin only)
                .requestMatchers("/actuator/**").hasRole("ADMIN")

                // Admin endpoints
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

                // Freelancer-only endpoints
                .requestMatchers(HttpMethod.POST, "/api/v1/packages/**").hasRole("FREELANCER")
                .requestMatchers(HttpMethod.POST, "/api/v1/proposals/**").hasRole("FREELANCER")

                // Employer-only endpoints
                .requestMatchers(HttpMethod.POST, "/api/v1/jobs/**").hasRole("EMPLOYER")

                // All other endpoints require authentication
                .anyRequest().authenticated()
            );

        // Add JWT filter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Strength: 12
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "https://marifetbul.com"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

---

## 🎭 JWT Authentication Filter

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                UUID userId = tokenProvider.getUserIdFromToken(jwt);

                UserDetails userDetails = userDetailsService.loadUserById(userId);

                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                    );

                authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.debug("Set authentication for user: {}", userId);
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

---

## 👤 UserPrincipal & UserDetailsService

```java
@Getter
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private UUID id;
    private String email;
    private String password;
    private UserType userType;
    private Collection<? extends GrantedAuthority> authorities;

    public static UserPrincipal create(User user) {
        List<GrantedAuthority> authorities = Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_" + user.getUserType().name())
        );

        return new UserPrincipal(
            user.getId(),
            user.getEmail(),
            user.getPasswordHash(),
            user.getUserType(),
            authorities
        );
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                    new UsernameNotFoundException("User not found with email: " + email));

        return UserPrincipal.create(user);
    }

    public UserDetails loadUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                    new ResourceNotFoundException("User", "id", id));

        return UserPrincipal.create(user);
    }
}
```

---

## 🛡️ Role-Based Access Control (RBAC)

### Roles

```java
public enum UserType {
    FREELANCER,  // Can: create packages, send proposals
    EMPLOYER,    // Can: create jobs, hire freelancers
    ADMIN        // Can: everything
}

// Additional roles for admins
public enum AdminRole {
    SUPER_ADMIN,  // Full access
    ADMIN,        // General management
    MODERATOR,    // Content moderation
    SUPPORT       // Customer support
}
```

### Method-Level Security

```java
@RestController
@RequestMapping("/api/v1/jobs")
public class JobController {

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<JobResponse>> createJob(...) {
        // Only employers can create jobs
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteJob(...) {
        // Employers can delete their own jobs, admins can delete any
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()") // or permitAll()
    public ResponseEntity<ApiResponse<JobResponse>> getJob(...) {
        // Anyone can view jobs
    }
}

@RestController
@RequestMapping("/api/v1/proposals")
public class ProposalController {

    @PostMapping
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<ApiResponse<ProposalResponse>> createProposal(...) {
        // Only freelancers can create proposals
    }

    @PostMapping("/{id}/accept")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Void> acceptProposal(...) {
        // Only employers can accept proposals
    }
}

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    // All methods require ADMIN role
}
```

### Custom Authorization Logic

```java
@Service
public class SecurityService {

    public boolean canAccessJob(UUID jobId, Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        Job job = jobRepository.findById(jobId).orElseThrow();

        // Owner or admin can access
        return job.getEmployer().getId().equals(principal.getId())
            || principal.getUserType() == UserType.ADMIN;
    }

    public boolean canEditOrder(UUID orderId, Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        Order order = orderRepository.findById(orderId).orElseThrow();

        // Employer, freelancer, or admin
        return order.getEmployerId().equals(principal.getId())
            || order.getFreelancerId().equals(principal.getId())
            || principal.getUserType() == UserType.ADMIN;
    }
}

// Usage in controller
@DeleteMapping("/{id}")
@PreAuthorize("@securityService.canAccessJob(#id, authentication)")
public ResponseEntity<Void> deleteJob(@PathVariable UUID id) {
    // Custom authorization logic
}
```

---

## 🔐 Password Security

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character

### Password Validation

```java
@Pattern(
    regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
    message = "Password must be at least 8 characters and include uppercase, lowercase, digit, and special character"
)
private String password;
```

### Password Hashing

```java
@Service
@RequiredArgsConstructor
public class AuthService {

    private final PasswordEncoder passwordEncoder;

    public void registerUser(RegisterRequest request) {
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        // BCrypt with strength 12
        // Result: $2a$12$... (60 characters)
    }

    public boolean authenticateUser(String rawPassword, String hashedPassword) {
        return passwordEncoder.matches(rawPassword, hashedPassword);
    }
}
```

---

## 🛡️ Data Protection

### Sensitive Data Encryption

```java
@Component
public class EncryptionService {

    @Value("${app.encryption.key}")
    private String encryptionKey;

    public String encrypt(String data) {
        // AES-256 encryption
        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            SecretKeySpec keySpec = new SecretKeySpec(
                encryptionKey.getBytes(), "AES"
            );
            cipher.init(Cipher.ENCRYPT_MODE, keySpec);
            byte[] encrypted = cipher.doFinal(data.getBytes());
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    public String decrypt(String encryptedData) {
        // Decryption logic
    }
}

// Usage in entity
@Entity
public class Payment {

    @Column(name = "card_number")
    @Convert(converter = EncryptedStringConverter.class)
    private String cardNumber; // Encrypted in database

    @Column(name = "cvv")
    @Convert(converter = EncryptedStringConverter.class)
    private String cvv; // Encrypted
}
```

---

## 🚫 Security Best Practices

### 1. Input Validation

```java
@RestController
@Validated
public class JobController {

    @PostMapping
    public ResponseEntity<ApiResponse<JobResponse>> createJob(
            @Valid @RequestBody CreateJobRequest request) {
        // @Valid triggers validation
    }
}

public class CreateJobRequest {
    @NotBlank
    @Size(max = 100)
    private String title;

    @NotBlank
    @Size(max = 5000)
    private String description;

    @Email
    private String contactEmail;
}
```

### 2. SQL Injection Prevention

```java
// ✅ GOOD: Using JPA/Hibernate
@Query("SELECT j FROM Job j WHERE j.title LIKE %:keyword%")
List<Job> searchJobs(@Param("keyword") String keyword);

// ✅ GOOD: Named parameters
@Query(value = "SELECT * FROM jobs WHERE title LIKE :keyword", nativeQuery = true)
List<Job> searchJobsNative(@Param("keyword") String keyword);

// ❌ BAD: String concatenation
@Query(value = "SELECT * FROM jobs WHERE title LIKE '" + keyword + "'", nativeQuery = true)
List<Job> searchJobsBad(String keyword); // SQL injection vulnerable!
```

### 3. XSS Prevention

```java
// Input sanitization
@Component
public class HtmlSanitizer {

    public String sanitize(String input) {
        return Jsoup.clean(input, Safelist.basic());
    }
}

// Usage
String sanitizedDescription = htmlSanitizer.sanitize(request.getDescription());
```

### 4. Rate Limiting

```java
@Configuration
public class RateLimitConfig {

    @Bean
    public RateLimiter rateLimiter() {
        return RateLimiter.create(100.0); // 100 requests per second
    }
}

@Component
@Aspect
public class RateLimitAspect {

    @Autowired
    private RateLimiter rateLimiter;

    @Around("@annotation(RateLimited)")
    public Object rateLimit(ProceedingJoinPoint joinPoint) throws Throwable {
        if (!rateLimiter.tryAcquire()) {
            throw new TooManyRequestsException("Rate limit exceeded");
        }
        return joinPoint.proceed();
    }
}
```

### 5. Audit Logging

```java
@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue
    private UUID id;

    private UUID userId;
    private String action; // LOGIN, CREATE_JOB, DELETE_ORDER, etc.
    private String resourceType;
    private UUID resourceId;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime timestamp;
    private String details; // JSON
}

@Service
public class AuditService {

    @Async
    public void log(String action, UUID resourceId, String resourceType) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setResourceId(resourceId);
        log.setResourceType(resourceType);
        log.setUserId(getCurrentUserId());
        log.setIpAddress(getClientIP());
        log.setTimestamp(LocalDateTime.now());

        auditLogRepository.save(log);
    }
}
```

---

## 🔍 Security Headers

```java
@Configuration
public class SecurityHeadersConfig {

    @Bean
    public FilterRegistrationBean<SecurityHeadersFilter> securityHeadersFilter() {
        FilterRegistrationBean<SecurityHeadersFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new SecurityHeadersFilter());
        registrationBean.addUrlPatterns("/api/*");
        return registrationBean;
    }
}

public class SecurityHeadersFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Security headers
        httpResponse.setHeader("X-Content-Type-Options", "nosniff");
        httpResponse.setHeader("X-Frame-Options", "DENY");
        httpResponse.setHeader("X-XSS-Protection", "1; mode=block");
        httpResponse.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        httpResponse.setHeader("Content-Security-Policy", "default-src 'self'");
        httpResponse.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        chain.doFilter(request, response);
    }
}
```

---

**Doküman Durumu**: ✅ Tamamlandı  
**Sonraki Adım**: Domain Models - [06-DOMAIN-MODELS.md](./06-DOMAIN-MODELS.md)
