import { Tile } from '../../models/Tile';
import { getHexCorners, hexToPixel } from '../utils/HexUtils';
import { type HexStyle, TERRAIN_COLORS, DEFAULT_HEX_STYLE } from './HexStyles';
import { HexCoordinate } from '../../models/HexCoordinate';

export class TileRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Draws a 6-sided tile at a specific hex coordinate.
   */
  drawTileAtHex(tile: Tile, hex: HexCoordinate, style: HexStyle = DEFAULT_HEX_STYLE) {
    const { x, y } = hexToPixel(hex, style.size);
    this.drawTile(tile, x, y, style);
  }

  /**
   * Draws a 6-sided tile with terrains represented by colors at pixel coordinates (x, y).
   * Reuses the terrain mapping from the Tile model.
   */
  drawTile(tile: Tile, x: number, y: number, style: HexStyle = DEFAULT_HEX_STYLE) {
    const corners = getHexCorners(x, y, style.size);
    const terrains = tile.getTerrains();

    // Iterate through terrains in the order they are defined in the model (North, North-East, ...)
    // In our Flat-Top orientation:
    // Index 0 (North) corresponds to the wedge between Corner 4 (240°) and Corner 5 (300°).
    // We can use an offset of 4 to align the model sides with the canvas corners.
    Object.values(terrains).forEach((terrain, i) => {
      const color = TERRAIN_COLORS[terrain];
      const startCorner = (i + 4) % 6;
      const endCorner = (i + 5) % 6;

      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(corners[startCorner].x, corners[startCorner].y);
      this.ctx.lineTo(corners[endCorner].x, corners[endCorner].y);
      this.ctx.closePath();

      this.ctx.fillStyle = color;
      this.ctx.fill();
    });

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
  }
}
