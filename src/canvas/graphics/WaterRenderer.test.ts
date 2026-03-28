import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Tile } from '../../models/Tile';
import { DEFAULT_HEX_STYLE, TERRAIN_COLORS } from './HexStyles';
import { WaterRenderer } from './WaterRenderer';
import { PastureTerrain, toTerrain } from '../../models/Terrain';

function mockCtx(): CanvasRenderingContext2D {
  return {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    fillStyle: '',
  } as unknown as CanvasRenderingContext2D;
}

describe('WaterRenderer', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ctx = mockCtx();
  });

  it('drawCenterHex is a no-op when tile has no water center', () => {
    const tile = new Tile({
      id: 't',
      north: new PastureTerrain(),
      northEast: new PastureTerrain(),
      southEast: new PastureTerrain(),
      south: new PastureTerrain(),
      southWest: new PastureTerrain(),
      northWest: new PastureTerrain(),
    });

    WaterRenderer.drawCenterHex(ctx, tile, 0, 0, DEFAULT_HEX_STYLE);

    expect(ctx.beginPath).not.toHaveBeenCalled();
    expect(ctx.fill).not.toHaveBeenCalled();
  });

  it('drawCenterHex fills a small hex with water color when center is water', () => {
    const tile = new Tile({
      id: 't',
      center: toTerrain('water'),
      north: new PastureTerrain(),
      northEast: new PastureTerrain(),
      southEast: new PastureTerrain(),
      south: new PastureTerrain(),
      southWest: new PastureTerrain(),
      northWest: new PastureTerrain(),
    });

    WaterRenderer.drawCenterHex(ctx, tile, 10, 20, DEFAULT_HEX_STYLE);

    expect(ctx.beginPath).toHaveBeenCalledTimes(1);
    expect(ctx.fill).toHaveBeenCalledTimes(1);
    expect(ctx.fillStyle).toBe(TERRAIN_COLORS.water);
  });
});
