import type { Page } from '@playwright/test';

/**
 * Waits until the app exposes `window.canvasCtrl` (DEV-only, see CanvasController).
 * Keeps specs free of `(window as any)` while preserving a single wait primitive.
 */
export async function waitForDevCanvasController(page: Page): Promise<void> {
  await page.waitForFunction(() => window.canvasCtrl !== undefined);
}
