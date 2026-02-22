import { test, expect } from '@playwright/test';

test.describe('GameHUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display initial score and turns', async ({ page }) => {
    // According to GameHUD.tsx: labels are "Score" and "Tiles"
    const scoreLabel = page.locator('text=/Score/');
    const turnsLabel = page.locator('text=/Tiles/');

    await expect(scoreLabel).toBeVisible();
    await expect(turnsLabel).toBeVisible();

    const scoreValue = page.locator('.game-hud__item').filter({ hasText: 'Score' }).locator('.game-hud__value');
    const turnsValue = page.locator('.game-hud__item').filter({ hasText: 'Tiles' }).locator('.game-hud__value');

    await expect(scoreValue).toHaveText('0');
    await expect(turnsValue).toHaveText('30');
  });
});
