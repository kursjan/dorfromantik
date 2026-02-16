export interface InputCallbacks {
  onPan: (dx: number, dy: number) => void;
  onZoom: (delta: number) => void;
  onHover: (x: number, y: number) => void;
}

export class InputManager {
  private canvas: HTMLCanvasElement;
  private isDragging: boolean = false;
  private lastMousePos: { x: number; y: number } = { x: 0, y: 0 };
  private callbacks: InputCallbacks;

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
    this.canvas.addEventListener('mouseleave', this.handleMouseUp);
    this.canvas.style.cursor = 'grab';
  }

  public detachListeners() {
    this.canvas.removeEventListener('wheel', this.handleWheel);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('mouseleave', this.handleMouseUp);
  }

  private handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    // Normalize deltaY (different browsers/devices use different scales)
    // For now, simple standard usage:
    this.callbacks.onZoom(e.deltaY);
  };

  private handleMouseDown = (e: MouseEvent) => {
    this.isDragging = true;
    this.lastMousePos = { x: e.clientX, y: e.clientY };
    this.canvas.style.cursor = 'grabbing';
  };

  private handleMouseMove = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Report hover position
    this.callbacks.onHover(mouseX, mouseY);

    // Handle Dragging (Pan)
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
}
