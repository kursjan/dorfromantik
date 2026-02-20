import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HexRenderer } from './HexRenderer';
import { HexCoordinate } from '../../models/HexCoordinate';
import { DEFAULT_HEX_STYLE } from './HexStyles';

describe('HexRenderer', () => {
  let ctx: CanvasRenderingContext2D;
  let renderer: HexRenderer;

  beforeEach(() => {
    // Create a mock context with all necessary methods
    ctx = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      fillText: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    renderer = new HexRenderer(ctx);
  });

  it('draws a single hex correctly', () => {
    const hex = new HexCoordinate(0, 0, 0);
    renderer.drawHex(hex, DEFAULT_HEX_STYLE);

    expect(ctx.beginPath).toHaveBeenCalled();
    // Flat-topped hex has 6 corners, so 1 moveTo + 5 lineTo + closePath (or 6 lineTo depending on implementation)
    // The current implementation uses moveTo(c0) + loop 1..5 lineTo
    expect(ctx.moveTo).toHaveBeenCalledTimes(1);
    expect(ctx.lineTo).toHaveBeenCalledTimes(5);
    expect(ctx.closePath).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();

    // Check style application
    expect(ctx.lineWidth).toBe(DEFAULT_HEX_STYLE.lineWidth);
    expect(ctx.strokeStyle).toBe(DEFAULT_HEX_STYLE.strokeColor);
  });

  it('draws the debug grid with correct count', () => {
    const drawHexSpy = vi.spyOn(renderer, 'drawHex');
    const radius = 2;
    renderer.drawDebugGrid(radius);

    // Formula for hex count in a hexagon of radius R: 3*R*(R+1) + 1
    // R=2 -> 3*2*3 + 1 = 19 hexes
    expect(drawHexSpy).toHaveBeenCalledTimes(19);
  });

  it('handles highlight drawing', () => {
    const drawHexSpy = vi.spyOn(renderer, 'drawHex');

    // 1. Null hex -> no draw
    renderer.drawHighlight(null);
    expect(drawHexSpy).not.toHaveBeenCalled();

    // 2. Valid hex -> draw
    const hex = new HexCoordinate(1, -1, 0);
    renderer.drawHighlight(hex);
    expect(drawHexSpy).toHaveBeenCalledWith(
      hex,
      expect.objectContaining({ strokeColor: '#FFD700' })
    );
  });
});
