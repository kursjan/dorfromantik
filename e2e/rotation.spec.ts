import { test, expect } from '@playwright/test';
import { startTestGame } from './test-utils';
import { waitForDevCanvasController } from './waitForDevCanvasController';

test.describe('Rotation Logic', () => {
  test.beforeEach(async ({ page }) => {
    await startTestGame(page);
    await waitForDevCanvasController(page);
  });

  test('should rotate the current tile clockwise when "R" is pressed', async ({ page }) => {
    // 1. Get initial tile state
    const initialTile = await page.evaluate(() => {
      const game = window.canvasCtrl!.activeGame;
      const tile = game.tileQueue[0];
      return {
        north: tile.north,
      };
    });

    // 2. Press "R"
    await page.keyboard.press('r');

    // 3. Get new tile state
    const newTile = await page.evaluate(() => {
      const game = window.canvasCtrl!.activeGame;
      const tile = game.tileQueue[0];
      return {
        northWest: tile.northWest,
      };
    });

    // Check rotation logic: Old North -> New NorthWest (Clockwise 60°)
    expect(newTile.northWest.id).toBe(initialTile.north.id);
  });

  test('should rotate the current tile counter-clockwise when "F" is pressed', async ({ page }) => {
    // 1. Get initial tile state
    const initialTile = await page.evaluate(() => {
      const game = window.canvasCtrl!.activeGame;
      const tile = game.tileQueue[0];
      return {
        north: tile.north,
      };
    });

    // 2. Press "F"
    await page.keyboard.press('f');

    // 3. Get new tile state
    const newTile = await page.evaluate(() => {
      const game = window.canvasCtrl!.activeGame;
      const tile = game.tileQueue[0];
      return {
        northEast: tile.northEast,
      };
    });

    // Check rotation logic: Old North -> New NorthEast (Counter-Clockwise 60°)
    expect(newTile.northEast.id).toBe(initialTile.north.id);
  });

  test('should rotate the current tile clockwise on Right Click', async ({ page }) => {
    const initialTile = await page.evaluate(() => {
      const game = window.canvasCtrl!.activeGame;
      const tile = game.tileQueue[0];
      return { north: tile.north };
    });

    const canvas = page.locator('canvas[data-testid="game-canvas"]');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // Right Click
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: 'right' });

    const newTile = await page.evaluate(() => {
      const game = window.canvasCtrl!.activeGame;
      const tile = game.tileQueue[0];
      return { northWest: tile.northWest };
    });

    expect(newTile.northWest.id).toBe(initialTile.north.id);
  });

  test('should rotate the current tile counter-clockwise on Shift + Right Click', async ({
    page,
  }) => {
    const initialTile = await page.evaluate(() => {
      const game = window.canvasCtrl!.activeGame;
      const tile = game.tileQueue[0];
      return { north: tile.north };
    });

    const canvas = page.locator('canvas[data-testid="game-canvas"]');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // Shift + Right Click
    await page.keyboard.down('Shift');
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: 'right' });
    await page.keyboard.up('Shift');

    const newTile = await page.evaluate(() => {
      const game = window.canvasCtrl!.activeGame;
      const tile = game.tileQueue[0];
      return { northEast: tile.northEast };
    });

    expect(newTile.northEast.id).toBe(initialTile.north.id);
  });
});
