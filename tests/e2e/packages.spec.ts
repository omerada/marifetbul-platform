import { test, expect } from '@playwright/test';
import {
  generateTestUser,
  login,
  clearSession,
  waitForElement,
  scrollToBottom,
} from '../utils/helpers';
import { TEST_PACKAGES } from '../fixtures/test-data';

test.describe('Package Marketplace', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test.describe('Browse Packages', () => {
    test('should load marketplace page successfully', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Verify page title
      await expect(page).toHaveTitle(/Marketplace|Pazar|Paketler/i);

      // Verify packages are displayed
      const packageCards = page.locator(
        '[data-testid="package-card"], .package-card'
      );
      const count = await packageCards.count();

      expect(count).toBeGreaterThan(0);
    });

    test('should display package information correctly', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Get first package card
      const firstPackage = page
        .locator('[data-testid="package-card"], .package-card')
        .first();

      // Should have title
      const title = firstPackage.locator(
        '[data-testid="package-title"], h2, h3'
      );
      await expect(title).toBeVisible();

      // Should have price
      const price = firstPackage.locator(
        '[data-testid="package-price"], .price'
      );
      await expect(price).toBeVisible();

      // Should have seller info
      const seller = firstPackage.locator(
        '[data-testid="seller-name"], .seller-name'
      );
      await expect(seller).toBeVisible();
    });

    test('should navigate to package detail on click', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Click on first package
      const firstPackage = page
        .locator('[data-testid="package-card"], .package-card')
        .first();
      await firstPackage.click();

      // Should navigate to package detail page
      await page.waitForURL(/\/packages\/\d+/, { timeout: 10000 });

      expect(page.url()).toMatch(/\/packages\/\d+/);
    });

    test('should load more packages on scroll (infinite scroll)', async ({
      page,
    }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Get initial package count
      const initialCount = await page
        .locator('[data-testid="package-card"], .package-card')
        .count();

      // Scroll to bottom
      await scrollToBottom(page);
      await page.waitForTimeout(2000); // Wait for new packages to load

      // Get new package count
      const newCount = await page
        .locator('[data-testid="package-card"], .package-card')
        .count();

      // Should have loaded more packages (or show "no more" message)
      const hasMorePackages = newCount > initialCount;
      const hasNoMoreMessage =
        (await page
          .locator(
            'text=/tüm.*paketler.*gösterildi/i, text=/no more.*packages/i'
          )
          .count()) > 0;

      expect(hasMorePackages || hasNoMoreMessage).toBeTruthy();
    });
  });

  test.describe('Search Packages', () => {
    test('should search packages by keyword', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Find search input
      const searchInput = page.locator(
        'input[name="search"], input[placeholder*="Ara"], input[type="search"]'
      );

      if ((await searchInput.count()) > 0) {
        await searchInput.fill('logo tasarım');
        await page.keyboard.press('Enter');

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Results should contain search query
        const pageContent = await page.textContent('body');
        expect(pageContent?.toLowerCase()).toContain('logo');
      }
    });

    test('should show no results message for invalid search', async ({
      page,
    }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator(
        'input[name="search"], input[placeholder*="Ara"], input[type="search"]'
      );

      if ((await searchInput.count()) > 0) {
        await searchInput.fill('qwerty12345xyz');
        await page.keyboard.press('Enter');

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Should show no results message or empty state
        const noResults = page.locator(
          'text=/sonuç.*bulunamadı/i, text=/no.*results/i, text=/paket.*bulunamadı/i'
        );
        const isEmpty = (await noResults.count()) > 0;
        const hasZeroPackages =
          (await page
            .locator('[data-testid="package-card"], .package-card')
            .count()) === 0;

        expect(isEmpty || hasZeroPackages).toBeTruthy();
      }
    });
  });

  test.describe('Filter Packages', () => {
    test('should filter packages by category', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Find category filter
      const categoryFilter = page.locator(
        '[data-testid="category-filter"], select[name="category"]'
      );

      if ((await categoryFilter.count()) > 0) {
        await categoryFilter.selectOption({ value: 'graphic_design' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // URL should contain filter parameter
        expect(page.url()).toContain('category');
      }
    });

    test('should filter packages by price range', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Find price range filters
      const minPriceInput = page.locator(
        'input[name="minPrice"], input[placeholder*="Min"]'
      );
      const maxPriceInput = page.locator(
        'input[name="maxPrice"], input[placeholder*="Max"]'
      );

      if (
        (await minPriceInput.count()) > 0 &&
        (await maxPriceInput.count()) > 0
      ) {
        await minPriceInput.fill('100');
        await maxPriceInput.fill('1000');

        // Submit filter
        const applyButton = page.locator(
          'button:has-text("Uygula"), button:has-text("Apply"), button[type="submit"]'
        );
        if ((await applyButton.count()) > 0) {
          await applyButton.click();
        } else {
          await page.keyboard.press('Enter');
        }

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // URL should contain price filters
        const url = page.url();
        expect(url).toMatch(/price|min|max/i);
      }
    });

    test('should filter packages by rating', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Find rating filter
      const ratingFilter = page.locator(
        '[data-testid="rating-filter"], input[name="rating"]'
      );

      if ((await ratingFilter.count()) > 0) {
        await ratingFilter.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // URL should contain rating parameter
        expect(page.url()).toContain('rating');
      }
    });

    test('should clear all filters', async ({ page }) => {
      await page.goto('/marketplace?category=graphic_design&minPrice=100');
      await page.waitForLoadState('networkidle');

      // Find clear filters button
      const clearButton = page.locator(
        'button:has-text("Temizle"), button:has-text("Clear"), button:has-text("Sıfırla")'
      );

      if ((await clearButton.count()) > 0) {
        await clearButton.click();
        await page.waitForLoadState('networkidle');

        // URL should not contain filter parameters
        const url = page.url();
        expect(url).toContain('/marketplace');
        expect(url).not.toContain('category');
        expect(url).not.toContain('minPrice');
      }
    });
  });

  test.describe('Sort Packages', () => {
    test('should sort packages by price (low to high)', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Find sort dropdown
      const sortSelect = page.locator(
        'select[name="sort"], [data-testid="sort-select"]'
      );

      if ((await sortSelect.count()) > 0) {
        await sortSelect.selectOption({ label: /Fiyat.*Düşük/i });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // URL should contain sort parameter
        expect(page.url()).toMatch(/sort|order/i);
      }
    });

    test('should sort packages by rating', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      const sortSelect = page.locator(
        'select[name="sort"], [data-testid="sort-select"]'
      );

      if ((await sortSelect.count()) > 0) {
        await sortSelect.selectOption({ label: /Puan/i });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        expect(page.url()).toMatch(/sort|order/i);
      }
    });
  });

  test.describe('Package Detail Page', () => {
    test('should display complete package information', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Navigate to first package detail
      const firstPackage = page
        .locator('[data-testid="package-card"], .package-card')
        .first();
      await firstPackage.click();
      await page.waitForURL(/\/packages\/\d+/, { timeout: 10000 });
      await page.waitForLoadState('networkidle');

      // Should have title
      const title = page.locator('h1, [data-testid="package-title"]');
      await expect(title).toBeVisible();

      // Should have description
      const description = page.locator(
        '[data-testid="package-description"], .description'
      );
      await expect(description).toBeVisible();

      // Should have pricing tiers
      const pricingSection = page.locator(
        '[data-testid="pricing-tiers"], .pricing-section'
      );
      await expect(pricingSection).toBeVisible();

      // Should have seller information
      const sellerInfo = page.locator(
        '[data-testid="seller-info"], .seller-card'
      );
      await expect(sellerInfo).toBeVisible();
    });

    test('should show package images/gallery', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      const firstPackage = page
        .locator('[data-testid="package-card"], .package-card')
        .first();
      await firstPackage.click();
      await page.waitForURL(/\/packages\/\d+/, { timeout: 10000 });
      await page.waitForLoadState('networkidle');

      // Should have images
      const images = page.locator(
        'img[alt*="package"], [data-testid="package-image"]'
      );
      const imageCount = await images.count();

      expect(imageCount).toBeGreaterThan(0);
    });

    test('should display reviews section', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      const firstPackage = page
        .locator('[data-testid="package-card"], .package-card')
        .first();
      await firstPackage.click();
      await page.waitForURL(/\/packages\/\d+/, { timeout: 10000 });
      await page.waitForLoadState('networkidle');

      // Scroll to reviews section
      await page.evaluate(() => {
        const reviewsSection = document.querySelector(
          '[data-testid="reviews-section"], #reviews, .reviews-section'
        );
        reviewsSection?.scrollIntoView();
      });

      // Should have reviews section
      const reviewsSection = page.locator(
        '[data-testid="reviews-section"], #reviews, .reviews-section'
      );
      const hasReviews = (await reviewsSection.count()) > 0;

      expect(hasReviews).toBeTruthy();
    });

    test('should show buy/order button', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      const firstPackage = page
        .locator('[data-testid="package-card"], .package-card')
        .first();
      await firstPackage.click();
      await page.waitForURL(/\/packages\/\d+/, { timeout: 10000 });
      await page.waitForLoadState('networkidle');

      // Should have buy/order button
      const buyButton = page.locator(
        '[data-testid="buy-button"], button:has-text("Satın Al"), button:has-text("Sipariş Ver")'
      );
      await expect(buyButton.first()).toBeVisible();
    });

    test('should contact seller button work', async ({ page }) => {
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      const firstPackage = page
        .locator('[data-testid="package-card"], .package-card')
        .first();
      await firstPackage.click();
      await page.waitForURL(/\/packages\/\d+/, { timeout: 10000 });
      await page.waitForLoadState('networkidle');

      // Find contact button
      const contactButton = page.locator(
        'button:has-text("İletişim"), button:has-text("Mesaj"), a:has-text("İletişim")'
      );

      if ((await contactButton.count()) > 0) {
        await contactButton.first().click();

        // Should open message modal or redirect to messages
        await page.waitForTimeout(1000);

        const hasModal =
          (await page.locator('[role="dialog"], .modal').count()) > 0;
        const onMessagesPage = page.url().includes('/messages');

        expect(hasModal || onMessagesPage).toBeTruthy();
      }
    });

    test('should add to favorites', async ({ page }) => {
      // First login
      const testUser = generateTestUser();
      await page.goto('/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'Test@1234Pass!');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/(dashboard|marketplace)/, { timeout: 10000 });

      // Go to a package
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      const firstPackage = page
        .locator('[data-testid="package-card"], .package-card')
        .first();
      await firstPackage.click();
      await page.waitForURL(/\/packages\/\d+/, { timeout: 10000 });

      // Find favorite button
      const favoriteButton = page.locator(
        'button[aria-label*="Favori"], button:has([data-icon="heart"])'
      );

      if ((await favoriteButton.count()) > 0) {
        await favoriteButton.first().click();
        await page.waitForTimeout(1000);

        // Should show success message or change icon
        const isFavorited = await favoriteButton
          .first()
          .getAttribute('aria-pressed');
        expect(isFavorited).toBeTruthy();
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Should display packages in single column
      const packageCards = page.locator(
        '[data-testid="package-card"], .package-card'
      );
      await expect(packageCards.first()).toBeVisible();

      // Should have mobile navigation
      const mobileMenu = page.locator(
        '[data-testid="mobile-menu"], button[aria-label="Menu"], .hamburger'
      );
      const hasMobileMenu = (await mobileMenu.count()) > 0;

      expect(hasMobileMenu).toBeTruthy();
    });

    test('should display correctly on tablet', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Should display packages
      const packageCards = page.locator(
        '[data-testid="package-card"], .package-card'
      );
      await expect(packageCards.first()).toBeVisible();
    });
  });
});
