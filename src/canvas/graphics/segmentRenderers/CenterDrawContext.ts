import type { Terrain } from '../../../models/Terrain';
import type { Tile } from '../../../models/Tile';
import type { HexStyle } from '../HexStyles';

/** Pixel context for drawing the optional center hex inside a tile. */
export interface CenterDrawContext {
  ctx: CanvasRenderingContext2D;
  centerX: number;
  centerY: number;
  corners: { x: number; y: number }[];
  style: HexStyle;
  tile: Tile;
}

/**
 * Renders the center segment when {@link Tile.center} is set.
 * Only {@link TerrainId}s present in the registry are drawn.
 */
export interface CenterSegmentRenderer {
  render(context: CenterDrawContext, centerTerrain: Terrain): void;
}
