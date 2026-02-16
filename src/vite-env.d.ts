// This file is used to extend the global Window interface
// See: https://www.totaltypescript.com/how-to-properly-type-window

import { CanvasController } from './canvas/engine/CanvasController';

declare global {
  interface Window {
    /**
     * Exposes the CanvasController instance for debugging purposes in development.
     */
    canvasCtrl?: CanvasController;
  }
}
