import { Tile } from '../../models/Tile';
import { getHexCorners, hexToPixel } from '../utils/HexUtils';
import { type HexStyle, TERRAIN_COLORS, DEFAULT_HEX_STYLE } from './HexStyles';
import { HexCoordinate } from '../../models/HexCoordinate';
import { WaterTerrain } from '../../models/Terrain';

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
    const originalAlpha = this.ctx.globalAlpha;
    this.ctx.globalAlpha = style.opacity ?? 1;

    const corners = getHexCorners(x, y, style.size);
    const terrains = tile.getTerrains();
    const waterSegments: { index: number; linkToCenter: boolean }[] = [];

    // Iterate through terrains in the order they are defined in the model (North, North-East, ...)
    // In our Flat-Top orientation:
    // Index 0 (North) corresponds to the wedge between Corner 4 (240°) and Corner 5 (300°).
    // We can use an offset of 4 to align the model sides with the canvas corners.
    Object.values(terrains).forEach((terrain, i) => {
      const isWater = terrain.name === 'water';
      const color = isWater ? TERRAIN_COLORS.pasture : TERRAIN_COLORS[terrain.name];
      const startCorner = (i + 4) % 6;
      const endCorner = (i + 5) % 6;

      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(corners[startCorner].x, corners[startCorner].y);
      this.ctx.lineTo(corners[endCorner].x, corners[endCorner].y);
      this.ctx.closePath();

      this.ctx.fillStyle = color;
      this.ctx.fill();

      if (isWater) {
        waterSegments.push({
          index: i,
          linkToCenter: terrain instanceof WaterTerrain && terrain.linkToCenter,
        });
      }
    });

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
    waterSegments: { index: number; linkToCenter: boolean }[],
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
