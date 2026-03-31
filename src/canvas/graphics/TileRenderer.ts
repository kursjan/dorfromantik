import { Tile } from '../../models/Tile';
import { getHexCorners, hexToPixel } from '../utils/HexUtils';
import { type HexStyle, DEFAULT_HEX_STYLE } from './HexStyles';
import type { CenterDrawContext } from './segmentRenderers/CenterDrawContext';
import type { WedgeDrawContext } from './segmentRenderers/WedgeDrawContext';
import { TERRAIN_ID_CENTER_SEGMENT_RENDERERS } from './segmentRenderers/terrainIdCenterSegmentRenderers';
import { TERRAIN_ID_SEGMENT_RENDERERS } from './segmentRenderers/terrainIdSegmentRenderers';
import { HexCoordinate } from '../../models/HexCoordinate';
import { Board } from '../../models/Board';
import { BoardNavigation } from '../../models/BoardNavigation';
import { directions, type Direction } from '../../models/Navigation';
import type { Terrain } from '../../models/Terrain';

export interface TileDrawOptions {
  /** Terrain on the neighbor tile along the shared edge for each direction (see {@link BoardNavigation.neighborEdgeTerrains}). */
  neighborEdgeTerrains?: Partial<Record<Direction, Terrain>>;
}

export class TileRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Draws a 6-sided tile with terrains represented by colors at pixel coordinates (x, y).
   */
  drawTile(
    tile: Tile,
    x: number,
    y: number,
    style: HexStyle = DEFAULT_HEX_STYLE,
    options: TileDrawOptions = {}
  ) {
    const originalAlpha = this.ctx.globalAlpha;
    this.ctx.globalAlpha = style.opacity ?? 1;

    const corners = getHexCorners(x, y, style.size);
    const terrainsMap = tile.getTerrains();

    for (let i = 0; i < directions.length; i++) {
      const direction = directions[i];
      const terrain = terrainsMap[direction];
      const startCorner = (i + 4) % 6;
      const endCorner = (i + 5) % 6;

      const wedgeContext: WedgeDrawContext = {
        ctx: this.ctx,
        centerX: x,
        centerY: y,
        corners,
        segmentIndex: i,
        startCorner,
        endCorner,
        style,
      };

      const neighborAcrossEdge = options.neighborEdgeTerrains?.[direction];
      TERRAIN_ID_SEGMENT_RENDERERS[terrain.id].render(wedgeContext, neighborAcrossEdge, terrain);
    }

    this.drawCenter(tile, x, y, style, corners);

    // Draw hex outline
    this.ctx.beginPath();
    this.ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < 6; i++) {
      this.ctx.lineTo(corners[i].x, corners[i].y);
    }
    this.ctx.closePath();

    this.ctx.lineWidth = style.lineWidth;
    this.ctx.strokeStyle = style.strokeColor;
    this.ctx.stroke();

    this.ctx.globalAlpha = originalAlpha;
  }

  /**
   * Draws a 6-sided tile at a specific hex coordinate.
   * Pass `board` so `waterOrPasture` edges resolve against real neighbors.
   */
  drawTileAtHex(
    tile: Tile,
    hex: HexCoordinate,
    style: HexStyle = DEFAULT_HEX_STYLE,
    board?: Board
  ) {
    const { x, y } = hexToPixel(hex, style.size);
    const neighborEdgeTerrains = board
      ? BoardNavigation.neighborEdgeTerrains(board, hex)
      : undefined;
    this.drawTile(tile, x, y, style, { neighborEdgeTerrains });
  }

  private drawCenter(
    tile: Tile,
    x: number,
    y: number,
    style: HexStyle,
    corners: { x: number; y: number }[]
  ): void {
    const center = tile.center;
    if (!center) {
      return;
    }
    const renderer = TERRAIN_ID_CENTER_SEGMENT_RENDERERS[center.id];
    if (!renderer) {
      return;
    }
    const context: CenterDrawContext = {
      ctx: this.ctx,
      centerX: x,
      centerY: y,
      corners,
      style,
      tile,
    };
    renderer.render(context, center);
  }
}
