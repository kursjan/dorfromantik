import { test, expect } from '@playwright/test';

test.describe('Real-time History Sync', () => {
  test('adds a newly played game to the Continue Journey list without reloading', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('text=Loading Profile')).not.toBeVisible();
    const initialGamesCount = await page.locator('.game-card').count();

    await page.getByRole('button', { name: /^Test Game$/i }).click();
    await expect(page).toHaveURL(/\/game$/);

    const canvas = page.locator('[data-testid="game-canvas"]');
    await expect(canvas).toBeVisible();

    // 2. Place a tile on a valid empty hex (canvas center is the occupied origin; hover a neighbor)
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    await page.mouse.move(centerX, centerY - 40);
    await page.waitForTimeout(100);
    await page.mouse.click(centerX, centerY - 40);

    // 3. Confirm placement (queue was 6 tiles; after one placement, 5 remain)
    const turnsValue = page
      .locator('.game-hud__item')
      .filter({ hasText: 'Tiles' })
      .locator('.game-hud__value');
    await expect(turnsValue).toHaveText('5', { timeout: 5000 });

    // 4. Wait for auto-save (dev server uses a 2s debounce before persisting)
    await expect(page.locator('[data-testid="save-status"].save-status--saved')).toBeVisible({
      timeout: 15_000,
    });

    // 5. Navigate back to Main Menu using browser history (simulating user going back)
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);

    // 6. Verify the Continue Journey list has updated without a hard reload
    // The count of game cards should be initial + 1
    const newGamesCount = await page.locator('.game-card').count();
    expect(newGamesCount).toBe(initialGamesCount + 1);
  });
});
