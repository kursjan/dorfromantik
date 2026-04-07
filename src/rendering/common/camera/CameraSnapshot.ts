import { radians, type Radians } from '../../../utils/Angle';
import { WORLD_ORIGIN, type WorldPoint } from '../WorldPoint';

export type CameraSnapshot = Readonly<{
  position: WorldPoint;
  zoom: number;
  rotation: Radians;
}>;

export const DEFAULT_CAMERA_SNAPSHOT = {
  position: WORLD_ORIGIN,
  zoom: 1,
  rotation: radians(0),
} satisfies CameraSnapshot;
