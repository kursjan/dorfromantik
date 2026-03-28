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

/**
 * Picks which base {@link TerrainType} to paint on a wedge (tests / tooling).
 * Multi-type locals (e.g. waterOrPasture) use {@link WaterOrPastureTerrain.edgeMatchTerrainTypes} vs neighbor.
 */
export function resolveEdgePaintTerrainType(
  terrain: Terrain,
  neighborAcrossEdge: Terrain | undefined
): TerrainType {
  const local = terrain.edgeMatchTypes();
  if (local.size === 1) {
    return local.values().next().value as TerrainType;
  }
  return resolveWaterOrPastureNeighborPaint(neighborAcrossEdge);
}

export class WaterOrPastureSegmentRenderer implements TerrainSegmentRenderer {
  render(context: WedgeDrawContext, neighborAcrossEdge: Terrain | undefined): void {
    const resolved = resolveWaterOrPastureNeighborPaint(neighborAcrossEdge);

    if (resolved === 'water') {
      waterSegmentRenderer.render(context, neighborAcrossEdge);
      return;
    }
    if (resolved === 'pasture') {
      pastureSegmentRenderer.render(context, neighborAcrossEdge);
      return;
    }
    throw new Error(`Unexpected resolved terrain type for waterOrPasture wedge: ${resolved}`);
  }
}

/** Stateless singleton — reuse instead of allocating per wedge. */
export const waterOrPastureSegmentRenderer = new WaterOrPastureSegmentRenderer();
