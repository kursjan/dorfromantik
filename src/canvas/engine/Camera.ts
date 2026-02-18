export interface CameraConfig {
  x?: number;
  y?: number;
  zoom?: number;
  rotation?: number;
}

/**
 * Manages the 2D view transformation (Pan, Zoom, & Rotation).
 * 
 * Coordinate Spaces:
 * 1. Screen Space: Pixels, Origin top-left.
 * 2. World Space: Logical units, Origin (0,0) is the center of the world.
 * 
 * Transform Chain:
 * Screen = ScreenCenter + Rotate((WorldPosition + CameraOffset) * Zoom)
 */
export class Camera {
  x: number = 0;
  y: number = 0;
  zoom: number = 1;
  rotation: number = 0; // Radians

  constructor(config: CameraConfig = {}) {
    this.x = config.x ?? 0;
    this.y = config.y ?? 0;
    this.zoom = config.zoom ?? 1;
    this.rotation = config.rotation ?? 0;
  }

  /**
   * Applies the current camera transform to the canvas context.
   * Logic: 
   * 1. Move origin to center of canvas.
   * 2. Rotate.
   * 3. Scale world by zoom level.
   * 4. Move world by camera position (panning).
   */
  applyTransform(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.rotate(this.rotation);
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
    
    // 1. Translate relative to center
    const relX = screenX - centerX;
    const relY = screenY - centerY;

    // 2. Inverse Rotate: Rotate by -rotation
    // x' = x cos(-θ) - y sin(-θ)
    // y' = x sin(-θ) + y cos(-θ)
    const cos = Math.cos(-this.rotation);
    const sin = Math.sin(-this.rotation);
    const rotX = relX * cos - relY * sin;
    const rotY = relX * sin + relY * cos;

    // 3. Inverse Scale
    const scaledX = rotX / this.zoom;
    const scaledY = rotY / this.zoom;

    // 4. Inverse Translate
    const worldX = scaledX - this.x;
    const worldY = scaledY - this.y;

    return { x: worldX, y: worldY };
  }

  /**
   * Pans the camera by the given delta in screen pixels.
   * We must rotate the delta vector to match the world orientation,
   * then divide by zoom.
   */
  pan(dx: number, dy: number) {
    // We want the drag to feel like "grabbing the world".
    // If the camera is rotated 90 deg, dragging "Up" on screen should move world "Up" relative to screen.
    // Screen Delta (dx, dy) is in Screen Space.
    // We need to apply the INVERSE rotation to the delta vector to align it with World Axes.

    const cos = Math.cos(-this.rotation);
    const sin = Math.sin(-this.rotation);
    
    // Rotate the delta vector
    const rotDx = dx * cos - dy * sin;
    const rotDy = dx * sin + dy * cos;

    // Apply to camera position (divided by zoom)
    this.x += rotDx / this.zoom;
    this.y += rotDy / this.zoom;
  }

  /**
   * Zooms the camera, clamping to min/max values.
   * Currently performs a center-screen zoom.
   */
  zoomBy(delta: number, min: number, max: number) {
    const newZoom = this.zoom + delta;
    this.zoom = Math.max(min, Math.min(max, newZoom));
  }

  /**
   * Rotates the camera.
   */
  rotateBy(deltaRadians: number) {
      this.rotation += deltaRadians;
  }
}
