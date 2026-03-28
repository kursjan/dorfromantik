import { Tile } from '../../models/Tile';
import { getHexCorners, hexToPixel } from '../utils/HexUtils';
import { type HexStyle, TERRAIN_COLORS, DEFAULT_HEX_STYLE } from './HexStyles';
import type { WedgeDrawContext } from './segmentRenderers/WedgeDrawContext';
import { TERRAIN_ID_SEGMENT_RENDERERS } from './segmentRenderers/terrainIdSegmentRenderers';
import { HexCoordinate } from '../../models/HexCoordinate';
import { Board } from '../../models/Board';
import { directions, getNeighbor, getOpposite, type Direction } from '../../models/Navigation';
import { WaterOrPastureTerrain, WaterTerrain, type Terrain } from '../../models/Terrain';

export interface TileDrawOptions {
  /** Terrain on the neighbor tile along the shared edge for each direction (see `neighborEdgeTerrainsFromBoard`). */
  neighborEdgeTerrains?: Partial<Record<Direction, Terrain>>;
}

export function neighborEdgeTerrainsFromBoard(
  board: Board,
  coord: HexCoordinate
): Partial<Record<Direction, Terrain>> {
  const out: Partial<Record<Direction, Terrain>> = {};
  for (const d of directions) {
    const nCoord = getNeighbor(coord, d);
    const boardTile = board.get(nCoord);
    if (boardTile) {
      out[d] = boardTile.tile.getTerrain(getOpposite(d));
    }
  }
  return out;
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
    options?: TileDrawOptions
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

      const linkWaterStrokeToCenter =
        (terrain instanceof WaterTerrain || terrain instanceof WaterOrPastureTerrain) &&
        terrain.linkToCenter;

      const wedgeContext: WedgeDrawContext = {
        ctx: this.ctx,
        centerX: x,
        centerY: y,
        corners,
        segmentIndex: i,
        startCorner,
        endCorner,
        style,
        linkWaterStrokeToCenter,
      };

      const neighborAcrossEdge = options?.neighborEdgeTerrains?.[direction];
      TERRAIN_ID_SEGMENT_RENDERERS[terrain.id].render(wedgeContext, neighborAcrossEdge);
    }

    this.drawWaterCenter(tile, x, y, style);

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
    const neighborEdgeTerrains = board ? neighborEdgeTerrainsFromBoard(board, hex) : undefined;
    this.drawTile(tile, x, y, style, { neighborEdgeTerrains });
  }

  private drawWaterCenter(tile: Tile, x: number, y: number, style: HexStyle): void {
    if (tile.center?.id !== 'water') {
      return;
    }

    const centerHexCorners = getHexCorners(x, y, style.size * 0.25);
    this.ctx.beginPath();
    this.ctx.moveTo(centerHexCorners[0].x, centerHexCorners[0].y);
    for (let i = 1; i < 6; i++) {
      this.ctx.lineTo(centerHexCorners[i].x, centerHexCorners[i].y);
    }
    this.ctx.closePath();
    this.ctx.fillStyle = TERRAIN_COLORS.water;
    this.ctx.fill();
  }
}
