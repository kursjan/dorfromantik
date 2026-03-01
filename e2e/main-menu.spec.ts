import { test, expect } from '@playwright/test';

test.describe('Main Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the main menu correctly', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Dorfromantik' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Standard Game/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Test Game/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Settings/i })).toBeVisible();
    await expect(page.locator('text=Continue Journey')).toBeVisible();
  });

  test('navigates to game canvas when Standard Game is clicked', async ({ page }) => {
    const startButton = page.getByRole('button', { name: /Standard Game/i });
    await startButton.click();

    await expect(page).toHaveURL(/\/game$/);
    const canvas = page.locator('[data-testid="game-canvas"]');
    await expect(canvas).toBeVisible();
  });

  test('navigates to game canvas when Continue is clicked on a game card', async ({ page }) => {
    const continueButton = page.locator('.game-card').first().getByRole('button', { name: /Continue/i });
    await continueButton.click();

    await expect(page).toHaveURL(/\/game$/);
    const canvas = page.locator('[data-testid="game-canvas"]');
    await expect(canvas).toBeVisible();
  });

  test('toggles the Settings modal', async ({ page }) => {
    const settingsButton = page.getByRole('button', { name: /Settings/i });
    await settingsButton.click();

    // Verify modal is open
    const modal = page.locator('.settings-modal');
    await expect(modal).toBeVisible();
    await expect(modal.locator('h2', { hasText: 'Settings' })).toBeVisible();

    // Close modal via button
    const closeButton = page.getByRole('button', { name: /Back to Menu/i });
    await closeButton.click();

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
  });

  test('closes the Settings modal when clicking the overlay', async ({ page }) => {
    const settingsButton = page.getByRole('button', { name: /Settings/i });
    await settingsButton.click();

    const modal = page.locator('.settings-modal');
    await expect(modal).toBeVisible();

    // Click on the overlay (the area outside the modal)
    // The overlay has the class .settings-modal-overlay
    await page.locator('.settings-modal-overlay').click({ position: { x: 5, y: 5 } });

    await expect(modal).not.toBeVisible();
  });
});
