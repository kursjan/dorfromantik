import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TileRenderer, neighborEdgeTerrainsFromBoard } from './TileRenderer';
import { Tile } from '../../models/Tile';
import { HexCoordinate } from '../../models/HexCoordinate';
import { Board } from '../../models/Board';
import { DEFAULT_HEX_STYLE, TERRAIN_COLORS } from './HexStyles';
import {
  PastureTerrain,
  toTerrain,
  WaterOrPastureTerrain,
  WaterTerrain,
} from '../../models/Terrain';
import { waterSegmentRenderer } from './segmentRenderers/WaterSegmentRenderer';
import { waterOrPastureSegmentRenderer } from './segmentRenderers/WaterOrPastureSegmentRenderer';

function allPastureTile(id: string, extra: ConstructorParameters<typeof Tile>[0] = {}): Tile {
  const p = () => new PastureTerrain();
  return new Tile({
    id,
    north: p(),
    northEast: p(),
    southEast: p(),
    south: p(),
    southWest: p(),
    northWest: p(),
    ...extra,
  });
}

function mockCanvasContext(): CanvasRenderingContext2D {
  const alpha = { value: 1 };
  return {
    get globalAlpha() {
      return alpha.value;
    },
    set globalAlpha(v: number) {
      alpha.value = v;
    },
    lineWidth: 0,
    strokeStyle: '',
    fillStyle: '',
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

describe('TileRenderer', () => {
  let ctx: CanvasRenderingContext2D;
  let renderer: TileRenderer;

  beforeEach(() => {
    ctx = mockCanvasContext();
    renderer = new TileRenderer(ctx);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('applies style opacity then restores globalAlpha', () => {
    ctx.globalAlpha = 0.99;
    const tile = allPastureTile('a');

    renderer.drawTile(tile, 0, 0, { ...DEFAULT_HEX_STYLE, opacity: 0.4 });

    expect(ctx.globalAlpha).toBe(0.99);
  });

  it('draws center water inset only when tile.center is water', () => {
    const withoutCenter = allPastureTile('no-center');
    renderer.drawTile(withoutCenter, 0, 0, DEFAULT_HEX_STYLE);
    expect(ctx.fill).toHaveBeenCalledTimes(6);

    vi.mocked(ctx.fill).mockClear();

    const withCenter = allPastureTile('with-center', { center: toTerrain('water') });
    renderer.drawTile(withCenter, 0, 0, DEFAULT_HEX_STYLE);
    expect(ctx.fill).toHaveBeenCalledTimes(7);
    expect(ctx.fillStyle).toBe(TERRAIN_COLORS.water);
  });

  it('does not draw center inset when center is not water', () => {
    const tile = allPastureTile('house-center', { center: toTerrain('house') });
    renderer.drawTile(tile, 0, 0, DEFAULT_HEX_STYLE);
    expect(ctx.fill).toHaveBeenCalledTimes(6);
  });

  it('strokes hex outline using style lineWidth and strokeColor', () => {
    const tile = allPastureTile('outline');
    const style = { ...DEFAULT_HEX_STYLE, strokeColor: '#112233', lineWidth: 4 };

    renderer.drawTile(tile, 0, 0, style);

    expect(ctx.stroke).toHaveBeenCalledTimes(1);
    expect(ctx.strokeStyle).toBe('#112233');
    expect(ctx.lineWidth).toBe(4);
  });

  it('passes segment terrain as third render argument for water and waterOrPasture', () => {
    const waterSpy = vi.spyOn(waterSegmentRenderer, 'render');

    const linkedWater = allPastureTile('lw', {
      center: toTerrain('water'),
      north: new WaterTerrain({ linkToCenter: true }),
    });
    renderer.drawTile(linkedWater, 0, 0, DEFAULT_HEX_STYLE);
    expect(waterSpy.mock.calls[0][2]).toBe(linkedWater.north);
    expect((waterSpy.mock.calls[0][2] as WaterTerrain).linkToCenter).toBe(true);

    waterSpy.mockClear();

    const unlinkedWater = allPastureTile('uw', {
      north: new WaterTerrain({ linkToCenter: false }),
    });
    renderer.drawTile(unlinkedWater, 0, 0, DEFAULT_HEX_STYLE);
    expect(waterSpy.mock.calls[0][2]).toBe(unlinkedWater.north);
    expect((waterSpy.mock.calls[0][2] as WaterTerrain).linkToCenter).toBe(false);

    waterSpy.mockClear();

    const linkedWop = allPastureTile('lwop', {
      center: toTerrain('water'),
      north: new WaterOrPastureTerrain({ linkToCenter: true }),
    });
    renderer.drawTile(linkedWop, 0, 0, DEFAULT_HEX_STYLE, {
      neighborEdgeTerrains: { north: new WaterTerrain() },
    });
    expect(waterSpy.mock.calls[0][2]).toBe(linkedWop.north);
    expect((waterSpy.mock.calls[0][2] as WaterOrPastureTerrain).linkToCenter).toBe(true);
  });

  it('forwards neighborEdgeTerrains to the segment renderer per direction', () => {
    const wopSpy = vi.spyOn(waterOrPastureSegmentRenderer, 'render');
    const neighbor = new WaterTerrain();
    const tile = allPastureTile('wop-n', {
      north: new WaterOrPastureTerrain({ linkToCenter: false }),
    });

    renderer.drawTile(tile, 0, 0, DEFAULT_HEX_STYLE, {
      neighborEdgeTerrains: { north: neighbor },
    });

    expect(wopSpy).toHaveBeenCalledWith(
      expect.objectContaining({ segmentIndex: 0 }),
      neighbor,
      tile.north
    );
  });

  it('draws a tile at a specific hex coordinate', () => {
    const tile = new Tile({ id: 'random' });
    const hex = new HexCoordinate(1, 0, -1);
    const drawTileSpy = vi.spyOn(renderer, 'drawTile');

    renderer.drawTileAtHex(tile, hex, DEFAULT_HEX_STYLE);

    expect(drawTileSpy).toHaveBeenCalled();
    const [calledTile, x, y, style, opts] = drawTileSpy.mock.calls[0];
    expect(calledTile).toBe(tile);
    expect(style).toBe(DEFAULT_HEX_STYLE);
    expect(opts).toEqual({ neighborEdgeTerrains: undefined });
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(40 * Math.sqrt(3));
  });

  it('drawTileAtHex passes neighbor map from board when board is provided', () => {
    const board = new Board();
    const center = new HexCoordinate(0, 0, 0);
    const northN = new HexCoordinate(-1, 0, 1);
    board.place(new Tile({ id: 'n', south: toTerrain('water') }), northN);

    const tile = allPastureTile('at-hex', {
      north: new WaterOrPastureTerrain({ linkToCenter: false }),
    });
    const drawSpy = vi.spyOn(renderer, 'drawTile');

    renderer.drawTileAtHex(tile, center, DEFAULT_HEX_STYLE, board);

    expect(drawSpy).toHaveBeenCalledWith(
      tile,
      expect.any(Number),
      expect.any(Number),
      DEFAULT_HEX_STYLE,
      {
        neighborEdgeTerrains: expect.objectContaining({
          north: expect.objectContaining({ id: 'water' }),
        }),
      }
    );
  });

  it('builds neighbor edge terrains from board', () => {
    const board = new Board();
    const center = new HexCoordinate(0, 0, 0);
    const northN = new HexCoordinate(-1, 0, 1);
    board.place(new Tile({ id: 'n', south: toTerrain('water') }), northN);
    const map = neighborEdgeTerrainsFromBoard(board, center);
    expect(map.north?.id).toBe('water');
  });
});
