import type { Radians } from '../../utils/Angle';
import type { WorldPoint } from '../common/WorldPoint';

/**
 * React-facing camera pose for the SVG path (`useCameraControls` → `SvgBoard`). Not used by the canvas rAF loop.
 * {@link WorldPoint} is the pan offset in world/layout space; zoom and rotation match {@link Camera}.
 */
export type CameraSnapshot = {
  position: WorldPoint;
  zoom: number;
  rotation: Radians;
};
