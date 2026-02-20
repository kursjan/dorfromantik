import { test, expect } from '@playwright/test';

test.describe('Reset View Button', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the game page
    await page.goto('/');
    // Wait for the canvas to be ready
    await page.waitForSelector('canvas[data-testid="game-canvas"]');
  });

  test('should be visible and reset the camera after panning', async ({ page }) => {
    const canvas = page.locator('canvas[data-testid="game-canvas"]');
    const resetBtn = page.locator('button[aria-label="Reset View"]');

    // 1. Verify button is visible
    await expect(resetBtn).toBeVisible();

    // 2. Pan the camera to change the view
    const box = await canvas.boundingBox();
    if (box) {
      // Move to center, drag right and down
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 200, box.y + box.height / 2 + 200);
      await page.mouse.up();
    }

    // 3. Take a screenshot of the panned state
    // We don't compare this yet, just ensuring we moved.

    // 4. Click reset button
    await resetBtn.click();

    // 5. Verify canvas is back to initial state using a stable snapshot
    // This snapshot will be generated on the first run.
    await expect(canvas).toHaveScreenshot('reset-view-restored.png', {
      maxDiffPixels: 150, // Small threshold for rendering variances
      animations: 'disabled',
    });
  });
});
