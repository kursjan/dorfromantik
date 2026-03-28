import {
  TERRAIN_TYPES,
  WaterOrPastureTerrain,
  type Terrain,
  type TerrainType,
} from '../../../models/Terrain';

import { type TerrainSegmentRenderer, type WedgeDrawContext } from './WedgeDrawContext';
import { pastureSegmentRenderer } from './PastureSegmentRenderer';
import { waterSegmentRenderer } from './WaterSegmentRenderer';

function resolveWaterOrPastureNeighborPaint(neighborAcrossEdge: Terrain | undefined): TerrainType {
  if (!neighborAcrossEdge) {
    return 'pasture';
  }
  const opposite = neighborAcrossEdge.edgeMatchTypes();
  const intersection = new Set<TerrainType>();
  for (const t of WaterOrPastureTerrain.edgeMatchTerrainTypes()) {
    if (opposite.has(t)) intersection.add(t);
  }
  if (intersection.size === 0) {
    return 'pasture';
  }
  for (const t of TERRAIN_TYPES) {
    if (intersection.has(t)) return t;
  }
  return 'pasture';
}

export class WaterOrPastureSegmentRenderer implements TerrainSegmentRenderer {
  render(
    context: WedgeDrawContext,
    neighborAcrossEdge: Terrain | undefined,
    segmentTerrain: Terrain
  ): void {
    const resolved = resolveWaterOrPastureNeighborPaint(neighborAcrossEdge);

    if (resolved === 'water') {
      waterSegmentRenderer.render(context, neighborAcrossEdge, segmentTerrain);
      return;
    }
    if (resolved === 'pasture') {
      pastureSegmentRenderer.render(context, neighborAcrossEdge, segmentTerrain);
      return;
    }
    throw new Error(`Unexpected resolved terrain type for waterOrPasture wedge: ${resolved}`);
  }
}

/** Stateless singleton — reuse instead of allocating per wedge. */
export const waterOrPastureSegmentRenderer = new WaterOrPastureSegmentRenderer();
