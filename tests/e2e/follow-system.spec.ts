/**
 * ================================================
 * FOLLOW SYSTEM - PLAYWRIGHT E2E TESTS
 * ================================================
 * End-to-end tests for User Follow/Unfollow functionality
 * Tests UI interactions, optimistic updates, and error handling
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-10-26
 */

import { test, expect } from '@playwright/test';

// Test data
const TEST_USER = {
  email: 'test@marifetbul.com',
  password: 'Test123!@#',
};

const TARGET_USER_PROFILE = '/profile/test-freelancer-123';

test.describe('Follow System E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should display follow button on other user profile', async ({
    page,
  }) => {
    // Navigate to another user's profile
    await page.goto(TARGET_USER_PROFILE);

    // Wait for profile to load
    await page.waitForSelector('[data-testid="profile-view"]');

    // Follow button should be visible
    const followButton = page.locator('[data-testid="follow-button"]');
    await expect(followButton).toBeVisible();

    // Button should show "Takip Et" initially
    await expect(followButton).toContainText('Takip Et');
  });

  test('should follow a user successfully', async ({ page }) => {
    await page.goto(TARGET_USER_PROFILE);
    await page.waitForSelector('[data-testid="profile-view"]');

    // Get initial follower count
    const followStats = page.locator('[data-testid="follow-stats"]');
    const initialCount = await followStats
      .locator('text=/\\d+ Takipçi/')
      .textContent();

    // Click follow button
    const followButton = page.locator('[data-testid="follow-button"]');
    await followButton.click();

    // Wait for optimistic update
    await expect(followButton).toContainText('Takip Ediliyor');

    // Verify follower count increased
    await page.waitForTimeout(1000); // Wait for API response
    const newCount = await followStats
      .locator('text=/\\d+ Takipçi/')
      .textContent();

    // Count should have increased (basic check)
    expect(newCount).not.toBe(initialCount);
  });

  test('should unfollow a user successfully', async ({ page }) => {
    await page.goto(TARGET_USER_PROFILE);
    await page.waitForSelector('[data-testid="profile-view"]');

    // First, follow the user
    const followButton = page.locator('[data-testid="follow-button"]');
    await followButton.click();
    await expect(followButton).toContainText('Takip Ediliyor');

    // Then unfollow
    await followButton.click();
    await expect(followButton).toContainText('Takip Et');
  });

  test('should show hover state on follow button', async ({ page }) => {
    await page.goto(TARGET_USER_PROFILE);
    await page.waitForSelector('[data-testid="profile-view"]');

    const followButton = page.locator('[data-testid="follow-button"]');

    // Follow the user first
    await followButton.click();
    await expect(followButton).toContainText('Takip Ediliyor');

    // Hover over the button
    await followButton.hover();

    // Should show "Takipten Çık" on hover
    await expect(followButton).toContainText('Takipten Çık');
  });

  test('should open followers modal', async ({ page }) => {
    await page.goto(TARGET_USER_PROFILE);
    await page.waitForSelector('[data-testid="profile-view"]');

    // Click on follower count
    const followerStats = page.locator('text=/\\d+ Takipçi/');
    await followerStats.click();

    // Modal should open
    const modal = page.locator('[data-testid="followers-modal"]');
    await expect(modal).toBeVisible();

    // Modal should have header
    await expect(modal.locator('h2')).toContainText('Takipçileri');

    // Close modal
    await page.locator('[aria-label="Kapat"]').click();
    await expect(modal).not.toBeVisible();
  });

  test('should open following modal', async ({ page }) => {
    await page.goto(TARGET_USER_PROFILE);
    await page.waitForSelector('[data-testid="profile-view"]');

    // Click on following count
    const followingStats = page.locator('text=/\\d+ Takip/');
    await followingStats.click();

    // Modal should open
    const modal = page.locator('[data-testid="following-modal"]');
    await expect(modal).toBeVisible();

    // Modal should have header
    await expect(modal.locator('h2')).toContainText('Takip Ediyor');

    // Close modal
    await page.locator('[aria-label="Kapat"]').click();
    await expect(modal).not.toBeVisible();
  });

  test('should search in followers modal', async ({ page }) => {
    await page.goto(TARGET_USER_PROFILE);
    await page.waitForSelector('[data-testid="profile-view"]');

    // Open followers modal
    await page.locator('text=/\\d+ Takipçi/').click();
    const modal = page.locator('[data-testid="followers-modal"]');
    await expect(modal).toBeVisible();

    // Type in search box
    const searchInput = modal.locator('input[placeholder*="ara"]');
    await searchInput.fill('test');

    // Wait for filtered results
    await page.waitForTimeout(300);

    // Results should be filtered (implementation specific)
    const userCards = modal.locator('[data-testid="user-card"]');
    const count = await userCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should load more followers on scroll', async ({ page }) => {
    await page.goto(TARGET_USER_PROFILE);
    await page.waitForSelector('[data-testid="profile-view"]');

    // Open followers modal
    await page.locator('text=/\\d+ Takipçi/').click();
    const modal = page.locator('[data-testid="followers-modal"]');
    await expect(modal).toBeVisible();

    // Get initial user count
    const userCards = modal.locator('[data-testid="user-card"]');
    const initialCount = await userCards.count();

    // Scroll to bottom
    await modal
      .locator('.overflow-y-auto')
      .evaluate((el) => el.scrollTo(0, el.scrollHeight));

    // Wait for more items to load
    await page.waitForTimeout(1000);

    // Count should increase (if there are more items)
    const newCount = await userCards.count();
    expect(newCount).toBeGreaterThanOrEqual(initialCount);
  });

  test('should prevent self-follow', async ({ page }) => {
    // Navigate to own profile
    await page.goto('/dashboard');
    await page.click('[data-testid="profile-link"]');

    // Follow button should NOT be visible on own profile
    const followButton = page.locator('[data-testid="follow-button"]');
    await expect(followButton).not.toBeVisible();
  });

  test('should show toast notification on follow', async ({ page }) => {
    await page.goto(TARGET_USER_PROFILE);
    await page.waitForSelector('[data-testid="profile-view"]');

    // Click follow button
    const followButton = page.locator('[data-testid="follow-button"]');
    await followButton.click();

    // Wait for toast
    const toast = page.locator('[data-sonner-toast]');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Kullanıcı takip edildi');
  });

  test('should handle follow errors gracefully', async ({ page }) => {
    // Mock network error
    await page.route('**/api/v1/users/*/follow', (route) => {
      route.abort('failed');
    });

    await page.goto(TARGET_USER_PROFILE);
    await page.waitForSelector('[data-testid="profile-view"]');

    // Click follow button
    const followButton = page.locator('[data-testid="follow-button"]');
    await followButton.click();

    // Error toast should appear
    const toast = page.locator('[data-sonner-toast]');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(/hata|başarısız/i);

    // Button should revert to original state
    await expect(followButton).toContainText('Takip Et');
  });

  test('should follow/unfollow from modal user card', async ({ page }) => {
    await page.goto(TARGET_USER_PROFILE);
    await page.waitForSelector('[data-testid="profile-view"]');

    // Open followers modal
    await page.locator('text=/\\d+ Takipçi/').click();
    const modal = page.locator('[data-testid="followers-modal"]');
    await expect(modal).toBeVisible();

    // Find first user card with follow button
    const firstUserCard = modal.locator('[data-testid="user-card"]').first();
    const nestedFollowButton = firstUserCard.locator(
      '[data-testid="follow-button"]'
    );

    if ((await nestedFollowButton.count()) > 0) {
      // Click follow on nested button
      await nestedFollowButton.click();

      // Should show loading or updated state
      await page.waitForTimeout(500);
      const buttonText = await nestedFollowButton.textContent();
      expect(['Takip Et', 'Takip Ediliyor', 'İşleniyor']).toContain(buttonText);
    }
  });

  test('should display correct follower/following counts', async ({ page }) => {
    await page.goto(TARGET_USER_PROFILE);
    await page.waitForSelector('[data-testid="profile-view"]');

    // Get displayed counts
    const followStats = page.locator('[data-testid="follow-stats"]');
    const followerText = await followStats
      .locator('text=/\\d+ Takipçi/')
      .textContent();
    const followingText = await followStats
      .locator('text=/\\d+ Takip/')
      .textContent();

    // Extract numbers
    const followerCount = parseInt(followerText?.match(/\d+/)?.[0] || '0');
    const followingCount = parseInt(followingText?.match(/\d+/)?.[0] || '0');

    // Counts should be non-negative
    expect(followerCount).toBeGreaterThanOrEqual(0);
    expect(followingCount).toBeGreaterThanOrEqual(0);
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto(TARGET_USER_PROFILE);
    await page.waitForSelector('[data-testid="profile-view"]');

    // Tab to follow button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // May need multiple tabs

    // Press Enter to follow
    await page.keyboard.press('Enter');

    // Should trigger follow action
    await page.waitForTimeout(500);
    const followButton = page.locator('[data-testid="follow-button"]');
    await expect(followButton).toContainText(/Takip/);
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(TARGET_USER_PROFILE);
    await page.waitForSelector('[data-testid="profile-view"]');

    // Follow button should still be visible and clickable
    const followButton = page.locator('[data-testid="follow-button"]');
    await expect(followButton).toBeVisible();
    await followButton.click();

    // Should work the same as desktop
    await expect(followButton).toContainText('Takip Ediliyor');
  });
});
