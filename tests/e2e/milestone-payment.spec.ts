/**
 * ================================================
 * MILESTONE PAYMENT SYSTEM E2E TESTS
 * ================================================
 * End-to-end tests for milestone-based payment workflow
 *
 * Test Scenarios:
 * - Complete milestone delivery → acceptance flow
 * - Milestone delivery → rejection → redelivery flow
 * - File upload during delivery
 * - Real-time WebSocket updates
 * - Modal interactions
 *
 * Sprint: Sprint 1 - Milestone Payment System
 * Story: 1.9 - E2E Tests (8 pts)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { test, expect, Page } from '@playwright/test';
import path from 'path';

// ============================================================================
// TEST DATA
// ============================================================================

const TEST_USERS = {
  FREELANCER: {
    email: 'freelancer@test.com',
    password: 'FreelancerPass123!',
  },
  EMPLOYER: {
    email: 'employer@test.com',
    password: 'EmployerPass123!',
  },
};

const TEST_ORDER = {
  id: 'test-order-milestone-123',
  title: 'Test Website Development',
  totalAmount: 1000,
};

const TEST_MILESTONE = {
  id: 'test-milestone-1',
  sequence: 1,
  title: 'Design Phase',
  description: 'Complete UI/UX design mockups',
  amount: 300,
  dueDate: '2025-12-15',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function loginAs(page: Page, user: typeof TEST_USERS.FREELANCER) {
  await page.goto('/login');
  await page.fill('[name="email"]', user.email);
  await page.fill('[name="password"]', user.password);
  await page.click('[type="submit"]');
  await page.waitForURL('/dashboard');
}

async function navigateToOrder(page: Page, orderId: string) {
  await page.goto(`/dashboard/orders/${orderId}`);
  await page.waitForSelector('[data-testid="milestone-list"]');
}

async function uploadTestFile(page: Page, fileName: string = 'test-file.pdf') {
  const testFilePath = path.join(__dirname, '../fixtures', fileName);
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(testFilePath);
}

// ============================================================================
// TEST SUITES
// ============================================================================

test.describe('Milestone Payment System', () => {
  test.describe('Freelancer Workflow', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, TEST_USERS.FREELANCER);
      await navigateToOrder(page, TEST_ORDER.id);
    });

    test('should start milestone work', async ({ page }) => {
      // Find "Başla" button for pending milestone
      const startButton = page.locator(
        `[data-testid="milestone-${TEST_MILESTONE.id}-start-btn"]`
      );
      await expect(startButton).toBeVisible();

      // Click start button
      await startButton.click();

      // Wait for status update
      await page.waitForTimeout(1000);

      // Verify status changed to "IN_PROGRESS"
      const statusBadge = page.locator(
        `[data-testid="milestone-${TEST_MILESTONE.id}-status"]`
      );
      await expect(statusBadge).toContainText('Devam Ediyor');

      // Verify "Teslim Et" button is now visible
      const deliverButton = page.locator(
        `[data-testid="milestone-${TEST_MILESTONE.id}-deliver-btn"]`
      );
      await expect(deliverButton).toBeVisible();
    });

    test('should deliver milestone with files and notes', async ({ page }) => {
      // Click "Teslim Et" button
      const deliverButton = page.locator(
        `[data-testid="milestone-${TEST_MILESTONE.id}-deliver-btn"]`
      );
      await deliverButton.click();

      // Wait for delivery modal
      await expect(page.locator('[data-testid="deliver-modal"]')).toBeVisible();

      // Fill delivery notes
      const notesInput = page.locator('[name="deliveryNotes"]');
      const testNotes =
        'Design mockups completed. Included homepage, product pages, and checkout flow. All designs follow brand guidelines.';
      await notesInput.fill(testNotes);

      // Verify character count
      const charCounter = page.locator('[data-testid="notes-char-count"]');
      await expect(charCounter).toContainText(`${testNotes.length}`);

      // Upload files (3 files)
      const fileInput = page.locator('input[type="file"]');
      const testFiles = [
        path.join(__dirname, '../fixtures/homepage-mockup.png'),
        path.join(__dirname, '../fixtures/product-page.png'),
        path.join(__dirname, '../fixtures/checkout-flow.pdf'),
      ];

      await fileInput.setInputFiles(testFiles);

      // Wait for file upload progress
      await expect(
        page.locator('[data-testid="upload-progress"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="upload-progress"]')
      ).not.toBeVisible({ timeout: 10000 });

      // Verify uploaded files are listed
      const uploadedFiles = page.locator('[data-testid="uploaded-file"]');
      await expect(uploadedFiles).toHaveCount(3);

      // Click submit button
      const submitButton = page.locator('[data-testid="deliver-submit-btn"]');
      await expect(submitButton).toBeEnabled();
      await submitButton.click();

      // Wait for success toast
      await expect(page.locator('.sonner-toast')).toContainText(
        'Milestone teslim edildi'
      );

      // Wait for modal to close
      await expect(
        page.locator('[data-testid="deliver-modal"]')
      ).not.toBeVisible();

      // Verify milestone status updated to "DELIVERED"
      const statusBadge = page.locator(
        `[data-testid="milestone-${TEST_MILESTONE.id}-status"]`
      );
      await expect(statusBadge).toContainText('Teslim Edildi');
    });

    test('should show validation errors for incomplete delivery', async ({
      page,
    }) => {
      // Click "Teslim Et" button
      const deliverButton = page.locator(
        `[data-testid="milestone-${TEST_MILESTONE.id}-deliver-btn"]`
      );
      await deliverButton.click();

      // Wait for modal
      await expect(page.locator('[data-testid="deliver-modal"]')).toBeVisible();

      // Try to submit without notes
      const submitButton = page.locator('[data-testid="deliver-submit-btn"]');
      await expect(submitButton).toBeDisabled();

      // Enter notes too short (< 20 chars)
      const notesInput = page.locator('[name="deliveryNotes"]');
      await notesInput.fill('Too short');

      // Verify error message
      await expect(page.locator('[data-testid="notes-error"]')).toContainText(
        'En az 20 karakter'
      );

      // Submit button should still be disabled
      await expect(submitButton).toBeDisabled();
    });
  });

  test.describe('Employer Workflow', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, TEST_USERS.EMPLOYER);
      await navigateToOrder(page, TEST_ORDER.id);
    });

    test('should accept delivered milestone', async ({ page }) => {
      // Find "Onayla" button for delivered milestone
      const acceptButton = page.locator(
        `[data-testid="milestone-${TEST_MILESTONE.id}-accept-btn"]`
      );
      await expect(acceptButton).toBeVisible();
      await acceptButton.click();

      // Wait for accept modal
      await expect(page.locator('[data-testid="accept-modal"]')).toBeVisible();

      // Verify payment amount is displayed
      const paymentAmount = page.locator('[data-testid="payment-amount"]');
      await expect(paymentAmount).toContainText('₺300.00');

      // Verify escrow warning is shown
      await expect(
        page.locator('[data-testid="escrow-warning"]')
      ).toBeVisible();

      // Verify delivery notes are displayed
      const deliveryNotes = page.locator('[data-testid="delivery-notes"]');
      await expect(deliveryNotes).toContainText('Design mockups completed');

      // Verify attachments are listed
      const attachments = page.locator('[data-testid="attachment"]');
      await expect(attachments.first()).toBeVisible();

      // Check confirmation checkbox
      const confirmCheckbox = page.locator('[name="confirmAcceptance"]');
      await confirmCheckbox.check();

      // Click accept button
      const submitButton = page.locator('[data-testid="accept-submit-btn"]');
      await expect(submitButton).toBeEnabled();
      await submitButton.click();

      // Wait for success toast
      await expect(page.locator('.sonner-toast')).toContainText(
        'Milestone onaylandı'
      );

      // Wait for modal to close
      await expect(
        page.locator('[data-testid="accept-modal"]')
      ).not.toBeVisible();

      // Verify milestone status updated to "ACCEPTED"
      const statusBadge = page.locator(
        `[data-testid="milestone-${TEST_MILESTONE.id}-status"]`
      );
      await expect(statusBadge).toContainText('Onaylandı');

      // Verify payment released indicator
      const paymentBadge = page.locator(
        `[data-testid="milestone-${TEST_MILESTONE.id}-payment-status"]`
      );
      await expect(paymentBadge).toContainText('Ödeme Yapıldı');
    });

    test('should reject milestone with reason', async ({ page }) => {
      // Find "Revizyon İste" button
      const rejectButton = page.locator(
        `[data-testid="milestone-${TEST_MILESTONE.id}-reject-btn"]`
      );
      await expect(rejectButton).toBeVisible();
      await rejectButton.click();

      // Wait for reject modal
      await expect(page.locator('[data-testid="reject-modal"]')).toBeVisible();

      // Enter rejection reason
      const reasonInput = page.locator('[name="rejectionReason"]');
      const testReason =
        'The homepage mockup needs revision. Please adjust the header navigation to match our brand style guide. Also, product page thumbnails should be larger.';
      await reasonInput.fill(testReason);

      // Verify character count
      const charCounter = page.locator('[data-testid="reason-char-count"]');
      await expect(charCounter).toContainText(`${testReason.length}/500`);

      // Click submit button
      const submitButton = page.locator('[data-testid="reject-submit-btn"]');
      await expect(submitButton).toBeEnabled();
      await submitButton.click();

      // Wait for success toast
      await expect(page.locator('.sonner-toast')).toContainText(
        'Revizyon istendi'
      );

      // Wait for modal to close
      await expect(
        page.locator('[data-testid="reject-modal"]')
      ).not.toBeVisible();

      // Verify milestone status updated to "REVISION_REQUESTED"
      const statusBadge = page.locator(
        `[data-testid="milestone-${TEST_MILESTONE.id}-status"]`
      );
      await expect(statusBadge).toContainText('Revizyon İstendi');
    });

    test('should show validation errors for short rejection reason', async ({
      page,
    }) => {
      // Click "Revizyon İste" button
      const rejectButton = page.locator(
        `[data-testid="milestone-${TEST_MILESTONE.id}-reject-btn"]`
      );
      await rejectButton.click();

      // Wait for modal
      await expect(page.locator('[data-testid="reject-modal"]')).toBeVisible();

      // Try to submit without reason
      const submitButton = page.locator('[data-testid="reject-submit-btn"]');
      await expect(submitButton).toBeDisabled();

      // Enter reason too short (< 20 chars)
      const reasonInput = page.locator('[name="rejectionReason"]');
      await reasonInput.fill('Too short');

      // Verify error message
      await expect(page.locator('[data-testid="reason-error"]')).toContainText(
        'En az 20 karakter'
      );

      // Submit button should still be disabled
      await expect(submitButton).toBeDisabled();
    });
  });

  test.describe('Complete Workflows', () => {
    test('should complete full delivery → acceptance workflow', async ({
      page,
      context,
    }) => {
      // === FREELANCER SIDE ===
      await loginAs(page, TEST_USERS.FREELANCER);
      await navigateToOrder(page, TEST_ORDER.id);

      // Start milestone
      await page
        .locator(`[data-testid="milestone-${TEST_MILESTONE.id}-start-btn"]`)
        .click();
      await page.waitForTimeout(1000);

      // Deliver milestone
      await page
        .locator(`[data-testid="milestone-${TEST_MILESTONE.id}-deliver-btn"]`)
        .click();
      await page
        .locator('[name="deliveryNotes"]')
        .fill(
          'All design mockups completed as per requirements. Please review and let me know if any changes are needed.'
        );
      // Skip file upload for speed
      await page.locator('[data-testid="deliver-submit-btn"]').click();

      // Wait for success
      await expect(page.locator('.sonner-toast')).toContainText(
        'Milestone teslim edildi'
      );

      // === EMPLOYER SIDE ===
      // Open new page as employer
      const employerPage = await context.newPage();
      await loginAs(employerPage, TEST_USERS.EMPLOYER);
      await navigateToOrder(employerPage, TEST_ORDER.id);

      // Accept milestone
      await employerPage
        .locator(`[data-testid="milestone-${TEST_MILESTONE.id}-accept-btn"]`)
        .click();
      await employerPage.locator('[name="confirmAcceptance"]').check();
      await employerPage.locator('[data-testid="accept-submit-btn"]').click();

      // Wait for success
      await expect(employerPage.locator('.sonner-toast')).toContainText(
        'Milestone onaylandı'
      );

      // === VERIFY FREELANCER SEES UPDATE ===
      // Reload freelancer page
      await page.reload();
      await page.waitForTimeout(1000);

      // Verify status is "ACCEPTED"
      const statusBadge = page.locator(
        `[data-testid="milestone-${TEST_MILESTONE.id}-status"]`
      );
      await expect(statusBadge).toContainText('Onaylandı');

      // Close employer page
      await employerPage.close();
    });

    test('should complete full delivery → rejection → redelivery workflow', async ({
      page,
      context,
    }) => {
      // === FREELANCER SIDE ===
      await loginAs(page, TEST_USERS.FREELANCER);
      await navigateToOrder(page, TEST_ORDER.id);

      // Start & deliver milestone
      await page
        .locator(`[data-testid="milestone-${TEST_MILESTONE.id}-start-btn"]`)
        .click();
      await page.waitForTimeout(1000);

      await page
        .locator(`[data-testid="milestone-${TEST_MILESTONE.id}-deliver-btn"]`)
        .click();
      await page
        .locator('[name="deliveryNotes"]')
        .fill('First version of design mockups completed.');
      await page.locator('[data-testid="deliver-submit-btn"]').click();
      await expect(page.locator('.sonner-toast')).toContainText(
        'Milestone teslim edildi'
      );

      // === EMPLOYER SIDE ===
      const employerPage = await context.newPage();
      await loginAs(employerPage, TEST_USERS.EMPLOYER);
      await navigateToOrder(employerPage, TEST_ORDER.id);

      // Reject milestone
      await employerPage
        .locator(`[data-testid="milestone-${TEST_MILESTONE.id}-reject-btn"]`)
        .click();
      await employerPage
        .locator('[name="rejectionReason"]')
        .fill(
          'Please adjust the color scheme to match our brand guidelines. The current design is too dark.'
        );
      await employerPage.locator('[data-testid="reject-submit-btn"]').click();
      await expect(employerPage.locator('.sonner-toast')).toContainText(
        'Revizyon istendi'
      );

      // === FREELANCER REDELIVERY ===
      // Reload freelancer page
      await page.reload();
      await page.waitForTimeout(1000);

      // Verify status is "REVISION_REQUESTED"
      let statusBadge = page.locator(
        `[data-testid="milestone-${TEST_MILESTONE.id}-status"]`
      );
      await expect(statusBadge).toContainText('Revizyon İstendi');

      // Redeliver milestone
      await page
        .locator(`[data-testid="milestone-${TEST_MILESTONE.id}-deliver-btn"]`)
        .click();
      await page
        .locator('[name="deliveryNotes"]')
        .fill(
          'Revised design with updated color scheme to match brand guidelines. All feedback addressed.'
        );
      await page.locator('[data-testid="deliver-submit-btn"]').click();
      await expect(page.locator('.sonner-toast')).toContainText(
        'Milestone teslim edildi'
      );

      // === EMPLOYER ACCEPTANCE ===
      await employerPage.reload();
      await employerPage.waitForTimeout(1000);

      await employerPage
        .locator(`[data-testid="milestone-${TEST_MILESTONE.id}-accept-btn"]`)
        .click();
      await employerPage.locator('[name="confirmAcceptance"]').check();
      await employerPage.locator('[data-testid="accept-submit-btn"]').click();
      await expect(employerPage.locator('.sonner-toast')).toContainText(
        'Milestone onaylandı'
      );

      // === VERIFY FINAL STATUS ===
      await page.reload();
      await page.waitForTimeout(1000);

      statusBadge = page.locator(
        `[data-testid="milestone-${TEST_MILESTONE.id}-status"]`
      );
      await expect(statusBadge).toContainText('Onaylandı');

      await employerPage.close();
    });
  });

  test.describe('Progress Tracking', () => {
    test('should display milestone progress correctly', async ({ page }) => {
      await loginAs(page, TEST_USERS.FREELANCER);
      await navigateToOrder(page, TEST_ORDER.id);

      // Verify progress summary is visible
      const progressCard = page.locator('[data-testid="milestone-progress"]');
      await expect(progressCard).toBeVisible();

      // Verify progress percentage
      const progressPercent = page.locator(
        '[data-testid="progress-percentage"]'
      );
      await expect(progressPercent).toBeVisible();

      // Verify completion count
      const completionCount = page.locator('[data-testid="completion-count"]');
      await expect(completionCount).toContainText(/\d+ \/ \d+ tamamlandı/);

      // Verify progress bar
      const progressBar = page.locator('[data-testid="progress-bar"]');
      await expect(progressBar).toBeVisible();
    });
  });

  test.describe('WebSocket Real-time Updates', () => {
    test.skip('should receive real-time status updates via WebSocket', async ({
      page,
      context,
    }) => {
      // This test requires WebSocket server to be running
      // Skip in CI environments

      // === FREELANCER SIDE (keep page open) ===
      await loginAs(page, TEST_USERS.FREELANCER);
      await navigateToOrder(page, TEST_ORDER.id);

      // Monitor WebSocket connection
      page.on('websocket', (ws) => {
        console.log('WebSocket connected:', ws.url());
        ws.on('framereceived', (event) => {
          console.log('WebSocket frame received:', event.payload);
        });
      });

      // === EMPLOYER SIDE (trigger status change) ===
      const employerPage = await context.newPage();
      await loginAs(employerPage, TEST_USERS.EMPLOYER);
      await navigateToOrder(employerPage, TEST_ORDER.id);

      // Accept milestone
      await employerPage
        .locator(`[data-testid="milestone-${TEST_MILESTONE.id}-accept-btn"]`)
        .click();
      await employerPage.locator('[name="confirmAcceptance"]').check();
      await employerPage.locator('[data-testid="accept-submit-btn"]').click();

      // === VERIFY FREELANCER RECEIVES UPDATE ===
      // WITHOUT page reload, status should update via WebSocket
      await page.waitForTimeout(2000); // Wait for WebSocket message

      const statusBadge = page.locator(
        `[data-testid="milestone-${TEST_MILESTONE.id}-status"]`
      );
      await expect(statusBadge).toContainText('Onaylandı');

      // Verify toast notification appeared
      await expect(page.locator('.sonner-toast')).toContainText(
        'Milestone onaylandı'
      );

      await employerPage.close();
    });
  });
});
