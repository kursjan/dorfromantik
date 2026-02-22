export interface InputCallbacks {
  onPan: (dx: number, dy: number) => void;
  onZoom: (delta: number) => void;
  onHover: (x: number, y: number) => void;
  onClick: (x: number, y: number) => void;
  onRotateClockwise: () => void;
  onRotateCounterClockwise: () => void;
  onLeave: () => void;
  onResize: () => void;
}

type InputState = 'IDLE' | 'MOUSE_DOWN_POTENTIAL_CLICK' | 'PANNING';

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
  private static readonly DRAG_THRESHOLD = 5; // pixels

  private canvas: HTMLCanvasElement;
  private state: InputState = 'IDLE';
  private mouseDownPos: { x: number; y: number } = { x: 0, y: 0 };
  private lastMousePos: { x: number; y: number } = { x: 0, y: 0 };
  private callbacks: InputCallbacks;

  // Keyboard State
  private keys: Set<string> = new Set();

  constructor(canvas: HTMLCanvasElement, callbacks: InputCallbacks) {
    this.canvas = canvas;
    this.callbacks = callbacks;
    this.attachListeners();
  }

  private attachListeners() {
    this.canvas.addEventListener('wheel', this.handleWheel, { passive: false });
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
    this.canvas.addEventListener('contextmenu', this.handleContextMenu);

    // Add resize listener to window to handle layout changes
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    // Set initial cursor
    this.canvas.style.cursor = 'grab';
  }

  private detachListeners() {
    this.canvas.removeEventListener('wheel', this.handleWheel);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
    this.canvas.removeEventListener('contextmenu', this.handleContextMenu);

    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  public destroy() {
    this.detachListeners();
  }

  private transition(newState: InputState) {
    this.state = newState;

    // Side effects of state changes
    switch (newState) {
      case 'IDLE':
      case 'MOUSE_DOWN_POTENTIAL_CLICK':
        this.canvas.style.cursor = 'grab';
        break;
      case 'PANNING':
        this.canvas.style.cursor = 'grabbing';
        break;
    }
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

  private handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.callbacks.onZoom(e.deltaY);
  };

  private handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  private handleMouseDown = (e: MouseEvent) => {
    // 1. Right Click for rotation
    if (e.button === 2) {
      if (e.shiftKey) {
        this.callbacks.onRotateCounterClockwise();
      } else {
        this.callbacks.onRotateClockwise();
      }
      return;
    }

    // 2. Only left click for Panning/Clicking
    if (e.button !== 0) return;

    this.transition('MOUSE_DOWN_POTENTIAL_CLICK');
    this.mouseDownPos = { x: e.clientX, y: e.clientY };
    this.lastMousePos = { x: e.clientX, y: e.clientY };
  };

  private handleMouseMove = (e: MouseEvent) => {
    // 1. Calculate and report local coordinates for Hover
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    this.callbacks.onHover(mouseX, mouseY);

    // 2. Handle State Transitions
    switch (this.state) {
      case 'MOUSE_DOWN_POTENTIAL_CLICK': {
        const dx = Math.abs(e.clientX - this.mouseDownPos.x);
        const dy = Math.abs(e.clientY - this.mouseDownPos.y);

        if (dx > InputManager.DRAG_THRESHOLD || dy > InputManager.DRAG_THRESHOLD) {
          this.transition('PANNING');
          this.lastMousePos = { x: e.clientX, y: e.clientY };
        }
        break;
      }

      case 'PANNING': {
        const dx = e.clientX - this.lastMousePos.x;
        const dy = e.clientY - this.lastMousePos.y;
        this.lastMousePos = { x: e.clientX, y: e.clientY };
        this.callbacks.onPan(dx, dy);
        break;
      }

      case 'IDLE':
      default:
        break;
    }
  };

  private handleMouseUp = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.finishInteraction(e.clientX - rect.left, e.clientY - rect.top);
  };

  private handleMouseLeave = () => {
    this.finishInteraction();
    this.callbacks.onLeave();
  };

  /**
   * Finalizes the current interaction (e.g. on mouseup or mouseleave).
   */
  private finishInteraction(mouseX?: number, mouseY?: number) {
    if (this.state === 'MOUSE_DOWN_POTENTIAL_CLICK' && mouseX !== undefined && mouseY !== undefined) {
      this.callbacks.onClick(mouseX, mouseY);
    }

    this.transition('IDLE');
  }

  private handleResize = () => {
    this.callbacks.onResize();
  };
}
