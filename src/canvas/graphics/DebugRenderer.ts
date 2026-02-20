import { Camera } from '../engine/Camera';
import { HexCoordinate } from '../../models/HexCoordinate';
import { DEBUG_OVERLAY_TEXT_COLOR, DEBUG_OVERLAY_FONT } from './DebugStyles';

export class DebugRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public drawOverlay(camera: Camera, hoveredHex: HexCoordinate | null) {
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'alphabetic';
    this.ctx.fillStyle = DEBUG_OVERLAY_TEXT_COLOR;
    this.ctx.font = DEBUG_OVERLAY_FONT;

    let debugText = `Camera: (${Math.round(camera.x)},${Math.round(camera.y)}) Zoom: ${camera.zoom.toFixed(2)}`;
    if (hoveredHex) {
      debugText += ` | Hover: (${hoveredHex.q},${hoveredHex.r},${hoveredHex.s})`;
    }
    this.ctx.fillText(debugText, 20, 30);
  }
}
