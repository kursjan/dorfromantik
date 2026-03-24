import { test, expect } from '@playwright/test';

// These tests require Mock Auth (VITE_USE_MOCK_AUTH=true).
// Run with: npm run test:e2e:ci -- e2e/auth.spec.ts

test.describe('Auth Flow (Mock Auth)', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('starts in anonymous mode with Guest badge', async ({ page }) => {
    const badge = page.locator('.main-menu__profile-badge');
    await expect(badge).toHaveText('Guest');
    await expect(badge).toHaveClass(/--anon/);
  });

  test('settings modal shows anonymous profile with Link Google Account button', async ({ page }) => {
    await page.getByRole('button', { name: /Settings/i }).click();

    const modal = page.locator('.settings-modal');
    await expect(modal).toBeVisible();

    await expect(modal.locator('.user-account__badge')).toHaveText('Guest Session');
    await expect(modal.getByRole('button', { name: /Link Google Account/i })).toBeVisible();
    await expect(modal.getByRole('button', { name: /Sign Out/i })).not.toBeVisible();
  });

  test('Link Google Account upgrades to registered user', async ({ page }) => {
    test.skip(process.env.VITE_USE_MOCK_AUTH !== 'true', 'Skipping real Google popup test locally');
    await page.getByRole('button', { name: /Settings/i }).click();

    const modal = page.locator('.settings-modal');
    await modal.getByRole('button', { name: /Link Google Account/i }).click();

    await expect(modal.locator('.user-account__badge')).toHaveText('Permanent Account');
    await expect(modal.locator('.user-account__value', { hasText: 'Test User' })).toBeVisible();
    await expect(modal.getByRole('button', { name: /Sign Out/i })).toBeVisible();
    await expect(modal.getByRole('button', { name: /Link Google Account/i })).not.toBeVisible();
  });

  test('main menu updates after Google sign-in', async ({ page }) => {
    test.skip(process.env.VITE_USE_MOCK_AUTH !== 'true', 'Skipping real Google popup test locally');
    await page.getByRole('button', { name: /Settings/i }).click();

    const modal = page.locator('.settings-modal');
    await modal.getByRole('button', { name: /Link Google Account/i }).click();

    await page.getByRole('button', { name: /Back to Menu/i }).click();
    await expect(modal).not.toBeVisible();

    const badge = page.locator('.main-menu__profile-badge');
    await expect(badge).toHaveText('Player');
    await expect(badge).toHaveClass(/--perm/);
    await expect(page.locator('.main-menu__profile-name')).toHaveText('Test User');
  });

  test('Logout button appears for registered users and signs out', async ({ page }) => {
    test.skip(process.env.VITE_USE_MOCK_AUTH !== 'true', 'Skipping real Google popup test locally');
    // Sign in with Google first
    await page.getByRole('button', { name: /Settings/i }).click();
    const modal = page.locator('.settings-modal');
    await modal.getByRole('button', { name: /Link Google Account/i }).click();
    await page.getByRole('button', { name: /Back to Menu/i }).click();

    // Logout button should now be visible in main menu
    const logoutButton = page.getByRole('button', { name: /Logout/i });
    await expect(logoutButton).toBeVisible();

    await logoutButton.click();

    // Should return to anonymous state
    const badge = page.locator('.main-menu__profile-badge');
    await expect(badge).toHaveText('Guest');
    await expect(badge).toHaveClass(/--anon/);
    await expect(logoutButton).not.toBeVisible();
  });

  test('Sign Out in settings returns to anonymous state', async ({ page }) => {
    test.skip(process.env.VITE_USE_MOCK_AUTH !== 'true', 'Skipping real Google popup test locally');
    // Sign in with Google
    await page.getByRole('button', { name: /Settings/i }).click();
    const modal = page.locator('.settings-modal');
    await modal.getByRole('button', { name: /Link Google Account/i }).click();
    await expect(modal.locator('.user-account__badge')).toHaveText('Permanent Account');

    // Sign out from within settings
    await modal.getByRole('button', { name: /Sign Out/i }).click();

    // Should return to anonymous profile in settings
    await expect(modal.locator('.user-account__badge')).toHaveText('Guest Session');
    await expect(modal.getByRole('button', { name: /Link Google Account/i })).toBeVisible();
  });

  test('Logout button is not visible for anonymous users', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Logout/i })).not.toBeVisible();
  });

  // Regression: re-auth after sign-out must work.
  // linkWithPopup was disabled because this cycle threw credential-already-in-use.
  test('can sign in with Google again after signing out', async ({ page }) => {
    test.skip(process.env.VITE_USE_MOCK_AUTH !== 'true', 'Skipping real Google popup test locally');
    // First sign-in
    await page.getByRole('button', { name: /Settings/i }).click();
    const modal = page.locator('.settings-modal');
    await modal.getByRole('button', { name: /Link Google Account/i }).click();
    await expect(modal.locator('.user-account__badge')).toHaveText('Permanent Account');

    // Sign out
    await modal.getByRole('button', { name: /Sign Out/i }).click();
    await expect(modal.locator('.user-account__badge')).toHaveText('Guest Session');

    // Second sign-in should succeed without errors
    await modal.getByRole('button', { name: /Link Google Account/i }).click();
    await expect(modal.locator('.user-account__badge')).toHaveText('Permanent Account');
    await expect(modal.locator('.user-account__value', { hasText: 'Test User' })).toBeVisible();
  });
});
