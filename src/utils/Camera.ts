export class Camera {
  x: number = 0;
  y: number = 0;
  zoom: number = 1;

  constructor(x: number = 0, y: number = 0, zoom: number = 1) {
    this.x = x;
    this.y = y;
    this.zoom = zoom;
  }

  /**
   * Applies the current camera transform to the canvas context.
   * Order: Center Screen -> Scale -> Translate Camera
   */
  applyTransform(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(this.x, this.y);
  }

  /**
   * Converts a screen pixel coordinate (e.g. mouse event) to World Space.
   */
  screenToWorld(screenX: number, screenY: number, canvasWidth: number, canvasHeight: number): { x: number, y: number } {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    // Reverse the render transform:
    // Screen = Center + (World + Cam) * Zoom
    // World = (Screen - Center) / Zoom - Cam
    
    const worldX = (screenX - centerX) / this.zoom - this.x;
    const worldY = (screenY - centerY) / this.zoom - this.y;

    return { x: worldX, y: worldY };
  }

  /**
   * Pans the camera.
   * Note: We divide by zoom so dragging 100px moves the view 100px visually.
   */
  pan(dx: number, dy: number) {
    this.x += dx / this.zoom;
    this.y += dy / this.zoom;
  }

  /**
   * Zooms the camera, clamping to min/max values.
   */
  zoomBy(delta: number, min: number, max: number) {
    const newZoom = this.zoom + delta;
    this.zoom = Math.max(min, Math.min(max, newZoom));
  }
}
