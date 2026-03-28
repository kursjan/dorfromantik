import { Tile } from '../../models/Tile';
import { getHexCorners } from '../utils/HexUtils';
import { type HexStyle, TERRAIN_COLORS } from './HexStyles';

/**
 * Tile-level water visuals that are not one of the six edge segments (e.g. center “lake” hex).
 */
export class WaterRenderer {
  /** Fills a small hex at the tile center when {@link Tile.center} is water. */
  static drawCenterHex(
    ctx: CanvasRenderingContext2D,
    tile: Tile,
    x: number,
    y: number,
    style: HexStyle
  ): void {
    if (tile.center?.id !== 'water') {
      return;
    }

    const centerHexCorners = getHexCorners(x, y, style.size * 0.25);
    ctx.beginPath();
    ctx.moveTo(centerHexCorners[0].x, centerHexCorners[0].y);
    for (let i = 1; i < 6; i++) {
      ctx.lineTo(centerHexCorners[i].x, centerHexCorners[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = TERRAIN_COLORS.water;
    ctx.fill();
  }
}
