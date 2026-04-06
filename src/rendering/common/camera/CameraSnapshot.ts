import { radians, type Radians } from '../../../utils/Angle';
import { WORLD_ORIGIN, type WorldPoint } from '../WorldPoint';

/** Immutable camera pose for UI and rendering; always replace the object to change it. */
export type CameraSnapshot = Readonly<{
  position: WorldPoint;
  zoom: number;
  rotation: Radians;
}>;

/** Canonical initial pose: origin pan, zoom 1, rotation 0. Used by {@link Camera}, canvas controller, and hooks. */
export const DEFAULT_CAMERA_SNAPSHOT = {
  position: WORLD_ORIGIN,
  zoom: 1,
  rotation: radians(0),
} satisfies CameraSnapshot;
