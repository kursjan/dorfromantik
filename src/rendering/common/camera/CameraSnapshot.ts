import type { Radians } from '../../../utils/Angle';
import type { WorldPoint } from '../WorldPoint';

export type CameraSnapshot = {
  position: WorldPoint;
  zoom: number;
  rotation: Radians;
};
