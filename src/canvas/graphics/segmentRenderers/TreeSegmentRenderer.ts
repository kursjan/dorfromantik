import { TERRAIN_COLORS } from '../HexStyles';
import type { Terrain } from '../../../models/Terrain';
import {
  fillHexWedge,
  type TerrainSegmentRenderer,
  type WedgeDrawContext,
} from './WedgeDrawContext';

export class TreeSegmentRenderer implements TerrainSegmentRenderer {
  render(context: WedgeDrawContext, _neighborAcrossEdge: Terrain | undefined): void {
    fillHexWedge(context, TERRAIN_COLORS.tree);
  }
}

/** Stateless singleton — reuse instead of allocating per wedge. */
export const treeSegmentRenderer = new TreeSegmentRenderer();
