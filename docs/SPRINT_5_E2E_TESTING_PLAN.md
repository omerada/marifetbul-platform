# Sprint 5: E2E Testing & Production Readiness

**Sprint Goal:** Implement comprehensive E2E testing for critical user flows and increase test coverage to 60%+

**Priority:** HIGH - Production Blocker  
**Estimated Time:** 8-12 hours  
**Status:** 🔵 PLANNED

---

## 📊 Current State Analysis

### ✅ Completed Features (Ready for Testing)

1. **Blog Comment Moderation System** - 100% Complete
   - Backend: CommentModerationService, CommentFacadeService
   - Frontend: CommentModerationQueue, CommentModerationCard
   - Hooks: useCommentModeration with filters & bulk actions
   - Status: Production-ready, needs E2E tests

2. **Review System** - 100% Complete
   - Full CRUD operations
   - Seller responses
   - Admin moderation
   - Voting & flagging
   - Status: Test skeletons exist, need implementation

3. **Email Notification System** - 100% Complete (Sprint 3)
   - SendGrid integration
   - Template management
   - User preferences
   - Status: Production-ready

4. **Build Stability** - 100% Complete (Sprint 4)
   - SSR fixes
   - DOMPurify migration
   - Suspense boundaries
   - Status: All builds passing

### 🔴 Test Coverage Gaps

**Current E2E Test Files:** 4

- `auth.spec.ts` - ✅ Basic auth tests
- `packages.spec.ts` - ⚠️ Skeleton only
- `follow-system.spec.ts` - ⚠️ Skeleton only
- `review-system.spec.ts` - ⚠️ 30+ test skeletons (TODO)

**Test Implementation Rate:** ~5% (Only auth has real implementations)

---

## 🎯 Sprint 5 Objectives

### Primary Goal

Implement E2E tests for **3 critical user flows** to ensure production stability

### Success Metrics

- ✅ 15+ E2E tests implemented and passing
- ✅ Critical paths covered: Auth, Orders, Reviews
- ✅ CI/CD pipeline integration
- ✅ Test execution < 5 minutes
- ✅ Zero flaky tests

---

## 📋 Task Breakdown

### Phase 1: Test Infrastructure Setup (1-2 hours)

#### Task 1.1: Playwright Configuration Review

**Priority:** HIGH  
**Effort:** 30 min

**Current Config Check:**

```bash
# Verify playwright.config.ts exists
# Check test environment setup
# Validate test data fixtures
```

**Actions:**

1. Review `playwright.config.ts` settings
2. Ensure test database isolation
3. Configure screenshot/video on failure
4. Setup test user fixtures
5. Add retry logic for flaky tests

---

#### Task 1.2: Mock API Setup

**Priority:** HIGH  
**Effort:** 1 hour

**Requirements:**

- Mock backend API responses for consistent tests
- Setup MSW (Mock Service Worker) handlers
- Create test data factories

**Implementation:**

```typescript
// tests/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  // Auth endpoints
  rest.post('/api/v1/auth/login', (req, res, ctx) => {
    return res(ctx.json({ token: 'mock-token', user: mockUser }));
  }),

  // Review endpoints
  rest.get('/api/v1/reviews', (req, res, ctx) => {
    return res(ctx.json({ content: mockReviews, total: 10 }));
  }),

  // Comment moderation
  rest.get('/api/v1/blog/admin/comments/pending', (req, res, ctx) => {
    return res(ctx.json({ content: mockPendingComments }));
  }),
];
```

---

### Phase 2: Critical Flow Tests (4-6 hours)

#### Task 2.1: Authentication Flow Tests

**Priority:** CRITICAL  
**Effort:** 1.5 hours  
**Status:** ✅ Partially Complete

**Test Cases:**

1. ✅ User registration with email verification
2. ✅ Login with valid credentials
3. ✅ Login with invalid credentials
4. ⚠️ Password reset flow (needs implementation)
5. ⚠️ Social login (Google/Facebook)
6. ⚠️ Token refresh on expiry

**Implementation:**

```typescript
// tests/e2e/auth.spec.ts
test('should complete password reset flow', async ({ page }) => {
  await page.goto('/forgot-password');
  await page.fill('[name="email"]', 'user@test.com');
  await page.click('button:has-text("Gönder")');

  await expect(page.locator('.success-message')).toBeVisible();

  // Simulate email link click
  const resetToken = await getResetToken('user@test.com');
  await page.goto(`/reset-password?token=${resetToken}`);

  await page.fill('[name="password"]', 'NewPassword123!');
  await page.fill('[name="confirmPassword"]', 'NewPassword123!');
  await page.click('button:has-text("Şifreyi Sıfırla")');

  await expect(page).toHaveURL('/login');
  await expect(page.locator('.success-message')).toContainText('başarıyla');
});
```

---

#### Task 2.2: Review System E2E Tests

**Priority:** HIGH  
**Effort:** 2 hours  
**Coverage Target:** 10 tests

**Critical Test Cases:**

1. Create review after order completion
2. Edit review within 30-day window
3. Seller response to review
4. Admin approve/reject review
5. Review voting (helpful/not helpful)

**Implementation Plan:**

```typescript
// tests/e2e/review-system.spec.ts
test('should create review after order completion', async ({ page }) => {
  // Login as buyer
  await login(page, 'buyer@test.com', 'password');

  // Navigate to completed order
  await page.goto('/dashboard/customer/orders');
  await page.click('[data-order-status="completed"]:first-of-type');

  // Open review form
  await page.click('button:has-text("Review Yaz")');

  // Fill review form
  await page.fill('[name="reviewText"]', 'Great service! Very professional.');
  await page.click('[data-rating="quality"][data-value="5"]');
  await page.click('[data-rating="communication"][data-value="5"]');
  await page.click('[data-rating="delivery"][data-value="4"]');
  await page.click('[data-rating="value"][data-value="5"]');

  // Submit
  await page.click('button:has-text("Gönder")');

  // Verify success
  await expect(page.locator('.success-toast')).toBeVisible();
  await expect(page.locator('[data-review-status="published"]')).toBeVisible();
});
```

---

#### Task 2.3: Comment Moderation E2E Tests

**Priority:** HIGH  
**Effort:** 1.5 hours  
**Coverage Target:** 8 tests

**Critical Test Cases:**

1. View pending comments queue
2. Approve single comment
3. Reject comment with reason
4. Mark comment as spam
5. Bulk approve comments
6. Filter comments by status
7. Search comments by content
8. Auto-refresh queue

**Implementation:**

```typescript
// tests/e2e/comment-moderation.spec.ts
test('should approve comment from moderation queue', async ({ page }) => {
  // Login as admin
  await login(page, 'admin@test.com', 'adminpass');

  // Navigate to moderation queue
  await page.goto('/admin/moderation');
  await page.click('button:has-text("Yorumlar")');

  // Verify pending comments visible
  await expect(page.locator('[data-comment-status="pending"]')).toHaveCount(5);

  // Approve first comment
  const firstComment = page.locator('[data-comment-status="pending"]').first();
  await firstComment.click('button:has-text("Onayla")');

  // Verify success
  await expect(page.locator('.success-toast')).toContainText('onaylandı');
  await expect(firstComment).toHaveAttribute('data-comment-status', 'approved');
});

test('should bulk approve comments', async ({ page }) => {
  await login(page, 'admin@test.com', 'adminpass');
  await page.goto('/admin/moderation/comments');

  // Select multiple comments
  await page.click('[data-comment-id="1"] input[type="checkbox"]');
  await page.click('[data-comment-id="2"] input[type="checkbox"]');
  await page.click('[data-comment-id="3"] input[type="checkbox"]');

  // Bulk approve
  await page.click('button:has-text("Seçilenleri Onayla")');
  await page.click('button:has-text("Evet, Onayla")'); // Confirmation

  // Verify success
  await expect(page.locator('.success-toast')).toContainText('3 yorum onaylandı');
  await expect(page.locator('[data-comment-status="approved"]')).toHaveCount(3);
});
```

---

#### Task 2.4: Order Flow E2E Tests

**Priority:** MEDIUM  
**Effort:** 1.5 hours

**Test Cases:**

1. Browse marketplace packages
2. Add package to cart
3. Complete checkout flow
4. Payment success handling
5. Order tracking
6. Freelancer order acceptance

**Implementation:**

```typescript
// tests/e2e/order-flow.spec.ts
test('should complete order purchase flow', async ({ page }) => {
  await login(page, 'customer@test.com', 'password');

  // Browse packages
  await page.goto('/marketplace/packages');
  await page.click('[data-package-id="1"]');

  // Package detail page
  await expect(page.locator('h1')).toContainText('Professional Logo Design');
  await page.click('button:has-text("Satın Al")');

  // Checkout page
  await expect(page).toHaveURL(/\/checkout\//);
  await page.fill('[name="notes"]', 'Please include revisions');
  await page.click('button:has-text("Ödemeye Geç")');

  // Payment (mock)
  await page.fill('[name="cardNumber"]', '4242424242424242');
  await page.fill('[name="expiry"]', '12/25');
  await page.fill('[name="cvc"]', '123');
  await page.click('button:has-text("Öde")');

  // Success page
  await expect(page).toHaveURL(/\/checkout\/success/);
  await expect(page.locator('.order-number')).toBeVisible();
});
```

---

### Phase 3: CI/CD Integration (1-2 hours)

#### Task 3.1: GitHub Actions E2E Pipeline

**Priority:** HIGH  
**Effort:** 1 hour

**Create `.github/workflows/e2e-tests.yml`:**

```yaml
name: E2E Tests

on:
  pull_request:
    branches: [main, master, develop]
  push:
    branches: [main, master]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

#### Task 3.2: Test Coverage Reporting

**Priority:** MEDIUM  
**Effort:** 30 min

**Setup Coverage Tools:**

```json
// package.json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

**Add Coverage Badges:**

- E2E test pass rate
- Test execution time
- Coverage percentage

---

### Phase 4: Documentation & Maintenance (1 hour)

#### Task 4.1: Test Documentation

**Priority:** MEDIUM  
**Effort:** 30 min

**Create `tests/README.md`:**

```markdown
# E2E Testing Guide

## Running Tests

### All Tests

npm run test:e2e

### Specific Test File

npx playwright test auth.spec.ts

### UI Mode (Interactive)

npm run test:e2e:ui

### Debug Mode

npm run test:e2e:debug

## Test Structure

- `tests/e2e/` - E2E test files
- `tests/mocks/` - MSW mock handlers
- `tests/fixtures/` - Test data fixtures
- `tests/utils/` - Test helper functions

## Writing Tests

See examples in:

- `auth.spec.ts` - Authentication flows
- `review-system.spec.ts` - Review system
- `comment-moderation.spec.ts` - Admin moderation

## CI/CD

Tests run automatically on:

- Pull requests to main/master/develop
- Push to main/master branches

View results: GitHub Actions → E2E Tests workflow
```

---

#### Task 4.2: Test Maintenance Guidelines

**Priority:** LOW  
**Effort:** 30 min

**Create Guidelines:**

1. **Test Naming Convention:**
   - Use descriptive names: "should approve comment when admin clicks approve button"
   - Follow pattern: "should [action] when [condition]"

2. **Test Independence:**
   - Each test must run independently
   - No shared state between tests
   - Use `beforeEach` for setup

3. **Test Data:**
   - Use factories for test data
   - Avoid hardcoded IDs
   - Clean up after tests

4. **Assertions:**
   - Be specific with selectors (data-testid)
   - Wait for elements properly
   - Check both visible and functional aspects

---

## 🎯 Success Criteria

### Must Have

- ✅ 15+ E2E tests implemented and passing
- ✅ Auth flow: 100% coverage
- ✅ Review system: 60% coverage
- ✅ Comment moderation: 60% coverage
- ✅ CI/CD pipeline running tests
- ✅ Test execution < 5 minutes
- ✅ Zero flaky tests (0% failure rate)

### Nice to Have

- ⭐ Visual regression testing
- ⭐ Performance tests (Lighthouse CI)
- ⭐ Accessibility tests (axe-core)
- ⭐ Cross-browser testing (Chrome, Firefox, Safari)

---

## 📈 Timeline

**Day 1 (4 hours):**

- Task 1.1: Playwright setup review (30 min)
- Task 1.2: Mock API setup (1 hour)
- Task 2.1: Auth flow tests (1.5 hours)
- Task 2.2: Start review tests (1 hour)

**Day 2 (4 hours):**

- Task 2.2: Complete review tests (1 hour)
- Task 2.3: Comment moderation tests (1.5 hours)
- Task 2.4: Order flow tests (1.5 hours)

**Day 3 (2-4 hours):**

- Task 3.1: CI/CD integration (1 hour)
- Task 3.2: Coverage reporting (30 min)
- Task 4.1: Documentation (30 min)
- Task 4.2: Guidelines (30 min)
- Buffer for debugging/fixes (1-2 hours)

**Total:** 10-12 hours over 3 days

---

## 🚨 Risks & Mitigation

### Risk 1: Flaky Tests

**Mitigation:**

- Use proper wait strategies (`waitFor`, `waitForLoadState`)
- Avoid `page.waitForTimeout()` (use explicit waits)
- Implement retry logic
- Use stable selectors (data-testid)

### Risk 2: Test Execution Time

**Mitigation:**

- Run tests in parallel (Playwright default)
- Use test sharding for CI
- Mock external API calls
- Optimize test setup/teardown

### Risk 3: Backend Dependency

**Mitigation:**

- Use MSW for API mocking
- Create test database with fixtures
- Implement test isolation

### Risk 4: CI/CD Integration Issues

**Mitigation:**

- Test locally with `CI=true` flag
- Use Docker for consistent environment
- Add retry logic to CI workflow

---

## 📊 Expected Outcomes

### Before Sprint 5:

- E2E test implementation: 5%
- Test coverage: <10%
- CI/CD: No automated tests
- Production confidence: 60%

### After Sprint 5:

- E2E test implementation: 60%
- Test coverage: 40-50%
- CI/CD: Automated on every PR
- Production confidence: 85%

---

## 🔄 Next Steps (Sprint 6 Candidates)

1. **Accessibility Testing** - WCAG 2.1 AA compliance
2. **Performance Optimization** - Core Web Vitals improvements
3. **Security Testing** - OWASP Top 10 validation
4. **Mobile E2E Tests** - iOS/Android browser testing
5. **Load Testing** - k6 or Artillery integration

---

## 📝 Notes

- Focus on **critical user paths** first
- Prioritize **test stability** over coverage
- Document **test patterns** for team
- Review and refactor tests regularly
- Keep tests **simple and maintainable**

---

**Last Updated:** October 26, 2025  
**Sprint Status:** 🔵 PLANNED  
**Owner:** Development Team
