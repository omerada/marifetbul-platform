# Proposal Notification System - Backend Integration Guide

## Overview

Proposal notification system kullanıcılara teklif ile ilgili önemli olaylar hakkında bildirim gönderir. Bu döküman backend entegrasyonu için gerekli endpoint'leri ve event listener'ları açıklar.

## Notification Types

```java
public enum ProposalNotificationType {
    PROPOSAL_SUBMITTED,    // Freelancer sent a proposal (to employer)
    PROPOSAL_VIEWED,       // Employer viewed your proposal (to freelancer)
    PROPOSAL_ACCEPTED,     // Employer accepted your proposal (to freelancer)
    PROPOSAL_REJECTED,     // Employer rejected your proposal (to freelancer)
    NEW_PROPOSAL,          // New proposal received on your job (to employer)
    PROPOSAL_WITHDRAWN,    // Freelancer withdrew their proposal (to employer)
    PROPOSAL_REMINDER      // Reminder to review pending proposals (to employer)
}
```

## Required Backend Endpoints

### 1. Get Proposal Notifications

**Endpoint:** `GET /api/v1/notifications/proposals`

**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-uuid-123",
        "type": "NEW_PROPOSAL",
        "title": "Yeni Teklif Aldınız",
        "message": "Ahmet Yılmaz 'Logo Tasarımı' ilanınıza teklif gönderdi",
        "proposalId": "proposal-uuid-456",
        "jobId": "job-uuid-789",
        "jobTitle": "Logo Tasarımı",
        "freelancerName": "Ahmet Yılmaz",
        "proposedBudget": 5000,
        "createdAt": "2024-01-20T10:00:00Z",
        "read": false,
        "actionUrl": "/dashboard/employer/proposals?jobId=job-uuid-789"
      },
      {
        "id": "notif-uuid-124",
        "type": "PROPOSAL_ACCEPTED",
        "title": "Teklifiniz Kabul Edildi",
        "message": "Mehmet Demir teklifinizi kabul etti",
        "proposalId": "proposal-uuid-457",
        "jobId": "job-uuid-790",
        "jobTitle": "Web Sitesi Geliştirme",
        "employerName": "Mehmet Demir",
        "proposedBudget": 15000,
        "createdAt": "2024-01-20T09:30:00Z",
        "read": false,
        "actionUrl": "/dashboard/freelancer/proposals"
      }
    ],
    "unreadCount": 2
  }
}
```

### 2. Mark Notification as Read

**Endpoint:** `POST /api/v1/notifications/{notificationId}/read`

**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**

```json
{
  "success": true,
  "message": "Bildirim okundu olarak işaretlendi"
}
```

### 3. Mark All Proposal Notifications as Read

**Endpoint:** `POST /api/v1/notifications/proposals/read-all`

**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**

```json
{
  "success": true,
  "message": "Tüm teklif bildirimleri okundu olarak işaretlendi"
}
```

## Event Listeners / Webhook Integration

Backend'de proposal oluşturma/güncelleme event'lerinde bildirim gönderilmesi gerekiyor.

### 1. Proposal Submitted Event

**Trigger:** Freelancer bir teklif gönderdiğinde

```java
@EventListener
public void onProposalSubmitted(ProposalSubmittedEvent event) {
    Proposal proposal = event.getProposal();
    Job job = jobService.findById(proposal.getJobId());
    User freelancer = userService.findById(proposal.getFreelancerId());

    // Employer'a bildirim gönder
    notificationService.createNotification(
        job.getEmployerId(),
        NotificationType.NEW_PROPOSAL,
        "Yeni Teklif Aldınız",
        String.format("%s '%s' ilanınıza teklif gönderdi",
            freelancer.getFullName(),
            job.getTitle()
        ),
        Map.of(
            "proposalId", proposal.getId(),
            "jobId", job.getId(),
            "jobTitle", job.getTitle(),
            "freelancerName", freelancer.getFullName(),
            "proposedBudget", proposal.getProposedBudget(),
            "actionUrl", "/dashboard/employer/proposals?jobId=" + job.getId()
        )
    );

    // Freelancer'a onay bildirimi
    notificationService.createNotification(
        freelancer.getId(),
        NotificationType.PROPOSAL_SUBMITTED,
        "Teklifiniz Gönderildi",
        String.format("'%s' için teklifiniz başarıyla gönderildi",
            job.getTitle()
        ),
        Map.of(
            "proposalId", proposal.getId(),
            "jobId", job.getId(),
            "jobTitle", job.getTitle(),
            "actionUrl", "/dashboard/freelancer/proposals"
        )
    );
}
```

### 2. Proposal Viewed Event

**Trigger:** Employer bir teklifi görüntülediğinde

```java
@EventListener
public void onProposalViewed(ProposalViewedEvent event) {
    Proposal proposal = event.getProposal();
    Job job = jobService.findById(proposal.getJobId());
    User employer = userService.findById(job.getEmployerId());

    // Freelancer'a bildirim gönder
    notificationService.createNotification(
        proposal.getFreelancerId(),
        NotificationType.PROPOSAL_VIEWED,
        "Teklifiniz Görüntülendi",
        String.format("%s teklifinizi görüntüledi",
            employer.getFullName()
        ),
        Map.of(
            "proposalId", proposal.getId(),
            "jobId", job.getId(),
            "jobTitle", job.getTitle(),
            "employerName", employer.getFullName(),
            "actionUrl", "/dashboard/freelancer/proposals"
        )
    );
}
```

### 3. Proposal Accepted Event

**Trigger:** Employer bir teklifi kabul ettiğinde

```java
@EventListener
public void onProposalAccepted(ProposalAcceptedEvent event) {
    Proposal proposal = event.getProposal();
    Job job = jobService.findById(proposal.getJobId());
    User employer = userService.findById(job.getEmployerId());

    // Freelancer'a bildirim gönder
    notificationService.createNotification(
        proposal.getFreelancerId(),
        NotificationType.PROPOSAL_ACCEPTED,
        "🎉 Teklifiniz Kabul Edildi!",
        String.format("%s '%s' için teklifinizi kabul etti. İş başlayabilir!",
            employer.getFullName(),
            job.getTitle()
        ),
        Map.of(
            "proposalId", proposal.getId(),
            "jobId", job.getId(),
            "jobTitle", job.getTitle(),
            "employerName", employer.getFullName(),
            "proposedBudget", proposal.getProposedBudget(),
            "actionUrl", "/dashboard/freelancer/jobs/" + job.getId()
        )
    );

    // Email bildirimi de gönderilebilir
    emailService.sendProposalAcceptedEmail(proposal);
}
```

### 4. Proposal Rejected Event

**Trigger:** Employer bir teklifi reddettiğinde

```java
@EventListener
public void onProposalRejected(ProposalRejectedEvent event) {
    Proposal proposal = event.getProposal();
    Job job = jobService.findById(proposal.getJobId());
    User employer = userService.findById(job.getEmployerId());

    // Freelancer'a bildirim gönder
    notificationService.createNotification(
        proposal.getFreelancerId(),
        NotificationType.PROPOSAL_REJECTED,
        "Teklifiniz Reddedildi",
        String.format("'%s' için teklifiniz reddedildi. Başka iş ilanlarına göz atabilirsiniz.",
            job.getTitle()
        ),
        Map.of(
            "proposalId", proposal.getId(),
            "jobId", job.getId(),
            "jobTitle", job.getTitle(),
            "actionUrl", "/marketplace/jobs"
        )
    );
}
```

### 5. Proposal Withdrawn Event

**Trigger:** Freelancer teklifini geri çektiğinde

```java
@EventListener
public void onProposalWithdrawn(ProposalWithdrawnEvent event) {
    Proposal proposal = event.getProposal();
    Job job = jobService.findById(proposal.getJobId());
    User freelancer = userService.findById(proposal.getFreelancerId());

    // Employer'a bildirim gönder
    notificationService.createNotification(
        job.getEmployerId(),
        NotificationType.PROPOSAL_WITHDRAWN,
        "Teklif Geri Çekildi",
        String.format("%s '%s' için gönderdiği teklifi geri çekti",
            freelancer.getFullName(),
            job.getTitle()
        ),
        Map.of(
            "proposalId", proposal.getId(),
            "jobId", job.getId(),
            "jobTitle", job.getTitle(),
            "freelancerName", freelancer.getFullName(),
            "actionUrl", "/dashboard/employer/proposals?jobId=" + job.getId()
        )
    );
}
```

### 6. Proposal Reminder Scheduled Job

**Trigger:** Her gün belirli saatte (örn: 10:00) çalışır

```java
@Scheduled(cron = "0 0 10 * * *") // Her gün saat 10:00
public void sendProposalReminders() {
    // Bekleyen teklifleri olan job'ları bul
    List<Job> jobsWithPendingProposals = jobService.findJobsWithPendingProposals();

    jobsWithPendingProposals.forEach(job -> {
        long pendingCount = proposalService.countPendingProposalsByJobId(job.getId());

        // Son 24 saatte bildirim gönderilmediyse hatırlatma gönder
        if (shouldSendReminder(job, pendingCount)) {
            notificationService.createNotification(
                job.getEmployerId(),
                NotificationType.PROPOSAL_REMINDER,
                "Bekleyen Teklifler",
                String.format("'%s' ilanınız için %d adet bekleyen teklif var",
                    job.getTitle(),
                    pendingCount
                ),
                Map.of(
                    "jobId", job.getId(),
                    "jobTitle", job.getTitle(),
                    "pendingCount", pendingCount,
                    "actionUrl", "/dashboard/employer/proposals?jobId=" + job.getId()
                )
            );
        }
    });
}

private boolean shouldSendReminder(Job job, long pendingCount) {
    if (pendingCount == 0) return false;

    // Son bildirim zamanını kontrol et
    LocalDateTime lastNotification = notificationService
        .getLastReminderTime(job.getId(), NotificationType.PROPOSAL_REMINDER);

    if (lastNotification == null) return true;

    // 24 saatten fazla geçmişse tekrar gönder
    return Duration.between(lastNotification, LocalDateTime.now()).toHours() >= 24;
}
```

## Database Schema Suggestion

```sql
CREATE TABLE proposal_notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    proposal_id VARCHAR(36),
    job_id VARCHAR(36),
    job_title VARCHAR(255),
    freelancer_name VARCHAR(255),
    employer_name VARCHAR(255),
    proposed_budget DECIMAL(10, 2),
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,

    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read),
    INDEX idx_type (type),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE SET NULL,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
);
```

## API Contract Checklist

- [ ] **GET /api/v1/notifications/proposals** - Fetch proposal notifications
- [ ] **POST /api/v1/notifications/{id}/read** - Mark single notification as read
- [ ] **POST /api/v1/notifications/proposals/read-all** - Mark all as read
- [ ] **ProposalSubmittedEvent** listener - Send notifications on new proposal
- [ ] **ProposalViewedEvent** listener - Notify freelancer when viewed
- [ ] **ProposalAcceptedEvent** listener - Notify freelancer on acceptance
- [ ] **ProposalRejectedEvent** listener - Notify freelancer on rejection
- [ ] **ProposalWithdrawnEvent** listener - Notify employer on withdrawal
- [ ] **Scheduled Job** - Daily reminder for pending proposals
- [ ] **Email Integration** - Optional email notifications for important events

## Frontend Integration Example

```typescript
// In a header component
import { useProposalNotifications } from '@/hooks/business';
import { ProposalNotificationBadge, ProposalNotificationList } from '@/components/domains/proposals';

function Header() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useProposalNotifications({ autoFetch: true, pollingInterval: 60000 });

  return (
    <ProposalNotificationBadge count={unreadCount} onClick={handleOpen}>
      <ProposalNotificationList
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />
    </ProposalNotificationBadge>
  );
}
```

## Testing

### Manual Testing Scenarios

1. **Proposal Submission**
   - Freelancer sends proposal → Employer receives "NEW_PROPOSAL" notification
   - Freelancer receives "PROPOSAL_SUBMITTED" confirmation

2. **Proposal Viewed**
   - Employer views proposal → Freelancer receives "PROPOSAL_VIEWED" notification

3. **Proposal Acceptance**
   - Employer accepts proposal → Freelancer receives "PROPOSAL_ACCEPTED" notification
   - Action URL redirects to job workspace

4. **Proposal Rejection**
   - Employer rejects proposal → Freelancer receives "PROPOSAL_REJECTED" notification

5. **Proposal Withdrawal**
   - Freelancer withdraws proposal → Employer receives "PROPOSAL_WITHDRAWN" notification

6. **Daily Reminders**
   - Scheduled job runs → Employers with pending proposals receive reminders

### API Testing with cURL

```bash
# Get notifications
curl -X GET "http://localhost:8080/api/v1/notifications/proposals" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"

# Mark as read
curl -X POST "http://localhost:8080/api/v1/notifications/{notificationId}/read" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"

# Mark all as read
curl -X POST "http://localhost:8080/api/v1/notifications/proposals/read-all" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

## Performance Considerations

1. **Pagination**: Consider paginating notification list if count grows large
2. **Caching**: Cache unread count for frequent access
3. **Batch Operations**: Batch mark-as-read operations for better performance
4. **Cleanup**: Periodically delete old read notifications (e.g., after 30 days)
5. **Rate Limiting**: Implement rate limiting on notification endpoints

## Security Notes

1. Users should only see their own notifications
2. Validate notification ownership before marking as read
3. Sanitize all user-generated content in notifications
4. Rate limit reminder jobs to prevent spam
5. Log all notification activities for audit purposes

---

**Implementation Priority:** High  
**Estimated Backend Effort:** 2-3 days  
**Frontend Ready:** ✅ Complete  
**Status:** Awaiting Backend Implementation
