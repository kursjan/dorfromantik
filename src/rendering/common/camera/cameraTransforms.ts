import { type Radians, radians } from '../../../utils/Angle';
import type { ContainerDelta, ContainerPoint } from '../ContainerPoint';
import { WorldPoint } from '../WorldPoint';
import { DEFAULT_CAMERA_SNAPSHOT, type CameraSnapshot } from './CameraSnapshot';

/** Map container-local pixels to world space for the given camera pose. */
export function cameraContainerToWorld(
  snapshot: CameraSnapshot,
  point: ContainerPoint,
  containerWidth: number,
  containerHeight: number
): WorldPoint {
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;

  const relX = point.x - centerX;
  const relY = point.y - centerY;

  const cos = Math.cos(-snapshot.rotation);
  const sin = Math.sin(-snapshot.rotation);
  const rotX = relX * cos - relY * sin;
  const rotY = relX * sin + relY * cos;

  const scaledX = rotX / snapshot.zoom;
  const scaledY = rotY / snapshot.zoom;

  const worldX = scaledX - snapshot.position.x;
  const worldY = scaledY - snapshot.position.y;

  return WorldPoint.xy(worldX, worldY);
}

export function panCameraSnapshotBy(
  snapshot: CameraSnapshot,
  delta: ContainerDelta
): CameraSnapshot {
  const cos = Math.cos(-snapshot.rotation);
  const sin = Math.sin(-snapshot.rotation);

  const rotDx = delta.x * cos - delta.y * sin;
  const rotDy = delta.x * sin + delta.y * cos;

  const nextX = snapshot.position.x + rotDx / snapshot.zoom;
  const nextY = snapshot.position.y + rotDy / snapshot.zoom;
  return {
    ...snapshot,
    position: WorldPoint.xy(nextX, nextY),
  } satisfies CameraSnapshot;
}

export function zoomCameraSnapshotBy(
  snapshot: CameraSnapshot,
  delta: number,
  min: number,
  max: number
): CameraSnapshot {
  const newZoom = snapshot.zoom + delta;
  return {
    ...snapshot,
    zoom: Math.max(min, Math.min(max, newZoom)),
  } satisfies CameraSnapshot;
}

export function rotateCameraSnapshotBy(
  snapshot: CameraSnapshot,
  deltaRadians: Radians
): CameraSnapshot {
  return {
    ...snapshot,
    rotation: radians(snapshot.rotation + deltaRadians),
  } satisfies CameraSnapshot;
}

export function resetCameraSnapshot(): CameraSnapshot {
  return { ...DEFAULT_CAMERA_SNAPSHOT } satisfies CameraSnapshot;
}
