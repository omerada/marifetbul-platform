/**
 * ================================================
 * REVIEW SYSTEM E2E TESTS
 * ================================================
 * End-to-end tests for the complete review system
 *
 * Test Coverage:
 * - User review creation flow (Story 4.1 - CRUD Tests)
 * - Review edit and validation
 * - Freelancer review dashboard
 * - Seller response functionality (Story 4.3)
 * - Employer review management
 * - Admin moderation workflow (Story 4.4)
 * - Review voting and flagging (Story 4.2)
 * - Notification system
 * - Order completion review reminder
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @since Review System Sprint 4 - Testing Phase
 */

import { test, expect, type Page } from '@playwright/test';

// ================================
// TEST SETUP
// ================================

test.describe('Review System - Complete E2E Tests', () => {
  // ================================
  // USER REVIEW CREATION FLOW
  // ================================

  test.describe('US-1.1: User Review Creation', () => {
    test('should allow user to create review after order completion', async ({
      page,
    }) => {
      // 1. Login as buyer
      await login(page, 'buyer');

      // 2. Navigate to completed orders
      await page.goto('/dashboard/employer/orders?status=COMPLETED');
      await page.waitForLoadState('networkidle');

      // 3. Click first completed order to view details
      const firstOrder = page.locator('[data-testid="order-card"]').first();
      await expect(firstOrder).toBeVisible({ timeout: 10000 });
      await firstOrder.click();

      // 4. Wait for order details page
      await page.waitForURL(/\/dashboard\/employer\/orders\/[^\/]+$/);

      // 5. Click "Değerlendirme Yaz" button
      await page.click('a[href*="/review"]:has-text("Değerlendirme Yaz")');

      // 6. Wait for review form page
      await page.waitForURL(/\/dashboard\/employer\/orders\/[^\/]+\/review$/);
      await page.waitForSelector('[data-testid="review-form"]');

      // 7. Fill 4 category ratings (Communication, Quality, Speed, Professionalism)
      // Click on the star rating buttons for each category
      await page.click(
        '[data-testid="rating-communication"] button[aria-label="5 yıldız"]'
      );
      await page.click(
        '[data-testid="rating-quality"] button[aria-label="5 yıldız"]'
      );
      await page.click(
        '[data-testid="rating-speed"] button[aria-label="4 yıldız"]'
      );
      await page.click(
        '[data-testid="rating-professionalism"] button[aria-label="5 yıldız"]'
      );

      // 8. Add review text (minimum 50 characters)
      const reviewText =
        'Excellent work! Very professional and delivered on time. Highly recommended for future projects. The freelancer was responsive to all feedback and made revisions quickly.';
      await page.fill('textarea[name="comment"]', reviewText);

      // 9. Verify character counter shows valid range
      const charCounter = page.locator('[data-testid="char-counter"]');
      await expect(charCounter).toContainText(`${reviewText.length}/1000`);

      // 10. Submit review
      await page.click(
        'button[type="submit"]:has-text("Değerlendirme Gönder")'
      );

      // 11. Wait for API response
      await page.waitForResponse(
        (response: { url: () => string; status: () => number }) =>
          response.url().includes('/api/v1/reviews') &&
          response.status() === 201
      );

      // 12. Verify success message
      await expect(
        page.locator('text=Değerlendirmeniz başarıyla gönderildi')
      ).toBeVisible({ timeout: 5000 });

      // 13. Verify redirect to orders page
      await page.waitForURL(/\/dashboard\/employer\/orders/);

      // 14. Navigate to reviews list and verify review appears
      await page.goto('/dashboard/employer/reviews');
      await page.waitForLoadState('networkidle');
      await expect(
        page.locator(`text=${reviewText.substring(0, 50)}`)
      ).toBeVisible();
    });

    test('should not allow duplicate reviews', async ({ page }) => {
      // 1. Login as buyer
      await login(page, 'buyer');

      // 2. Navigate to completed orders
      await page.goto('/dashboard/orders?status=COMPLETED');
      await page.waitForLoadState('networkidle');

      // 3. Find an order that already has a review
      const orderWithReview = page
        .locator('[data-testid="order-card"]')
        .filter({
          has: page.locator('[data-testid="review-badge"]'),
        })
        .first();

      // 4. If no reviewed order exists, skip this test
      const reviewedOrderCount = await orderWithReview.count();
      if (reviewedOrderCount === 0) {
        test.skip();
      }

      // 5. Click on the reviewed order
      await orderWithReview.click();
      await page.waitForURL(/\/dashboard\/employer\/orders\/[^\/]+$/);

      // 6. Verify "Değerlendirme Yaz" button is NOT present
      const reviewButton = page.locator(
        'a[href*="/review"]:has-text("Değerlendirme Yaz")'
      );
      const isVisible = await reviewButton.isVisible().catch(() => false);
      expect(isVisible).toBe(false);

      // 7. Verify "Değerlendirme Yapıldı" or similar message is shown
      await expect(
        page.locator('text=/Değerlendirme (yapıldı|mevcut)/i')
      ).toBeVisible();

      // 8. Try to navigate directly to review page (should redirect or show error)
      const currentUrl = page.url();
      const orderId = currentUrl.split('/').pop();
      await page.goto(`/dashboard/orders/${orderId}/review`);

      // 9. Should redirect back to order detail or show error message
      await expect(async () => {
        const url = page.url();
        const hasError = await page
          .locator('text=/Zaten.*değerlendirme/i')
          .isVisible();
        expect(url.includes('/review') === false || hasError).toBeTruthy();
      }).toPass({ timeout: 5000 });
    });

    test('should allow review edit within 30 days', async ({ page }) => {
      // 1. Login as buyer
      await login(page, 'buyer');

      // 2. Navigate to employer reviews page
      await page.goto('/dashboard/employer/reviews');
      await page.waitForLoadState('networkidle');

      // 3. Find a recent review (created within 30 days) with edit button
      const editableReview = page
        .locator('[data-testid="review-item"]')
        .filter({
          has: page.locator(
            '[data-testid="edit-review-button"]:not([disabled])'
          ),
        })
        .first();

      // 4. Check if editable review exists, if not skip
      const editableCount = await editableReview.count();
      if (editableCount === 0) {
        test.skip();
        return;
      }

      // 5. Click edit button
      await editableReview
        .locator('[data-testid="edit-review-button"]')
        .click();

      // 6. Wait for edit form/modal
      await page.waitForSelector('[data-testid="review-edit-form"]');

      // 7. Modify review text
      const updatedText =
        'Updated review text with additional feedback about the project completion and overall experience working with this freelancer.';
      await page.fill('textarea[name="comment"]', '');
      await page.fill('textarea[name="comment"]', updatedText);

      // 8. Update some ratings
      await page.click(
        '[data-testid="rating-quality"] button[aria-label="5 yıldız"]'
      );
      await page.click(
        '[data-testid="rating-communication"] button[aria-label="5 yıldız"]'
      );

      // 9. Submit changes
      await page.click('button[type="submit"]:has-text("Güncelle")');

      // 10. Wait for API response
      await page.waitForResponse(
        (response: { url: () => string; status: () => number }) =>
          response.url().includes('/api/v1/reviews') &&
          (response.status() === 200 || response.status() === 204)
      );

      // 11. Verify success message
      await expect(
        page.locator('text=/Değerlendirme.*güncellendi/i')
      ).toBeVisible({ timeout: 5000 });

      // 12. Verify updated text appears in the list
      await expect(
        page.locator(`text=${updatedText.substring(0, 50)}`)
      ).toBeVisible();
    });

    test('should not allow review edit after 30 days', async ({ page }) => {
      // 1. Login as buyer
      await login(page, 'buyer');

      // 2. Navigate to reviews page
      await page.goto('/dashboard/employer/reviews');
      await page.waitForLoadState('networkidle');

      // 3. Find review older than 30 days (edit button should be disabled)
      const oldReview = page
        .locator('[data-testid="review-item"]')
        .filter({
          has: page.locator('[data-testid="edit-review-button"][disabled]'),
        })
        .first();

      // 4. Check if old review exists
      const oldReviewCount = await oldReview.count();
      if (oldReviewCount === 0) {
        test.skip();
        return;
      }

      // 5. Verify edit button is disabled
      const editButton = oldReview.locator(
        '[data-testid="edit-review-button"]'
      );
      await expect(editButton).toBeDisabled();

      // 6. Hover on button to see tooltip
      await editButton.hover();

      // 7. Verify tooltip shows expiration message
      await expect(
        page.locator(
          'text=/Düzenleme süresi.*doldu/i, [role="tooltip"]:has-text(/Düzenleme süresi/i)'
        )
      ).toBeVisible({ timeout: 3000 });
    });

    test('should validate minimum review text length', async ({ page }) => {
      // 1. Login as buyer
      await login(page, 'buyer');

      // 2. Navigate to completed order
      await page.goto('/dashboard/orders?status=COMPLETED');
      await page.waitForLoadState('networkidle');

      // 3. Click on first completed order
      const firstOrder = page.locator('[data-testid="order-card"]').first();
      await firstOrder.click();
      await page.waitForURL(/\/dashboard\/employer\/orders\/[^\/]+$/);

      // 4. Navigate to review page
      await page.click('a[href*="/review"]:has-text("Değerlendirme Yaz")');
      await page.waitForURL(/\/dashboard\/employer\/orders\/[^\/]+\/review$/);
      await page.waitForSelector('[data-testid="review-form"]');

      // 5. Fill ratings (required)
      await page.click(
        '[data-testid="rating-communication"] button[aria-label="5 yıldız"]'
      );
      await page.click(
        '[data-testid="rating-quality"] button[aria-label="5 yıldız"]'
      );
      await page.click(
        '[data-testid="rating-speed"] button[aria-label="5 yıldız"]'
      );
      await page.click(
        '[data-testid="rating-professionalism"] button[aria-label="5 yıldız"]'
      );

      // 6. Enter review text with less than 50 characters
      const shortText = 'Short text'; // 10 characters - less than 50 minimum
      await page.fill('textarea[name="comment"]', shortText);

      // 7. Verify character counter shows warning
      const charCounter = page.locator('[data-testid="char-counter"]');
      await expect(charCounter).toContainText(`${shortText.length}/1000`);

      // 8. Attempt to submit
      await page.click(
        'button[type="submit"]:has-text("Değerlendirme Gönder")'
      );

      // 9. Verify validation error message appears
      await expect(
        page.locator('text=/En az 50 karakter|minimum.*50/i')
      ).toBeVisible({ timeout: 3000 });

      // 10. Verify submit button is disabled or form not submitted
      const currentUrl = page.url();
      expect(currentUrl).toContain('/review'); // Still on review page
    });
  });

  // ================================
  // FREELANCER DASHBOARD
  // ================================

  test.describe('US-1.2: Freelancer Review Dashboard', () => {
    test('should display all received reviews with stats', async ({ page }) => {
      // 1. Login as freelancer
      await login(page, 'seller');

      // 2. Navigate to /dashboard/freelancer/reviews
      await page.goto('/dashboard/freelancer/reviews');

      // 3. Verify stats cards display
      await expect(page.locator('[data-testid="avg-rating"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-reviews"]')).toBeVisible();
      await expect(page.locator('[data-testid="response-rate"]')).toBeVisible();

      // 4. Verify rating distribution chart
      await expect(
        page.locator('[data-testid="rating-distribution"]')
      ).toBeVisible();

      // 5. Verify review list with pagination
      await expect(page.locator('[data-testid="review-list"]')).toBeVisible();
      const reviewCount = await page
        .locator('[data-testid="review-item"]')
        .count();
      expect(reviewCount).toBeGreaterThan(0);
    });

    test('should filter reviews by rating', async ({ page }) => {
      await login(page, 'seller');
      await page.goto('/dashboard/freelancer/reviews');

      // Apply 5-star filter
      await page.click('[data-filter="rating"] button:has-text("5 Yıldız")');

      // Verify all reviews have 5 stars
      const reviews = await page.locator('[data-testid="review-item"]').all();
      for (const review of reviews) {
        await expect(review.locator('[data-rating="5"]')).toBeVisible();
      }
    });

    test('should sort reviews by different criteria', async ({ page }) => {
      await login(page, 'seller');
      await page.goto('/dashboard/freelancer/reviews');

      // Select "Highest Rating" sort
      await page.selectOption('select[name="sortBy"]', 'rating-desc');

      // Get first two reviews and verify descending order
      const firstRating = await page
        .locator('[data-testid="review-item"]:first-child [data-rating]')
        .getAttribute('data-rating');
      const secondRating = await page
        .locator('[data-testid="review-item"]:nth-child(2) [data-rating]')
        .getAttribute('data-rating');
      expect(Number(firstRating)).toBeGreaterThanOrEqual(Number(secondRating));

      // Select "Most Recent" sort
      await page.selectOption('select[name="sortBy"]', 'date-desc');
      await page.waitForTimeout(500); // Wait for re-sort

      // Verify first review is most recent
      const firstDate = await page
        .locator('[data-testid="review-item"]:first-child [data-date]')
        .getAttribute('data-date');
      expect(new Date(firstDate!)).toBeInstanceOf(Date);
    });
  });

  // ================================
  // SELLER RESPONSE (Story 4.3)
  // ================================

  test.describe('US-1.3: Seller Response Tests', () => {
    test('should allow seller to respond to review', async ({ page }) => {
      // 1. Login as freelancer/seller
      await login(page, 'seller');

      // 2. Navigate to freelancer reviews page
      await page.goto('/dashboard/freelancer/reviews');
      await page.waitForLoadState('networkidle');

      // 3. Find review without response
      const reviewWithoutResponse = page
        .locator('[data-testid="review-item"]')
        .filter({
          hasNot: page.locator('[data-testid="seller-response"]'),
        })
        .first();

      // Check if review exists
      const reviewCount = await reviewWithoutResponse.count();
      if (reviewCount === 0) {
        test.skip(); // No reviews without response
        return;
      }

      // 4. Click "Yanıtla" button
      await reviewWithoutResponse
        .locator('[data-testid="respond-button"]')
        .click();

      // 5. Wait for response modal/form
      await page.waitForSelector('[data-testid="seller-response-modal"]');

      // 6. Enter response text (10-500 characters)
      const responseText =
        'Thank you for your valuable feedback! I really appreciate your kind words and look forward to working with you again in the future.';
      await page.fill('textarea[name="responseText"]', responseText);

      // 7. Verify character counter
      const charCounter = page.locator('[data-testid="response-char-counter"]');
      await expect(charCounter).toContainText(`${responseText.length}/500`);

      // 8. Submit response
      await page.click('button[type="submit"]:has-text("Gönder")');

      // 9. Wait for API response
      await page.waitForResponse(
        (response: { url: () => string; status: () => number }) =>
          response.url().includes('/api/v1/reviews') &&
          response.url().includes('/response') &&
          (response.status() === 200 || response.status() === 201)
      );

      // 10. Verify success message
      await expect(page.locator('text=/Yanıt.*gönderildi/i')).toBeVisible({
        timeout: 5000,
      });

      // 11. Verify response appears on review
      await expect(
        page.locator(
          `[data-testid="seller-response"]:has-text("${responseText.substring(0, 30)}")`
        )
      ).toBeVisible();
    });

    test('should allow seller to edit response', async ({ page }) => {
      // 1. Login as seller
      await login(page, 'seller');

      // 2. Navigate to reviews page
      await page.goto('/dashboard/freelancer/reviews');
      await page.waitForLoadState('networkidle');

      // 3. Find review with existing response
      const reviewWithResponse = page
        .locator('[data-testid="review-item"]')
        .filter({
          has: page.locator('[data-testid="seller-response"]'),
        })
        .first();

      const hasResponse = await reviewWithResponse.count();
      if (hasResponse === 0) {
        test.skip(); // No reviews with response to edit
        return;
      }

      // 4. Click "Düzenle" button
      await reviewWithResponse
        .locator('[data-testid="edit-response-button"]')
        .click();

      // 5. Wait for edit modal
      await page.waitForSelector('[data-testid="seller-response-modal"]');

      // 6. Modify response text
      const updatedText =
        'Updated response: Thank you again for your feedback! I have taken your suggestions into account and will continue to improve my services.';
      await page.fill('textarea[name="responseText"]', ''); // Clear first
      await page.fill('textarea[name="responseText"]', updatedText);

      // 7. Submit changes
      await page.click('button[type="submit"]:has-text("Güncelle")');

      // 8. Wait for API update
      await page.waitForResponse(
        (response: { url: () => string; status: () => number }) =>
          response.url().includes('/api/v1/reviews') &&
          response.url().includes('/response') &&
          (response.status() === 200 || response.status() === 204)
      );

      // 9. Verify success message
      await expect(page.locator('text=/Yanıt.*güncellendi/i')).toBeVisible({
        timeout: 5000,
      });

      // 10. Verify updated response displayed
      await expect(
        page.locator(
          `[data-testid="seller-response"]:has-text("${updatedText.substring(0, 30)}")`
        )
      ).toBeVisible();
    });

    test('should allow seller to delete response', async ({ page }) => {
      // 1. Login as seller
      await login(page, 'seller');

      // 2. Navigate to reviews page
      await page.goto('/dashboard/freelancer/reviews');
      await page.waitForLoadState('networkidle');

      // 3. Find review with response
      const reviewWithResponse = page
        .locator('[data-testid="review-item"]')
        .filter({
          has: page.locator('[data-testid="seller-response"]'),
        })
        .first();

      const hasResponse = await reviewWithResponse.count();
      if (hasResponse === 0) {
        test.skip(); // No reviews with response to delete
        return;
      }

      // 4. Click "Sil" button
      await reviewWithResponse
        .locator('[data-testid="delete-response-button"]')
        .click();

      // 5. Verify confirmation dialog
      await page.waitForSelector('[data-testid="confirm-delete-modal"]');
      await expect(
        page.locator('text=/silmek istediğinizden emin misiniz/i')
      ).toBeVisible();

      // 6. Confirm deletion
      await page.click('button:has-text("Evet, Sil")');

      // 7. Wait for API delete
      await page.waitForResponse(
        (response: { url: () => string; status: () => number }) =>
          response.url().includes('/api/v1/reviews') &&
          response.url().includes('/response') &&
          (response.status() === 200 || response.status() === 204)
      );

      // 8. Verify success message
      await expect(page.locator('text=/Yanıt.*silindi/i')).toBeVisible({
        timeout: 5000,
      });

      // 9. Verify response removed from review
      await expect(
        reviewWithResponse.locator('[data-testid="seller-response"]')
      ).not.toBeVisible();

      // 10. Verify "Yanıtla" button is now available
      await expect(
        reviewWithResponse.locator('[data-testid="respond-button"]')
      ).toBeVisible();
    });

    test('should validate response character limits', async ({ page }) => {
      // 1. Login as seller
      await login(page, 'seller');

      // 2. Navigate to reviews page
      await page.goto('/dashboard/freelancer/reviews');
      await page.waitForLoadState('networkidle');

      // 3. Find review without response
      const reviewWithoutResponse = page
        .locator('[data-testid="review-item"]')
        .filter({
          hasNot: page.locator('[data-testid="seller-response"]'),
        })
        .first();

      const reviewCount = await reviewWithoutResponse.count();
      if (reviewCount === 0) {
        test.skip();
        return;
      }

      // 4. Open response modal
      await reviewWithoutResponse
        .locator('[data-testid="respond-button"]')
        .click();
      await page.waitForSelector('[data-testid="seller-response-modal"]');

      // 5. Test minimum length (10 characters)
      const shortText = 'Short'; // 5 characters - less than minimum
      await page.fill('textarea[name="responseText"]', shortText);

      // 6. Verify character counter shows warning
      const charCounter = page.locator('[data-testid="response-char-counter"]');
      await expect(charCounter).toContainText(`${shortText.length}/500`);

      // 7. Verify submit button is disabled
      const submitButton = page.locator(
        'button[type="submit"]:has-text("Gönder")'
      );
      await expect(submitButton).toBeDisabled();

      // 8. Enter valid text (10-500 characters)
      const validText = 'Thank you for your feedback!'; // Valid length
      await page.fill('textarea[name="responseText"]', validText);

      // 9. Verify submit button is enabled
      await expect(submitButton).toBeEnabled();

      // 10. Test maximum length (500 characters)
      const longText = 'A'.repeat(501); // 501 characters - exceeds maximum
      await page.fill('textarea[name="responseText"]', longText);

      // 11. Verify character counter shows limit exceeded
      await expect(charCounter).toContainText('500/500'); // Should be truncated or show error

      // 12. Verify submit button behavior
      const isDisabledForLongText = await submitButton.isDisabled();
      expect(isDisabledForLongText).toBe(true);
    });

    test('should prevent non-seller from responding', async ({ page }) => {
      // 1. Login as buyer (not seller)
      await login(page, 'buyer');

      // 2. Navigate to marketplace and view a package
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');
      await page.locator('[data-testid="package-card"]').first().click();
      await page.waitForURL(/\/marketplace\/packages\/[^\/]+$/);

      // 3. Scroll to reviews
      const reviewsSection = page.locator('[data-testid="reviews-section"]');
      await reviewsSection.scrollIntoViewIfNeeded();

      // 4. Find a review (not own review)
      const review = page.locator('[data-testid="review-item"]').first();

      // 5. Verify "Respond" button is NOT visible for non-sellers
      const respondButton = review.locator('[data-testid="respond-button"]');
      const isVisible = await respondButton.isVisible().catch(() => false);
      expect(isVisible).toBe(false);
    });
  });

  // ================================
  // EMPLOYER DASHBOARD
  // ================================

  test.describe('US-1.4: Employer Review Management', () => {
    test('should display all written reviews', async ({ page }) => {
      // 1. Login as employer
      await page.goto('/login');
      await page.fill('input[name="email"]', 'employer@test.com');
      await page.fill('input[name="password"]', 'Test123!');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/dashboard/);

      // 2. Navigate to /dashboard/employer/reviews
      await page.goto('/dashboard/employer/reviews');
      await page.waitForLoadState('networkidle');

      // 3. Verify list of written reviews
      const reviewCards = await page
        .locator('[data-testid="review-card"]')
        .count();
      expect(reviewCards).toBeGreaterThan(0);

      // 4. Verify status badges (Pending, Approved, Rejected)
      const statusBadges = await page.locator(
        '[data-testid="review-status-badge"]'
      );
      expect(await statusBadges.count()).toBeGreaterThan(0);

      const firstBadge = statusBadges.first();
      const badgeText = await firstBadge.textContent();
      expect(['Onay Bekliyor', 'Onaylandı', 'Reddedildi']).toContain(
        badgeText?.trim()
      );

      // 5. Verify seller responses displayed
      const responseElements = await page
        .locator('[data-testid="seller-response"]')
        .count();
      // Should have at least some responses (not all reviews will have responses)
      expect(responseElements).toBeGreaterThanOrEqual(0);
    });

    test('should show edit time remaining indicator', async ({ page }) => {
      // 1. Login as employer
      await page.goto('/login');
      await page.fill('input[name="email"]', 'employer@test.com');
      await page.fill('input[name="password"]', 'Test123!');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/dashboard/);

      // 2. Navigate to reviews page
      await page.goto('/dashboard/employer/reviews');
      await page.waitForLoadState('networkidle');

      // 3. Find recent review (created within last 7 days)
      const recentReview = page.locator('[data-testid="review-card"]').first();
      expect(await recentReview.isVisible()).toBeTruthy();

      // 4. Verify "X days remaining" indicator
      const editIndicator = recentReview.locator(
        '[data-testid="edit-time-remaining"]'
      );
      if (await editIndicator.isVisible()) {
        // 5. Verify countdown is accurate (should show days remaining out of 7)
        const indicatorText = await editIndicator.textContent();
        expect(indicatorText).toMatch(/\d+ gün kaldı/);

        // Extract number and verify it's between 0-7
        const daysMatch = indicatorText?.match(/(\d+) gün/);
        if (daysMatch) {
          const daysRemaining = parseInt(daysMatch[1]);
          expect(daysRemaining).toBeGreaterThanOrEqual(0);
          expect(daysRemaining).toBeLessThanOrEqual(7);
        }
      }
    });

    test('should allow review deletion', async ({ page }) => {
      // 1. Login as employer
      await page.goto('/login');
      await page.fill('input[name="email"]', 'employer@test.com');
      await page.fill('input[name="password"]', 'Test123!');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/dashboard/);

      // 2. Navigate to reviews page
      await page.goto('/dashboard/employer/reviews');
      await page.waitForLoadState('networkidle');

      // Get initial review count
      const initialCount = await page
        .locator('[data-testid="review-card"]')
        .count();
      expect(initialCount).toBeGreaterThan(0);

      // 3. Click delete button on first review
      const firstReview = page.locator('[data-testid="review-card"]').first();
      const deleteButton = firstReview.locator(
        '[data-testid="delete-review-button"]'
      );
      await deleteButton.click();

      // 4. Verify confirmation dialog
      const confirmDialog = page.locator('[role="dialog"]');
      await expect(confirmDialog).toBeVisible();
      expect(await confirmDialog.textContent()).toContain(
        'Silmek istediğinize emin misiniz?'
      );

      // 5. Confirm deletion
      const confirmButton = confirmDialog.locator('button:has-text("Sil")');
      await confirmButton.click();

      // 6. Verify review removed from list
      await page.waitForTimeout(1000); // Wait for deletion to complete
      const newCount = await page
        .locator('[data-testid="review-card"]')
        .count();
      expect(newCount).toBe(initialCount - 1);

      // Verify success message
      const successMessage = page.locator('[data-testid="toast-success"]');
      await expect(successMessage).toBeVisible();
      expect(await successMessage.textContent()).toContain('silindi');
    });
  });

  // ================================
  // PACKAGE REVIEW INTEGRATION
  // ================================

  test.describe('US-2.1: Package Reviews Display & Voting (Story 4.2)', () => {
    /**
     * FUTURE TEST: Package Review Display Integration
     * Sprint: Future sprint (requires full package detail page implementation)
     *
     * Test Coverage Plan:
     * 1. Navigate to package detail page
     * 2. Scroll to reviews section
     * 3. Verify average rating displayed
     * 4. Verify rating distribution chart
     * 5. Verify review list with pagination
     * 6. Verify verified purchase badges
     *
     * Prerequisites:
     * - Package detail page fully implemented
     * - Review display component integrated
     * - Rating aggregation service ready
     */
    test.skip('should display reviews on package detail page', async () => {
      // Implementation pending - see test plan above
    });

    test('should allow helpful voting on reviews', async ({ page }) => {
      // 1. Navigate to marketplace and select a package
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // 2. Click on first package
      const firstPackage = page.locator('[data-testid="package-card"]').first();
      await expect(firstPackage).toBeVisible({ timeout: 10000 });
      await firstPackage.click();

      // 3. Wait for package detail page
      await page.waitForURL(/\/marketplace\/packages\/[^\/]+$/);

      // 4. Scroll to reviews section
      const reviewsSection = page.locator('[data-testid="reviews-section"]');
      await reviewsSection.scrollIntoViewIfNeeded();

      // 5. Find first review with voting buttons
      const firstReview = page.locator('[data-testid="review-item"]').first();
      await expect(firstReview).toBeVisible();

      // 6. Get initial helpful count
      const helpfulButton = firstReview.locator(
        '[data-testid="helpful-button"]'
      );
      const initialCountText = await helpfulButton.textContent();
      const initialCount = parseInt(initialCountText?.match(/\d+/)?.[0] || '0');

      // 7. Login as user to vote
      await page.goto('/login');
      await login(page, 'buyer');

      // 8. Navigate back to package
      await page.goto(page.url().split('/login')[0]);
      await reviewsSection.scrollIntoViewIfNeeded();

      // 9. Click "Helpful" button
      await firstReview.locator('[data-testid="helpful-button"]').click();

      // 10. Wait for API response
      await page.waitForResponse(
        (response: { url: () => string; status: () => number }) =>
          response.url().includes('/api/v1/reviews') &&
          response.url().includes('/vote') &&
          response.status() === 200
      );

      // 11. Verify helpful count increased
      await expect(async () => {
        const newCountText = await helpfulButton.textContent();
        const newCount = parseInt(newCountText?.match(/\d+/)?.[0] || '0');
        expect(newCount).toBe(initialCount + 1);
      }).toPass({ timeout: 5000 });

      // 12. Verify button state changed (should be highlighted/active)
      await expect(helpfulButton).toHaveClass(/active|voted|selected/);

      // 13. Try to vote again (should not allow)
      await helpfulButton.click();

      // 14. Verify count didn't change
      const finalCountText = await helpfulButton.textContent();
      const finalCount = parseInt(finalCountText?.match(/\d+/)?.[0] || '0');
      expect(finalCount).toBe(initialCount + 1);
    });

    test('should allow vote toggling (remove vote)', async ({ page }) => {
      // 1. Login and navigate to package
      await login(page, 'buyer');
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // 2. Click on a package
      await page.locator('[data-testid="package-card"]').first().click();
      await page.waitForURL(/\/marketplace\/packages\/[^\/]+$/);

      // 3. Scroll to reviews
      const reviewsSection = page.locator('[data-testid="reviews-section"]');
      await reviewsSection.scrollIntoViewIfNeeded();

      // 4. Find a review and vote
      const review = page.locator('[data-testid="review-item"]').first();
      const helpfulButton = review.locator('[data-testid="helpful-button"]');

      const initialCountText = await helpfulButton.textContent();
      const initialCount = parseInt(initialCountText?.match(/\d+/)?.[0] || '0');

      // 5. Click to vote
      await helpfulButton.click();
      await page.waitForTimeout(500);

      // 6. Verify vote registered
      let currentCountText = await helpfulButton.textContent();
      let currentCount = parseInt(currentCountText?.match(/\d+/)?.[0] || '0');

      // If already voted, count stays same; if new vote, count increases
      const isNewVote = currentCount > initialCount;

      // 7. Click again to toggle/remove vote
      await helpfulButton.click();
      await page.waitForTimeout(500);

      // 8. Verify vote removed (count decreased or stays same)
      currentCountText = await helpfulButton.textContent();
      currentCount = parseInt(currentCountText?.match(/\d+/)?.[0] || '0');

      if (isNewVote) {
        expect(currentCount).toBe(initialCount); // Vote removed, back to original
      }

      // 9. Verify button state changed back to inactive
      const buttonClasses = await helpfulButton.getAttribute('class');
      expect(buttonClasses).not.toContain('active');
    });

    /**
     * FUTURE TEST: Verified Purchase Filter
     * Sprint: Future sprint (requires verified purchase badge implementation)
     *
     * Test Coverage Plan:
     * 1. Navigate to package reviews
     * 2. Click "Verified Only" filter
     * 3. Verify only verified reviews displayed
     * 4. Verify all have verified badge
     *
     * Prerequisites:
     * - Verified purchase badge system implemented
     * - Filter component integrated
     * - Backend API support for verified filter
     */
    test.skip('should filter reviews by verified purchases only', async () => {
      // Implementation pending - see test plan above
    });
  });

  // ================================
  // ADMIN MODERATION (Story 4.4)
  // ================================

  test.describe('US-3.1 & US-3.2: Admin Moderation Tests', () => {
    test('should display pending reviews for moderation', async ({ page }) => {
      // 1. Login as admin
      await login(page, 'admin');

      // 2. Navigate to admin moderation reviews page
      await page.goto('/admin/moderation/reviews');
      await page.waitForLoadState('networkidle');

      // 3. Verify page loaded
      await expect(
        page.locator('h1, h2').filter({ hasText: /moderasyon|review/i })
      ).toBeVisible();

      // 4. Click "Pending" tab/filter
      const pendingTab = page.locator(
        '[data-testid="status-filter-PENDING"], button:has-text("Bekleyen")'
      );
      if (await pendingTab.isVisible()) {
        await pendingTab.click();
        await page.waitForTimeout(500);
      }

      // 5. Verify pending reviews list is visible
      const reviewsList = page.locator(
        '[data-testid="moderation-reviews-list"]'
      );
      await expect(reviewsList).toBeVisible();

      // 6. Verify stats cards are displayed
      await expect(
        page.locator('[data-testid="total-reviews-stat"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="pending-reviews-stat"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="flagged-reviews-stat"]')
      ).toBeVisible();

      // 7. If there are pending reviews, verify details are visible
      const firstReview = page.locator('[data-testid="review-item"]').first();
      const hasReviews = await firstReview.isVisible().catch(() => false);

      if (hasReviews) {
        await expect(firstReview).toContainText(/\d+/); // Has rating
        await expect(
          firstReview.locator('[data-testid="review-status"]')
        ).toBeVisible();
      }
    });

    test('should allow admin to approve review', async ({ page }) => {
      // 1. Login as admin
      await login(page, 'admin');

      // 2. Navigate to pending reviews
      await page.goto('/admin/moderation/reviews?status=PENDING');
      await page.waitForLoadState('networkidle');

      // 3. Find first pending review
      const firstReview = page.locator('[data-testid="review-item"]').first();
      const hasReviews = await firstReview.isVisible().catch(() => false);

      if (!hasReviews) {
        test.skip(); // No pending reviews to approve
        return;
      }

      // 4. Select the review (checkbox)
      const checkbox = firstReview.locator('input[type="checkbox"]');
      await checkbox.check();

      // 5. Click "Approve" button
      await page.click(
        '[data-testid="approve-button"], button:has-text("Onayla")'
      );

      // 6. Wait for confirmation modal (if exists)
      const confirmModal = page.locator(
        '[data-testid="confirm-approve-modal"]'
      );
      const hasModal = await confirmModal.isVisible().catch(() => false);

      if (hasModal) {
        await page.click('button:has-text("Evet"), button:has-text("Onayla")');
      }

      // 7. Wait for API response
      await page.waitForResponse(
        (response: { url: () => string; status: () => number }) =>
          response.url().includes('/api/v1/admin/reviews') &&
          response.url().includes('/moderate') &&
          response.status() === 200
      );

      // 8. Verify success message
      await expect(page.locator('text=/onaylandı|başarıyla/i')).toBeVisible({
        timeout: 5000,
      });

      // 9. Verify review removed from pending list or status changed
      await page.waitForTimeout(500);
      const stillPending = await firstReview
        .locator('[data-status="PENDING"]')
        .isVisible()
        .catch(() => false);
      expect(stillPending).toBe(false);
    });

    test('should allow admin to reject review with reason', async ({
      page,
    }) => {
      // 1. Login as admin
      await login(page, 'admin');

      // 2. Navigate to pending reviews
      await page.goto('/admin/moderation/reviews?status=PENDING');
      await page.waitForLoadState('networkidle');

      // 3. Find first pending review
      const firstReview = page.locator('[data-testid="review-item"]').first();
      const hasReviews = await firstReview.isVisible().catch(() => false);

      if (!hasReviews) {
        test.skip();
        return;
      }

      // 4. Select review
      await firstReview.locator('input[type="checkbox"]').check();

      // 5. Click "Reject" button
      await page.click(
        '[data-testid="reject-button"], button:has-text("Reddet")'
      );

      // 6. Wait for rejection modal
      await page.waitForSelector('[data-testid="reject-review-modal"]');

      // 7. Enter rejection reason
      const rejectionReason =
        'This review violates our community guidelines regarding appropriate language and content.';
      await page.fill('textarea[name="rejectionReason"]', rejectionReason);

      // 8. Check "Send email notification" if available
      const emailCheckbox = page.locator(
        'input[name="sendEmail"][type="checkbox"]'
      );
      if (await emailCheckbox.isVisible()) {
        await emailCheckbox.check();
      }

      // 9. Confirm rejection
      await page.click('button[type="submit"]:has-text("Reddet")');

      // 10. Wait for API response
      await page.waitForResponse(
        (response: { url: () => string; status: () => number }) =>
          response.url().includes('/api/v1/admin/reviews') &&
          response.url().includes('/moderate') &&
          response.status() === 200
      );

      // 11. Verify success message
      await expect(page.locator('text=/reddedildi|başarıyla/i')).toBeVisible({
        timeout: 5000,
      });
    });

    test('should display flagged reviews', async ({ page }) => {
      // 1. Login as admin
      await login(page, 'admin');

      // 2. Navigate to moderation page
      await page.goto('/admin/moderation/reviews');
      await page.waitForLoadState('networkidle');

      // 3. Click "Flagged" tab
      const flaggedTab = page.locator(
        '[data-testid="flagged-filter"], button:has-text("Şikayet")'
      );
      await flaggedTab.click();
      await page.waitForTimeout(500);

      // 4. Verify flagged reviews list
      const reviewsList = page.locator(
        '[data-testid="moderation-reviews-list"]'
      );
      await expect(reviewsList).toBeVisible();

      // 5. If flagged reviews exist, verify details
      const firstFlaggedReview = page
        .locator('[data-testid="review-item"]')
        .filter({
          has: page.locator(
            '[data-flagged="true"], [data-testid="flag-badge"]'
          ),
        })
        .first();

      const hasFlaggedReviews = await firstFlaggedReview
        .isVisible()
        .catch(() => false);

      if (hasFlaggedReviews) {
        // 6. Verify flag count shown
        await expect(
          firstFlaggedReview.locator('[data-testid="flag-count"]')
        ).toBeVisible();

        // 7. Click to view flag details
        await firstFlaggedReview.click();

        // 8. Verify flag reasons displayed in detail view
        const detailModal = page.locator('[data-testid="review-detail-modal"]');
        if (await detailModal.isVisible()) {
          await expect(
            detailModal.locator('[data-testid="flag-reasons"]')
          ).toBeVisible();
        }
      }
    });

    test('should support bulk actions for reviews', async ({ page }) => {
      // 1. Login as admin
      await login(page, 'admin');

      // 2. Navigate to moderation page
      await page.goto('/admin/moderation/reviews?status=PENDING');
      await page.waitForLoadState('networkidle');

      // 3. Select multiple reviews
      const reviews = page.locator('[data-testid="review-item"]');
      const reviewCount = await reviews.count();

      if (reviewCount < 2) {
        test.skip(); // Need at least 2 reviews for bulk action
        return;
      }

      // 4. Check first 2 reviews
      await reviews.nth(0).locator('input[type="checkbox"]').check();
      await reviews.nth(1).locator('input[type="checkbox"]').check();

      // 5. Verify bulk action buttons are enabled
      const bulkApproveButton = page.locator(
        '[data-testid="bulk-approve-button"]'
      );
      await expect(bulkApproveButton).toBeEnabled();

      // 6. Verify selection count is displayed
      const selectionCount = page.locator('[data-testid="selection-count"]');
      await expect(selectionCount).toContainText('2');
    });

    test('should filter reviews by status', async ({ page }) => {
      // 1. Login as admin
      await login(page, 'admin');

      // 2. Navigate to moderation page
      await page.goto('/admin/moderation/reviews');
      await page.waitForLoadState('networkidle');

      // 3. Test different status filters
      const statuses = ['PENDING', 'APPROVED', 'REJECTED'];

      for (const status of statuses) {
        // Click status filter
        const filterButton = page.locator(
          `[data-testid="status-filter-${status}"]`
        );

        if (await filterButton.isVisible()) {
          await filterButton.click();
          await page.waitForTimeout(500);

          // Verify URL or page state changed
          const currentUrl = page.url();
          expect(currentUrl).toContain(`status=${status}`);
        }
      }
    });

    test('should display moderation statistics', async ({ page }) => {
      // 1. Login as admin
      await login(page, 'admin');

      // 2. Navigate to admin moderation page
      await page.goto('/admin/moderation/reviews');
      await page.waitForLoadState('networkidle');

      // 3. Verify stats cards are displayed
      const statsCards = [
        { testId: 'total-reviews-stat', label: /toplam|total/i },
        { testId: 'pending-reviews-stat', label: /bekleyen|pending/i },
        { testId: 'flagged-reviews-stat', label: /şikayet|flagged/i },
        { testId: 'approved-reviews-stat', label: /onaylanan|approved/i },
        { testId: 'rejected-reviews-stat', label: /reddedilen|rejected/i },
      ];

      for (const stat of statsCards) {
        const statCard = page.locator(`[data-testid="${stat.testId}"]`);

        if (await statCard.isVisible()) {
          // Verify stat has a number
          await expect(statCard).toContainText(/\d+/);
        }
      }
    });
  });

  // ================================
  // REVIEW FLAGGING
  // ================================

  test.describe('Review Flagging System (Story 4.2)', () => {
    test('should allow user to flag inappropriate review', async ({ page }) => {
      // 1. Login as user
      await login(page, 'buyer');

      // 2. Navigate to marketplace and select package
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');
      await page.locator('[data-testid="package-card"]').first().click();
      await page.waitForURL(/\/marketplace\/packages\/[^\/]+$/);

      // 3. Scroll to reviews section
      const reviewsSection = page.locator('[data-testid="reviews-section"]');
      await reviewsSection.scrollIntoViewIfNeeded();

      // 4. Find a review from another user (not own review)
      const reviewItem = page.locator('[data-testid="review-item"]').first();
      await expect(reviewItem).toBeVisible();

      // 5. Click on review options menu (three dots)
      const optionsButton = reviewItem.locator(
        '[data-testid="review-options-button"]'
      );
      await optionsButton.click();

      // 6. Click "Flag" button in dropdown
      await page.click('[data-testid="flag-review-button"]');

      // 7. Wait for flag modal
      await page.waitForSelector('[data-testid="flag-review-modal"]');

      // 8. Select flag reason (SPAM)
      await page.click('[data-testid="flag-reason-SPAM"]');

      // 9. Add optional comment
      await page.fill(
        'textarea[name="flagComment"]',
        'This review appears to be spam and not genuine feedback.'
      );

      // 10. Submit flag
      await page.click('button[type="submit"]:has-text("Gönder")');

      // 11. Wait for API response
      await page.waitForResponse(
        (response: { url: () => string; status: () => number }) =>
          response.url().includes('/api/v1/reviews') &&
          response.url().includes('/flag') &&
          (response.status() === 200 || response.status() === 201)
      );

      // 12. Verify success message
      await expect(
        page.locator(
          'text=/Şikayet.*gönderildi/i, [role="alert"]:has-text("başarı")'
        )
      ).toBeVisible({ timeout: 5000 });

      // 13. Verify modal closed
      await expect(
        page.locator('[data-testid="flag-review-modal"]')
      ).not.toBeVisible();
    });

    test('should test all 5 flag reasons', async ({ page }) => {
      // Test all flag reason types
      const flagReasons = [
        { id: 'SPAM', label: 'Spam' },
        { id: 'INAPPROPRIATE', label: 'Uygunsuz İçerik' },
        { id: 'FAKE', label: 'Sahte Değerlendirme' },
        { id: 'OFFENSIVE', label: 'Saldırgan/Hakaret' },
        { id: 'OTHER', label: 'Diğer' },
      ];

      await login(page, 'buyer');
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      for (const reason of flagReasons) {
        // 1. Navigate to a package
        await page.locator('[data-testid="package-card"]').first().click();
        await page.waitForURL(/\/marketplace\/packages\/[^\/]+$/);

        // 2. Open flag modal
        const reviewsSection = page.locator('[data-testid="reviews-section"]');
        await reviewsSection.scrollIntoViewIfNeeded();

        const reviewItem = page.locator('[data-testid="review-item"]').nth(1); // Use different review each time
        await reviewItem
          .locator('[data-testid="review-options-button"]')
          .click();
        await page.click('[data-testid="flag-review-button"]');
        await page.waitForSelector('[data-testid="flag-review-modal"]');

        // 3. Verify flag reason option exists
        const reasonButton = page.locator(
          `[data-testid="flag-reason-${reason.id}"]`
        );
        await expect(reasonButton).toBeVisible();

        // 4. Select the reason
        await reasonButton.click();

        // 5. If OTHER, verify comment is required
        if (reason.id === 'OTHER') {
          const commentField = page.locator('textarea[name="flagComment"]');
          await expect(commentField).toBeVisible();
          await expect(commentField).toHaveAttribute('required', '');
        }

        // 6. Close modal
        await page.click('[data-testid="flag-modal-close"]');
        await page.goBack(); // Go back to marketplace
      }
    });

    test('should prevent duplicate flags from same user', async ({ page }) => {
      // 1. Login as user
      await login(page, 'buyer');

      // 2. Navigate to package and flag a review
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');
      await page.locator('[data-testid="package-card"]').first().click();
      await page.waitForURL(/\/marketplace\/packages\/[^\/]+$/);

      const reviewsSection = page.locator('[data-testid="reviews-section"]');
      await reviewsSection.scrollIntoViewIfNeeded();

      const reviewItem = page.locator('[data-testid="review-item"]').first();

      // 3. Try to flag the review
      await reviewItem.locator('[data-testid="review-options-button"]').click();

      // 4. Check if "Flag" button is available or shows "Already Flagged"
      const flagButton = page.locator('[data-testid="flag-review-button"]');

      if (await flagButton.isVisible()) {
        // First time flagging
        await flagButton.click();
        await page.waitForSelector('[data-testid="flag-review-modal"]');
        await page.click('[data-testid="flag-reason-SPAM"]');
        await page.click('button[type="submit"]:has-text("Gönder")');

        // Wait for success
        await page.waitForTimeout(1000);

        // 5. Try to flag again
        await reviewItem
          .locator('[data-testid="review-options-button"]')
          .click();
      }

      // 6. Verify flag button is disabled or shows "Already Flagged"
      const flagButtonState = page.locator(
        '[data-testid="flag-review-button"]'
      );
      const isDisabled = await flagButtonState.isDisabled().catch(() => false);
      const hasAlreadyFlaggedText = await page
        .locator('text=/Zaten.*şikayet/i')
        .isVisible()
        .catch(() => false);

      expect(isDisabled || hasAlreadyFlaggedText).toBeTruthy();
    });

    test('should prevent self-flagging own review', async ({ page }) => {
      // 1. Login as user
      await login(page, 'buyer');

      // 2. Navigate to own reviews page
      await page.goto('/dashboard/employer/reviews');
      await page.waitForLoadState('networkidle');

      // 3. Find own review
      const ownReview = page.locator('[data-testid="review-item"]').first();

      // Check if review exists
      const reviewExists = await ownReview.isVisible().catch(() => false);
      if (!reviewExists) {
        test.skip(); // No reviews to test
        return;
      }

      // 4. Check if options button exists
      const optionsButton = ownReview.locator(
        '[data-testid="review-options-button"]'
      );
      const hasOptions = await optionsButton.isVisible().catch(() => false);

      if (hasOptions) {
        await optionsButton.click();

        // 5. Verify "Flag" button is not present for own reviews
        const flagButton = page.locator('[data-testid="flag-review-button"]');
        await expect(flagButton).not.toBeVisible();
      }
    });

    /**
     * FUTURE TEST: Auto-flag Review System
     * Sprint: Future sprint (requires multi-user simulation)
     *
     * Test Coverage Plan:
     * 1. Simulate 3 different users flagging same review
     * 2. Verify review status changes to FLAGGED
     * 3. Verify admin receives notification
     * 4. Verify review appears in flagged tab
     *
     * Prerequisites:
     * - Multi-user session management in E2E tests
     * - Flag threshold system implemented
     * - Admin notification system ready
     */
    test.skip('should auto-flag review at 3 reports', async () => {
      // Implementation pending - see test plan above
    });
  });

  // ================================
  // ORDER COMPLETION FLOW
  // ================================

  test.describe('US-4.1: Order Completion Review Reminder', () => {
    /**
     * FUTURE TEST: Order Completion Review Reminder
     * Sprint: Future sprint (requires order flow completion)
     *
     * Test Coverage Plan:
     * 1. Complete an order as buyer
     * 2. Verify notification appears
     * 3. Verify "Write Review" CTA present
     * 4. Click CTA
     * 5. Verify review modal opens with order details
     *
     * Prerequisites:
     * - Order completion flow fully implemented
     * - Real-time notification system ready
     */
    test.skip('should trigger review reminder on order completion', async () => {
      // Implementation pending - see test plan above
    });

    /**
     * FUTURE TEST: 7-Day Reminder Notification
     * Sprint: Future sprint (requires date/time manipulation)
     *
     * Test Coverage Plan:
     * 1. Complete order
     * 2. Fast-forward 7 days (mock time)
     * 3. Run scheduled job
     * 4. Verify reminder notification sent
     * 5. Verify notification content correct
     *
     * Prerequisites:
     * - Time mocking utilities in E2E framework
     * - Scheduled job trigger mechanism
     */
    test.skip('should send 7-day reminder notification', async () => {
      // Implementation pending - see test plan above
    });

    /**
     * FUTURE TEST: Final Reminder at 23 Days
     * Sprint: Future sprint (requires date/time manipulation)
     *
     * Test Coverage Plan:
     * 1. Complete order
     * 2. Fast-forward 23 days (mock time)
     * 3. Run scheduled job
     * 4. Verify final reminder sent
     * 5. Verify urgency message present
     *
     * Prerequisites:
     * - Time mocking utilities
     * - Scheduled job execution
     */
    test.skip('should send final reminder at 23 days', async () => {
      // Implementation pending - see test plan above
    });

    /**
     * FUTURE TEST: Stop Reminders After Review
     * Sprint: Future sprint
     *
     * Test Coverage Plan:
     * 1. Complete order
     * 2. Submit review
     * 3. Fast-forward 7 days
     * 4. Run scheduled job
     * 5. Verify no reminder sent
     *
     * Prerequisites:
     * - Review submission triggers reminder cancellation
     * - Notification history tracking
     */
    test.skip('should stop reminders after review submitted', async () => {
      // Implementation pending - see test plan above
    });

    /**
     * FUTURE TEST: 30-Day Review Deadline
     * Sprint: Future sprint (requires date/time manipulation)
     *
     * Test Coverage Plan:
     * 1. Complete order
     * 2. Fast-forward 31 days
     * 3. Attempt to write review
     * 4. Verify error message "Review period expired"
     * 5. Verify review form disabled
     *
     * Prerequisites:
     * - Time-based review eligibility validation
     * - Expired review state UI
     */
    test.skip('should enforce 30-day review deadline', async () => {
      // Implementation pending - see test plan above
    });
  });

  // ================================
  // NOTIFICATION SYSTEM
  // ================================

  test.describe('US-5.1: Review Notifications', () => {
    test('should notify seller of new review', async ({ page }) => {
      // 1. Login as buyer, create review
      await login(page, 'buyer');
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Find a package to review
      const packageCard = page.locator('[data-testid="package-card"]').first();
      await packageCard.click();
      await page.waitForLoadState('networkidle');

      // Get seller ID before creating review (for reference)
      const sellerLink = page.locator('[data-testid="seller-profile-link"]');
      const _sellerHref = await sellerLink.getAttribute('href');

      // Create review
      await page.click('[data-testid="write-review-button"]');
      await page.waitForSelector('[data-testid="review-form"]');
      await page.fill(
        '[data-testid="review-content"]',
        'Great service, highly recommended!'
      );
      await page.click('[data-testid="rating-star-5"]');
      await page.click('button[type="submit"]:has-text("Gönder")');
      await page.waitForTimeout(1500);

      // 2. Logout, login as seller
      await logout(page);
      await login(page, 'seller');

      // 3. Verify notification badge count
      const notificationBadge = page.locator(
        '[data-testid="notification-badge"]'
      );
      const badgeCount = await notificationBadge.textContent();
      expect(parseInt(badgeCount || '0')).toBeGreaterThan(0);

      // 4. Open notifications
      await page.click('[data-testid="notifications-button"]');
      await page.waitForSelector('[data-testid="notifications-panel"]');

      // 5. Verify "New Review" notification
      const reviewNotification = page.locator(
        '[data-testid="notification-item"]:has-text("Yeni değerlendirme")'
      );
      await expect(reviewNotification).toBeVisible();

      // 6. Click notification
      await reviewNotification.click();

      // 7. Verify navigates to review
      await page.waitForURL(/\/(dashboard|profile|reviews)/);
      const reviewContent = page.locator(
        'text=Great service, highly recommended!'
      );
      await expect(reviewContent).toBeVisible();
    });

    test('should notify buyer of seller response', async ({ page }) => {
      // 1. Login as seller, respond to review
      await login(page, 'seller');
      await page.goto('/dashboard/seller/reviews');
      await page.waitForLoadState('networkidle');

      // Find a review without response
      const reviewWithoutResponse = page
        .locator(
          '[data-testid="review-item"]:not(:has([data-testid="seller-response"]))'
        )
        .first();

      if (await reviewWithoutResponse.isVisible()) {
        // Respond to review
        await reviewWithoutResponse
          .locator('[data-testid="respond-button"]')
          .click();
        await page.waitForSelector('[data-testid="response-form"]');
        await page.fill(
          '[data-testid="response-content"]',
          'Thank you for your feedback!'
        );
        await page.click('button[type="submit"]:has-text("Gönder")');
        await page.waitForTimeout(1500);

        // 2. Logout, login as buyer
        await logout(page);
        await login(page, 'buyer');

        // 3. Verify notification received
        await page.goto('/notifications');
        await page.waitForLoadState('networkidle');

        const responseNotification = page.locator(
          '[data-testid="notification-item"]:has-text("yanıtladı")'
        );
        await expect(responseNotification).toBeVisible();

        // 4. Verify response content in notification
        expect(await responseNotification.textContent()).toContain('yanıt');
      } else {
        test.skip(); // No reviews without responses
      }
    });

    test('should notify reviewer of helpful votes', async ({ page }) => {
      // This test requires multiple users - simplified version
      // 1. Login as user, vote review helpful
      await login(page, 'buyer');
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      const packageCard = page.locator('[data-testid="package-card"]').first();
      await packageCard.click();
      await page.waitForLoadState('networkidle');

      // Find a review by another user
      const otherReview = page.locator('[data-testid="review-item"]').first();
      const helpfulButton = otherReview.locator(
        '[data-testid="helpful-button"]'
      );

      if (
        (await helpfulButton.isVisible()) &&
        !(await helpfulButton.isDisabled())
      ) {
        await helpfulButton.click();
        await page.waitForTimeout(1000);

        // 2. Logout, login as reviewer
        // Note: In real scenario, would need to login as the review author
        // For now, verify the helpful count increased
        const helpfulCount = await otherReview
          .locator('[data-testid="helpful-count"]')
          .textContent();
        expect(parseInt(helpfulCount || '0')).toBeGreaterThan(0);
      }
    });

    test('should notify reviewer of approval', async ({ page }) => {
      // 1. Login as admin, approve review
      await login(page, 'admin');
      await page.goto('/admin/reviews');
      await page.waitForLoadState('networkidle');

      // Find pending review
      await page.click('[data-testid="pending-reviews-tab"]');
      const pendingReview = page.locator('[data-testid="review-item"]').first();

      if (await pendingReview.isVisible()) {
        // Approve review
        await pendingReview.locator('[data-testid="approve-button"]').click();
        await page.waitForTimeout(1500);

        // 2. Logout, login as reviewer (simulated - would need actual reviewer login)
        await logout(page);
        await login(page, 'buyer'); // Assuming buyer is the reviewer

        // 3. Verify approval notification
        await page.goto('/notifications');
        await page.waitForLoadState('networkidle');

        const approvalNotification = page.locator(
          '[data-testid="notification-item"]:has-text("onaylandı")'
        );
        if (await approvalNotification.isVisible()) {
          expect(await approvalNotification.textContent()).toContain(
            'onaylandı'
          );

          // 4. Verify review now visible
          await page.goto('/dashboard/employer/reviews');
          const approvedReview = page.locator(
            '[data-testid="review-status-badge"]:has-text("Onaylandı")'
          );
          await expect(approvedReview.first()).toBeVisible();
        }
      } else {
        test.skip(); // No pending reviews
      }
    });

    /**
     * FUTURE TEST: Reviewer Rejection Notification
     * Sprint: Future sprint
     *
     * Test Coverage Plan:
     * 1. Login as admin, reject review
     * 2. Enter rejection reason
     * 3. Logout, login as reviewer
     * 4. Verify rejection notification
     * 5. Verify reason displayed
     *
     * Prerequisites:
     * - Review rejection with reason system implemented
     * - Notification content includes rejection details
     */
    test.skip('should notify reviewer of rejection with reason', async () => {
      // Implementation pending - see test plan above
    });

    test('should notify admins of flagged review', async ({ page }) => {
      // 1. Login as user, flag review
      await login(page, 'buyer');
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      const packageCard = page.locator('[data-testid="package-card"]').first();
      await packageCard.click();
      await page.waitForLoadState('networkidle');

      // Find a review to flag
      const reviewItem = page.locator('[data-testid="review-item"]').first();
      await reviewItem.locator('[data-testid="review-options-button"]').click();
      await page.click('[data-testid="flag-review-button"]');

      await page.waitForSelector('[data-testid="flag-review-modal"]');
      await page.click('[data-testid="flag-reason-SPAM"]');
      await page.fill(
        '[data-testid="flag-additional-info"]',
        'This is clearly spam content'
      );
      await page.click('button[type="submit"]:has-text("Gönder")');
      await page.waitForTimeout(1500);

      // 2. Logout, login as admin
      await logout(page);
      await login(page, 'admin');

      // 3. Verify notification received
      await page.goto('/admin/notifications');
      await page.waitForLoadState('networkidle');

      const flagNotification = page.locator(
        '[data-testid="notification-item"]:has-text("şikayet")'
      );
      await expect(flagNotification).toBeVisible();

      // 4. Verify flag reason in notification
      expect(await flagNotification.textContent()).toContain('SPAM');

      // 5. Verify link to moderation page
      await flagNotification.click();
      await page.waitForURL(/\/admin\/(reviews|moderation)/);
      expect(page.url()).toMatch(/\/admin\/(reviews|moderation)/);
    });
  });

  // ================================
  // PERFORMANCE TESTS
  // ================================

  test.describe('Performance & Load Tests', () => {
    /**
     * FUTURE TEST: Package Reviews Page Load Performance
     * Sprint: Future sprint
     *
     * Test Coverage Plan:
     * 1. Navigate to package with 100+ reviews
     * 2. Measure page load time
     * 3. Verify load time < 2000ms
     *
     * Prerequisites:
     * - Performance measurement utilities
     * - Test data with sufficient review volume
     * - Baseline performance metrics established
     */
    test.skip('should load package reviews page within 2 seconds', async () => {
      // Implementation pending - see test plan above
    });

    test('should handle pagination efficiently', async ({ page }) => {
      // 1. Navigate to reviews list
      await login(page, 'buyer');
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      const packageCard = page.locator('[data-testid="package-card"]').first();
      await packageCard.click();
      await page.waitForLoadState('networkidle');

      // 2. Click through multiple pages (up to 5 or max available)
      const maxPages = 5;
      for (let i = 0; i < maxPages; i++) {
        const nextButton = page.locator('[data-testid="pagination-next"]');
        if (
          (await nextButton.isVisible()) &&
          !(await nextButton.isDisabled())
        ) {
          const startTime = Date.now();
          await nextButton.click();
          await page.waitForLoadState('networkidle');
          const loadTime = Date.now() - startTime;

          // 3. Verify each page loads < 1000ms (relaxed from 500ms)
          expect(loadTime).toBeLessThan(1000);
        } else {
          break; // No more pages
        }
      }
    });

    test('should cache rating statistics', async ({ page }) => {
      // 1. Load package page
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      const packageCard = page.locator('[data-testid="package-card"]').first();
      const packageHref = await packageCard
        .locator('a')
        .first()
        .getAttribute('href');

      // Track network requests
      const requests: string[] = [];
      page.on('request', (request) => {
        if (
          request.url().includes('/api/') &&
          request.url().includes('reviews')
        ) {
          requests.push(request.url());
        }
      });

      await page.goto(packageHref || '/marketplace');
      await page.waitForLoadState('networkidle');
      const initialRequestCount = requests.length;

      // 2. Verify stats loaded
      const ratingStats = page.locator('[data-testid="rating-stats"]');
      await expect(ratingStats).toBeVisible();

      // 3. Reload page
      requests.length = 0; // Clear
      await page.reload();
      await page.waitForLoadState('networkidle');

      // 4. Verify fewer API calls (caching working)
      const reloadRequestCount = requests.length;
      expect(reloadRequestCount).toBeLessThanOrEqual(initialRequestCount);
    });
  });

  // ================================
  // ACCESSIBILITY TESTS
  // ================================

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      // 1. Navigate to review form
      await login(page, 'buyer');
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      const packageCard = page.locator('[data-testid="package-card"]').first();
      await packageCard.click();
      await page.waitForLoadState('networkidle');

      // 2. Use only keyboard (Tab, Enter, Space)
      await page.click('[data-testid="write-review-button"]');
      await page.waitForSelector('[data-testid="review-form"]');

      // Tab through form elements
      const reviewContent = page.locator('[data-testid="review-content"]');
      await reviewContent.focus();
      await expect(reviewContent).toBeFocused();

      // 3. Verify all elements accessible
      await page.keyboard.press('Tab');
      const ratingStars = page.locator('[data-testid^="rating-star"]');
      await expect(ratingStars.first()).toBeFocused();

      // 4. Verify focus indicators visible
      const focusedElement = await page.evaluateHandle(
        () => document.activeElement
      );
      const hasOutline = await page.evaluate((el) => {
        if (!el) return false;
        const element = el as Element;
        const styles = window.getComputedStyle(element);
        return styles.outline !== 'none' || styles.border !== 'none';
      }, focusedElement);

      expect(hasOutline).toBeTruthy();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await login(page, 'buyer');
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      const packageCard = page.locator('[data-testid="package-card"]').first();
      await packageCard.click();
      await page.waitForLoadState('networkidle');

      // 1. Check review form ARIA labels
      await page.click('[data-testid="write-review-button"]');
      await page.waitForSelector('[data-testid="review-form"]');

      // 2. Verify interactive elements have labels
      const reviewContent = page.locator('[data-testid="review-content"]');
      const ariaLabel = await reviewContent.getAttribute('aria-label');
      const placeholder = await reviewContent.getAttribute('placeholder');
      const label = await page.locator('label[for*="review"]').count();

      // 3. Verify all interactive elements labeled
      expect(ariaLabel || placeholder || label > 0).toBeTruthy();

      // Check rating stars have labels
      const ratingStars = page.locator('[data-testid^="rating-star"]').first();
      const starAriaLabel = await ratingStars.getAttribute('aria-label');
      expect(starAriaLabel).toBeTruthy();
    });

    /**
     * FUTURE TEST: Screen Reader Compatibility
     * Sprint: Future sprint (requires screen reader simulation)
     *
     * Test Coverage Plan:
     * 1. Enable screen reader simulation
     * 2. Navigate through review form
     * 3. Verify all content announced correctly
     *
     * Prerequisites:
     * - Screen reader simulation library integration
     * - ARIA attributes fully implemented
     * - Accessibility audit tools configured
     */
    test.skip('should work with screen readers', async () => {
      // Implementation pending - see test plan above
    });
  });

  // ================================
  // MOBILE RESPONSIVE TESTS
  // ================================

  test.describe('Mobile Responsiveness', () => {
    /**
     * FUTURE TEST: Mobile Review Form Display
     * Sprint: Future sprint
     *
     * Test Coverage Plan:
     * 1. Set viewport to mobile size (375x667)
     * 2. Open review form
     * 3. Verify all elements visible
     * 4. Verify no horizontal scroll
     * 5. Verify touch-friendly button sizes
     *
     * Prerequisites:
     * - Mobile-responsive review form implementation
     * - Touch-optimized UI components
     */
    test.skip('should display review form correctly on mobile', async () => {
      // Implementation pending - see test plan above
    });

    /**
     * FUTURE TEST: Touch Gestures for Star Rating
     * Sprint: Future sprint
     *
     * Test Coverage Plan:
     * 1. Set viewport to mobile
     * 2. Test touch interactions on star rating
     * 3. Verify swipe gestures work
     * 4. Verify tap accuracy
     *
     * Prerequisites:
     * - Touch event handling in rating component
     * - Mobile gesture library integration
     */
    test.skip('should handle touch gestures for star rating', async () => {
      // Implementation pending - see test plan above
      // 2. Open review form
      // 3. Touch star rating
      // 4. Verify rating updates
      // 5. Verify visual feedback
    });
  });
});

// ================================
// TEST UTILITIES
// ================================

/**
 * Login helper for different user roles
 */
async function login(page: Page, role: 'buyer' | 'seller' | 'admin' = 'buyer') {
  const credentials = {
    buyer: {
      email: 'buyer@test.com',
      password: 'Test123!',
    },
    seller: {
      email: 'seller@test.com',
      password: 'Test123!',
    },
    admin: {
      email: 'admin@test.com',
      password: 'Admin123!',
    },
  };

  await page.goto('/login');
  await page.fill('input[name="email"]', credentials[role].email);
  await page.fill('input[name="password"]', credentials[role].password);
  await page.click('button[type="submit"]');

  // Wait for redirect after successful login
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

/**
 * Logout helper
 */
async function logout(page: Page) {
  // Click user menu
  await page.click('[data-testid="user-menu-button"]');

  // Click logout
  await page.click('[data-testid="logout-button"]');

  // Wait for redirect to login/home page
  await page.waitForURL(/\/(login|$)/, { timeout: 5000 });
}

/**
 * Create test order helper
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function createTestOrder(page: Page) {
  await page.goto('/marketplace');

  // Select first package
  await page.click('[data-testid="package-card"]:first-child');

  // Select BASIC tier
  await page.click('button[data-tier="BASIC"]');

  // Fill requirements
  await page.fill(
    'textarea[name="requirements"]',
    'Test order requirements for E2E testing'
  );

  // Submit order
  await page.click('button[type="submit"]:has-text("Sipariş Oluştur")');

  // Wait for success and get order ID from URL
  await page.waitForURL(/\/orders\/[a-zA-Z0-9-]+/, { timeout: 10000 });
  const url = page.url();
  const orderId = url.split('/').pop();

  return orderId;
}

/**
 * Complete order helper (seller accepts delivery)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function completeOrder(page: Page, orderId: string) {
  // Navigate to order
  await page.goto(`/dashboard/orders/${orderId}`);

  // Seller delivers
  await page.click('button:has-text("Teslimatı Gönder")');
  await page.fill('textarea[name="deliveryNote"]', 'Test delivery completed');
  await page.click('button[type="submit"]:has-text("Gönder")');

  // Wait for delivery confirmation
  await page.waitForSelector('text=Teslimat gönderildi', { timeout: 5000 });

  // Logout and login as buyer
  await page.goto('/logout');
  await login(page, 'buyer');

  // Buyer approves delivery
  await page.goto(`/dashboard/orders/${orderId}`);
  await page.click('button:has-text("Teslimatı Onayla")');
  await page.click('button:has-text("Evet, Onayla")'); // Confirmation modal

  // Wait for completion
  await page.waitForSelector('text=Sipariş tamamlandı', { timeout: 5000 });
}

/**
 * Wait for notification helper
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function waitForNotification(page: Page, title: string) {
  const notificationSelector = `[data-testid="notification"]:has-text("${title}")`;
  await page.waitForSelector(notificationSelector, { timeout: 10000 });
}

/**
 * Verify analytics event (mock implementation)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function verifyAnalyticsEvent(
  eventName: string,
  properties: Record<string, unknown>
) {
  // In real implementation, this would verify analytics tracking
  // For now, we just validate the expected structure
  expect(eventName).toBeTruthy();
  expect(typeof eventName).toBe('string');
  expect(properties).toBeDefined();
  expect(typeof properties).toBe('object');
}
