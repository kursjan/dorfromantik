import { Tile } from '../../models/Tile';
import { getHexCorners, hexToPixel } from '../utils/HexUtils';
import { type HexStyle, TERRAIN_COLORS, DEFAULT_HEX_STYLE } from './HexStyles';
import { HexCoordinate } from '../../models/HexCoordinate';
import { Board } from '../../models/Board';
import { directions, getNeighbor, getOpposite, type Direction } from '../../models/Navigation';
import { WaterOrPastureTerrain, WaterTerrain, type Terrain } from '../../models/Terrain';

export interface TileDrawOptions {
  /** Terrain on the neighbor tile along the shared edge for each direction (see `neighborEdgeTerrainsFromBoard`). */
  neighborEdgeTerrains?: Partial<Record<Direction, Terrain>>;
}

/**
 * How to paint a `waterOrPasture` wedge: water-like vs pasture, from the neighbor across that edge.
 */
export function resolveWaterOrPastureVisual(
  neighborTerrain: Terrain | undefined
): 'water' | 'pasture' {
  if (!neighborTerrain) return 'pasture';
  if (neighborTerrain.name === 'water') return 'water';
  if (neighborTerrain.name === 'pasture') return 'pasture';
  if (neighborTerrain.name === 'waterOrPasture') return 'pasture';
  return 'pasture';
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
    const waterSegments: { index: number; linkToCenter: boolean }[] = [];

    for (let i = 0; i < directions.length; i++) {
      const direction = directions[i];
      const terrain = terrainsMap[direction];
      const startCorner = (i + 4) % 6;
      const endCorner = (i + 5) % 6;

      let fillColor: string;
      if (terrain.name === 'water') {
        fillColor = TERRAIN_COLORS.pasture;
        waterSegments.push({
          index: i,
          linkToCenter: terrain instanceof WaterTerrain && terrain.linkToCenter,
        });
      } else if (terrain.name === 'waterOrPasture') {
        const neighbor = options?.neighborEdgeTerrains?.[direction];
        const visual = resolveWaterOrPastureVisual(neighbor);
        if (visual === 'water') {
          fillColor = TERRAIN_COLORS.pasture;
          waterSegments.push({
            index: i,
            linkToCenter: terrain instanceof WaterOrPastureTerrain && terrain.linkToCenter,
          });
        } else {
          fillColor = TERRAIN_COLORS.pasture;
        }
      } else {
        fillColor = TERRAIN_COLORS[terrain.name];
      }

      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(corners[startCorner].x, corners[startCorner].y);
      this.ctx.lineTo(corners[endCorner].x, corners[endCorner].y);
      this.ctx.closePath();

      this.ctx.fillStyle = fillColor;
      this.ctx.fill();
    }

    this.drawWaterSegments(corners, x, y, style, waterSegments);
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

  private drawWaterSegments(
    corners: { x: number; y: number }[],
    centerX: number,
    centerY: number,
    style: HexStyle,
    waterSegments: { index: number; linkToCenter: boolean }[]
  ): void {
    this.ctx.strokeStyle = TERRAIN_COLORS.water;
    this.ctx.lineWidth = Math.max(5, style.size * 0.24);

    for (const segment of waterSegments) {
      const startCorner = (segment.index + 4) % 6;
      const endCorner = (segment.index + 5) % 6;
      const edgeMidpoint = {
        x: (corners[startCorner].x + corners[endCorner].x) / 2,
        y: (corners[startCorner].y + corners[endCorner].y) / 2,
      };
      const target = segment.linkToCenter
        ? { x: centerX, y: centerY }
        : {
            x: (edgeMidpoint.x + centerX) / 2,
            y: (edgeMidpoint.y + centerY) / 2,
          };

      this.ctx.beginPath();
      this.ctx.moveTo(edgeMidpoint.x, edgeMidpoint.y);
      const dx = target.x - edgeMidpoint.x;
      const dy = target.y - edgeMidpoint.y;
      const length = Math.hypot(dx, dy) || 1;
      const curveStrength = style.size * 0.08;
      const controlX = (edgeMidpoint.x + target.x) / 2 + (-dy / length) * curveStrength;
      const controlY = (edgeMidpoint.y + target.y) / 2 + (dx / length) * curveStrength;
      this.ctx.quadraticCurveTo(controlX, controlY, target.x, target.y);
      this.ctx.stroke();
    }
  }

  private drawWaterCenter(tile: Tile, x: number, y: number, style: HexStyle): void {
    if (tile.center?.name !== 'water') {
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
