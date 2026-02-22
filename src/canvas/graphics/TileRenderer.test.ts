import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TileRenderer } from './TileRenderer';
import { Tile } from '../../models/Tile';
import { HexCoordinate } from '../../models/HexCoordinate';
import { DEFAULT_HEX_STYLE } from './HexStyles';

describe('TileRenderer', () => {
  let ctx: CanvasRenderingContext2D;
  let renderer: TileRenderer;

  beforeEach(() => {
    ctx = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    renderer = new TileRenderer(ctx);
  });

  it('draws a tile with 6 terrain sections and an outline', () => {
    const tile = new Tile({
      id: 'test-tile',
      north: 'tree',
      northEast: 'water',
      southEast: 'house',
      south: 'pasture',
      southWest: 'rail',
      northWest: 'field',
    });

    renderer.drawTile(tile, 0, 0, DEFAULT_HEX_STYLE);

    // 6 terrains + 1 outline = 7 beginPath calls
    expect(ctx.beginPath).toHaveBeenCalledTimes(7);
    
    // Each terrain section is a triangle (moveTo center, lineTo c1, lineTo c2, closePath)
    // 6 terrains * 1 moveTo = 6 moveTo
    // 1 outline * 1 moveTo = 1 moveTo
    expect(ctx.moveTo).toHaveBeenCalledTimes(7);

    // 6 terrains * 2 lineTo = 12 lineTo
    // 1 outline * 5 lineTo = 5 lineTo
    expect(ctx.lineTo).toHaveBeenCalledTimes(17);

    expect(ctx.fill).toHaveBeenCalledTimes(6);
    expect(ctx.stroke).toHaveBeenCalledTimes(1);
    expect(ctx.closePath).toHaveBeenCalledTimes(7);
  });

  it('draws a tile at a specific hex coordinate', () => {
    const tile = Tile.createRandom('random');
    const hex = new HexCoordinate(1, 0, -1);
    const drawTileSpy = vi.spyOn(renderer, 'drawTile');

    renderer.drawTileAtHex(tile, hex, DEFAULT_HEX_STYLE);

    expect(drawTileSpy).toHaveBeenCalled();
    // hexToPixel for (1,0,-1) with size 40 is (0, size * sqrt(3))
    // Wait, let's verify exact call if needed, but the fact it's called is good.
    const [calledTile, x, y, style] = drawTileSpy.mock.calls[0];
    expect(calledTile).toBe(tile);
    expect(style).toBe(DEFAULT_HEX_STYLE);
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(40 * Math.sqrt(3));
  });
});
