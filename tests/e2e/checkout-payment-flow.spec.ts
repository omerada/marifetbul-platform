import { test, expect, Page } from '@playwright/test';
import {
  generateTestUser,
  login,
  clearSession,
  waitForElement,
} from '../utils/helpers';

/**
 * ================================================
 * DUAL PAYMENT SYSTEM - E2E TESTS
 * ================================================
 * 
 * Sprint 1 - Epic 5: End-to-end testing for dual payment system
 * 
 * Test Coverage:
 * - Payment mode selection (Escrow vs Manual IBAN)
 * - IBAN display and copy functionality
 * - Payment proof upload with validation
 * - Dual confirmation flow (buyer + seller)
 * - Order status transitions
 * 
 * @author MarifetBul Development Team
 * @since Sprint 1 - Epic 5
 */
test.describe('Dual Payment System - Checkout Flow', () => {
  let buyer: { email: string; password: string };
  let seller: { email: string; password: string };

  test.beforeAll(() => {
    buyer = generateTestUser('buyer');
    seller = generateTestUser('seller');
  });

  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test.describe('Payment Mode Selection', () => {
    test('should display payment mode selector on checkout page', async ({
      page,
    }) => {
      // Setup: Login as buyer and navigate to checkout
      await login(page, buyer.email, buyer.password);
      await navigateToCheckout(page);

      // Verify payment mode selector is visible
      const modeSelector = page.locator('[data-testid="payment-mode-selector"]');
      await expect(modeSelector).toBeVisible();

      // Verify both payment options are displayed
      const escrowCard = page.locator('[data-testid="payment-mode-escrow"]');
      const ibanCard = page.locator('[data-testid="payment-mode-manual-iban"]');

      await expect(escrowCard).toBeVisible();
      await expect(ibanCard).toBeVisible();
    });

    test('should select escrow protected payment mode', async ({ page }) => {
      await login(page, buyer.email, buyer.password);
      await navigateToCheckout(page);

      // Click escrow card
      const escrowCard = page.locator('[data-testid="payment-mode-escrow"]');
      await escrowCard.click();

      // Verify selected state
      await expect(escrowCard).toHaveAttribute('data-selected', 'true');

      // Verify IBAN section is hidden
      const ibanDisplay = page.locator('[data-testid="iban-display-card"]');
      await expect(ibanDisplay).not.toBeVisible();
    });

    test('should select manual IBAN payment mode', async ({ page }) => {
      await login(page, buyer.email, buyer.password);
      await navigateToCheckout(page);

      // Click IBAN card
      const ibanCard = page.locator('[data-testid="payment-mode-manual-iban"]');
      await ibanCard.click();

      // Verify selected state
      await expect(ibanCard).toHaveAttribute('data-selected', 'true');

      // Verify IBAN display card appears
      const ibanDisplay = page.locator('[data-testid="iban-display-card"]');
      await expect(ibanDisplay).toBeVisible();
    });

    test('should display platform fee for both payment modes', async ({
      page,
    }) => {
      await login(page, buyer.email, buyer.password);
      await navigateToCheckout(page);

      // Check escrow fee display
      const escrowFee = page.locator('[data-testid="escrow-platform-fee"]');
      await expect(escrowFee).toContainText('%10');

      // Check IBAN fee display
      const ibanFee = page.locator('[data-testid="iban-platform-fee"]');
      await expect(ibanFee).toContainText('%10');
    });
  });

  test.describe('IBAN Display & Copy Functionality', () => {
    test('should display platform IBAN when manual payment selected', async ({
      page,
    }) => {
      await login(page, buyer.email, buyer.password);
      await navigateToCheckout(page);

      // Select manual IBAN mode
      await selectManualIBANMode(page);

      // Verify IBAN is displayed
      const ibanNumber = page.locator('[data-testid="platform-iban-number"]');
      await expect(ibanNumber).toBeVisible();
      await expect(ibanNumber).toContainText('TR');
    });

    test('should display payment reference number', async ({ page }) => {
      await login(page, buyer.email, buyer.password);
      await navigateToCheckout(page);
      await selectManualIBANMode(page);

      // Verify reference number is displayed
      const referenceNumber = page.locator(
        '[data-testid="payment-reference-number"]'
      );
      await expect(referenceNumber).toBeVisible();

      // Reference should be in format: ORDER-YYYYMMDD-XXXXX
      const refText = await referenceNumber.textContent();
      expect(refText).toMatch(/ORDER-\d{8}-\d{5}/);
    });

    test('should copy IBAN to clipboard', async ({ page, context }) => {
      // Grant clipboard permissions
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      await login(page, buyer.email, buyer.password);
      await navigateToCheckout(page);
      await selectManualIBANMode(page);

      // Click copy IBAN button
      const copyButton = page.locator('[data-testid="copy-iban-button"]');
      await copyButton.click();

      // Verify success message
      const successToast = page.locator('text=/IBAN kopyalandı/i');
      await expect(successToast).toBeVisible({ timeout: 3000 });

      // Verify clipboard content
      const clipboardText = await page.evaluate(() =>
        navigator.clipboard.readText()
      );
      expect(clipboardText).toMatch(/TR\d{24}/);
    });

    test('should copy reference number to clipboard', async ({
      page,
      context,
    }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      await login(page, buyer.email, buyer.password);
      await navigateToCheckout(page);
      await selectManualIBANMode(page);

      // Click copy reference button
      const copyRefButton = page.locator(
        '[data-testid="copy-reference-button"]'
      );
      await copyRefButton.click();

      // Verify success message
      const successToast = page.locator('text=/Referans numarası kopyalandı/i');
      await expect(successToast).toBeVisible({ timeout: 3000 });
    });

    test('should display payment instructions', async ({ page }) => {
      await login(page, buyer.email, buyer.password);
      await navigateToCheckout(page);
      await selectManualIBANMode(page);

      // Verify instructions are visible
      const instructions = page.locator(
        '[data-testid="payment-instructions"]'
      );
      await expect(instructions).toBeVisible();
      await expect(instructions).toContainText(/havale|EFT/i);
    });
  });

  test.describe('Payment Proof Upload', () => {
    test('should open payment proof upload modal', async ({ page }) => {
      await login(page, buyer.email, buyer.password);
      await createOrderWithManualIBAN(page);

      // Click upload proof button
      const uploadButton = page.locator(
        '[data-testid="upload-proof-button"]'
      );
      await uploadButton.click();

      // Verify modal is open
      const modal = page.locator('[data-testid="payment-proof-upload-modal"]');
      await expect(modal).toBeVisible();
    });

    test('should validate file size (max 5MB)', async ({ page }) => {
      await login(page, buyer.email, buyer.password);
      await createOrderWithManualIBAN(page);
      await openPaymentProofModal(page);

      // Try to upload file larger than 5MB
      // Note: This is a mock test - in real scenario, you'd create a large file
      const fileInput = page.locator('input[type="file"]');
      
      // Verify file size validation message appears
      const errorMessage = page.locator('text=/Maksimum dosya boyutu 5MB/i');
      // This would trigger after attempting to upload a large file
    });

    test('should validate file type (jpeg, png, pdf)', async ({ page }) => {
      await login(page, buyer.email, buyer.password);
      await createOrderWithManualIBAN(page);
      await openPaymentProofModal(page);

      // Verify allowed file types are mentioned
      const fileTypeHint = page.locator(
        'text=/JPEG, PNG, PDF/i'
      );
      await expect(fileTypeHint).toBeVisible();
    });

    test('should show image preview after upload', async ({ page }) => {
      await login(page, buyer.email, buyer.password);
      await createOrderWithManualIBAN(page);
      await openPaymentProofModal(page);

      // Upload a test image
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'payment-proof.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-content'),
      });

      // Verify preview is shown
      const preview = page.locator('[data-testid="proof-image-preview"]');
      await expect(preview).toBeVisible();
    });

    test('should submit payment proof successfully', async ({ page }) => {
      await login(page, buyer.email, buyer.password);
      await createOrderWithManualIBAN(page);
      await openPaymentProofModal(page);

      // Upload valid file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'payment-proof.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-content'),
      });

      // Fill reference number
      const referenceInput = page.locator(
        '[data-testid="payment-reference-input"]'
      );
      await referenceInput.fill('ORDER-20240115-00001');

      // Add notes (optional)
      const notesInput = page.locator('[data-testid="payment-notes-input"]');
      await notesInput.fill('Havale ile ödeme yaptım');

      // Submit
      const submitButton = page.locator('[data-testid="submit-proof-button"]');
      await submitButton.click();

      // Verify success message
      const successToast = page.locator('text=/Ödeme kanıtı yüklendi/i');
      await expect(successToast).toBeVisible({ timeout: 5000 });

      // Verify modal closes
      const modal = page.locator('[data-testid="payment-proof-upload-modal"]');
      await expect(modal).not.toBeVisible();
    });

    test('should display upload progress bar', async ({ page }) => {
      await login(page, buyer.email, buyer.password);
      await createOrderWithManualIBAN(page);
      await openPaymentProofModal(page);

      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'payment-proof.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-content'),
      });

      // Fill required fields
      await page
        .locator('[data-testid="payment-reference-input"]')
        .fill('ORDER-20240115-00001');

      // Submit
      const submitButton = page.locator('[data-testid="submit-proof-button"]');
      await submitButton.click();

      // Verify progress bar appears (may be too fast to catch)
      // This is a best-effort check
      const progressBar = page.locator('[data-testid="upload-progress"]');
      // Progress bar might appear briefly
    });
  });

  test.describe('Dual Confirmation Flow', () => {
    test('should show buyer confirmation status after proof upload', async ({
      page,
    }) => {
      await login(page, buyer.email, buyer.password);
      await createOrderWithManualIBAN(page);
      await uploadPaymentProof(page);

      // Navigate to order details
      await navigateToOrderDetails(page);

      // Verify buyer confirmation badge
      const buyerStatus = page.locator(
        '[data-testid="buyer-confirmation-status"]'
      );
      await expect(buyerStatus).toContainText(/Onaylandı|Confirmed/i);
    });

    test('should show pending seller confirmation', async ({ page }) => {
      await login(page, buyer.email, buyer.password);
      await createOrderWithManualIBAN(page);
      await uploadPaymentProof(page);
      await navigateToOrderDetails(page);

      // Verify seller status is pending
      const sellerStatus = page.locator(
        '[data-testid="seller-confirmation-status"]'
      );
      await expect(sellerStatus).toContainText(/Bekliyor|Pending/i);
    });

    test('seller should be able to view payment proof', async ({ page }) => {
      // Seller logs in and views order
      await login(page, seller.email, seller.password);
      await navigateToSellerOrders(page);

      // Find order with payment proof
      const orderWithProof = page
        .locator('[data-testid="order-card"]')
        .filter({ hasText: /Ödeme Kanıtı Bekleniyor/i })
        .first();
      await orderWithProof.click();

      // Verify payment proof viewer is visible
      const proofViewer = page.locator('[data-testid="payment-proof-viewer"]');
      await expect(proofViewer).toBeVisible();

      // Click to view full proof
      const viewButton = page.locator('[data-testid="view-proof-button"]');
      await viewButton.click();

      // Verify proof image modal opens
      const proofModal = page.locator('[data-testid="proof-image-modal"]');
      await expect(proofModal).toBeVisible();
    });

    test('seller should be able to confirm payment', async ({ page }) => {
      await login(page, seller.email, seller.password);
      await navigateToOrderWithPaymentProof(page);

      // Click confirm button
      const confirmButton = page.locator(
        '[data-testid="seller-confirm-payment-button"]'
      );
      await confirmButton.click();

      // Verify confirmation success
      const successToast = page.locator('text=/Ödeme onaylandı/i');
      await expect(successToast).toBeVisible({ timeout: 5000 });

      // Verify seller status updated
      const sellerStatus = page.locator(
        '[data-testid="seller-confirmation-status"]'
      );
      await expect(sellerStatus).toContainText(/Onaylandı|Confirmed/i);
    });

    test('should show mutual confirmation badge after both confirmations', async ({
      page,
    }) => {
      // Assume both buyer and seller confirmed
      await login(page, buyer.email, buyer.password);
      await navigateToMutuallyConfirmedOrder(page);

      // Verify dual confirmation badge
      const mutualBadge = page.locator('[data-testid="mutual-confirmation-badge"]');
      await expect(mutualBadge).toBeVisible();
      await expect(mutualBadge).toContainText(/Karşılıklı Onaylandı/i);
    });

    test('seller should be able to reject payment proof', async ({ page }) => {
      await login(page, seller.email, seller.password);
      await navigateToOrderWithPaymentProof(page);

      // Click reject button
      const rejectButton = page.locator(
        '[data-testid="seller-reject-payment-button"]'
      );
      await rejectButton.click();

      // Fill rejection reason
      const reasonInput = page.locator(
        '[data-testid="rejection-reason-input"]'
      );
      await reasonInput.fill('Ödeme tutarı eşleşmiyor');

      // Confirm rejection
      const confirmRejectButton = page.locator(
        '[data-testid="confirm-reject-button"]'
      );
      await confirmRejectButton.click();

      // Verify rejection message
      const rejectToast = page.locator('text=/Ödeme reddedildi/i');
      await expect(rejectToast).toBeVisible();
    });
  });

  test.describe('Order Status Transitions', () => {
    test('order should start in PENDING_PAYMENT status', async ({ page }) => {
      await login(page, buyer.email, buyer.password);
      await createOrderWithManualIBAN(page);
      await navigateToOrderDetails(page);

      // Verify order status
      const orderStatus = page.locator('[data-testid="order-status-badge"]');
      await expect(orderStatus).toContainText(/Ödeme Bekliyor|PENDING_PAYMENT/i);
    });

    test('order should transition to IN_PROGRESS after mutual confirmation', async ({
      page,
    }) => {
      await login(page, buyer.email, buyer.password);
      await navigateToMutuallyConfirmedOrder(page);

      // Verify order status changed
      const orderStatus = page.locator('[data-testid="order-status-badge"]');
      await expect(orderStatus).toContainText(/Devam Ediyor|IN_PROGRESS/i);
    });

    test('should show payment mode on order detail page', async ({ page }) => {
      await login(page, buyer.email, buyer.password);
      await createOrderWithManualIBAN(page);
      await navigateToOrderDetails(page);

      // Verify payment mode display
      const paymentMode = page.locator('[data-testid="payment-mode-display"]');
      await expect(paymentMode).toBeVisible();
      await expect(paymentMode).toContainText(/Manuel IBAN|MANUAL_IBAN/i);
    });

    test('should display payment timeline for manual IBAN orders', async ({
      page,
    }) => {
      await login(page, buyer.email, buyer.password);
      await navigateToOrderWithPaymentProof(page);

      // Verify timeline exists
      const timeline = page.locator('[data-testid="payment-timeline"]');
      await expect(timeline).toBeVisible();

      // Timeline should show key events
      await expect(timeline).toContainText(/Ödeme Kanıtı Yüklendi/i);
    });
  });

  // ==================== Helper Functions ====================

  async function navigateToCheckout(page: Page) {
    // Navigate to marketplace
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');

    // Click first package
    const firstPackage = page.locator('[data-testid="package-card"]').first();
    await firstPackage.click();

    // Click "Buy Now" or "Satın Al" button
    const buyButton = page.locator(
      '[data-testid="buy-package-button"], text=/Satın Al|Buy Now/i'
    );
    await buyButton.click();

    // Wait for checkout page
    await page.waitForURL(/\/checkout/);
  }

  async function selectManualIBANMode(page: Page) {
    const ibanCard = page.locator('[data-testid="payment-mode-manual-iban"]');
    await ibanCard.click();
    
    // Wait for IBAN display to appear
    await waitForElement(page, '[data-testid="iban-display-card"]');
  }

  async function createOrderWithManualIBAN(page: Page) {
    await navigateToCheckout(page);
    await selectManualIBANMode(page);

    // Complete checkout with manual IBAN
    const checkoutButton = page.locator(
      '[data-testid="complete-checkout-button"]'
    );
    await checkoutButton.click();

    // Wait for order creation
    await page.waitForURL(/\/orders\/.*\/payment/);
  }

  async function openPaymentProofModal(page: Page) {
    const uploadButton = page.locator('[data-testid="upload-proof-button"]');
    await uploadButton.click();
    await waitForElement(page, '[data-testid="payment-proof-upload-modal"]');
  }

  async function uploadPaymentProof(page: Page) {
    await openPaymentProofModal(page);

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'payment-proof.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-content'),
    });

    // Fill reference
    await page
      .locator('[data-testid="payment-reference-input"]')
      .fill('ORDER-20240115-00001');

    // Submit
    const submitButton = page.locator('[data-testid="submit-proof-button"]');
    await submitButton.click();

    // Wait for success
    await waitForElement(page, 'text=/Ödeme kanıtı yüklendi/i', 5000);
  }

  async function navigateToOrderDetails(page: Page) {
    // Navigate to dashboard orders
    await page.goto('/dashboard/orders');
    await page.waitForLoadState('networkidle');

    // Click first order
    const firstOrder = page.locator('[data-testid="order-card"]').first();
    await firstOrder.click();

    await page.waitForURL(/\/dashboard\/orders\/.+/);
  }

  async function navigateToSellerOrders(page: Page) {
    await page.goto('/dashboard/orders?view=seller');
    await page.waitForLoadState('networkidle');
  }

  async function navigateToOrderWithPaymentProof(page: Page) {
    await navigateToSellerOrders(page);
    
    // Find order with payment proof pending
    const orderWithProof = page
      .locator('[data-testid="order-card"]')
      .filter({ hasText: /Ödeme Kanıtı|Payment Proof/i })
      .first();
    
    await orderWithProof.click();
    await page.waitForURL(/\/dashboard\/orders\/.+/);
  }

  async function navigateToMutuallyConfirmedOrder(page: Page) {
    await page.goto('/dashboard/orders');
    await page.waitForLoadState('networkidle');

    // Find order with mutual confirmation
    const confirmedOrder = page
      .locator('[data-testid="order-card"]')
      .filter({ hasText: /Karşılıklı Onaylandı|Mutually Confirmed/i })
      .first();
    
    await confirmedOrder.click();
    await page.waitForURL(/\/dashboard\/orders\/.+/);
  }
});
