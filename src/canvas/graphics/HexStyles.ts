import { TerrainType } from '../../models/Tile';

export interface HexStyle {
  size: number;
  strokeColor: string;
  fillColor: string;
  font: string;
  textColor: string;
  lineWidth: number;
}

export const HEX_SIZE = 40;

export const DEFAULT_HEX_STYLE: HexStyle = {
  size: HEX_SIZE,
  strokeColor: '#000000',
  fillColor: '#FFFFFF',
  font: '12px Arial',
  textColor: '#000000',
  lineWidth: 1,
};

export const GRID_HEX_STYLE: HexStyle = {
  ...DEFAULT_HEX_STYLE,
  strokeColor: '#ccc',
  textColor: '#666',
  fillColor: 'transparent',
};

export const CENTER_HEX_STYLE: HexStyle = {
  ...DEFAULT_HEX_STYLE,
  strokeColor: 'red',
  lineWidth: 2,
  fillColor: 'rgba(255,0,0,0.1)',
};

export const HOVER_HEX_STYLE: HexStyle = {
  ...DEFAULT_HEX_STYLE,
  strokeColor: '#FFD700', // Gold
  lineWidth: 3,
  fillColor: 'rgba(255, 215, 0, 0.2)',
  textColor: '#000',
};

export const TERRAIN_COLORS: Record<TerrainType, string> = {
  tree: '#228B22', // ForestGreen
  house: '#8B4513', // SaddleBrown
  water: '#00BFFF', // DeepSkyBlue
  pasture: '#7CFC00', // LawnGreen
  rail: '#708090', // SlateGray
  field: '#FFD700', // Gold
};
