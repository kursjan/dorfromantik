import type { ContainerPoint } from '../common/ContainerPoint';
import type { CameraSnapshot } from '../common/camera/CameraSnapshot';
import { radiansToDegrees } from '../../utils/Angle';

/** Radians added per animation frame while Q/E is held; matches `CanvasController.ROTATION_SPEED`. */
export const SVG_CAMERA_KEYBOARD_ROTATION_RADIANS_PER_FRAME = 0.05;

export function buildSvgWorldTransformString(
  camera: CameraSnapshot,
  viewCenter: ContainerPoint
): string {
  const rotationDeg = radiansToDegrees(camera.rotation);
  return `translate(${viewCenter.x}, ${viewCenter.y}) rotate(${rotationDeg}) scale(${camera.zoom}) translate(${camera.position.x}, ${camera.position.y})`;
}

export function applySvgWorldTransformToGroup(
  group: SVGGElement | null,
  camera: CameraSnapshot,
  viewCenter: ContainerPoint
): void {
  if (!group) return;
  group.setAttribute('transform', buildSvgWorldTransformString(camera, viewCenter));
}
