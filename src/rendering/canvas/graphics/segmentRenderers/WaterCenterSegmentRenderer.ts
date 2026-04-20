import { getHexCorners } from '../../../common/hex/HexUtils';
import { WorldPoint } from '../../../common/WorldPoint';
import { TERRAIN_COLORS } from '../HexStyles';
import type { Terrain } from '../../../../models/Terrain';
import { type CenterDrawContext, type CenterSegmentRenderer } from './CenterDrawContext';

export class WaterCenterSegmentRenderer implements CenterSegmentRenderer {
  render(context: CenterDrawContext, _centerTerrain: Terrain): void {
    const { ctx, centerX, centerY, style } = context;
    const centerHexCorners = getHexCorners(WorldPoint.xy(centerX, centerY), style.size * 0.35);
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

export const waterCenterSegmentRenderer = new WaterCenterSegmentRenderer();
