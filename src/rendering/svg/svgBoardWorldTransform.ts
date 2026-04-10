import type { ContainerPoint } from '../common/ContainerPoint';
import type { CameraSnapshot } from '../common/camera/CameraSnapshot';
import { radiansToDegrees } from '../../utils/Angle';

/** Radians per frame while Q/E is held; keep in sync with `CanvasController.ROTATION_SPEED`. */
export const SVG_CAMERA_KEYBOARD_ROTATION_RADIANS_PER_FRAME = 0.05;

export function buildSvgWorldTransformString(
  camera: CameraSnapshot,
  viewCenter: ContainerPoint
): string {
  const rotationDeg = radiansToDegrees(camera.rotation);
  return `translate(${viewCenter.x}, ${viewCenter.y}) rotate(${rotationDeg}) scale(${camera.zoom}) translate(${camera.position.x}, ${camera.position.y})`;
}
