import { radians, type Radians } from '../../../utils/Angle';
import { WORLD_ORIGIN, type WorldPoint } from '../WorldPoint';

export type CameraSnapshot = {
  position: WorldPoint;
  zoom: number;
  rotation: Radians;
};

/** Canonical initial pose: origin pan, zoom 1, rotation 0. Used by {@link Camera}, canvas controller, and hooks. */
export const DEFAULT_CAMERA_SNAPSHOT = {
  position: WORLD_ORIGIN,
  zoom: 1,
  rotation: radians(0),
} satisfies CameraSnapshot;
