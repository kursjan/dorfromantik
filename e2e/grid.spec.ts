import { test, expect } from '@playwright/test';

test.describe('Debug Grid', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render the debug grid correctly', async ({ page }) => {
    const canvas = page.locator('canvas[data-testid="game-canvas"]');
    await expect(canvas).toBeVisible();

    // Take a screenshot of the entire page or just the canvas
    // Since canvas fills screen, page screenshot is fine.
    // We name it specifically to keep it stable.
    await expect(page).toHaveScreenshot('debug-grid-initial.png', {
      maxDiffPixels: 100, // Allow tiny rendering differences if any
    });
  });
});
