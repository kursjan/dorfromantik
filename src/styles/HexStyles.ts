export interface HexStyle {
  size: number;
  strokeColor: string;
  fillColor: string;
  font: string;
  textColor: string;
  lineWidth: number;
}

export const DEFAULT_HEX_STYLE: HexStyle = {
  size: 40,
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
