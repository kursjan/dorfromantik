import { TERRAIN_COLORS } from '../HexStyles';
import { type Terrain, type RailTerrain } from '../../../../models/Terrain';
import {
  fillHexWedge,
  type TerrainSegmentRenderer,
  type WedgeDrawContext,
} from './WedgeDrawContext';

export class RailSegmentRenderer implements TerrainSegmentRenderer {
  render(
    context: WedgeDrawContext,
    _neighborAcrossEdge: Terrain | undefined,
    segmentTerrain: Terrain
  ): void {
    fillHexWedge(context, TERRAIN_COLORS.pasture);
    this.drawRailStroke(context, segmentTerrain as RailTerrain);
  }

  private drawRailStroke(context: WedgeDrawContext, railEdge: RailTerrain): void {
    const { ctx, corners, centerX, centerY, style, startCorner, endCorner } = context;

    const edgeMidpoint = {
      x: (corners[startCorner].x + corners[endCorner].x) / 2,
      y: (corners[startCorner].y + corners[endCorner].y) / 2,
    };
    const target = railEdge.linkToCenter
      ? { x: centerX, y: centerY }
      : {
          x: (edgeMidpoint.x + centerX) / 2,
          y: (edgeMidpoint.y + centerY) / 2,
        };

    const dx = target.x - edgeMidpoint.x;
    const dy = target.y - edgeMidpoint.y;
    const length = Math.hypot(dx, dy) || 1;
    const nx = dx / length;
    const ny = dy / length;
    // Perpendicular vector for the sleepers and track offsets
    const px = -ny;
    const py = nx;

    // 1. Draw Sleepers (Ties)
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = Math.max(2, style.size * 0.06);

    const sleeperWidth = style.size * 0.28;
    const spacing = style.size * 0.16;

    ctx.beginPath();
    for (let d = spacing / 2; d < length; d += spacing) {
      const cx = edgeMidpoint.x + nx * d;
      const cy = edgeMidpoint.y + ny * d;
      ctx.moveTo(cx - px * (sleeperWidth / 2), cy - py * (sleeperWidth / 2));
      ctx.lineTo(cx + px * (sleeperWidth / 2), cy + py * (sleeperWidth / 2));
    }
    ctx.stroke();

    // 2. Draw Parallel Rail Tracks
    ctx.strokeStyle = TERRAIN_COLORS.rail;
    ctx.lineWidth = Math.max(1.5, style.size * 0.05);
    const trackOffset = style.size * 0.08;

    ctx.beginPath();
    // Left track
    ctx.moveTo(edgeMidpoint.x - px * trackOffset, edgeMidpoint.y - py * trackOffset);
    ctx.lineTo(target.x - px * trackOffset, target.y - py * trackOffset);
    // Right track
    ctx.moveTo(edgeMidpoint.x + px * trackOffset, edgeMidpoint.y + py * trackOffset);
    ctx.lineTo(target.x + px * trackOffset, target.y + py * trackOffset);
    ctx.stroke();
  }
}

/** Stateless singleton — reuse instead of allocating per wedge. */
export const railSegmentRenderer = new RailSegmentRenderer();
