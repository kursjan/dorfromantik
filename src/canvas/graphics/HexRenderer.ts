import { HexCoordinate } from '../../models/HexCoordinate';
import { hexToPixel, getHexCorners } from '../utils/HexUtils';
import {
  type HexStyle,
  DEFAULT_HEX_STYLE,
  GRID_HEX_STYLE,
  CENTER_HEX_STYLE,
  HOVER_HEX_STYLE,
} from './HexStyles';

export class HexRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Draws a single hex with the given style.
   */
  drawHex(hex: HexCoordinate, style: HexStyle = DEFAULT_HEX_STYLE, label?: string) {
    const { x, y } = hexToPixel(hex, style.size);
    const corners = getHexCorners(x, y, style.size);
    const ctx = this.ctx;

    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < 6; i++) {
      ctx.lineTo(corners[i].x, corners[i].y);
    }
    ctx.closePath();

    ctx.lineWidth = style.lineWidth;
    ctx.strokeStyle = style.strokeColor;
    ctx.stroke();

    if (style.fillColor !== 'transparent') {
      ctx.fillStyle = style.fillColor;
      ctx.fill();
    }

    const text = label ?? `${hex.q},${hex.r},${hex.s}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = style.font;
    ctx.fillStyle = style.textColor;
    ctx.fillText(text, x, y);
  }

  /**
   * Draws a debug grid centered around (0,0).
   */
  drawDebugGrid(radius: number = 5) {
    for (let q = -radius; q <= radius; q++) {
      const r1 = Math.max(-radius, -q - radius);
      const r2 = Math.min(radius, -q + radius);
      for (let r = r1; r <= r2; r++) {
        const s = -q - r;
        const hex = new HexCoordinate(q, r, s);

        let style = GRID_HEX_STYLE;

        if (q === 0 && r === 0 && s === 0) {
          style = CENTER_HEX_STYLE;
        }

        this.drawHex(hex, style);
      }
    }
  }

  /**
   * Highlights a specific hex if provided.
   */
  drawHighlight(hex: HexCoordinate | null) {
    if (hex) {
      this.drawHex(hex, HOVER_HEX_STYLE);
    }
  }
}
