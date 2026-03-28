import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TileRenderer, neighborEdgeTerrainsFromBoard } from './TileRenderer';
import { resolveEdgePaintTerrainType } from './segmentRenderers/WaterOrPastureSegmentRenderer';
import { Tile } from '../../models/Tile';
import { HexCoordinate } from '../../models/HexCoordinate';
import { Board } from '../../models/Board';
import { DEFAULT_HEX_STYLE } from './HexStyles';
import {
  PastureTerrain,
  toTerrain,
  TreeTerrain,
  WaterOrPastureTerrain,
  WaterTerrain,
} from '../../models/Terrain';

describe('TileRenderer', () => {
  let ctx: CanvasRenderingContext2D;
  let renderer: TileRenderer;

  beforeEach(() => {
    ctx = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    renderer = new TileRenderer(ctx);
  });

  it('draws water overlays on top of pasture background', () => {
    const tile = new Tile({
      id: 'test-tile',
      north: toTerrain('tree'),
      northEast: toTerrain('water'),
      southEast: toTerrain('house'),
      south: toTerrain('pasture'),
      southWest: toTerrain('rail'),
      northWest: toTerrain('field'),
    });

    renderer.drawTile(tile, 0, 0, DEFAULT_HEX_STYLE);

    // 6 wedges + 1 water line + 1 outline
    expect(ctx.beginPath).toHaveBeenCalledTimes(8);

    // 6 wedges + 1 line + 1 outline
    expect(ctx.moveTo).toHaveBeenCalledTimes(8);

    // 6 wedges * 2 + 1 outline * 5
    expect(ctx.lineTo).toHaveBeenCalledTimes(17);
    expect(ctx.quadraticCurveTo).toHaveBeenCalledTimes(1);

    expect(ctx.fill).toHaveBeenCalledTimes(6);
    expect(ctx.stroke).toHaveBeenCalledTimes(2);
    expect(ctx.closePath).toHaveBeenCalledTimes(7);
  });

  it('draws center water hex when center terrain is water', () => {
    const pasture = new PastureTerrain();
    const tile = new Tile({
      id: 'water-center',
      center: toTerrain('water'),
      north: new WaterTerrain({ linkToCenter: true }),
      northEast: pasture,
      southEast: pasture,
      south: pasture,
      southWest: pasture,
      northWest: pasture,
    });

    renderer.drawTile(tile, 0, 0, DEFAULT_HEX_STYLE);

    // 6 wedges + 1 water line + 1 center hex + 1 outline
    expect(ctx.beginPath).toHaveBeenCalledTimes(9);
    expect(ctx.fill).toHaveBeenCalledTimes(7);
  });

  it('draws linked water to center and unlinked water to mid-segment point', () => {
    const pasture = new PastureTerrain();
    const tile = new Tile({
      id: 'water-link-geometry',
      center: toTerrain('water'),
      north: new WaterTerrain({ linkToCenter: true }),
      northEast: new WaterTerrain({ linkToCenter: false }),
      southEast: pasture,
      south: pasture,
      southWest: pasture,
      northWest: pasture,
    });

    renderer.drawTile(tile, 0, 0, DEFAULT_HEX_STYLE);

    const curveCalls = (ctx.quadraticCurveTo as ReturnType<typeof vi.fn>).mock.calls;
    const waterEndpoints = curveCalls.map(([, , x, y]) => [x, y]);

    // North linked water should end exactly at tile center.
    const hasCenterEndpoint = waterEndpoints.some(
      ([x, y]) => Math.abs(x - 0) < 0.001 && Math.abs(y - 0) < 0.001
    );
    expect(hasCenterEndpoint).toBe(true);

    // NorthEast unlinked water should end halfway from edge midpoint to center.
    // For size=40 and this orientation, that point is approximately (15, -8.6603).
    const hasMidpointEndpoint = waterEndpoints.some(
      ([x, y]) => Math.abs(x - 15) < 0.01 && Math.abs(y + 8.6603) < 0.01
    );
    expect(hasMidpointEndpoint).toBe(true);
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

  it('resolves edge paint type from local match set and neighbor intersection', () => {
    expect(resolveEdgePaintTerrainType(new TreeTerrain(), undefined)).toBe('tree');
    expect(resolveEdgePaintTerrainType(new WaterTerrain(), new TreeTerrain())).toBe('water');
    expect(resolveEdgePaintTerrainType(new PastureTerrain(), undefined)).toBe('pasture');

    const wop = new WaterOrPastureTerrain();
    expect(resolveEdgePaintTerrainType(wop, undefined)).toBe('pasture');
    expect(resolveEdgePaintTerrainType(wop, new WaterTerrain())).toBe('water');
    expect(resolveEdgePaintTerrainType(wop, new PastureTerrain())).toBe('pasture');
    expect(resolveEdgePaintTerrainType(wop, new TreeTerrain())).toBe('pasture');
    expect(resolveEdgePaintTerrainType(wop, new WaterOrPastureTerrain())).toBe('water');
  });

  it('builds neighbor edge terrains from board', () => {
    const board = new Board();
    const center = new HexCoordinate(0, 0, 0);
    const northN = new HexCoordinate(-1, 0, 1);
    board.place(new Tile({ id: 'n', south: toTerrain('water') }), northN);
    const map = neighborEdgeTerrainsFromBoard(board, center);
    expect(map.north?.id).toBe('water');
  });

  it('draws waterOrPasture as water when neighbor across edge is water', () => {
    const pasture = new PastureTerrain();
    const tile = new Tile({
      id: 'wop-water',
      north: new WaterOrPastureTerrain({ linkToCenter: false }),
      northEast: pasture,
      southEast: pasture,
      south: pasture,
      southWest: pasture,
      northWest: pasture,
    });
    renderer.drawTile(tile, 0, 0, DEFAULT_HEX_STYLE, {
      neighborEdgeTerrains: { north: new WaterTerrain() },
    });
    expect(ctx.quadraticCurveTo).toHaveBeenCalledTimes(1);
  });

  it('draws waterOrPasture as pasture when neighbor is tree', () => {
    const pasture = new PastureTerrain();
    const tile = new Tile({
      id: 'wop-tree',
      north: new WaterOrPastureTerrain({ linkToCenter: false }),
      northEast: pasture,
      southEast: pasture,
      south: pasture,
      southWest: pasture,
      northWest: pasture,
    });
    renderer.drawTile(tile, 0, 0, DEFAULT_HEX_STYLE, {
      neighborEdgeTerrains: { north: new TreeTerrain() },
    });
    expect(ctx.quadraticCurveTo).toHaveBeenCalledTimes(0);
  });
});
