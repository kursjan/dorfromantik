import type { TerrainId } from '../../../../models/Terrain';
import type { TerrainSegmentRenderer } from './WedgeDrawContext';
import { treeSegmentRenderer } from './TreeSegmentRenderer';
import { houseSegmentRenderer } from './HouseSegmentRenderer';
import { waterSegmentRenderer } from './WaterSegmentRenderer';
import { pastureSegmentRenderer } from './PastureSegmentRenderer';
import { railSegmentRenderer } from './RailSegmentRenderer';
import { fieldSegmentRenderer } from './FieldSegmentRenderer';
import { waterOrPastureSegmentRenderer } from './WaterOrPastureSegmentRenderer';

/** One shared renderer instance per {@link TerrainId} (stateless). */
export const TERRAIN_ID_SEGMENT_RENDERERS: Record<TerrainId, TerrainSegmentRenderer> = {
  tree: treeSegmentRenderer,
  house: houseSegmentRenderer,
  water: waterSegmentRenderer,
  pasture: pastureSegmentRenderer,
  rail: railSegmentRenderer,
  field: fieldSegmentRenderer,
  waterOrPasture: waterOrPastureSegmentRenderer,
};
