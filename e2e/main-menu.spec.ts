import { test, expect } from '@playwright/test';

test('navigates to game canvas when Start Game is clicked', async ({ page }) => {
  await page.goto('/');

  // Check we are on the main menu
  await expect(page.locator('h1', { hasText: 'Dorfromantik' })).toBeVisible();

  // Click the start game button
  const startButton = page.getByRole('button', { name: /Start Game/i });
  await expect(startButton).toBeVisible();
  await startButton.click();

  // Verify we are on the game page
  await expect(page).toHaveURL(/\/game$/);
  
  // Verify the canvas is rendered
  const canvas = page.locator('[data-testid="game-canvas"]');
  await expect(canvas).toBeVisible();
});
