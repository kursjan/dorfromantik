import { TERRAIN_COLORS } from '../HexStyles';
import type { Terrain } from '../../../models/Terrain';
import {
  fillHexWedge,
  type TerrainSegmentRenderer,
  type WedgeDrawContext,
} from './WedgeDrawContext';

export class HouseSegmentRenderer implements TerrainSegmentRenderer {
  render(context: WedgeDrawContext, _neighborAcrossEdge: Terrain | undefined): void {
    fillHexWedge(context, TERRAIN_COLORS.house);
  }
}

/** Stateless singleton — reuse instead of allocating per wedge. */
export const houseSegmentRenderer = new HouseSegmentRenderer();
