import { Terrain, WaterOrPastureTerrain, WaterTerrain } from './Terrain';

const REQUIRED_SIDES = [
  'north',
  'northEast',
  'southEast',
  'south',
  'southWest',
  'northWest',
] as const;
type TileLike = {
  center?: Terrain;
  north: Terrain;
  northEast: Terrain;
  southEast: Terrain;
  south: Terrain;
  southWest: Terrain;
  northWest: Terrain;
};

export class TileValidator {
  validate(tile: TileLike): void {
    this.ensureRequiredSidesAreTerrains(tile);
    this.ensureOptionalCenterIsTerrain(tile);
    this.ensureLinkedWaterSidesHaveWaterCenter(tile);
  }

  private ensureRequiredSidesAreTerrains(tile: TileLike): void {
    for (const side of REQUIRED_SIDES) {
      this.assertTerrain(tile[side], side);
    }
  }

  private ensureOptionalCenterIsTerrain(tile: TileLike): void {
    if (tile.center !== undefined) {
      this.assertTerrain(tile.center, 'center');
    }
  }

  private assertTerrain(value: unknown, fieldName: string): asserts value is Terrain {
    if (!(value instanceof Terrain)) {
      const centerSuffix = fieldName === 'center' ? ' when provided' : '';
      throw new Error(`Invalid tile: "${fieldName}" must be a terrain instance${centerSuffix}`);
    }
  }

  private ensureLinkedWaterSidesHaveWaterCenter(tile: TileLike): void {
    for (const side of REQUIRED_SIDES) {
      this.assertLinkedWaterSideHasWaterCenter(tile, side);
    }
  }

  private assertLinkedWaterSideHasWaterCenter(
    tile: TileLike,
    side: (typeof REQUIRED_SIDES)[number]
  ): void {
    const terrain = tile[side];
    if (!this.isLinkedToCenterWaterSide(terrain)) {
      return;
    }

    if (tile.center?.name !== 'water') {
      throw new Error(
        `Invalid tile: "${side}" terrain with linkToCenter=true requires center terrain to be water`
      );
    }
  }

  private isLinkedToCenterWaterSide(terrain: Terrain): boolean {
    return (
      (terrain instanceof WaterTerrain && terrain.linkToCenter) ||
      (terrain instanceof WaterOrPastureTerrain && terrain.linkToCenter)
    );
  }
}
