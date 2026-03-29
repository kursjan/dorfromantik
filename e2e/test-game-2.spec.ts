import { test, expect } from '@playwright/test';
import { startTestGame2 } from './test-utils';

test.describe('Test Game 2 (water center, mixed edges; queue pasture + one water)', () => {
  test('starts from main menu and shows the game canvas', async ({ page }) => {
    await startTestGame2(page);
    await expect(page.locator('canvas[data-testid="game-canvas"]')).toBeVisible();
  });
});
