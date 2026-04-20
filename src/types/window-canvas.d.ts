import type { CanvasController } from '../rendering/canvas/engine/CanvasController';

declare global {
  interface Window {
    /**
     * DEV-only: {@link CanvasController} on `window` for debugging and Playwright.
     * Single source of truth for this global; referenced from app and e2e TS configs.
     */
    canvasCtrl?: CanvasController;
  }
}

export {};
