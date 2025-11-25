/**
 * ================================================
 * ACCESSIBILITY E2E TESTS - REVIEW SYSTEM
 * ================================================
 * Sprint: Review System E2E Test Coverage
 * Story 4: Accessibility E2E Test (3 SP)
 *
 * Tests for WCAG 2.1 AA compliance:
 * - Keyboard navigation (Tab, Enter, Space, Arrow keys)
 * - Screen reader compatibility (ARIA labels, roles, live regions)
 * - Focus management (focus trap, focus visible)
 * - Color contrast (AA standard: 4.5:1)
 *
 * Tools:
 * - Playwright accessibility testing
 * - axe-core integration (automated WCAG checks)
 * - Keyboard event simulation
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since November 25, 2025
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const REVIEW_FORM_URL = '/dashboard/orders/test-order-123/review';
const REVIEW_LIST_URL = '/dashboard/reviews';

// ============================================================================
// TEST SUITE: KEYBOARD NAVIGATION
// ============================================================================

test.describe('Accessibility: Keyboard Navigation', () => {
  // ==========================================================================
  // US-6.1: REVIEW FORM KEYBOARD NAVIGATION
  // ==========================================================================

  test('should navigate review form using Tab key', async ({ page }) => {
    await page.goto(REVIEW_FORM_URL);
    await page.waitForSelector('[data-testid="review-form"]');

    // ========== STEP 1: Start focus on first element ==========
    await page.keyboard.press('Tab');

    // Should focus on overall rating
    const overallRating = page.locator('[data-testid="rating-overall"]');
    await expect(overallRating).toBeFocused();

    // ========== STEP 2: Tab to communication rating ==========
    await page.keyboard.press('Tab');
    const communicationRating = page.locator(
      '[data-testid="rating-communication"]'
    );
    await expect(communicationRating).toBeFocused();

    // ========== STEP 3: Tab to quality rating ==========
    await page.keyboard.press('Tab');
    const qualityRating = page.locator('[data-testid="rating-quality"]');
    await expect(qualityRating).toBeFocused();

    // ========== STEP 4: Tab to delivery rating ==========
    await page.keyboard.press('Tab');
    const deliveryRating = page.locator('[data-testid="rating-delivery"]');
    await expect(deliveryRating).toBeFocused();

    // ========== STEP 5: Tab to review text area ==========
    await page.keyboard.press('Tab');
    const reviewTextarea = page.locator('textarea[name="reviewText"]');
    await expect(reviewTextarea).toBeFocused();

    // ========== STEP 6: Tab to submit button ==========
    await page.keyboard.press('Tab');
    const submitButton = page.locator(
      'button[type="submit"]:has-text("Gönder")'
    );
    await expect(submitButton).toBeFocused();
  });

  test('should navigate star ratings using Arrow keys', async ({ page }) => {
    await page.goto(REVIEW_FORM_URL);
    await page.waitForSelector('[data-testid="review-form"]');

    // Focus on overall rating
    await page.keyboard.press('Tab');
    const overallRating = page.locator('[data-testid="rating-overall"]');
    await expect(overallRating).toBeFocused();

    // ========== Arrow Right: Increase rating ==========
    await page.keyboard.press('ArrowRight');
    await expect(
      overallRating.locator('[aria-checked="true"]')
    ).toHaveAttribute('aria-label', '2 yıldız');

    await page.keyboard.press('ArrowRight');
    await expect(
      overallRating.locator('[aria-checked="true"]')
    ).toHaveAttribute('aria-label', '3 yıldız');

    // ========== Arrow Left: Decrease rating ==========
    await page.keyboard.press('ArrowLeft');
    await expect(
      overallRating.locator('[aria-checked="true"]')
    ).toHaveAttribute('aria-label', '2 yıldız');

    // ========== Home: Jump to 1 star ==========
    await page.keyboard.press('Home');
    await expect(
      overallRating.locator('[aria-checked="true"]')
    ).toHaveAttribute('aria-label', '1 yıldız');

    // ========== End: Jump to 5 stars ==========
    await page.keyboard.press('End');
    await expect(
      overallRating.locator('[aria-checked="true"]')
    ).toHaveAttribute('aria-label', '5 yıldız');
  });

  test('should select star rating using Enter/Space keys', async ({ page }) => {
    await page.goto(REVIEW_FORM_URL);
    await page.waitForSelector('[data-testid="review-form"]');

    // Focus on rating
    await page.keyboard.press('Tab');
    const overallRating = page.locator('[data-testid="rating-overall"]');

    // Navigate to 4 stars
    await page.keyboard.press('End'); // Go to 5 stars
    await page.keyboard.press('ArrowLeft'); // Go to 4 stars

    // ========== Select using Enter key ==========
    await page.keyboard.press('Enter');
    await expect(
      overallRating.locator('[aria-checked="true"]')
    ).toHaveAttribute('aria-label', '4 yıldız');

    // Navigate to 3 stars
    await page.keyboard.press('ArrowLeft');

    // ========== Select using Space key ==========
    await page.keyboard.press('Space');
    await expect(
      overallRating.locator('[aria-checked="true"]')
    ).toHaveAttribute('aria-label', '3 yıldız');
  });

  test('should submit review form using Enter key', async ({ page }) => {
    await page.goto(REVIEW_FORM_URL);
    await page.waitForSelector('[data-testid="review-form"]');

    // Fill form using keyboard
    // Overall rating: 5 stars
    await page.keyboard.press('Tab');
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');

    // Communication rating: 5 stars
    await page.keyboard.press('Tab');
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');

    // Quality rating: 5 stars
    await page.keyboard.press('Tab');
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');

    // Delivery rating: 5 stars
    await page.keyboard.press('Tab');
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');

    // Review text
    await page.keyboard.press('Tab');
    await page.keyboard.type(
      'Excellent work! Very professional and delivered on time. Highly recommended for future projects.'
    );

    // Submit button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // Verify submission
    await expect(page.locator('.toast-success')).toBeVisible({ timeout: 5000 });
  });

  // ==========================================================================
  // US-6.2: REVIEW LIST KEYBOARD NAVIGATION
  // ==========================================================================

  test('should navigate review list using keyboard', async ({ page }) => {
    await page.goto(REVIEW_LIST_URL);
    await page.waitForSelector('[data-testid="reviews-list"]');

    // ========== Tab to first review ==========
    await page.keyboard.press('Tab');
    const firstReview = page
      .locator('[data-testid="review-item"]')
      .first()
      .locator('[tabindex="0"]');
    await expect(firstReview).toBeFocused();

    // ========== Enter to expand review ==========
    await page.keyboard.press('Enter');
    await expect(
      page.locator('[data-testid="review-details-expanded"]').first()
    ).toBeVisible();

    // ========== Tab to "Helpful" button ==========
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="helpful-button"]')).toBeFocused();

    // ========== Space to vote helpful ==========
    await page.keyboard.press('Space');
    await page.waitForResponse((res) => res.url().includes('/helpful'));

    // ========== Tab to "Flag" button ==========
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="flag-button"]')).toBeFocused();

    // ========== Enter to open flag modal ==========
    await page.keyboard.press('Enter');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  // ==========================================================================
  // US-6.3: MODAL FOCUS TRAP
  // ==========================================================================

  test('should trap focus inside review flag modal', async ({ page }) => {
    await page.goto(REVIEW_LIST_URL);
    await page.waitForSelector('[data-testid="reviews-list"]');

    // Open flag modal
    await page.click('[data-testid="flag-button"]');
    await page.waitForSelector('[role="dialog"]');

    // ========== Get all focusable elements in modal ==========
    const modal = page.locator('[role="dialog"]');
    const closeButton = modal.locator('[data-testid="close-modal"]');
    const flagReasonRadios = modal.locator(
      'input[type="radio"][name="reason"]'
    );
    const reasonTextarea = modal.locator('textarea[name="details"]');
    const submitButton = modal.locator('button[type="submit"]');
    const cancelButton = modal.locator('button:has-text("İptal")');

    // ========== Tab through modal elements ==========
    await page.keyboard.press('Tab'); // Close button
    await expect(closeButton).toBeFocused();

    await page.keyboard.press('Tab'); // First radio
    await expect(flagReasonRadios.first()).toBeFocused();

    await page.keyboard.press('Tab'); // Reason textarea
    await expect(reasonTextarea).toBeFocused();

    await page.keyboard.press('Tab'); // Submit button
    await expect(submitButton).toBeFocused();

    await page.keyboard.press('Tab'); // Cancel button
    await expect(cancelButton).toBeFocused();

    // ========== Tab again should wrap to close button (focus trap) ==========
    await page.keyboard.press('Tab');
    await expect(closeButton).toBeFocused();

    // ========== Shift+Tab should reverse navigation ==========
    await page.keyboard.press('Shift+Tab');
    await expect(cancelButton).toBeFocused();
  });

  test('should close modal with Escape key', async ({ page }) => {
    await page.goto(REVIEW_LIST_URL);
    await page.waitForSelector('[data-testid="reviews-list"]');

    // Open flag modal
    await page.click('[data-testid="flag-button"]');
    await page.waitForSelector('[role="dialog"]');

    // Verify modal visible
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // ========== Press Escape to close ==========
    await page.keyboard.press('Escape');

    // Verify modal closed
    await expect(modal).not.toBeVisible({ timeout: 1000 });

    // Focus should return to trigger button
    await expect(page.locator('[data-testid="flag-button"]')).toBeFocused();
  });
});

// ============================================================================
// TEST SUITE: SCREEN READER COMPATIBILITY
// ============================================================================

test.describe('Accessibility: Screen Reader Compatibility', () => {
  // ==========================================================================
  // US-6.4: ARIA LABELS AND ROLES
  // ==========================================================================

  test('should have proper ARIA labels on review form', async ({ page }) => {
    await page.goto(REVIEW_FORM_URL);
    await page.waitForSelector('[data-testid="review-form"]');

    // ========== Rating components ==========
    const overallRating = page.locator('[data-testid="rating-overall"]');
    await expect(overallRating).toHaveAttribute('role', 'radiogroup');
    await expect(overallRating).toHaveAttribute(
      'aria-label',
      /Genel değerlendirme|Overall rating/i
    );

    // Each star should have proper label
    const stars = overallRating.locator('[role="radio"]');
    const firstStar = stars.first();
    await expect(firstStar).toHaveAttribute('aria-label', /1 yıldız/);

    // ========== Review textarea ==========
    const reviewTextarea = page.locator('textarea[name="reviewText"]');
    await expect(reviewTextarea).toHaveAttribute(
      'aria-label',
      /Değerlendirme metni|Review text/i
    );
    await expect(reviewTextarea).toHaveAttribute('aria-required', 'true');

    // ========== Character counter ==========
    const charCounter = page.locator('[data-testid="char-counter"]');
    await expect(charCounter).toHaveAttribute('aria-live', 'polite');
    await expect(charCounter).toHaveAttribute('aria-atomic', 'true');

    // ========== Submit button ==========
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toHaveAttribute('aria-label', /.+/); // Has label
  });

  test('should announce validation errors to screen readers', async ({
    page,
  }) => {
    await page.goto(REVIEW_FORM_URL);
    await page.waitForSelector('[data-testid="review-form"]');

    // Submit empty form
    await page.click('button[type="submit"]');

    // ========== Verify error container has aria-live ==========
    const errorContainer = page.locator('[data-testid="form-errors"]');
    await expect(errorContainer).toHaveAttribute('role', 'alert');
    await expect(errorContainer).toHaveAttribute('aria-live', 'assertive');

    // ========== Verify error messages visible ==========
    await expect(errorContainer).toContainText(/zorunlu|required/i);

    // ========== Verify focus moves to first error ==========
    const firstErrorField = page.locator('[aria-invalid="true"]').first();
    await expect(firstErrorField).toBeFocused();
  });

  test('should have proper ARIA labels on review card', async ({ page }) => {
    await page.goto(REVIEW_LIST_URL);
    await page.waitForSelector('[data-testid="reviews-list"]');

    const firstReview = page.locator('[data-testid="review-item"]').first();

    // ========== Review card structure ==========
    await expect(firstReview).toHaveAttribute('role', 'article');
    await expect(firstReview).toHaveAttribute('aria-label', /.+/);

    // ========== Star rating display ==========
    const starRating = firstReview.locator('[data-testid="star-rating"]');
    await expect(starRating).toHaveAttribute('role', 'img');
    await expect(starRating).toHaveAttribute('aria-label', /\d\.\d yıldız/);

    // ========== Helpful button ==========
    const helpfulButton = firstReview.locator('[data-testid="helpful-button"]');
    await expect(helpfulButton).toHaveAttribute('aria-label', /Yardımcı/);
    await expect(helpfulButton).toHaveAttribute('aria-pressed', /(true|false)/);

    // ========== Timestamp ==========
    const timestamp = firstReview.locator('[data-testid="review-timestamp"]');
    await expect(timestamp).toHaveAttribute('aria-label', /.+/);
  });

  // ==========================================================================
  // US-6.5: LIVE REGION ANNOUNCEMENTS
  // ==========================================================================

  test('should announce helpful vote count changes', async ({ page }) => {
    await page.goto(REVIEW_LIST_URL);
    await page.waitForSelector('[data-testid="reviews-list"]');

    const firstReview = page.locator('[data-testid="review-item"]').first();
    const helpfulButton = firstReview.locator('[data-testid="helpful-button"]');

    // Get initial count
    const initialCount = await helpfulButton.textContent();

    // Click helpful button
    await helpfulButton.click();

    // ========== Verify live region announcement ==========
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toContainText(/Yardımcı.*işaretlendi/i, {
      timeout: 3000,
    });

    // Verify count updated
    const newCount = await helpfulButton.textContent();
    expect(newCount).not.toBe(initialCount);
  });

  test('should announce review submission success', async ({ page }) => {
    await page.goto(REVIEW_FORM_URL);
    await page.waitForSelector('[data-testid="review-form"]');

    // Fill and submit review
    await page.click(
      '[data-testid="rating-overall"] button[aria-label="5 yıldız"]'
    );
    await page.fill(
      'textarea[name="reviewText"]',
      'Great experience working with this seller. Delivered high quality work on time.'
    );
    await page.click('button[type="submit"]');

    // ========== Verify success announcement ==========
    const successToast = page.locator('.toast-success');
    await expect(successToast).toHaveAttribute('role', 'status');
    await expect(successToast).toHaveAttribute('aria-live', 'polite');
    await expect(successToast).toContainText(/başarıyla.*gönderildi/i);
  });
});

// ============================================================================
// TEST SUITE: AUTOMATED WCAG CHECKS (axe-core)
// ============================================================================

test.describe('Accessibility: WCAG 2.1 AA Compliance', () => {
  // ==========================================================================
  // US-6.6: AUTOMATED ACCESSIBILITY AUDIT
  // ==========================================================================

  test('should have no accessibility violations on review form', async ({
    page,
  }) => {
    await page.goto(REVIEW_FORM_URL);
    await page.waitForSelector('[data-testid="review-form"]');

    // Run axe accessibility audit
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // Assert no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have no accessibility violations on review list', async ({
    page,
  }) => {
    await page.goto(REVIEW_LIST_URL);
    await page.waitForSelector('[data-testid="reviews-list"]');

    // Run axe accessibility audit
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // Assert no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have no accessibility violations on flag modal', async ({
    page,
  }) => {
    await page.goto(REVIEW_LIST_URL);
    await page.waitForSelector('[data-testid="reviews-list"]');

    // Open flag modal
    await page.click('[data-testid="flag-button"]');
    await page.waitForSelector('[role="dialog"]');

    // Run axe accessibility audit
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // Assert no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  // ==========================================================================
  // US-6.7: COLOR CONTRAST COMPLIANCE
  // ==========================================================================

  test('should meet color contrast requirements (AA 4.5:1)', async ({
    page,
  }) => {
    await page.goto(REVIEW_FORM_URL);
    await page.waitForSelector('[data-testid="review-form"]');

    // Run axe with contrast rules only
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa'])
      .include('[data-testid="review-form"]')
      .analyze();

    // Filter for color contrast violations
    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast'
    );

    expect(contrastViolations).toEqual([]);
  });
});

// ============================================================================
// TEST SUITE: FOCUS MANAGEMENT
// ============================================================================

test.describe('Accessibility: Focus Management', () => {
  // ==========================================================================
  // US-6.8: FOCUS VISIBLE INDICATOR
  // ==========================================================================

  test('should show visible focus indicator on all interactive elements', async ({
    page,
  }) => {
    await page.goto(REVIEW_FORM_URL);
    await page.waitForSelector('[data-testid="review-form"]');

    // ========== Tab through form elements ==========
    const focusableElements = [
      '[data-testid="rating-overall"]',
      '[data-testid="rating-communication"]',
      'textarea[name="reviewText"]',
      'button[type="submit"]',
    ];

    for (const selector of focusableElements) {
      await page.keyboard.press('Tab');
      const element = page.locator(selector);
      await expect(element).toBeFocused();

      // ========== Verify focus outline visible ==========
      // Check computed styles for outline or box-shadow
      const outline = await element.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          boxShadow: styles.boxShadow,
        };
      });

      // Should have visible focus indicator
      const hasFocusIndicator =
        outline.outlineWidth !== '0px' ||
        outline.outline !== 'none' ||
        outline.boxShadow !== 'none';

      expect(hasFocusIndicator).toBe(true);
    }
  });

  test('should restore focus after modal closes', async ({ page }) => {
    await page.goto(REVIEW_LIST_URL);
    await page.waitForSelector('[data-testid="reviews-list"]');

    // Click flag button to open modal
    const flagButton = page.locator('[data-testid="flag-button"]').first();
    await flagButton.click();
    await page.waitForSelector('[role="dialog"]');

    // Close modal with Escape
    await page.keyboard.press('Escape');

    // ========== Focus should return to flag button ==========
    await expect(flagButton).toBeFocused({ timeout: 2000 });
  });

  // ==========================================================================
  // US-6.9: SKIP NAVIGATION LINKS
  // ==========================================================================

  test('should provide skip to content link', async ({ page }) => {
    await page.goto(REVIEW_LIST_URL);

    // Press Tab to focus skip link (usually first focusable element)
    await page.keyboard.press('Tab');

    const skipLink = page.locator('[data-testid="skip-to-content"]');
    await expect(skipLink).toBeFocused();

    // ========== Activate skip link ==========
    await page.keyboard.press('Enter');

    // Focus should jump to main content
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeFocused({ timeout: 1000 });
  });
});

// ============================================================================
// TEST SUITE: SEMANTIC HTML
// ============================================================================

test.describe('Accessibility: Semantic HTML', () => {
  // ==========================================================================
  // US-6.10: PROPER HEADING HIERARCHY
  // ==========================================================================

  test('should have proper heading hierarchy on review page', async ({
    page,
  }) => {
    await page.goto(REVIEW_LIST_URL);
    await page.waitForLoadState('networkidle');

    // Get all headings
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();

    // ========== Verify heading levels in order ==========
    const headingLevels: number[] = [];
    for (const heading of headings) {
      const tagName = await heading.evaluate((el) => el.tagName.toLowerCase());
      const level = parseInt(tagName.substring(1));
      headingLevels.push(level);
    }

    // Check no heading level is skipped
    for (let i = 1; i < headingLevels.length; i++) {
      const diff = headingLevels[i] - headingLevels[i - 1];
      // Should not skip levels (e.g., h2 → h4 without h3)
      expect(diff).toBeLessThanOrEqual(1);
    }

    // ========== Verify page has exactly one h1 ==========
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  // ==========================================================================
  // US-6.11: LANDMARK REGIONS
  // ==========================================================================

  test('should have proper landmark regions', async ({ page }) => {
    await page.goto(REVIEW_LIST_URL);
    await page.waitForLoadState('networkidle');

    // ========== Main content area ==========
    const mainLandmark = page.locator('main, [role="main"]');
    await expect(mainLandmark).toBeVisible();

    // ========== Navigation ==========
    const navLandmark = page.locator('nav, [role="navigation"]');
    await expect(navLandmark).toBeVisible();

    // ========== Banner (header) ==========
    const bannerLandmark = page.locator('header, [role="banner"]');
    await expect(bannerLandmark).toBeVisible();

    // ========== Content info (footer) ==========
    const footerLandmark = page.locator('footer, [role="contentinfo"]');
    await expect(footerLandmark).toBeVisible();
  });

  // ==========================================================================
  // US-6.12: FORM FIELD ASSOCIATIONS
  // ==========================================================================

  test('should properly associate labels with form fields', async ({
    page,
  }) => {
    await page.goto(REVIEW_FORM_URL);
    await page.waitForSelector('[data-testid="review-form"]');

    // ========== Review textarea ==========
    const reviewTextarea = page.locator('textarea[name="reviewText"]');
    const textareaId = await reviewTextarea.getAttribute('id');

    // Find associated label
    const label = page.locator(`label[for="${textareaId}"]`);
    await expect(label).toBeVisible();
    await expect(label).toContainText(/.+/); // Has text content

    // ========== Click label should focus input ==========
    await label.click();
    await expect(reviewTextarea).toBeFocused();
  });
});

// ============================================================================
// TEST SUITE: ERROR HANDLING ACCESSIBILITY
// ============================================================================

test.describe('Accessibility: Error Handling', () => {
  // ==========================================================================
  // US-6.13: VALIDATION ERROR ANNOUNCEMENTS
  // ==========================================================================

  test('should announce form validation errors', async ({ page }) => {
    await page.goto(REVIEW_FORM_URL);
    await page.waitForSelector('[data-testid="review-form"]');

    // Submit incomplete form
    await page.click('button[type="submit"]');

    // ========== Verify error summary container ==========
    const errorSummary = page.locator('[data-testid="error-summary"]');
    await expect(errorSummary).toHaveAttribute('role', 'alert');
    await expect(errorSummary).toHaveAttribute('aria-live', 'assertive');
    await expect(errorSummary).toHaveAttribute('tabindex', '-1');

    // ========== Focus should move to error summary ==========
    await expect(errorSummary).toBeFocused();

    // ========== Each field error should have aria-describedby ==========
    const ratingField = page.locator('[data-testid="rating-overall"]');
    const ariaDescribedBy = await ratingField.getAttribute('aria-describedby');
    expect(ariaDescribedBy).toBeTruthy();

    // Verify error message element exists
    const errorMessage = page.locator(`#${ariaDescribedBy}`);
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/zorunlu|required/i);
  });

  test('should mark invalid fields with aria-invalid', async ({ page }) => {
    await page.goto(REVIEW_FORM_URL);
    await page.waitForSelector('[data-testid="review-form"]');

    // Type short text (less than 50 chars minimum)
    const reviewTextarea = page.locator('textarea[name="reviewText"]');
    await reviewTextarea.fill('Too short');

    // Blur to trigger validation
    await page.keyboard.press('Tab');

    // ========== Field should be marked invalid ==========
    await expect(reviewTextarea).toHaveAttribute('aria-invalid', 'true');

    // ========== Error message should be associated ==========
    const ariaDescribedBy =
      await reviewTextarea.getAttribute('aria-describedby');
    expect(ariaDescribedBy).toBeTruthy();

    const errorMessage = page.locator(`#${ariaDescribedBy}`);
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/En az 50 karakter/i);
  });
});

// ============================================================================
// TEST SUITE: LOADING STATES & PROGRESS
// ============================================================================

test.describe('Accessibility: Loading States', () => {
  // ==========================================================================
  // US-6.14: LOADING INDICATORS
  // ==========================================================================

  test('should announce loading state to screen readers', async ({ page }) => {
    await page.goto(REVIEW_LIST_URL);

    // Trigger pagination (loading state)
    await page.click('[data-testid="next-page-button"]');

    // ========== Verify loading indicator ==========
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    await expect(loadingSpinner).toHaveAttribute('role', 'status');
    await expect(loadingSpinner).toHaveAttribute('aria-live', 'polite');
    await expect(loadingSpinner).toHaveAttribute('aria-label', /Yükleniyor/i);

    // Wait for loading to complete
    await expect(loadingSpinner).not.toBeVisible({ timeout: 5000 });
  });

  test('should disable submit button during review submission', async ({
    page,
  }) => {
    await page.goto(REVIEW_FORM_URL);
    await page.waitForSelector('[data-testid="review-form"]');

    // Fill form
    await page.click(
      '[data-testid="rating-overall"] button[aria-label="5 yıldız"]'
    );
    await page.fill(
      'textarea[name="reviewText"]',
      'Excellent service. Will definitely work with this seller again.'
    );

    // Submit
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // ========== Button should be disabled during submission ==========
    await expect(submitButton).toBeDisabled({ timeout: 1000 });
    await expect(submitButton).toHaveAttribute('aria-busy', 'true');

    // ========== Loading spinner should be visible ==========
    const buttonSpinner = submitButton.locator(
      '[data-testid="button-spinner"]'
    );
    await expect(buttonSpinner).toBeVisible();
    await expect(buttonSpinner).toHaveAttribute('aria-hidden', 'true');
  });
});
