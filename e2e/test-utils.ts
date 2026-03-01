import { Page, expect } from '@playwright/test';

export async function startStandardGame(page: Page) {
  await page.goto('/');
  const startButton = page.getByRole('button', { name: /Standard Game/i });
  await expect(startButton).toBeVisible();
  await startButton.click();
  await expect(page).toHaveURL(/\/game$/);
  // Wait for canvas to be visible
  await expect(page.locator('canvas[data-testid="game-canvas"]')).toBeVisible();
}
