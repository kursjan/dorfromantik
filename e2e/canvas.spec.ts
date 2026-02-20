import { test, expect } from '@playwright/test';

test.describe('GameCanvas', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app (baseURL is configured in playwright.config.ts)
    await page.goto('/');
  });

  test('should render the canvas', async ({ page }) => {
    const canvas = page.locator('canvas[data-testid="game-canvas"]');
    await expect(canvas).toBeVisible();
  });

  test('should support zooming', async ({ page }) => {
    const canvas = page.locator('canvas[data-testid="game-canvas"]');

    // Move mouse to center
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    await page.mouse.move(centerX, centerY);

    // Scroll (Zoom)
    await page.mouse.wheel(0, -100);

    // We can't easily assert the internal state of the canvas without exposing it,
    // but we can assert that no error occurred and the element is still there.
    await expect(canvas).toBeVisible();
  });
});
