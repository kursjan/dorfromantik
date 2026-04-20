import { TERRAIN_COLORS } from '../HexStyles';
import { type Terrain, type WaterStrokeEdge } from '../../../../models/Terrain';
import {
  fillHexWedge,
  type TerrainSegmentRenderer,
  type WedgeDrawContext,
} from './WedgeDrawContext';

export class WaterSegmentRenderer implements TerrainSegmentRenderer {
  render(
    context: WedgeDrawContext,
    _neighborAcrossEdge: Terrain | undefined,
    segmentTerrain: Terrain
  ): void {
    fillHexWedge(context, TERRAIN_COLORS.pasture);
    this.drawWaterStroke(context, segmentTerrain as WaterStrokeEdge);
  }

  /** River stroke from the middle of this wedge’s outer edge toward the center (or midpoint). */
  private drawWaterStroke(context: WedgeDrawContext, waterEdge: WaterStrokeEdge): void {
    const { ctx, corners, centerX, centerY, style, startCorner, endCorner } = context;

    ctx.strokeStyle = TERRAIN_COLORS.water;
    ctx.lineWidth = Math.max(5, style.size * 0.24);

    const edgeMidpoint = {
      x: (corners[startCorner].x + corners[endCorner].x) / 2,
      y: (corners[startCorner].y + corners[endCorner].y) / 2,
    };
    const target = waterEdge.linkToCenter
      ? { x: centerX, y: centerY }
      : {
          x: (edgeMidpoint.x + centerX) / 2,
          y: (edgeMidpoint.y + centerY) / 2,
        };

    ctx.beginPath();
    ctx.moveTo(edgeMidpoint.x, edgeMidpoint.y);
    const dx = target.x - edgeMidpoint.x;
    const dy = target.y - edgeMidpoint.y;
    const length = Math.hypot(dx, dy) || 1;
    const curveStrength = style.size * 0.08;
    const controlX = (edgeMidpoint.x + target.x) / 2 + (-dy / length) * curveStrength;
    const controlY = (edgeMidpoint.y + target.y) / 2 + (dx / length) * curveStrength;
    ctx.quadraticCurveTo(controlX, controlY, target.x, target.y);
    ctx.stroke();
  }
}

/** Stateless singleton — reuse instead of allocating per wedge. */
export const waterSegmentRenderer = new WaterSegmentRenderer();
