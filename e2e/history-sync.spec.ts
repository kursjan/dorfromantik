import { test, expect } from '@playwright/test';

test.describe('Real-time History Sync', () => {
  test('adds a newly played game to the Continue Journey list without reloading', async ({ page }) => {
    // 1. Go to Main Menu
    await page.goto('/');

    // Ensure we start with an empty or existing state
    const initialGamesCount = await page.locator('.game-card').count();

    // 2. Start a new Test Game
    const startButton = page.getByRole('button', { name: /Test Game/i });
    await startButton.click();

    // 3. Wait for canvas to load
    await expect(page).toHaveURL(/\/game$/);
    const canvas = page.locator('[data-testid="game-canvas"]');
    await expect(canvas).toBeVisible();

    // 4. Place a tile (click middle of canvas, and a bit offset just in case)
    const box = await canvas.boundingBox();
    if (box) {
      // Click center (origin)
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(500); // Give the game loop a frame
      // Click slightly right (south east)
      await page.mouse.click(box.x + box.width / 2 + 50, box.y + box.height / 2 + 30);
    }

    // 5. Wait for the game to auto-save
    // The GameAutosaver should trigger and the SaveStatusIndicator should show "Saved"
    // Since we use 10ms in test mode, it should be near instant.
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 5000 });

    // 6. Navigate back to Main Menu using browser history (simulating user going back)
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);

    // 7. Verify the Continue Journey list has updated without a hard reload
    // The count of game cards should be initial + 1
    const newGamesCount = await page.locator('.game-card').count();
    expect(newGamesCount).toBe(initialGamesCount + 1);
  });
});
