export interface CameraConfig {
  x?: number;
  y?: number;
  zoom?: number;
}

/**
 * Manages the 2D view transformation (Pan & Zoom).
 * 
 * Coordinate Spaces:
 * 1. Screen Space: Pixels, Origin top-left.
 * 2. World Space: Logical units, Origin (0,0) is the center of the world.
 * 
 * Transform Chain:
 * Screen = ScreenCenter + (WorldPosition + CameraOffset) * Zoom
 */
export class Camera {
  x: number = 0;
  y: number = 0;
  zoom: number = 1;

  constructor(config: CameraConfig = {}) {
    this.x = config.x ?? 0;
    this.y = config.y ?? 0;
    this.zoom = config.zoom ?? 1;
  }

  /**
   * Applies the current camera transform to the canvas context.
   * Logic: 
   * 1. Move origin to center of canvas.
   * 2. Scale world by zoom level.
   * 3. Move world by camera position (panning).
   */
  applyTransform(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(this.x, this.y);
  }

  /**
   * Converts a screen pixel coordinate (e.g. mouse event) to World Space.
   * Inverts the transformation chain of applyTransform.
   */
  screenToWorld(screenX: number, screenY: number, canvasWidth: number, canvasHeight: number): { x: number, y: number } {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    // Reverse logic:
    // 1. Subtract Center (undo translate 1)
    // 2. Divide by Zoom (undo scale)
    // 3. Subtract Camera Position (undo translate 2)
    
    const worldX = (screenX - centerX) / this.zoom - this.x;
    const worldY = (screenY - centerY) / this.zoom - this.y;

    return { x: worldX, y: worldY };
  }

  /**
   * Pans the camera by the given delta in screen pixels.
   * We divide by zoom to ensure the world moves in sync with the mouse cursor ("Drag the map" feel).
   */
  pan(dx: number, dy: number) {
    this.x += dx / this.zoom;
    this.y += dy / this.zoom;
  }

  /**
   * Zooms the camera, clamping to min/max values.
   * Currently performs a center-screen zoom.
   */
  zoomBy(delta: number, min: number, max: number) {
    const newZoom = this.zoom + delta;
    this.zoom = Math.max(min, Math.min(max, newZoom));
  }
}
