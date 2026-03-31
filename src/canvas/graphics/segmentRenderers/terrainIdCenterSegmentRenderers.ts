import type { TerrainId } from '../../../models/Terrain';
import type { CenterSegmentRenderer } from './CenterDrawContext';
import { waterCenterSegmentRenderer } from './WaterCenterSegmentRenderer';
import { railCenterSegmentRenderer } from './RailCenterSegmentRenderer';

/** Center renderers by terrain id (only terrains that use {@link Tile.center}). */
export const TERRAIN_ID_CENTER_SEGMENT_RENDERERS: Partial<
  Record<TerrainId, CenterSegmentRenderer>
> = {
  water: waterCenterSegmentRenderer,
  rail: railCenterSegmentRenderer,
};
