export interface InputCallbacks {
  onPan: (dx: number, dy: number) => void;
  onZoom: (delta: number) => void;
  onHover: (x: number, y: number) => void;
  onLeave: () => void;
  onResize: () => void;
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
  private isDragging: boolean = false;
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
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key);
  };

  private handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.callbacks.onZoom(e.deltaY);
  };

  private handleMouseDown = (e: MouseEvent) => {
    // Only left click drags
    if (e.button !== 0) return;

    this.isDragging = true;
    this.lastMousePos = { x: e.clientX, y: e.clientY };
    this.canvas.style.cursor = 'grabbing';
  };

  private handleMouseMove = (e: MouseEvent) => {
    // 1. Calculate and report local coordinates for Hover
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    this.callbacks.onHover(mouseX, mouseY);

    // 2. Handle Dragging (Pan)
    if (this.isDragging) {
      const dx = e.clientX - this.lastMousePos.x;
      const dy = e.clientY - this.lastMousePos.y;
      this.lastMousePos = { x: e.clientX, y: e.clientY };
      
      this.callbacks.onPan(dx, dy);
    }
  };

  private handleMouseUp = () => {
    this.isDragging = false;
    this.canvas.style.cursor = 'grab';
  };

  private handleMouseLeave = () => {
    this.isDragging = false;
    this.canvas.style.cursor = 'grab';
    this.callbacks.onLeave();
  };

  private handleResize = () => {
    this.callbacks.onResize();
  };
}
