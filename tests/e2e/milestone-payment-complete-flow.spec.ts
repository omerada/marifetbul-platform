/**
 * ================================================
 * MILESTONE PAYMENT - COMPLETE E2E FLOW
 * ================================================
 * End-to-end test for complete milestone payment workflow
 * Sprint 1 - Story 1.6: E2E Test (1 SP)
 *
 * Test Flow:
 * 1. Employer creates order with milestones
 * 2. Freelancer starts milestone
 * 3. Freelancer delivers milestone (with files)
 * 4. Employer accepts milestone
 * 5. Payment released to wallet
 * 6. Repeat for all milestones
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { test, expect, Page } from '@playwright/test';

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const TEST_USERS = {
  freelancer: {
    email: 'freelancer@test.com',
    password: 'Test123!',
  },
  employer: {
    email: 'employer@test.com',
    password: 'Test123!',
  },
};

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Login as specific user
 */
async function login(page: Page, userType: 'freelancer' | 'employer') {
  const user = TEST_USERS[userType];

  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

/**
 * Logout current user
 */
async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('text=Çıkış Yap');
  await page.waitForURL(/\/login/, { timeout: 5000 });
}

/**
 * Create order with milestones via API
 */
async function createOrderWithMilestones(
  page: Page,
  milestoneCount: number = 2
) {
  // Get auth token from localStorage
  const token = await page.evaluate(() => localStorage.getItem('auth_token'));

  // Create order with milestones via API
  const response = await page.request.post(`${API_URL}/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: {
      packageId: 'test-package-id',
      requirements: 'E2E test order with milestones',
      paymentMode: 'ESCROW_PROTECTED',
      milestones: Array.from({ length: milestoneCount }, (_, i) => ({
        sequence: i + 1,
        title: `Milestone ${i + 1}`,
        description: `Description for milestone ${i + 1}`,
        amount: 500,
        dueDate: new Date(
          Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      })),
    },
  });

  expect(response.ok()).toBeTruthy();
  const orderData = await response.json();
  return orderData.data.id;
}

/**
 * Navigate to order detail page
 */
async function goToOrderDetail(page: Page, orderId: string) {
  await page.goto(`${BASE_URL}/dashboard/orders/${orderId}`);
  await page.waitForLoadState('networkidle');
}

/**
 * Switch to milestones tab
 */
async function switchToMilestonesTab(page: Page) {
  await page.click('button:has-text("Milestone")');
  await page.waitForTimeout(1000); // Wait for tab content
}

// ============================================================================
// TEST SUITE
// ============================================================================

test.describe('Milestone Payment - Complete Flow', () => {
  let orderId: string;

  // ==========================================================================
  // SETUP: Create Order with Milestones
  // ==========================================================================

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();

    // Login as employer
    await login(page, 'employer');

    // Create order with 2 milestones
    orderId = await createOrderWithMilestones(page, 2);
    // eslint-disable-next-line no-console
    console.log(`✓ Test order created: ${orderId}`);

    await page.close();
  });

  // ==========================================================================
  // MILESTONE 1: Complete Flow
  // ==========================================================================

  test('Milestone 1: Freelancer starts and delivers', async ({ page }) => {
    // Login as freelancer
    await login(page, 'freelancer');

    // Navigate to order
    await goToOrderDetail(page, orderId);

    // Switch to milestones tab
    await switchToMilestonesTab(page);

    // Find Milestone 1
    const milestone1 = page.locator('text=Milestone 1').first();
    await expect(milestone1).toBeVisible();

    // Check status is PENDING
    await expect(page.locator('text=Beklemede').first()).toBeVisible();

    // ========== START MILESTONE ==========
    // eslint-disable-next-line no-console
    console.log('→ Starting Milestone 1...');

    await page.click('button:has-text("İşe Başla")');

    // Wait for status to change to IN_PROGRESS
    await expect(page.locator('text=Devam Ediyor').first()).toBeVisible({
      timeout: 5000,
    });

    // eslint-disable-next-line no-console
    console.log('✓ Milestone 1 started');

    // ========== DELIVER MILESTONE ==========
    // eslint-disable-next-line no-console
    console.log('→ Delivering Milestone 1...');

    // Click deliver button
    await page.click('button:has-text("Teslim Et")');

    // Wait for delivery modal
    await expect(page.locator('text=Milestone Teslim Et')).toBeVisible();

    // Fill delivery notes
    await page.fill(
      'textarea[name="deliveryNotes"]',
      'E2E test delivery - Milestone 1 completed successfully'
    );

    // Upload test file (optional - requires test file)
    // const fileInput = page.locator('input[type="file"]');
    // await fileInput.setInputFiles('./test-files/milestone-delivery.pdf');

    // Submit delivery
    await page.click('button:has-text("Teslim Et"):last-of-type');

    // Wait for success toast
    await expect(page.locator('text=Teslim edildi')).toBeVisible({
      timeout: 10000,
    });

    // Verify status changed to DELIVERED
    await expect(page.locator('text=Teslim Edildi').first()).toBeVisible();

    // eslint-disable-next-line no-console
    console.log('✓ Milestone 1 delivered');

    await logout(page);
  });

  test('Milestone 1: Employer accepts', async ({ page }) => {
    // Login as employer
    await login(page, 'employer');

    // Navigate to order
    await goToOrderDetail(page, orderId);

    // Switch to milestones tab
    await switchToMilestonesTab(page);

    // ========== ACCEPT MILESTONE ==========
    // eslint-disable-next-line no-console
    console.log('→ Accepting Milestone 1...');

    // Verify status is DELIVERED
    await expect(page.locator('text=Teslim Edildi').first()).toBeVisible();

    // Check delivery notes are visible
    await expect(
      page.locator(
        'text=E2E test delivery - Milestone 1 completed successfully'
      )
    ).toBeVisible();

    // Click accept button
    await page.click('button:has-text("Onayla")');

    // Wait for acceptance modal
    await expect(page.locator('text=Milestone Onayla')).toBeVisible();

    // Optional: Add feedback
    await page.fill(
      'textarea[name="feedback"]',
      'Excellent work! Milestone 1 accepted.'
    );

    // Confirm acceptance
    await page.click('button:has-text("Onayla ve Ödemeyi Serbest Bırak")');

    // Wait for success toast
    await expect(page.locator('text=Ödeme serbest bırakıldı')).toBeVisible({
      timeout: 10000,
    });

    // Verify status changed to ACCEPTED
    await expect(page.locator('text=Onaylandı').first()).toBeVisible();

    // eslint-disable-next-line no-console
    console.log('✓ Milestone 1 accepted');

    await logout(page);
  });

  test('Milestone 1: Verify payment released to wallet', async ({ page }) => {
    // Login as freelancer
    await login(page, 'freelancer');

    // Navigate to wallet
    await page.goto(`${BASE_URL}/dashboard/wallet`);

    // Check wallet balance increased
    await expect(page.locator('text=₺500').first()).toBeVisible({
      timeout: 5000,
    });

    // Check transaction history
    await expect(
      page.locator('text=Milestone Payment - Milestone 1')
    ).toBeVisible();

    // eslint-disable-next-line no-console
    console.log('✓ Payment released to wallet');

    await logout(page);
  });

  // ==========================================================================
  // MILESTONE 2: Complete Flow
  // ==========================================================================

  test('Milestone 2: Complete flow', async ({ page }) => {
    // Login as freelancer
    await login(page, 'freelancer');

    // Navigate to order
    await goToOrderDetail(page, orderId);
    await switchToMilestonesTab(page);

    // ========== START ==========
    await page.click('button:has-text("İşe Başla")');
    await expect(page.locator('text=Devam Ediyor').nth(1)).toBeVisible({
      timeout: 5000,
    });

    // ========== DELIVER ==========
    await page.click('button:has-text("Teslim Et")');
    await page.fill(
      'textarea[name="deliveryNotes"]',
      'Milestone 2 completed - Final delivery'
    );
    await page.click('button:has-text("Teslim Et"):last-of-type');
    await expect(page.locator('text=Teslim Edildi').nth(1)).toBeVisible({
      timeout: 10000,
    });

    await logout(page);

    // ========== ACCEPT (as employer) ==========
    await login(page, 'employer');
    await goToOrderDetail(page, orderId);
    await switchToMilestonesTab(page);

    await page.click('button:has-text("Onayla")');
    await page.click('button:has-text("Onayla ve Ödemeyi Serbest Bırak")');
    await expect(page.locator('text=Onaylandı').nth(1)).toBeVisible({
      timeout: 10000,
    });

    // eslint-disable-next-line no-console
    console.log('✓ Milestone 2 completed');

    await logout(page);
  });

  // ==========================================================================
  // FINAL VERIFICATION
  // ==========================================================================

  test('Final: Verify order completion and wallet balance', async ({
    page,
  }) => {
    // Login as freelancer
    await login(page, 'freelancer');

    // Navigate to order
    await goToOrderDetail(page, orderId);
    await switchToMilestonesTab(page);

    // ========== VERIFY ALL MILESTONES ACCEPTED ==========
    const acceptedBadges = page.locator('text=Onaylandı');
    await expect(acceptedBadges).toHaveCount(2);

    // Verify progress is 100%
    await expect(page.locator('text=100%')).toBeVisible();

    // Verify total earned
    await expect(page.locator('text=₺1,000').first()).toBeVisible();

    // eslint-disable-next-line no-console
    console.log('✓ All milestones accepted');

    // ========== VERIFY WALLET BALANCE ==========
    await page.goto(`${BASE_URL}/dashboard/wallet`);

    // Total balance should be 1000 TRY (2 milestones × 500 TRY)
    await expect(page.locator('text=₺1,000').first()).toBeVisible();

    // Check transaction history
    await expect(
      page.locator('text=Milestone Payment - Milestone 1')
    ).toBeVisible();
    await expect(
      page.locator('text=Milestone Payment - Milestone 2')
    ).toBeVisible();

    // eslint-disable-next-line no-console
    console.log('✓ Final wallet balance verified');

    // ========== VERIFY ORDER STATUS ==========
    await page.goto(`${BASE_URL}/dashboard/orders/${orderId}`);

    // Order should be marked as COMPLETED
    await expect(page.locator('text=Tamamlandı')).toBeVisible();

    // eslint-disable-next-line no-console
    console.log('✓ Order marked as completed');
  });

  // ==========================================================================
  // REVISION REQUEST FLOW (Optional)
  // ==========================================================================

  test.skip('Revision flow: Employer requests revision', async ({ page }) => {
    // Create another test order for revision flow
    await login(page, 'employer');
    const revisionOrderId = await createOrderWithMilestones(page, 1);

    await logout(page);

    // Freelancer delivers
    await login(page, 'freelancer');
    await goToOrderDetail(page, revisionOrderId);
    await switchToMilestonesTab(page);

    await page.click('button:has-text("İşe Başla")');
    await page.click('button:has-text("Teslim Et")');
    await page.fill('textarea[name="deliveryNotes"]', 'Initial delivery');
    await page.click('button:has-text("Teslim Et"):last-of-type');

    await logout(page);

    // Employer rejects and requests revision
    await login(page, 'employer');
    await goToOrderDetail(page, revisionOrderId);
    await switchToMilestonesTab(page);

    await page.click('button:has-text("Revizyon İste")');
    await page.fill(
      'textarea[name="reason"]',
      'Please improve the design quality'
    );
    await page.click('button:has-text("Revizyon Talep Et")');

    // Verify status changed to REVISION_REQUESTED
    await expect(page.locator('text=Revizyon İstendi')).toBeVisible();

    // eslint-disable-next-line no-console
    console.log('✓ Revision requested');

    await logout(page);

    // Freelancer re-delivers
    await login(page, 'freelancer');
    await goToOrderDetail(page, revisionOrderId);
    await switchToMilestonesTab(page);

    await page.click('button:has-text("Tekrar Teslim Et")');
    await page.fill(
      'textarea[name="deliveryNotes"]',
      'Revised version with improvements'
    );
    await page.click('button:has-text("Teslim Et"):last-of-type');

    await expect(page.locator('text=Teslim Edildi')).toBeVisible();

    // eslint-disable-next-line no-console
    console.log('✓ Revision delivered');
  });
});

// ============================================================================
// WEBSOCKET REAL-TIME TESTS
// ============================================================================

test.describe('Milestone Payment - Real-time Updates', () => {
  test('Real-time: Delivery notification', async ({ browser }) => {
    const employerPage = await browser.newPage();
    const freelancerPage = await browser.newPage();

    try {
      // Employer logs in and waits on order page
      await login(employerPage, 'employer');
      const orderId = await createOrderWithMilestones(employerPage, 1);
      await goToOrderDetail(employerPage, orderId);
      await switchToMilestonesTab(employerPage);

      // Freelancer logs in and delivers
      await login(freelancerPage, 'freelancer');
      await goToOrderDetail(freelancerPage, orderId);
      await switchToMilestonesTab(freelancerPage);

      await freelancerPage.click('button:has-text("İşe Başla")');
      await freelancerPage.click('button:has-text("Teslim Et")');
      await freelancerPage.fill(
        'textarea[name="deliveryNotes"]',
        'Real-time test'
      );
      await freelancerPage.click('button:has-text("Teslim Et"):last-of-type');

      // Employer should see real-time update
      await expect(employerPage.locator('text=Teslim Edildi')).toBeVisible({
        timeout: 5000,
      });

      // Toast notification should appear
      await expect(
        employerPage.locator('text=Milestone Teslim Edildi')
      ).toBeVisible({
        timeout: 3000,
      });

      // eslint-disable-next-line no-console
      console.log('✓ Real-time delivery notification works');
    } finally {
      await employerPage.close();
      await freelancerPage.close();
    }
  });

  test('Real-time: Acceptance notification', async ({ browser }) => {
    const employerPage = await browser.newPage();
    const freelancerPage = await browser.newPage();

    try {
      // Create and deliver milestone
      await login(employerPage, 'employer');
      const orderId = await createOrderWithMilestones(employerPage, 1);

      await login(freelancerPage, 'freelancer');
      await goToOrderDetail(freelancerPage, orderId);
      await switchToMilestonesTab(freelancerPage);

      await freelancerPage.click('button:has-text("İşe Başla")');
      await freelancerPage.click('button:has-text("Teslim Et")');
      await freelancerPage.fill('textarea[name="deliveryNotes"]', 'Delivery');
      await freelancerPage.click('button:has-text("Teslim Et"):last-of-type');

      await freelancerPage.waitForTimeout(2000);

      // Employer accepts while freelancer watches
      await goToOrderDetail(employerPage, orderId);
      await switchToMilestonesTab(employerPage);

      await employerPage.click('button:has-text("Onayla")');
      await employerPage.click(
        'button:has-text("Onayla ve Ödemeyi Serbest Bırak")'
      );

      // Freelancer should see real-time update
      await expect(freelancerPage.locator('text=Onaylandı')).toBeVisible({
        timeout: 5000,
      });

      // Toast notification should appear
      await expect(
        freelancerPage.locator('text=Milestone Onaylandı')
      ).toBeVisible({
        timeout: 3000,
      });

      // eslint-disable-next-line no-console
      console.log('✓ Real-time acceptance notification works');
    } finally {
      await employerPage.close();
      await freelancerPage.close();
    }
  });
});
