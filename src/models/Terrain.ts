/** The six base terrain kinds (palette / random generation / edge overlap). */
export const TERRAIN_TYPES = ['tree', 'house', 'water', 'pasture', 'rail', 'field'] as const;
export type TerrainType = (typeof TERRAIN_TYPES)[number];

/**
 * Stable keys for terrain *instances* in saves and string constructors — separate registry from
 * {@link TERRAIN_TYPES}. Hybrid `waterOrPasture` has id here; its edge match set uses two
 * {@link TerrainType}s only, not a seventh base kind.
 */
export const TERRAIN_IDS = [
  'tree',
  'house',
  'water',
  'pasture',
  'rail',
  'field',
  'waterOrPasture',
] as const;
export type TerrainId = (typeof TERRAIN_IDS)[number];

export abstract class Terrain {
  readonly id: TerrainId;
  readonly shortCode: string;

  protected constructor(id: TerrainId, shortCode: string) {
    this.id = id;
    this.shortCode = shortCode;
  }

  /**
   * Two edges match iff their {@link TerrainType} match sets have a non-empty intersection.
   */
  matchesForEdge(other: Terrain): boolean {
    const a = this.getEdgeMatchTypes();
    const b = other.getEdgeMatchTypes();
    for (const t of a) {
      if (b.has(t)) return true;
    }
    return false;
  }

  /** Same as {@link getEdgeMatchTypes}; public for rendering and other non-subclass callers. */
  edgeMatchTypes(): ReadonlySet<TerrainType> {
    return this.getEdgeMatchTypes();
  }

  /** Which of the six {@link TerrainType} values this edge can match as. */
  protected abstract getEdgeMatchTypes(): ReadonlySet<TerrainType>;
}

export class TreeTerrain extends Terrain {
  constructor() {
    super('tree', 'T');
  }

  protected getEdgeMatchTypes(): ReadonlySet<TerrainType> {
    return new Set(['tree']);
  }
}

export class HouseTerrain extends Terrain {
  constructor() {
    super('house', 'H');
  }

  protected getEdgeMatchTypes(): ReadonlySet<TerrainType> {
    return new Set(['house']);
  }
}

export interface WaterTerrainOptions {
  linkToCenter?: boolean;
}

export class WaterTerrain extends Terrain {
  readonly linkToCenter: boolean;

  constructor(options: WaterTerrainOptions = {}) {
    super('water', 'W');
    this.linkToCenter = options.linkToCenter ?? false;
  }

  protected getEdgeMatchTypes(): ReadonlySet<TerrainType> {
    return new Set(['water']);
  }
}

export class PastureTerrain extends Terrain {
  constructor() {
    super('pasture', 'P');
  }

  protected getEdgeMatchTypes(): ReadonlySet<TerrainType> {
    return new Set(['pasture']);
  }
}

export interface WaterOrPastureTerrainOptions {
  linkToCenter?: boolean;
}

/**
 * Hybrid terrain: matches as water or pasture on an edge (see {@link getEdgeMatchTypes}).
 * Rendering picks water vs pasture per edge from the neighbor (see TileRenderer).
 */
export class WaterOrPastureTerrain extends Terrain {
  readonly linkToCenter: boolean;

  private static readonly EDGE_MATCH_TYPES: ReadonlySet<TerrainType> = new Set([
    'water',
    'pasture',
  ]);

  /** Base terrain kinds this hybrid edge can match as (same for every instance). */
  static edgeMatchTerrainTypes(): ReadonlySet<TerrainType> {
    return WaterOrPastureTerrain.EDGE_MATCH_TYPES;
  }

  constructor(options: WaterOrPastureTerrainOptions = {}) {
    super('waterOrPasture', 'O');
    this.linkToCenter = options.linkToCenter ?? false;
  }

  protected getEdgeMatchTypes(): ReadonlySet<TerrainType> {
    return WaterOrPastureTerrain.edgeMatchTerrainTypes();
  }
}

export class RailTerrain extends Terrain {
  constructor() {
    super('rail', 'R');
  }

  protected getEdgeMatchTypes(): ReadonlySet<TerrainType> {
    return new Set(['rail']);
  }
}

export class FieldTerrain extends Terrain {
  constructor() {
    super('field', 'F');
  }

  protected getEdgeMatchTypes(): ReadonlySet<TerrainType> {
    return new Set(['field']);
  }
}

export type TerrainInput = TerrainId | Terrain;

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
