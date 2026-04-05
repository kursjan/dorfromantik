import type { Camera } from '../common/camera/Camera';

/** Applies {@link Camera} pan, zoom, and rotation to a 2D canvas context (viewport-centered). */
export function applyCameraTransformToCanvas(
  camera: Camera,
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
): void {
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.rotate(camera.rotation);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(camera.pan.x, camera.pan.y);
}
