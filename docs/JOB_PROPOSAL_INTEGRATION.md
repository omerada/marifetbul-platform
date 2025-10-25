# Job Proposal Integration Backend Guide

## Day 9: Job List Integration - Backend Requirements

This document outlines the backend API endpoints and implementation details required to support the employer job list integration with proposal data.

---

## Overview

The frontend now displays proposal summaries on job cards in the employer dashboard, allowing employers to quickly see:

- Total proposal count per job
- Unread/new proposals
- Pending proposals
- Accepted proposals
- Proposal budget range (min/max)

This requires a new backend endpoint to aggregate proposal data per job.

---

## Required API Endpoint

### 1. Get Job Proposal Summaries

**Endpoint:** `GET /api/v1/jobs/proposals/summary`

**Purpose:** Get aggregated proposal statistics for multiple jobs at once.

**Authentication:** Required (employer only)

**Query Parameters:**

```
jobIds (optional): Comma-separated list of job IDs
  - If provided: Returns summaries for specific jobs
  - If omitted: Returns summaries for all employer's jobs

Example: /api/v1/jobs/proposals/summary?jobIds=job-1,job-2,job-3
```

**Response Format:**

```json
{
  "success": true,
  "data": [
    {
      "jobId": "job-uuid-1",
      "totalCount": 15,
      "unreadCount": 5,
      "pendingCount": 10,
      "acceptedCount": 2,
      "rejectedCount": 3,
      "lastProposalDate": "2024-01-15T14:30:00Z",
      "averageProposedBudget": 2500.0,
      "lowestProposedBudget": 1500.0,
      "highestProposedBudget": 4000.0
    },
    {
      "jobId": "job-uuid-2",
      "totalCount": 8,
      "unreadCount": 2,
      "pendingCount": 6,
      "acceptedCount": 1,
      "rejectedCount": 1,
      "lastProposalDate": "2024-01-14T10:15:00Z",
      "averageProposedBudget": 1800.0,
      "lowestProposedBudget": 1200.0,
      "highestProposedBudget": 2500.0
    }
  ],
  "timestamp": "2024-01-15T15:00:00Z"
}
```

**Field Descriptions:**

- `jobId`: The job's unique identifier
- `totalCount`: Total number of proposals for this job
- `unreadCount`: Number of proposals employer hasn't viewed yet
- `pendingCount`: Number of proposals awaiting decision (status = PENDING)
- `acceptedCount`: Number of accepted proposals (status = ACCEPTED)
- `rejectedCount`: Number of rejected proposals (status = REJECTED)
- `lastProposalDate`: Timestamp of most recent proposal submission
- `averageProposedBudget`: Average of all proposal amounts
- `lowestProposedBudget`: Minimum proposal amount
- `highestProposedBudget`: Maximum proposal amount

**Error Responses:**

```json
// Unauthorized
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}

// Forbidden (not an employer)
{
  "success": false,
  "error": "FORBIDDEN",
  "message": "Only employers can access this endpoint"
}

// Invalid job IDs
{
  "success": false,
  "error": "INVALID_REQUEST",
  "message": "One or more job IDs are invalid"
}
```

---

## Backend Implementation Guide

### Java Spring Boot Example

```java
@RestController
@RequestMapping("/api/v1/jobs/proposals")
public class JobProposalSummaryController {

    @Autowired
    private ProposalService proposalService;

    @Autowired
    private JobService jobService;

    @Autowired
    private AuthService authService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<List<JobProposalSummaryDto>>> getProposalSummaries(
            @RequestParam(required = false) String jobIds,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Verify user is employer
        User user = authService.getCurrentUser(userDetails);
        if (user.getRole() != UserRole.EMPLOYER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("FORBIDDEN", "Only employers can access this endpoint"));
        }

        List<String> jobIdList;

        if (jobIds != null && !jobIds.isEmpty()) {
            // Parse comma-separated job IDs
            jobIdList = Arrays.asList(jobIds.split(","));

            // Verify all jobs belong to this employer
            List<Job> jobs = jobService.getJobsByIds(jobIdList);
            boolean allOwned = jobs.stream()
                .allMatch(job -> job.getEmployerId().equals(user.getId()));

            if (!allOwned) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("FORBIDDEN", "Cannot access other employers' jobs"));
            }
        } else {
            // Get all jobs for this employer
            List<Job> employerJobs = jobService.getJobsByEmployerId(user.getId());
            jobIdList = employerJobs.stream()
                .map(Job::getId)
                .collect(Collectors.toList());
        }

        // Get proposal summaries
        List<JobProposalSummaryDto> summaries = proposalService.getProposalSummariesByJobIds(jobIdList);

        return ResponseEntity.ok(ApiResponse.success(summaries));
    }
}
```

### Service Layer Implementation

```java
@Service
public class ProposalService {

    @Autowired
    private ProposalRepository proposalRepository;

    public List<JobProposalSummaryDto> getProposalSummariesByJobIds(List<String> jobIds) {
        return jobIds.stream()
            .map(this::getProposalSummaryForJob)
            .collect(Collectors.toList());
    }

    private JobProposalSummaryDto getProposalSummaryForJob(String jobId) {
        List<Proposal> proposals = proposalRepository.findByJobId(jobId);

        JobProposalSummaryDto summary = new JobProposalSummaryDto();
        summary.setJobId(jobId);
        summary.setTotalCount(proposals.size());

        // Count by status
        long unreadCount = proposals.stream()
            .filter(p -> !p.isViewedByEmployer())
            .count();
        long pendingCount = proposals.stream()
            .filter(p -> p.getStatus() == ProposalStatus.PENDING)
            .count();
        long acceptedCount = proposals.stream()
            .filter(p -> p.getStatus() == ProposalStatus.ACCEPTED)
            .count();
        long rejectedCount = proposals.stream()
            .filter(p -> p.getStatus() == ProposalStatus.REJECTED)
            .count();

        summary.setUnreadCount((int) unreadCount);
        summary.setPendingCount((int) pendingCount);
        summary.setAcceptedCount((int) acceptedCount);
        summary.setRejectedCount((int) rejectedCount);

        // Get last proposal date
        proposals.stream()
            .map(Proposal::getCreatedAt)
            .max(Comparator.naturalOrder())
            .ifPresent(summary::setLastProposalDate);

        // Calculate budget statistics
        if (!proposals.isEmpty()) {
            DoubleSummaryStatistics budgetStats = proposals.stream()
                .mapToDouble(Proposal::getProposedBudget)
                .summaryStatistics();

            summary.setAverageProposedBudget(budgetStats.getAverage());
            summary.setLowestProposedBudget(budgetStats.getMin());
            summary.setHighestProposedBudget(budgetStats.getMax());
        }

        return summary;
    }
}
```

### DTO Definition

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobProposalSummaryDto {
    private String jobId;
    private Integer totalCount;
    private Integer unreadCount;
    private Integer pendingCount;
    private Integer acceptedCount;
    private Integer rejectedCount;
    private LocalDateTime lastProposalDate;
    private Double averageProposedBudget;
    private Double lowestProposedBudget;
    private Double highestProposedBudget;
}
```

---

## Database Query Optimization

### Recommended Approach: Single Query with Aggregations

Instead of querying each job separately, use a single SQL query with GROUP BY:

```sql
SELECT
    p.job_id,
    COUNT(*) as total_count,
    SUM(CASE WHEN p.viewed_by_employer = false THEN 1 ELSE 0 END) as unread_count,
    SUM(CASE WHEN p.status = 'PENDING' THEN 1 ELSE 0 END) as pending_count,
    SUM(CASE WHEN p.status = 'ACCEPTED' THEN 1 ELSE 0 END) as accepted_count,
    SUM(CASE WHEN p.status = 'REJECTED' THEN 1 ELSE 0 END) as rejected_count,
    MAX(p.created_at) as last_proposal_date,
    AVG(p.proposed_budget) as average_proposed_budget,
    MIN(p.proposed_budget) as lowest_proposed_budget,
    MAX(p.proposed_budget) as highest_proposed_budget
FROM proposals p
INNER JOIN jobs j ON p.job_id = j.id
WHERE j.employer_id = :employerId
  AND p.job_id IN (:jobIds)
GROUP BY p.job_id
```

### JPA Repository Method

```java
public interface ProposalRepository extends JpaRepository<Proposal, String> {

    @Query("""
        SELECT new com.marifeto.dto.JobProposalSummaryDto(
            p.jobId,
            CAST(COUNT(p) AS int),
            CAST(SUM(CASE WHEN p.viewedByEmployer = false THEN 1 ELSE 0 END) AS int),
            CAST(SUM(CASE WHEN p.status = 'PENDING' THEN 1 ELSE 0 END) AS int),
            CAST(SUM(CASE WHEN p.status = 'ACCEPTED' THEN 1 ELSE 0 END) AS int),
            CAST(SUM(CASE WHEN p.status = 'REJECTED' THEN 1 ELSE 0 END) AS int),
            MAX(p.createdAt),
            AVG(p.proposedBudget),
            MIN(p.proposedBudget),
            MAX(p.proposedBudget)
        )
        FROM Proposal p
        WHERE p.jobId IN :jobIds
        GROUP BY p.jobId
    """)
    List<JobProposalSummaryDto> getProposalSummariesByJobIds(@Param("jobIds") List<String> jobIds);
}
```

---

## Performance Considerations

### 1. Caching Strategy

Since this data is polled every 60 seconds, consider caching:

```java
@Cacheable(value = "proposalSummaries", key = "#employerId")
@CacheEvict(value = "proposalSummaries", key = "#employerId", condition = "#result.size() > 0")
public List<JobProposalSummaryDto> getProposalSummariesForEmployer(String employerId) {
    // Implementation
}
```

**Cache Invalidation Events:**

- When a new proposal is submitted
- When employer views a proposal
- When proposal status changes

### 2. Pagination

For employers with many jobs (>100), consider pagination:

```
GET /api/v1/jobs/proposals/summary?page=1&limit=50&jobIds=...
```

### 3. Rate Limiting

Since frontend polls every 60 seconds:

- Implement rate limiting: Max 120 requests/hour per employer
- Return cached results if called within 30 seconds of last request

---

## Security Checklist

- [x] Verify user is authenticated
- [x] Verify user has EMPLOYER role
- [x] Verify user owns all requested jobs
- [x] Sanitize and validate jobIds parameter
- [x] Limit maximum number of job IDs (e.g., max 100 per request)
- [x] Log access for audit trail
- [x] Rate limit API calls

---

## Testing Scenarios

### 1. Manual Testing with cURL

**Get all job summaries for logged-in employer:**

```bash
curl -X GET "http://localhost:8080/api/v1/jobs/proposals/summary" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Get specific job summaries:**

```bash
curl -X GET "http://localhost:8080/api/v1/jobs/proposals/summary?jobIds=job-1,job-2,job-3" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Test unauthorized access:**

```bash
curl -X GET "http://localhost:8080/api/v1/jobs/proposals/summary" \
  -H "Content-Type: application/json"
# Expected: 401 Unauthorized
```

**Test freelancer access (should fail):**

```bash
curl -X GET "http://localhost:8080/api/v1/jobs/proposals/summary" \
  -H "Authorization: Bearer FREELANCER_JWT_TOKEN" \
  -H "Content-Type: application/json"
# Expected: 403 Forbidden
```

### 2. Unit Test Example

```java
@Test
public void testGetProposalSummaries_Success() {
    // Arrange
    String employerId = "employer-1";
    String jobId1 = "job-1";
    String jobId2 = "job-2";

    List<Proposal> job1Proposals = Arrays.asList(
        createProposal(jobId1, ProposalStatus.PENDING, false, 1500.0),
        createProposal(jobId1, ProposalStatus.ACCEPTED, true, 2000.0),
        createProposal(jobId1, ProposalStatus.PENDING, false, 1800.0)
    );

    when(proposalRepository.findByJobId(jobId1)).thenReturn(job1Proposals);

    // Act
    JobProposalSummaryDto summary = proposalService.getProposalSummaryForJob(jobId1);

    // Assert
    assertEquals(3, summary.getTotalCount());
    assertEquals(2, summary.getUnreadCount());
    assertEquals(2, summary.getPendingCount());
    assertEquals(1, summary.getAcceptedCount());
    assertEquals(1766.67, summary.getAverageProposedBudget(), 0.01);
    assertEquals(1500.0, summary.getLowestProposedBudget());
    assertEquals(2000.0, summary.getHighestProposedBudget());
}
```

---

## Integration with Existing Proposal System

This endpoint complements the existing proposal endpoints:

**Existing Endpoints (already implemented):**

- `GET /api/v1/proposals/employer` - Get detailed proposals for employer
- `GET /api/v1/proposals/{id}` - Get single proposal details
- `POST /api/v1/proposals/{id}/accept` - Accept a proposal
- `POST /api/v1/proposals/{id}/reject` - Reject a proposal

**New Endpoint (this document):**

- `GET /api/v1/jobs/proposals/summary` - Get aggregated statistics

The new endpoint provides lightweight summaries for quick overview, while existing endpoints provide full proposal details.

---

## API Contract Checklist

Before marking backend implementation as complete, verify:

- [ ] Endpoint returns correct data structure
- [ ] All summary counts match actual proposal counts
- [ ] Budget calculations are accurate
- [ ] Only employer's own jobs are accessible
- [ ] Performance is acceptable with 100+ jobs
- [ ] Caching works correctly
- [ ] Cache invalidates on proposal changes
- [ ] Rate limiting is enforced
- [ ] Error responses are consistent with API standards
- [ ] Logging captures important events
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Documentation is updated

---

## Frontend Usage

The frontend automatically calls this endpoint when:

1. Employer visits `/dashboard/employer/jobs` page
2. Every 60 seconds while on the page (polling)
3. After creating a new job

Expected frontend behavior:

- Shows loading spinner on initial fetch
- Displays proposal badges on each job card
- Updates badges in real-time via polling
- Filters jobs by proposal status
- Shows unread count prominently

---

## Next Steps

After backend implementation:

1. Test endpoint manually with cURL
2. Verify data accuracy against database
3. Test with multiple concurrent employers
4. Monitor performance under load
5. Deploy to staging environment
6. Test frontend integration
7. Deploy to production

---

## Support

For questions or issues:

- **Backend Team Lead:** [Name]
- **API Documentation:** `/api/docs` or Swagger UI
- **Frontend Integration:** See `hooks/business/useJobProposals.ts`

---

**Document Version:** 1.0  
**Last Updated:** Day 9 - Job List Integration  
**Related Documents:**

- PROPOSAL_SYSTEM_SPRINT.md
- PROPOSAL_NOTIFICATION_INTEGRATION.md
- API_DOCUMENTATION.md
