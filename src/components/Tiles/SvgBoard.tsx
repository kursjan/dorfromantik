import React, { useMemo } from 'react';
import { HexCoordinate } from '../../models/HexCoordinate';
import { Tile } from '../../models/Tile';
import { HexTile } from './HexTile';
import { hexToPixel } from './SvgHexUtils';

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export interface SvgBoardTile {
  id: string;
  tile: Tile;
  coordinate: HexCoordinate;
}

export interface SvgBoardProps {
  /** The list of tiles to render on the board */
  tiles: SvgBoardTile[];
  /** The camera state for panning and zooming */
  camera: Camera;
  /** Optional callback for when a tile is clicked */
  onTileClick?: (coordinate: HexCoordinate) => void;
}

export const SvgBoard: React.FC<SvgBoardProps> = ({ tiles, camera, onTileClick }) => {
  // Memoize the rendered tiles to avoid re-rendering all SVG paths when only camera changes.
  // We use the tile id and its rotation as the dependency.
  const renderedTiles = useMemo(() => {
    return tiles.map(({ id, tile, coordinate }) => {
      const { x, y } = hexToPixel(coordinate);

      return (
        <g
          key={id}
          transform={`translate(${x}, ${y})`}
          onClick={() => onTileClick?.(coordinate)}
          style={{ cursor: onTileClick ? 'pointer' : 'default' }}
        >
          <HexTile tile={tile} />
        </g>
      );
    });
  }, [tiles, onTileClick]);

  return (
    <svg width="100%" height="100%" style={{ overflow: 'hidden', touchAction: 'none' }}>
      <g transform={`translate(${camera.x}, ${camera.y}) scale(${camera.zoom})`}>{renderedTiles}</g>
    </svg>
  );
};
