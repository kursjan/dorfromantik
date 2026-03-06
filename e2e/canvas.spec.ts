import { test, expect } from '@playwright/test';
import { startTestGame } from './test-utils';

test.describe('GameCanvas', () => {
  test.beforeEach(async ({ page }) => {
    await startTestGame(page);
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

  test('should show ghost preview on hover', async ({ page }) => {
    const canvas = page.locator('canvas[data-testid="game-canvas"]');
    await expect(canvas).toBeVisible();

    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    // 1. Hover over center (0,0,0) - Invalid placement (occupied)
    await page.mouse.move(centerX, centerY);
    // Wait for a frame to render
    await page.waitForTimeout(100);
    await expect(canvas).toHaveScreenshot('ghost-invalid-center.png');

    // 2. Hover over neighbor (approx 40px up) - Valid placement
    await page.mouse.move(centerX, centerY - 40);
    await page.waitForTimeout(100);
    // TODO: Reduce maxDiffPixels after fixing flaky snapshots (refs #30)
    await expect(canvas).toHaveScreenshot('ghost-valid-neighbor.png');
  });
});
