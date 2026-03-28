import { TERRAIN_COLORS } from '../HexStyles';
import type { Terrain } from '../../../models/Terrain';
import {
  fillHexWedge,
  type TerrainSegmentRenderer,
  type WedgeDrawContext,
} from './WedgeDrawContext';

export class FieldSegmentRenderer implements TerrainSegmentRenderer {
  render(
    context: WedgeDrawContext,
    _neighborAcrossEdge: Terrain | undefined,
    _segmentTerrain: Terrain
  ): void {
    fillHexWedge(context, TERRAIN_COLORS.field);
  }
}

/** Stateless singleton — reuse instead of allocating per wedge. */
export const fieldSegmentRenderer = new FieldSegmentRenderer();
