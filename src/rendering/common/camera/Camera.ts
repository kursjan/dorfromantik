import { type Radians, radians } from '../../../utils/Angle';
import type { ContainerDelta, ContainerPoint } from '../ContainerPoint';
import { WorldPoint } from '../WorldPoint';

export interface CameraConfig {
  position?: WorldPoint;
  zoom?: number;
  rotation?: Radians;
}

export class Camera {
  private readonly defaultPan: WorldPoint = WorldPoint.xy(0, 0);
  private readonly defaultZoom: number = 1;
  private readonly defaultRotation: Radians = radians(0);

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

  containerToWorld(
    point: ContainerPoint,
    containerWidth: number,
    containerHeight: number
  ): WorldPoint {
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    const relX = point.x - centerX;
    const relY = point.y - centerY;

    const cos = Math.cos(-this.rotation);
    const sin = Math.sin(-this.rotation);
    const rotX = relX * cos - relY * sin;
    const rotY = relX * sin + relY * cos;

    const scaledX = rotX / this.zoom;
    const scaledY = rotY / this.zoom;

    const worldX = scaledX - this.worldPan.x;
    const worldY = scaledY - this.worldPan.y;

    return WorldPoint.xy(worldX, worldY);
  }

  panBy(delta: ContainerDelta) {
    const cos = Math.cos(-this.rotation);
    const sin = Math.sin(-this.rotation);

    const rotDx = delta.x * cos - delta.y * sin;
    const rotDy = delta.x * sin + delta.y * cos;

    const nextX = this.worldPan.x + rotDx / this.zoom;
    const nextY = this.worldPan.y + rotDy / this.zoom;
    this.worldPan = WorldPoint.xy(nextX, nextY);
  }

  zoomBy(delta: number, min: number, max: number) {
    const newZoom = this.zoom + delta;
    this.zoom = Math.max(min, Math.min(max, newZoom));
  }

  rotateBy(deltaRadians: Radians) {
    this.rotation = radians(this.rotation + deltaRadians);
  }

  reset() {
    this.worldPan = WorldPoint.xy(this.defaultPan.x, this.defaultPan.y);
    this.zoom = this.defaultZoom;
    this.rotation = this.defaultRotation;
  }
}
