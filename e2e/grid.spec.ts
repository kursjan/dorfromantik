import { test, expect } from '@playwright/test';
import { startStandardGame } from './test-utils';

test.describe('Debug Grid', () => {
  test.beforeEach(async ({ page }) => {
    await startStandardGame(page);
  });

  test('should render the debug grid correctly', async ({ page }) => {
    const canvas = page.locator('canvas[data-testid="game-canvas"]');
    await expect(canvas).toBeVisible();

    // Take a screenshot of just the canvas to ignore UI overlays.
    // We name it specifically to keep it stable.
    await expect(canvas).toHaveScreenshot('debug-grid-initial.png');
  });
});
