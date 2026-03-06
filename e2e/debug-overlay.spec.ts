import { test, expect } from '@playwright/test';
import { startTestGame } from './test-utils';

test.describe('DebugOverlay', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Go to the app and start game
    await startTestGame(page);

    // 2. Wait for the controller to be initialized (published on window in dev)
    await page.waitForFunction(() => (window as any).canvasCtrl !== undefined);
  });

  test('should be hidden by default', async ({ page }) => {
    const overlay = page.locator('[data-testid="debug-overlay"]');
    await expect(overlay).toBeHidden();
  });

  test('should toggle visibility on F3', async ({ page }) => {
    const overlay = page.locator('[data-testid="debug-overlay"]');

    // Initially hidden
    await expect(overlay).toBeHidden();

    // Press F3 -> Show
    await page.keyboard.press('F3');
    // Wait for stats to populate and component to render
    await expect(overlay).toBeVisible();

    // Press F3 -> Hide
    await page.keyboard.press('F3');
    await expect(overlay).toBeHidden();
  });

  test('should display FPS, Camera, and Hover info when visible', async ({ page }) => {
    const overlay = page.locator('[data-testid="debug-overlay"]');

    // Show overlay
    await page.keyboard.press('F3');
    await expect(overlay).toBeVisible();

    // Check content
    // We use regex to match the expected format
    await expect(overlay).toContainText(/FPS: \d+/);
    await expect(overlay).toContainText(/Camera: \(.*, .*\) Zoom: .* Rot: \d+°/);
    await expect(overlay).toContainText(/Hover:/);

    // Check styling (centering)
    await expect(overlay).toHaveCSS('text-align', 'center');
  });
});
