import { type Radians, radians } from '../../../utils/Angle';
import type { ContainerDelta, ContainerPoint } from '../ContainerPoint';
import { WorldPoint } from '../WorldPoint';
import { DEFAULT_CAMERA_SNAPSHOT, type CameraSnapshot } from './CameraSnapshot';

/** View math; internal pose is an immutable {@link CameraSnapshot} replaced on every change. */
export class Camera {
  private snapshot: CameraSnapshot;

  constructor(snapshot: CameraSnapshot) {
    this.snapshot = { ...snapshot } satisfies CameraSnapshot;
  }

  get pan(): WorldPoint {
    return this.snapshot.position;
  }

  get zoom(): number {
    return this.snapshot.zoom;
  }

  get rotation(): Radians {
    return this.snapshot.rotation;
  }

  containerToWorld(
    point: ContainerPoint,
    containerWidth: number,
    containerHeight: number
  ): WorldPoint {
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    const relX = point.x - centerX;
    const relY = point.y - centerY;

    const cos = Math.cos(-this.snapshot.rotation);
    const sin = Math.sin(-this.snapshot.rotation);
    const rotX = relX * cos - relY * sin;
    const rotY = relX * sin + relY * cos;

    const scaledX = rotX / this.snapshot.zoom;
    const scaledY = rotY / this.snapshot.zoom;

    const worldX = scaledX - this.snapshot.position.x;
    const worldY = scaledY - this.snapshot.position.y;

    return WorldPoint.xy(worldX, worldY);
  }

  panBy(delta: ContainerDelta) {
    const cos = Math.cos(-this.snapshot.rotation);
    const sin = Math.sin(-this.snapshot.rotation);

    const rotDx = delta.x * cos - delta.y * sin;
    const rotDy = delta.x * sin + delta.y * cos;

    const nextX = this.snapshot.position.x + rotDx / this.snapshot.zoom;
    const nextY = this.snapshot.position.y + rotDy / this.snapshot.zoom;
    this.snapshot = {
      ...this.snapshot,
      position: WorldPoint.xy(nextX, nextY),
    } satisfies CameraSnapshot;
  }

  zoomBy(delta: number, min: number, max: number) {
    const newZoom = this.snapshot.zoom + delta;
    this.snapshot = {
      ...this.snapshot,
      zoom: Math.max(min, Math.min(max, newZoom)),
    } satisfies CameraSnapshot;
  }

  rotateBy(deltaRadians: Radians) {
    this.snapshot = {
      ...this.snapshot,
      rotation: radians(this.snapshot.rotation + deltaRadians),
    } satisfies CameraSnapshot;
  }

  reset() {
    this.snapshot = { ...DEFAULT_CAMERA_SNAPSHOT } satisfies CameraSnapshot;
  }
}
