# Sprint 3: Email Notifications System - Implementation Plan

## 📊 Sprint Overview

**Sprint Goal**: Implement email notification delivery for offline users with user preferences management

**Prerequisites**:

- ✅ Sprint 2 Completed (Notification System with WebSocket)
- ✅ Email Infrastructure Ready (SendGrid + Thymeleaf)
- ✅ NotificationPreferences Entity Created
- ✅ NotificationChannelService Implemented

**Current State Analysis**:

- Email service READY: SendGridEmailService fully functional
- Email templates READY: 11 templates in `resources/templates/email/`
- NotificationChannelService EXISTS: Email delivery logic already implemented
- NotificationPreferences EXISTS: User email preferences in database
- **MISSING**: Email templates for FOLLOW notification type
- **MISSING**: Email delivery call in NotificationEventListener
- **MISSING**: Frontend UI for notification preferences
- **NOT USED**: Email functionality exists but not triggered by events

---

## 🎯 Sprint Goals

### Primary Objectives

1. **Enable email delivery** for all notification types when users are offline
2. **Add FOLLOW notification email template** (missing from current templates)
3. **Integrate email sending** into NotificationEventListener
4. **Build frontend UI** for managing notification preferences
5. **Test end-to-end** email delivery flow

### Success Criteria

- ✅ Emails sent automatically when notifications created (if user preferences allow)
- ✅ Users can manage email preferences per notification type
- ✅ FOLLOW notification has email template
- ✅ Email delivery tracked in EmailNotification entity
- ✅ Integration tests passing for email flow
- ✅ No performance degradation (async email sending)

---

## 🏗️ Current Architecture Analysis

### Existing Infrastructure (Ready to Use)

#### 1. Email Service Layer ✅

**File**: `SendGridEmailService.java`

- SendGrid API integration
- Template processing with Thymeleaf
- Retry logic for failed sends
- Batch email support
- Comprehensive error handling

**Configuration**:

```yaml
# application.yml
spring:
  mail:
    from-email: noreply@marifetbul.com
    from-name: MarifetBul
    reply-to-email: support@marifetbul.com

sendgrid:
  api-key: ${SENDGRID_API_KEY}
  enabled: true
```

#### 2. NotificationChannelService ✅

**File**: `NotificationChannelService.java`

- **Method**: `sendViaEmail(Notification notification)`
  - Checks if email service enabled
  - Checks user has email address
  - Checks user preferences (via preferencesService)
  - Calls `sendEmailNotificationAsync()` with @Async
  - Updates notification.emailSent flag

**Key Features**:

- Async email sending (@Async("emailTaskExecutor"))
- User preference checking (per notification type)
- EmailNotification audit record creation
- Template data building from notification
- Error handling without failing parent transaction

#### 3. NotificationPreferences Entity ✅

**File**: `NotificationPreferences.java`

- Per-type email preferences (7 types):
  - messageEmail, jobEmail, proposalEmail, orderEmail, paymentEmail, reviewEmail, systemEmail
- Per-type push preferences
- Do Not Disturb settings (with time range)
- Helper methods: `shouldSendEmail(type)`, `shouldSendPush(type)`

**Default Values**:

```java
messageEmail = true
jobEmail = false
proposalEmail = true
orderEmail = true
paymentEmail = true
reviewEmail = true
systemEmail = true
```

#### 4. Email Templates ✅

**Location**: `src/main/resources/templates/email/`

**Existing Templates (11 files)**:

1. ✅ `base.html` - Base layout for all emails
2. ✅ `welcome.html` - Welcome email
3. ✅ `email-verification.html` - Email verification
4. ✅ `password-reset.html` - Password reset
5. ✅ `new-message.html` - New message notification
6. ✅ `job-alert.html` - Job alert
7. ✅ `proposal-update.html` - Proposal update
8. ✅ `order-confirmation.html` - Order confirmation
9. ✅ `payment-received.html` - Payment received
10. ✅ `review-received.html` - Review received
11. ✅ `system-notification.html` - System notification

**Missing Template**:

- ❌ `follow-notification.html` - Follow notification (FOLLOW type)

#### 5. EmailTemplate Enum ✅

**File**: `EmailTemplate.java`

```java
public enum EmailTemplate {
    WELCOME_EMAIL("Hoş Geldiniz!", "welcome"),
    EMAIL_VERIFICATION("Email Doğrulama", "email-verification"),
    PASSWORD_RESET("Şifre Sıfırlama", "password-reset"),
    NEW_MESSAGE("Yeni Mesajınız Var", "new-message"),
    JOB_ALERT("Yeni İş İlanı", "job-alert"),
    PROPOSAL_UPDATE("Teklif Güncellendi", "proposal-update"),
    ORDER_CONFIRMATION("Sipariş Onayı", "order-confirmation"),
    PAYMENT_RECEIVED("Ödeme Alındı", "payment-received"),
    REVIEW_RECEIVED("Yeni Değerlendirme", "review-received"),
    SYSTEM_NOTIFICATION("Sistem Bildirimi", "system-notification");
    // MISSING: FOLLOW_NOTIFICATION
}
```

---

## 📝 Gap Analysis

### What's Working

1. ✅ Email service fully functional (SendGrid)
2. ✅ Template engine configured (Thymeleaf)
3. ✅ NotificationChannelService has email logic
4. ✅ NotificationPreferences stored in DB
5. ✅ Email templates for 10 notification types
6. ✅ Async email processing configured

### What's Missing

#### Backend Gaps

1. ❌ **Email call in NotificationEventListener**
   - Currently: Only creates notification + sends WebSocket
   - Needed: Call `notificationChannelService.sendViaEmail(notification)`
   - Impact: 5 event handlers need update

2. ❌ **FOLLOW email template**
   - File: `follow-notification.html` doesn't exist
   - Enum: EmailTemplate.FOLLOW_NOTIFICATION not defined
   - Mapping: NotificationChannelService doesn't map FOLLOW type

3. ❌ **EmailTemplate enum extension**
   - Add FOLLOW_NOTIFICATION to enum
   - Update subject/template name

4. ❌ **NotificationType.FOLLOW mapping**
   - NotificationChannelService.mapNotificationTypeToEmailTemplate() missing FOLLOW case

#### Frontend Gaps

1. ❌ **Notification Preferences Page**
   - No UI at `/settings/notifications`
   - No component for email toggles
   - No DND time range picker

2. ❌ **API Integration**
   - No frontend API client for preferences
   - No custom hook (useNotificationPreferences)

3. ❌ **Settings Navigation**
   - Missing link in dashboard settings menu

#### Testing Gaps

1. ❌ **Email delivery tests**
   - No PowerShell script for email testing
   - No E2E test for email flow
   - No verification of template rendering

---

## 📋 Task Breakdown

### Phase 1: Backend Email Integration (3-4 hours)

#### Task 1: Add FOLLOW Email Template ⏳

**Estimate**: 30 minutes

**Files to Create**:

1. `follow-notification.html` (Thymeleaf template)

**Template Structure**:

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
  <th:block th:replace="~{email/base :: email-content(~{::content})}">
    <th:block th:fragment="content">
      <p class="email-text">Merhaba [[${userName}]]!</p>
      <p class="email-text">
        [[${followerName}]] sizi takip etmeye başladı! 👤
      </p>
      <div class="email-highlight">
        <h3>Yeni Takipçi</h3>
        <p><strong>[[${followerName}]]</strong></p>
        <p th:if="${followerBio}">[[${followerBio}]]</p>
      </div>
      <div class="email-button-container">
        <a th:href="${actionUrl}" class="email-button">Profili Görüntüle</a>
      </div>
    </th:block>
  </th:block>
</html>
```

**Variables Needed**:

- userName (recipient)
- followerName
- followerBio (optional)
- followerAvatar (optional)
- actionUrl (/profile/username)

#### Task 2: Update EmailTemplate Enum ⏳

**Estimate**: 15 minutes

**File**: `EmailTemplate.java`

**Changes**:

```java
public enum EmailTemplate {
    // ... existing templates ...
    FOLLOW_NOTIFICATION("Yeni Takipçi", "follow-notification");

    // ... rest of enum ...
}
```

#### Task 3: Update NotificationChannelService Mapping ⏳

**Estimate**: 15 minutes

**File**: `NotificationChannelService.java`

**Method**: `mapNotificationTypeToEmailTemplate()`

**Add Case**:

```java
private EmailTemplate mapNotificationTypeToEmailTemplate(NotificationType type) {
    return switch (type) {
        case MESSAGE -> EmailTemplate.NEW_MESSAGE;
        case JOB -> EmailTemplate.JOB_ALERT;
        case PROPOSAL -> EmailTemplate.PROPOSAL_UPDATE;
        case ORDER -> EmailTemplate.ORDER_CONFIRMATION;
        case PAYMENT -> EmailTemplate.PAYMENT_RECEIVED;
        case REVIEW -> EmailTemplate.REVIEW_RECEIVED;
        case SYSTEM -> EmailTemplate.SYSTEM_NOTIFICATION;
        case FOLLOW -> EmailTemplate.FOLLOW_NOTIFICATION; // ADD THIS
    };
}
```

#### Task 4: Integrate Email Sending in NotificationEventListener ⏳

**Estimate**: 1 hour

**File**: `NotificationEventListener.java`

**Changes to Each Handler**:

```java
@EventListener
@Async
@Transactional
public void handleUserFollowEvent(UserFollowEvent event) {
    try {
        // ... existing notification creation code ...

        var notification = notificationCrudService.createNotification(...);

        if (notification != null) {
            // Existing WebSocket code...

            // ADD: Send email notification
            notificationChannelService.sendViaEmail(notification);

            log.debug("Email notification queued for delivery");
        }
    } catch (Exception e) {
        log.error("Failed to handle UserFollowEvent", e);
    }
}
```

**Apply to 5 Handlers**:

1. handleUserFollowEvent()
2. handleOrderPlacedEvent()
3. handlePaymentReceivedEvent()
4. handleReviewReceivedEvent()
5. (Add to any future event handlers)

**Testing**:

- Verify notification created
- Verify email queued async
- Verify EmailNotification record created
- Verify email sent (check logs)
- Verify no performance impact

#### Task 5: Add NotificationChannelService Dependency ⏳

**Estimate**: 15 minutes

**File**: `NotificationEventListener.java`

**Add Field**:

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationCrudService notificationCrudService;
    private final WebSocketService webSocketService;
    private final NotificationChannelService notificationChannelService; // ADD THIS

    // ... rest of class ...
}
```

---

### Phase 2: Frontend Preferences UI (3-4 hours)

#### Task 6: Create Notification Preferences API Client ⏳

**Estimate**: 45 minutes

**File**: `lib/api/notification-preferences.ts`

```typescript
import { apiClient } from '@/lib/infrastructure/api/client';

export interface NotificationPreferences {
  // Email preferences
  messageEmail: boolean;
  jobEmail: boolean;
  proposalEmail: boolean;
  orderEmail: boolean;
  paymentEmail: boolean;
  reviewEmail: boolean;
  systemEmail: boolean;

  // Push preferences
  messagePush: boolean;
  jobPush: boolean;
  proposalPush: boolean;
  orderPush: boolean;
  paymentPush: boolean;
  reviewPush: boolean;
  systemPush: boolean;

  // DND settings
  doNotDisturb: boolean;
  dndStartTime?: string; // "22:00"
  dndEndTime?: string;   // "08:00"
}

export async function getNotificationPreferences() {
  return apiClient.get<NotificationPreferences>('/notifications/preferences');
}

export async function updateNotificationPreferences(preferences: Partial<NotificationPreferences>) {
  return apiClient.put<NotificationPreferences>('/notifications/preferences', preferences);
}

export async function resetNotificationPreferences() {
  return apiClient.post<NotificationPreferences>('/notifications/preferences/reset');
}
```

**Endpoints** (Already exist in backend):

- GET `/api/v1/notifications/preferences`
- PUT `/api/v1/notifications/preferences`
- POST `/api/v1/notifications/preferences/reset`

#### Task 7: Create useNotificationPreferences Hook ⏳

**Estimate**: 45 minutes

**File**: `hooks/business/useNotificationPreferences.ts`

```typescript
import { useState } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  resetNotificationPreferences,
  type NotificationPreferences,
} from '@/lib/api/notification-preferences';

export function useNotificationPreferences() {
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch preferences with SWR
  const { data, error, isLoading, mutate } = useSWR<NotificationPreferences>(
    '/notifications/preferences',
    getNotificationPreferences,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  // Update preferences (optimistic)
  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    setIsUpdating(true);

    try {
      // Optimistic update
      mutate(
        (current) => (current ? { ...current, ...updates } : undefined),
        false
      );

      // API call
      const response = await updateNotificationPreferences(updates);

      // Revalidate with server data
      mutate(response, false);

      toast.success('Bildirim ayarları güncellendi');
      return response;
    } catch (error) {
      // Revert on error
      mutate();
      toast.error('Ayarlar güncellenirken bir hata oluştu');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Reset to defaults
  const resetToDefaults = async () => {
    setIsUpdating(true);

    try {
      const response = await resetNotificationPreferences();
      mutate(response, false);
      toast.success('Ayarlar varsayılana sıfırlandı');
      return response;
    } catch (error) {
      toast.error('Sıfırlama işlemi başarısız');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    preferences: data,
    isLoading,
    error,
    isUpdating,
    updatePreferences,
    resetToDefaults,
    refetch: mutate,
  };
}
```

#### Task 8: Create NotificationPreferencesPage ⏳

**Estimate**: 2 hours

**File**: `app/settings/notifications/page.tsx`

```typescript
import { Metadata } from 'next';
import { NotificationPreferencesClient } from './NotificationPreferencesClient';

export const metadata: Metadata = {
  title: 'Bildirim Ayarları | MarifetBul',
  description: 'Bildirim tercihlerinizi yönetin',
};

export default function NotificationPreferencesPage() {
  return <NotificationPreferencesClient />;
}
```

**File**: `app/settings/notifications/NotificationPreferencesClient.tsx`

**Features**:

- Email toggles per notification type (7 types)
- Push toggles per notification type (7 types)
- Do Not Disturb toggle + time range picker
- "Enable All" / "Disable All" buttons
- "Reset to Defaults" button
- Loading states
- Error handling
- Real-time save (optimistic updates)

**UI Structure**:

```
┌─ Notification Preferences ────────────────────┐
│                                                │
│  ┌─ Email Notifications ──────────────────┐   │
│  │ ☑ Messages          ☑ Orders           │   │
│  │ ☐ Job Alerts        ☑ Payments         │   │
│  │ ☑ Proposals         ☑ Reviews          │   │
│  │ ☑ System Announcements                 │   │
│  │ [Enable All] [Disable All]             │   │
│  └────────────────────────────────────────┘   │
│                                                │
│  ┌─ Push Notifications ───────────────────┐   │
│  │ ☑ Messages          ☑ Orders           │   │
│  │ ☑ Job Alerts        ☑ Payments         │   │
│  │ ☑ Proposals         ☑ Reviews          │   │
│  │ ☐ System Announcements                 │   │
│  │ [Enable All] [Disable All]             │   │
│  └────────────────────────────────────────┘   │
│                                                │
│  ┌─ Do Not Disturb ────────────────────────┐  │
│  │ ☐ Enable Do Not Disturb                │   │
│  │ From: [22:00] To: [08:00]              │   │
│  │ (Suppress notifications during sleep)  │   │
│  └────────────────────────────────────────┘   │
│                                                │
│  [Reset to Defaults]                           │
│                                                │
└────────────────────────────────────────────────┘
```

#### Task 9: Add to Settings Navigation ⏳

**Estimate**: 15 minutes

**Files**:

- `app/settings/layout.tsx` or settings navigation component
- Add "Bildirimler" link to settings menu

---

### Phase 3: Testing & Documentation (2-3 hours)

#### Task 10: Create Email Testing Script ⏳

**Estimate**: 1.5 hours

**File**: `scripts/test-email-notifications.ps1`

**Test Cases**:

1. Follow notification email
2. Order notification email
3. Payment notification email
4. Review notification email
5. Email preference checking
6. DND period blocking
7. Batch email sending
8. Email delivery tracking

**Script Structure**:

```powershell
# Setup
- Register test users
- Login and get tokens
- Set email preferences

# Test Cases
- Trigger follow event → verify email sent
- Check EmailNotification table
- Verify template rendering
- Test preference blocking
- Test DND period
- Performance benchmarks

# Cleanup
- Delete test data
- Report results
```

#### Task 11: Update Sprint 3 Documentation ⏳

**Estimate**: 1 hour

**File**: `docs/SPRINT_3_EMAIL_NOTIFICATIONS_COMPLETION.md`

**Sections**:

- Implementation summary
- Email templates overview
- API endpoints documentation
- Frontend UI guide
- Testing results
- Troubleshooting guide
- Performance metrics

---

## 🔄 Integration Points

### Backend Flow

```
Domain Event → NotificationEventListener
    ↓
1. Create Notification (DB)
    ↓
2. Send WebSocket (real-time)
    ↓
3. Send Email (async) → NotificationChannelService
    ↓
    Check user preferences
    ↓
    Create EmailNotification record
    ↓
    Call EmailService (SendGrid)
    ↓
    Update EmailNotification status
```

### Frontend Flow

```
User opens Settings → Notifications
    ↓
Fetch preferences via SWR
    ↓
Display toggles for each type
    ↓
User changes setting
    ↓
Optimistic UI update
    ↓
PUT /api/v1/notifications/preferences
    ↓
Revalidate with server response
    ↓
Show success toast
```

---

## 📊 Estimated Effort

| Phase                     | Tasks        | Hours     | Priority |
| ------------------------- | ------------ | --------- | -------- |
| Backend Email Integration | Tasks 1-5    | 3-4h      | HIGH     |
| Frontend Preferences UI   | Tasks 6-9    | 3-4h      | HIGH     |
| Testing & Documentation   | Tasks 10-11  | 2-3h      | MEDIUM   |
| **TOTAL**                 | **11 tasks** | **8-11h** | -        |

---

## 🎯 Success Metrics

### Technical Metrics

- Email delivery rate: >95%
- Email send time: <3 seconds (async)
- Template rendering time: <100ms
- API response time: <200ms
- No memory leaks in email queue

### User Experience Metrics

- Preference save success: 100%
- UI responsiveness: <50ms for toggles
- Clear feedback on all actions
- No confused users (clear labels)

---

## 🚨 Risk Assessment

### High Risk

1. **SendGrid API rate limits**
   - Mitigation: Batch processing, retry with backoff
   - Monitor: SendGrid dashboard

2. **Email deliverability**
   - Mitigation: Proper SPF/DKIM/DMARC setup
   - Monitor: Bounce rates

### Medium Risk

1. **Performance impact of email sending**
   - Mitigation: @Async execution, separate thread pool
   - Monitor: Application metrics

2. **User confusion about preferences**
   - Mitigation: Clear UI labels, help tooltips
   - Monitor: Support tickets

### Low Risk

1. **Template rendering errors**
   - Mitigation: Comprehensive testing, fallback HTML
   - Monitor: Error logs

---

## 📚 Dependencies

### External Services

- SendGrid API (configured, API key in env)
- SMTP server (fallback, if needed)

### Internal Dependencies

- NotificationPreferences entity (exists)
- EmailNotification entity (exists)
- NotificationChannelService (exists)
- EmailService (exists)
- Thymeleaf template engine (configured)

### Database

- notification_preferences table (exists)
- email_notifications table (exists)
- No migrations needed ✅

---

## 🔧 Configuration Requirements

### Backend Configuration (application.yml)

```yaml
# Email settings (already configured)
spring:
  mail:
    from-email: noreply@marifetbul.com
    from-name: MarifetBul
    reply-to-email: support@marifetbul.com

sendgrid:
  api-key: ${SENDGRID_API_KEY}
  enabled: true

# Async executor for emails (already configured)
async:
  email-task-executor:
    core-pool-size: 5
    max-pool-size: 20
    queue-capacity: 100
```

### Frontend Configuration (.env.local)

```bash
# No additional config needed
# Uses existing NEXT_PUBLIC_API_URL
```

---

## 🎓 Learning Resources

### For Developers

- [SendGrid API Docs](https://docs.sendgrid.com/)
- [Thymeleaf Email Templates](https://www.thymeleaf.org/doc/tutorials/3.0/thymeleafspring.html)
- [Spring @Async Best Practices](https://spring.io/guides/gs/async-method/)

### For Testing

- [Email Testing with Mailtrap](https://mailtrap.io/blog/test-emails-in-spring-boot/)
- [SendGrid Testing Guide](https://docs.sendgrid.com/for-developers/sending-email/getting-started-email-api)

---

## ✅ Definition of Done

### Backend

- [ ] FOLLOW email template created and tested
- [ ] EmailTemplate enum updated with FOLLOW_NOTIFICATION
- [ ] NotificationChannelService maps FOLLOW type
- [ ] NotificationEventListener calls sendViaEmail() in all 5 handlers
- [ ] Email delivery tracked in EmailNotification table
- [ ] No compilation errors
- [ ] All unit tests passing
- [ ] Email templates render correctly

### Frontend

- [ ] Notification preferences API client implemented
- [ ] useNotificationPreferences hook working
- [ ] Notification preferences page created
- [ ] All toggles functional (email + push)
- [ ] DND time picker working
- [ ] Optimistic updates working
- [ ] Error handling comprehensive
- [ ] Added to settings navigation

### Testing

- [ ] PowerShell email test script created
- [ ] All test cases passing
- [ ] Email delivery verified end-to-end
- [ ] Performance benchmarks acceptable
- [ ] No memory leaks detected

### Documentation

- [ ] Sprint 3 completion report written
- [ ] API endpoints documented
- [ ] Email templates documented
- [ ] Troubleshooting guide created
- [ ] User guide for preferences UI

---

## 🚀 Next Steps After Sprint 3

### Sprint 4 Candidates

1. **Push Notifications** (FCM/APNS integration)
2. **Email Batching & Scheduling** (daily digest emails)
3. **Notification Analytics** (open rates, click rates)
4. **Advanced Preferences** (frequency control, mute specific users)
5. **Email Unsubscribe Flow** (one-click unsubscribe)

---

_Sprint 3 Ready to Start - All prerequisites validated ✅_
