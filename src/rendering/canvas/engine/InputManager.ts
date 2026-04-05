import type { ContainerDelta, ContainerPoint } from '../../common/ContainerPoint';
import {
  PointerPanZoomSession,
  bindPointerInteraction,
} from '../../common/camera/cameraInteraction';

export interface InputCallbacks {
  onPan: (delta: ContainerDelta) => void;
  onZoom: (delta: number) => void;
  onHover: (point: ContainerPoint) => void;
  onClick: (point: ContainerPoint) => void;
  onRotateClockwise: () => void;
  onRotateCounterClockwise: () => void;
  onLeave: () => void;
  onResize: () => void;
  onToggleDebugOverlay?: () => void;
}

/**
 * Manages DOM event listeners for the canvas.
 * Translates raw mouse/touch events into abstract Game Actions (Pan, Zoom, Hover, Resize).
 * Tracks Keyboard state for continuous actions (Rotation).
 *
 * Responsibilities:
 * - Attach/Detach listeners to prevent memory leaks.
 * - Normalize browser events (e.g. wheel delta).
 * - Manage drag state.
 * - Track active keys.
 */
export class InputManager {
  private canvas: HTMLCanvasElement;
  private readonly panPointer = new PointerPanZoomSession();
  private callbacks: InputCallbacks;
  private cleanupPointer: () => void = () => {};

  // Keyboard State
  private keys: Set<string> = new Set();

  constructor(canvas: HTMLCanvasElement, callbacks: InputCallbacks) {
    this.canvas = canvas;
    this.callbacks = callbacks;
    this.attachListeners();
  }

  private attachListeners() {
    this.cleanupPointer = bindPointerInteraction(this.canvas, this.callbacks, this.panPointer);

    // Add resize listener to window to handle layout changes
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private detachListeners() {
    this.cleanupPointer();
    this.cleanupPointer = () => {};

    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  public destroy() {
    this.detachListeners();
  }

  /**
   * Returns -1 for Left (Q), 1 for Right (E), 0 for None.
   */
  public getRotationDirection(): number {
    let dir = 0;
    if (this.keys.has('q') || this.keys.has('Q')) dir -= 1;
    if (this.keys.has('e') || this.keys.has('E')) dir += 1;
    return dir;
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys.add(e.key);

    // Debug overlay (F3)
    if (e.key === 'F3') {
      e.preventDefault();
      this.callbacks.onToggleDebugOverlay?.();
      return;
    }

    // Tile Rotation (R/F)
    if (e.key === 'r' || e.key === 'R') {
      this.callbacks.onRotateClockwise();
    } else if (e.key === 'f' || e.key === 'F') {
      this.callbacks.onRotateCounterClockwise();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key);
  };

  private handleResize = () => {
    this.callbacks.onResize();
  };
}
