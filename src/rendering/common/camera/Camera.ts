import { type Radians, radians } from '../../../utils/Angle';
import type { ContainerDelta, ContainerPoint } from '../ContainerPoint';
import type { WorldPoint } from '../WorldPoint';

export interface CameraConfig {
  position?: WorldPoint;
  zoom?: number;
  rotation?: Radians;
}

export class Camera {
  private readonly defaultPan: WorldPoint = { x: 0, y: 0 } satisfies WorldPoint;
  private readonly defaultZoom: number = 1;
  private readonly defaultRotation: Radians = radians(0);

  /** World-space pan offset (layout plane; SVG path mirrors these as `CameraSnapshot.position`). */
  private worldPan: WorldPoint = this.defaultPan;
  zoom: number = this.defaultZoom;
  rotation: Radians = this.defaultRotation;

  constructor(config: CameraConfig = {}) {
    this.worldPan = config.position ?? this.defaultPan;
    this.zoom = config.zoom ?? this.defaultZoom;
    this.rotation = config.rotation ?? this.defaultRotation;
  }

  get pan(): WorldPoint {
    return this.worldPan;
  }

  /**
   * Unproject a container-local pixel to world space. `containerWidth` / `containerHeight` must match
   * the same element as `point` (e.g. canvas `width`/`height` or host `getBoundingClientRect()`).
   */
  containerToWorld(
    point: ContainerPoint,
    containerWidth: number,
    containerHeight: number
  ): WorldPoint {
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    // 1. Translate relative to center
    const relX = point.x - centerX;
    const relY = point.y - centerY;

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
    const worldX = scaledX - this.worldPan.x;
    const worldY = scaledY - this.worldPan.y;

    return { x: worldX, y: worldY } satisfies WorldPoint;
  }

  /**
   * Adds a container-pixel drag step ({@link ContainerDelta}) to `pan`.
   * Rotates the delta to match world axes, then divides by zoom.
   */
  panBy(delta: ContainerDelta) {
    // We want the drag to feel like "grabbing the world".
    // If the camera is rotated 90 deg, dragging "Up" on screen should move world "Up" relative to screen.
    // We apply the INVERSE rotation to the delta vector to align it with world axes.
    const cos = Math.cos(-this.rotation);
    const sin = Math.sin(-this.rotation);

    const rotDx = delta.x * cos - delta.y * sin;
    const rotDy = delta.x * sin + delta.y * cos;

    const nextX = this.worldPan.x + rotDx / this.zoom;
    const nextY = this.worldPan.y + rotDy / this.zoom;
    this.worldPan = { x: nextX, y: nextY };
  }

  zoomBy(delta: number, min: number, max: number) {
    const newZoom = this.zoom + delta;
    this.zoom = Math.max(min, Math.min(max, newZoom));
  }

  rotateBy(deltaRadians: Radians) {
    this.rotation = radians(this.rotation + deltaRadians);
  }

  reset() {
    this.worldPan = { x: this.defaultPan.x, y: this.defaultPan.y };
    this.zoom = this.defaultZoom;
    this.rotation = this.defaultRotation;
  }
}
