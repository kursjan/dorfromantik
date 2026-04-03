import { Camera } from '../engine/Camera';
import { HexCoordinate } from '../../models/HexCoordinate';
import { DEBUG_OVERLAY_TEXT_COLOR, DEBUG_OVERLAY_FONT } from './DebugStyles';

/**
 * Legacy debug text drawn with Canvas `Context2D`. Do not add new call sites.
 *
 * @deprecated Migrate to an **HTML overlay** (e.g. `src/canvas/components/DebugOverlay.tsx`, fed by
 * `CanvasController` debug stats). This class exists only until any remaining canvas usage is removed.
 */
export class DebugRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /** @deprecated Canvas path; replace with HTML overlay rendering. */
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
