import { getHexCorners } from '../../../common/hex/HexUtils';
import { TERRAIN_COLORS } from '../HexStyles';
import { type Terrain, type RailTerrain } from '../../../../models/Terrain';
import { type CenterDrawContext, type CenterSegmentRenderer } from './CenterDrawContext';
import { directions } from '../../../../models/Navigation';

export class RailCenterSegmentRenderer implements CenterSegmentRenderer {
  render(context: CenterDrawContext, _centerTerrain: Terrain): void {
    const { ctx, centerX, centerY, style, corners, tile } = context;
    const centerHexCorners = getHexCorners(centerX, centerY, style.size * 0.15);

    ctx.beginPath();
    ctx.moveTo(centerHexCorners[0].x, centerHexCorners[0].y);
    for (let i = 1; i < 6; i++) {
      ctx.lineTo(centerHexCorners[i].x, centerHexCorners[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = TERRAIN_COLORS.rail;
    ctx.fill();

    // Draw sleepers inside the crossing area
    const terrains = tile.getTerrains();
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = Math.max(1.5, style.size * 0.05);

    directions.forEach((dir, i) => {
      const terrain = terrains[dir];
      if (terrain.id === 'rail' && (terrain as RailTerrain).linkToCenter) {
        const startCornerIdx = (i + 4) % 6;
        const endCornerIdx = (i + 5) % 6;
        const edgeMidpoint = {
          x: (corners[startCornerIdx].x + corners[endCornerIdx].x) / 2,
          y: (corners[startCornerIdx].y + corners[endCornerIdx].y) / 2,
        };

        const dx = centerX - edgeMidpoint.x;
        const dy = centerY - edgeMidpoint.y;
        const length = Math.hypot(dx, dy) || 1;
        const nx = dx / length;
        const ny = dy / length;
        const px = -ny;
        const py = nx;

        const sleeperWidth = style.size * 0.22;
        const spacing = style.size * 0.12;

        // Draw a few sleepers near the center to look like a junction/crossing
        ctx.beginPath();
        // Only draw sleepers that fall within the central region
        for (let d = length - spacing; d < length; d += spacing) {
          const cx = edgeMidpoint.x + nx * d;
          const cy = edgeMidpoint.y + ny * d;
          ctx.moveTo(cx - px * (sleeperWidth / 2), cy - py * (sleeperWidth / 2));
          ctx.lineTo(cx + px * (sleeperWidth / 2), cy + py * (sleeperWidth / 2));
        }
        ctx.stroke();
      }
    });
  }
}

export const railCenterSegmentRenderer = new RailCenterSegmentRenderer();
