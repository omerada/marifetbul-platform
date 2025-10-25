# Proposal System - Testing Guide & Scenarios

## Day 10: Testing & Quality Assurance

**Document Version:** 1.0  
**Last Updated:** October 25, 2025  
**Sprint Status:** Day 10 - Testing & Polish

---

## 📋 Table of Contents

1. [E2E Test Scenarios](#e2e-test-scenarios)
2. [Manual Testing Checklist](#manual-testing-checklist)
3. [Edge Cases & Error Handling](#edge-cases--error-handling)
4. [Performance Testing](#performance-testing)
5. [Accessibility Testing](#accessibility-testing)
6. [Cross-Browser Testing](#cross-browser-testing)
7. [Mobile Testing](#mobile-testing)
8. [Security Testing](#security-testing)

---

## 🧪 E2E Test Scenarios

### Scenario 1: Freelancer Submits Proposal

**User Story:** As a freelancer, I want to submit a proposal for a job so I can bid on work.

**Preconditions:**

- User is logged in as freelancer
- User has completed profile
- Job exists and is active
- User hasn't already submitted proposal for this job

**Test Steps:**

1. **Navigate to Job Detail**

   ```
   Given: User visits /marketplace/jobs/[jobId]
   When: Page loads
   Then:
     - Job details are displayed
     - "Teklif Ver" button is visible
     - User can see job requirements
   ```

2. **Check Eligibility**

   ```
   Given: User clicks "Teklif Ver" button
   When: Eligibility check runs
   Then:
     - If eligible: Navigate to proposal form
     - If not eligible: Show error message with reason
   ```

3. **Fill Proposal Form**

   ```
   Given: User is on /marketplace/jobs/[jobId]/proposal
   When: User fills form
   Then:
     - Cover letter field accepts 100-2000 characters
     - Budget field validates number format
     - Delivery time field shows options
     - All required fields are marked
   ```

4. **Submit Proposal**

   ```
   Given: User fills all required fields
   When: User clicks "Teklifi Gönder"
   Then:
     - Loading spinner appears
     - API call is made
     - Success message shows
     - User redirects to dashboard
     - Proposal appears in "My Proposals" list
   ```

5. **Verify Submission**
   ```
   Given: Proposal was submitted
   When: User visits dashboard/freelancer/proposals
   Then:
     - New proposal is in "Bekleyen" tab
     - Proposal shows correct job title
     - Status badge shows "Bekliyor"
     - Submission time is displayed
   ```

**Expected Results:**

- ✅ Proposal created successfully
- ✅ Shows in freelancer dashboard
- ✅ Employer receives notification (when backend ready)
- ✅ No console errors
- ✅ All data persists correctly

**Edge Cases to Test:**

- [ ] Submit with minimum character limit
- [ ] Submit with maximum character limit
- [ ] Submit with very low budget
- [ ] Submit with very high budget
- [ ] Network error during submission
- [ ] Duplicate submission attempt

---

### Scenario 2: Employer Reviews Proposals

**User Story:** As an employer, I want to review proposals for my job so I can hire the best freelancer.

**Preconditions:**

- User is logged in as employer
- User has posted a job
- Job has received proposals

**Test Steps:**

1. **View Job with Proposals**

   ```
   Given: User visits /dashboard/employer/jobs
   When: Page loads
   Then:
     - Jobs list shows proposal badges
     - "5 yeni teklif" badge is visible
     - "Teklifleri Gör" button is clickable
   ```

2. **Navigate to Proposals**

   ```
   Given: User clicks "Teklifleri Gör"
   When: Navigation occurs
   Then:
     - Redirects to /dashboard/employer/proposals?jobId=X
     - Proposals list loads
     - Shows all proposals for that job
   ```

3. **View Proposal Details**

   ```
   Given: User sees proposals list
   When: User clicks "Detayları Gör" on a proposal
   Then:
     - Modal opens with full proposal details
     - Shows freelancer profile preview
     - Shows cover letter
     - Shows proposed budget and timeline
     - Action buttons are visible (Accept/Reject)
   ```

4. **Compare Proposals**

   ```
   Given: User selects multiple proposals (max 3)
   When: User clicks "Karşılaştır"
   Then:
     - Comparison view opens
     - Shows proposals side-by-side
     - Highlights differences
     - Budget comparison is clear
   ```

5. **Accept Proposal**
   ```
   Given: User clicks "Kabul Et" on a proposal
   When: Confirmation dialog appears
   Then:
     - Shows confirmation message
     - User confirms acceptance
     - API call succeeds
     - Status changes to "Kabul Edildi"
     - Other proposals auto-reject (if configured)
     - Success notification shows
   ```

**Expected Results:**

- ✅ Proposals load correctly
- ✅ Filtering works (All/New/Pending/Accepted)
- ✅ Sorting works (Date/Budget)
- ✅ Comparison works up to 3 proposals
- ✅ Accept/reject actions work
- ✅ Real-time updates via polling

**Edge Cases to Test:**

- [ ] Job with 0 proposals
- [ ] Job with 100+ proposals
- [ ] Compare 3 very different proposals
- [ ] Accept already-accepted proposal
- [ ] Network error during accept
- [ ] Multiple employers viewing same proposals

---

### Scenario 3: Freelancer Withdraws Proposal

**User Story:** As a freelancer, I want to withdraw my proposal if I change my mind.

**Preconditions:**

- User is logged in as freelancer
- User has submitted a proposal
- Proposal status is PENDING

**Test Steps:**

1. **View Proposals**

   ```
   Given: User visits /dashboard/freelancer/proposals
   When: Page loads
   Then:
     - Shows all user's proposals
     - "Bekleyen" tab shows pending proposals
     - Each proposal has "Geri Çek" button
   ```

2. **Initiate Withdrawal**

   ```
   Given: User clicks "Geri Çek"
   When: Confirmation dialog appears
   Then:
     - Shows warning message
     - Explains withdrawal is permanent
     - Has Cancel and Confirm buttons
   ```

3. **Confirm Withdrawal**
   ```
   Given: User clicks "Onayla"
   When: API call is made
   Then:
     - Loading state shows
     - Proposal status changes to WITHDRAWN
     - Success message appears
     - Proposal moves to appropriate tab
   ```

**Expected Results:**

- ✅ Withdrawal succeeds
- ✅ Cannot withdraw non-pending proposals
- ✅ Cannot withdraw accepted proposals
- ✅ Stats update correctly

**Edge Cases to Test:**

- [ ] Withdraw just-submitted proposal
- [ ] Withdraw very old proposal
- [ ] Network error during withdrawal
- [ ] Proposal accepted while withdrawing

---

### Scenario 4: Notification System

**User Story:** As a user, I want to receive notifications about proposal activities.

**Test Steps:**

1. **Freelancer Receives Notification**

   ```
   Given: Employer views freelancer's proposal
   When: View event occurs
   Then:
     - Notification appears in bell icon
     - Badge shows unread count
     - Notification says "İşveren teklifinizi görüntüledi"
   ```

2. **Employer Receives Notification**

   ```
   Given: Freelancer submits proposal
   When: Submission occurs
   Then:
     - Notification appears for employer
     - Shows job title and freelancer name
     - Links to proposal detail
   ```

3. **Mark Notification as Read**
   ```
   Given: User clicks notification
   When: Navigation occurs
   Then:
     - Notification marked as read
     - Unread count decreases
     - Blue indicator disappears
   ```

**Expected Results:**

- ✅ Notifications appear in real-time (polling)
- ✅ Badge count is accurate
- ✅ Mark as read works
- ✅ Mark all as read works

---

## ✅ Manual Testing Checklist

### Freelancer Flows

- [ ] **Job Discovery**
  - [ ] Browse jobs in marketplace
  - [ ] Search for specific jobs
  - [ ] Filter by category/budget/location
  - [ ] View job details

- [ ] **Proposal Submission**
  - [ ] Click "Teklif Ver" button
  - [ ] Pass eligibility check
  - [ ] Fill proposal form
  - [ ] Validate all fields
  - [ ] Submit successfully
  - [ ] See success message
  - [ ] Redirect to dashboard

- [ ] **Proposal Management**
  - [ ] View all proposals
  - [ ] Filter by status (tabs)
  - [ ] See proposal stats
  - [ ] Withdraw pending proposal
  - [ ] View proposal details
  - [ ] See status badges

- [ ] **Notifications**
  - [ ] Receive proposal viewed notification
  - [ ] Receive proposal accepted notification
  - [ ] Receive proposal rejected notification
  - [ ] Mark notifications as read
  - [ ] View notification history

### Employer Flows

- [ ] **Job Management**
  - [ ] View jobs with proposal counts
  - [ ] Filter jobs by proposal status
  - [ ] See "5 yeni teklif" badges
  - [ ] Click "Teklifleri Gör"

- [ ] **Proposal Review**
  - [ ] View proposals list
  - [ ] Filter proposals (All/New/Pending)
  - [ ] Sort proposals (Date/Budget)
  - [ ] View proposal details in modal
  - [ ] See freelancer profile preview
  - [ ] Read cover letter

- [ ] **Proposal Actions**
  - [ ] Accept proposal (with confirmation)
  - [ ] Reject proposal (with confirmation)
  - [ ] Compare up to 3 proposals
  - [ ] Download proposal attachments
  - [ ] See budget range summary

- [ ] **Notifications**
  - [ ] Receive new proposal notification
  - [ ] Receive proposal withdrawn notification
  - [ ] See unread count
  - [ ] Navigate from notification

---

## 🚨 Edge Cases & Error Handling

### Input Validation

1. **Cover Letter Validation**

   ```typescript
   Test Cases:
   - Empty string → Error: "Kapak mektubu gereklidir"
   - 99 characters → Error: "En az 100 karakter olmalı"
   - 2001 characters → Error: "En fazla 2000 karakter olabilir"
   - 100-2000 characters → Success
   - HTML/Script injection → Sanitized
   - Special characters → Accepted
   - Emoji → Accepted
   ```

2. **Budget Validation**

   ```typescript
   Test Cases:
   - Negative number → Error: "Bütçe pozitif olmalı"
   - Zero → Error: "Bütçe 0'dan büyük olmalı"
   - Non-number → Error: "Geçerli bir sayı girin"
   - Decimal with 3+ places → Rounded to 2
   - Very large number (>1000000) → Warning
   - Below job minimum → Warning (if exists)
   - Above job maximum → Warning (if exists)
   ```

3. **Delivery Time Validation**
   ```typescript
   Test Cases:
   - Not selected → Error: "Teslim süresi seçin"
   - Past date → Error: "Gelecek bir tarih seçin"
   - Too far in future (>1 year) → Warning
   ```

### Network Errors

1. **API Call Failures**

   ```typescript
   Scenarios:
   - 500 Internal Server Error
     → Show: "Bir hata oluştu, lütfen tekrar deneyin"
     → Keep form data
     → Allow retry

   - 401 Unauthorized
     → Redirect to login
     → Save form data in localStorage
     → Restore after re-login

   - 403 Forbidden
     → Show: "Bu işlem için yetkiniz yok"
     → Redirect to dashboard

   - 429 Too Many Requests
     → Show: "Çok fazla istek, lütfen bekleyin"
     → Disable submit for 60 seconds

   - Timeout
     → Show: "Bağlantı zaman aşımı"
     → Offer retry
   ```

2. **Network Offline**

   ```typescript
   Scenarios:
   - Form submission while offline
     → Detect offline state
     → Queue submission
     → Retry when online
     → Show offline indicator

   - Polling while offline
     → Pause polling
     → Resume when online
     → Show "Bağlantı kesildi" banner
   ```

### Data Inconsistencies

1. **Race Conditions**

   ```typescript
   Scenarios:
   - Double submission
     → Disable button after first click
     → Show loading state
     → Prevent duplicate API calls

   - Concurrent status changes
     → Use optimistic updates
     → Revert on conflict
     → Show conflict resolution UI
   ```

2. **Stale Data**

   ```typescript
   Scenarios:
   - View proposal that was just deleted
     → Show 404 error
     → Redirect to list

   - Accept proposal already accepted
     → Show conflict error
     → Refresh list

   - Withdraw proposal already accepted
     → Show validation error
     → Refresh proposal details
   ```

### Empty States

1. **No Proposals**

   ```typescript
   Scenarios:
   - Freelancer with no proposals
     → Show empty state with CTA
     → "Henüz teklif göndermediniz"
     → Link to marketplace

   - Job with no proposals
     → Show empty state
     → "Henüz teklif alınmadı"
     → Suggest sharing job
   ```

2. **No Jobs**
   ```typescript
   Scenarios:
   - Employer with no jobs
     → Show empty state
     → "İş ilanı oluşturun"
     → CTA to create job
   ```

### Permission Errors

1. **Unauthorized Actions**

   ```typescript
   Scenarios:
   - Freelancer tries to accept proposal
     → 403 error
     → Show: "Bu işlem sadece işverenlere açık"

   - Employer tries to submit proposal
     → Block UI
     → Show: "Sadece freelancer'lar teklif verebilir"

   - User tries to view other's proposals
     → 403 error
     → Redirect to own dashboard
   ```

---

## ⚡ Performance Testing

### Load Time Benchmarks

**Target Metrics:**

- Initial page load: < 2 seconds
- Proposal submission: < 1 second
- List view load: < 1.5 seconds
- Modal open: < 300ms
- Filter/sort: < 200ms

### Performance Tests

1. **Bundle Size Analysis**

   ```bash
   # Run bundle analyzer
   npm run build
   npm run analyze

   # Check proposal component sizes
   # Target: Each page < 200KB gzipped
   ```

2. **Lazy Loading**

   ```typescript
   Test:
   - ProposalDetailModal lazy loads
   - ProposalComparisonView lazy loads
   - Heavy components code-split
   - Images lazy load with loading="lazy"
   ```

3. **Render Performance**

   ```typescript
   Test:
   - List with 100 proposals renders in < 500ms
   - Scroll performance is smooth (60fps)
   - No layout shifts (CLS < 0.1)
   - No blocking JavaScript
   ```

4. **API Performance**
   ```typescript
   Test:
   - Parallel requests for summary data
   - Debounced search (300ms)
   - Throttled polling (60s)
   - Request deduplication
   ```

### Optimization Checklist

- [ ] Use React.memo for proposal cards
- [ ] Use useMemo for expensive calculations
- [ ] Use useCallback for event handlers
- [ ] Implement virtual scrolling for long lists
- [ ] Optimize images (WebP, correct sizes)
- [ ] Enable gzip compression
- [ ] Use CDN for static assets
- [ ] Implement service worker caching
- [ ] Prefetch critical resources
- [ ] Remove unused code (tree shaking)

---

## ♿ Accessibility Testing

### WCAG 2.1 AA Compliance

**Required Standards:**

- Color contrast ratio ≥ 4.5:1
- All interactive elements keyboard accessible
- Screen reader compatible
- Focus indicators visible
- ARIA labels present
- Form validation messages clear

### Accessibility Checklist

- [ ] **Keyboard Navigation**
  - [ ] Tab through all interactive elements
  - [ ] Enter/Space activates buttons
  - [ ] Escape closes modals
  - [ ] Arrow keys navigate lists
  - [ ] Focus trap in modals

- [ ] **Screen Reader**
  - [ ] All images have alt text
  - [ ] Buttons have aria-label
  - [ ] Form fields have labels
  - [ ] Error messages announced
  - [ ] Loading states announced

- [ ] **Visual**
  - [ ] Text contrast passes WCAG AA
  - [ ] Focus indicators visible
  - [ ] No color-only information
  - [ ] Font size ≥ 16px
  - [ ] Touch targets ≥ 44x44px

- [ ] **Forms**
  - [ ] Labels associated with inputs
  - [ ] Error messages descriptive
  - [ ] Required fields marked
  - [ ] Validation messages clear
  - [ ] Success messages announced

### Testing Tools

```bash
# Install axe-core for automated testing
npm install --save-dev @axe-core/react

# Run accessibility audit
npm run test:a11y

# Manual testing with:
# - VoiceOver (Mac)
# - NVDA (Windows)
# - Keyboard only navigation
# - Chrome DevTools Lighthouse
```

---

## 🌐 Cross-Browser Testing

### Supported Browsers

**Desktop:**

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

**Mobile:**

- Chrome Android 90+ ✅
- Safari iOS 14+ ✅
- Samsung Internet 14+ ✅

### Browser-Specific Tests

1. **Chrome/Edge (Chromium)**
   - [ ] Forms submit correctly
   - [ ] Modals render properly
   - [ ] CSS Grid/Flexbox works
   - [ ] Date picker functions

2. **Firefox**
   - [ ] No console errors
   - [ ] CSS animations smooth
   - [ ] WebSocket connections work
   - [ ] LocalStorage accessible

3. **Safari**
   - [ ] Date inputs work (fallback)
   - [ ] Backdrop filter supported
   - [ ] Touch events work
   - [ ] Position: sticky works

### Polyfills Required

```typescript
// Add to polyfills if needed
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Check browser support
if (!window.fetch) {
  require('whatwg-fetch');
}
```

---

## 📱 Mobile Testing

### Responsive Breakpoints

```css
Mobile: 320px - 767px
Tablet: 768px - 1023px
Desktop: 1024px+
```

### Mobile Test Scenarios

1. **Touch Interactions**
   - [ ] Tap targets ≥ 44x44px
   - [ ] Swipe gestures work
   - [ ] Pull-to-refresh (if enabled)
   - [ ] Long-press actions

2. **Layout**
   - [ ] No horizontal scroll
   - [ ] Text readable without zoom
   - [ ] Images scale correctly
   - [ ] Forms fit screen

3. **Performance**
   - [ ] Fast 3G loads in < 5s
   - [ ] Images optimized
   - [ ] JavaScript minimal
   - [ ] CSS critical inlined

4. **Mobile-Specific**
   - [ ] Tel: links work
   - [ ] Email: links work
   - [ ] Share API works
   - [ ] Camera upload works
   - [ ] Location services work

### Mobile Testing Tools

```bash
# Chrome DevTools Device Mode
# Real device testing (iOS/Android)
# BrowserStack for multi-device testing
```

---

## 🔒 Security Testing

### Security Checklist

- [ ] **Authentication**
  - [ ] JWT tokens expire correctly
  - [ ] Refresh token rotation works
  - [ ] Logout clears all tokens
  - [ ] Session timeout enforced

- [ ] **Authorization**
  - [ ] Role-based access enforced
  - [ ] Can't access other users' data
  - [ ] API endpoints check permissions
  - [ ] Frontend hides unauthorized actions

- [ ] **Input Validation**
  - [ ] XSS protection (sanitize inputs)
  - [ ] SQL injection protection
  - [ ] CSRF tokens validated
  - [ ] File upload validation
  - [ ] Max file size enforced

- [ ] **Data Protection**
  - [ ] Sensitive data not in localStorage
  - [ ] HTTPS enforced
  - [ ] Cookies marked secure+httpOnly
  - [ ] No sensitive data in URLs
  - [ ] No console.log in production

### Penetration Testing

```bash
# Test for common vulnerabilities
npm audit
npm run test:security

# Manual security tests:
# - Try to submit proposal for another user
# - Try to accept own proposal
# - Try XSS in cover letter
# - Try to view other employer's proposals
# - Try rate limit bypass
```

---

## 📊 Test Coverage Goals

### Unit Tests

- Target: >80% coverage
- Focus: Hooks, utilities, helpers

### Integration Tests

- Target: >70% coverage
- Focus: Component interactions, API calls

### E2E Tests

- Target: Critical paths covered
- Focus: User flows, happy paths

### Coverage Report

```bash
# Run all tests with coverage
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

---

## ✅ Pre-Production Checklist

### Code Quality

- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] No console.log statements
- [ ] No TODO/FIXME comments
- [ ] Code formatted (Prettier)

### Functionality

- [ ] All user flows work
- [ ] All edge cases handled
- [ ] All error states handled
- [ ] All loading states present

### Performance

- [ ] Lighthouse score >90
- [ ] Bundle size acceptable
- [ ] No memory leaks
- [ ] Images optimized

### Security

- [ ] Security audit passed
- [ ] No vulnerable dependencies
- [ ] HTTPS enforced
- [ ] API tokens secure

### Documentation

- [ ] Code comments complete
- [ ] README updated
- [ ] API docs updated
- [ ] User guide created

### Deployment

- [ ] Staging deployment successful
- [ ] Production build works
- [ ] Environment variables set
- [ ] Monitoring configured
- [ ] Rollback plan ready

---

## 📝 Bug Report Template

```markdown
**Bug Title:** [Concise description]

**Environment:**

- Browser: [Chrome 120, Firefox 115, etc.]
- OS: [Windows 11, macOS 14, etc.]
- Device: [Desktop, iPhone 14, etc.]
- Screen Size: [1920x1080, 375x667, etc.]

**Steps to Reproduce:**

1. Go to [page]
2. Click on [element]
3. Observe [behavior]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots:**
[Attach screenshots]

**Console Errors:**
[Paste any console errors]

**Severity:**

- [ ] Critical (blocks functionality)
- [ ] High (major impact)
- [ ] Medium (moderate impact)
- [ ] Low (minor issue)

**Additional Context:**
[Any other relevant information]
```

---

**Testing Status:** 🟡 In Progress  
**Last Updated:** October 25, 2025  
**Next Review:** After all tests complete
