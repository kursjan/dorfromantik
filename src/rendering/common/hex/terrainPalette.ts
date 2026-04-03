import type { TerrainType } from '../../../models/Tile';

/** Fill colors for the six {@link TerrainType} values; hybrid `waterOrPasture` resolves per edge. */
export const TERRAIN_COLORS: Record<TerrainType, string> = {
  tree: '#228B22', // ForestGreen
  house: '#8B4513', // SaddleBrown
  water: '#00BFFF', // DeepSkyBlue
  pasture: '#7CFC00', // LawnGreen
  rail: '#708090', // SlateGray
  field: '#FFD700', // Gold
};
