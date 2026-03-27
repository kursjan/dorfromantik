export const TERRAIN_TYPES = [
  'tree',
  'house',
  'water',
  'pasture',
  'waterOrPasture',
  'rail',
  'field',
] as const;
export type TerrainName = (typeof TERRAIN_TYPES)[number];

export abstract class Terrain {
  readonly name: TerrainName;
  readonly shortCode: string;

  protected constructor(name: TerrainName, shortCode: string) {
    this.name = name;
    this.shortCode = shortCode;
  }

  matchesForEdge(other: Terrain): boolean {
    return this.name === other.name;
  }
}

export class TreeTerrain extends Terrain {
  constructor() {
    super('tree', 'T');
  }
}

export class HouseTerrain extends Terrain {
  constructor() {
    super('house', 'H');
  }
}

export class WaterTerrain extends Terrain {
  readonly linkToCenter: boolean;

  constructor(linkToCenter = false) {
    super('water', 'W');
    this.linkToCenter = linkToCenter;
  }

  matchesForEdge(other: Terrain): boolean {
    if (other.name === 'waterOrPasture') return true;
    return super.matchesForEdge(other);
  }
}

export class PastureTerrain extends Terrain {
  constructor() {
    super('pasture', 'P');
  }

  matchesForEdge(other: Terrain): boolean {
    if (other.name === 'waterOrPasture') return true;
    return super.matchesForEdge(other);
  }
}

/**
 * Matches both water and pasture edges for scoring.
 * Rendering resolves per edge from the neighbor across that edge (see TileRenderer).
 */
export class WaterOrPastureTerrain extends Terrain {
  readonly linkToCenter: boolean;

  constructor(linkToCenter = false) {
    super('waterOrPasture', 'O');
    this.linkToCenter = linkToCenter;
  }

  matchesForEdge(other: Terrain): boolean {
    return other.name === 'waterOrPasture' || other.name === 'water' || other.name === 'pasture';
  }
}

export class RailTerrain extends Terrain {
  constructor() {
    super('rail', 'R');
  }
}

export class FieldTerrain extends Terrain {
  constructor() {
    super('field', 'F');
  }
}

export type TerrainInput = TerrainName | Terrain;

export function toTerrain(input: TerrainInput): Terrain {
  if (input instanceof Terrain) {
    return input;
  }

  switch (input) {
    case 'tree':
      return new TreeTerrain();
    case 'house':
      return new HouseTerrain();
    case 'water':
      return new WaterTerrain();
    case 'pasture':
      return new PastureTerrain();
    case 'waterOrPasture':
      return new WaterOrPastureTerrain();
    case 'rail':
      return new RailTerrain();
    case 'field':
      return new FieldTerrain();
  }
}
