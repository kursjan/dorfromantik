import React, { useEffect, useMemo, useRef } from 'react';
import { HexCoordinate } from '../../models/HexCoordinate';
import { Tile } from '../../models/Tile';
import { HexTile } from './HexTile';
import { SVG_HEX_RADIUS, hexToPixel } from './SvgHexUtils';

/** Flat-top hex height in SVG user units (matches {@link HexTile} viewBox). */
const SVG_HEX_HALF_HEIGHT = (Math.sqrt(3) * SVG_HEX_RADIUS) / 2;
const SVG_HEX_LAYOUT_WIDTH = SVG_HEX_RADIUS * 2;
const SVG_HEX_LAYOUT_HEIGHT = SVG_HEX_HALF_HEIGHT * 2;

export interface Camera {
  x: number;
  y: number;
  zoom: number;
  /** Radians; only applied when `viewCenter` is set (canvas parity path). */
  rotation?: number;
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
  /**
   * Viewport center in SVG user units (typically half of the host `svg` client width/height).
   * When set, applies the same transform order as canvas `Camera.applyTransform`: translate to
   * center, rotate, scale, then pan — so world origin stays near the middle of the view.
   */
  viewCenter?: { x: number; y: number };
  /** Optional callback for when a tile is clicked */
  onTileClick?: (coordinate: HexCoordinate) => void;
}

export const SvgBoard: React.FC<SvgBoardProps> = ({ tiles, camera, viewCenter, onTileClick }) => {
  const onTileClickRef = useRef(onTileClick);
  useEffect(() => {
    onTileClickRef.current = onTileClick;
  }, [onTileClick]);

  // TODO(#73): Memoize per-row rendering or virtualize for large boards (see REVIEW_FEEDBACK.md).
  // Rebuild only when tile data changes; click handler is read from a ref so unstable parent lambdas do not invalidate this memo.
  const renderedTiles = useMemo(() => {
    return tiles.map(({ id, tile, coordinate }) => {
      const { x, y } = hexToPixel(coordinate);

      return (
        <g
          key={id}
          transform={`translate(${x}, ${y})`}
          onClick={() => onTileClickRef.current?.(coordinate)}
        >
          {/* Nested <svg> needs explicit size or it fills the parent canvas; x/y keep hex center on (x,y). */}
          <HexTile
            tile={tile}
            x={-SVG_HEX_RADIUS}
            y={-SVG_HEX_HALF_HEIGHT}
            width={SVG_HEX_LAYOUT_WIDTH}
            height={SVG_HEX_LAYOUT_HEIGHT}
          />
        </g>
      );
    });
  }, [tiles]);

  const { x, y, zoom } = camera;
  const rotationDeg = camera.rotation != null ? (camera.rotation * 180) / Math.PI : 0;

  const worldTransform = viewCenter
    ? `translate(${viewCenter.x}, ${viewCenter.y}) rotate(${rotationDeg}) scale(${zoom}) translate(${x}, ${y})`
    : `translate(${x}, ${y}) scale(${zoom})`;

  return (
    <svg
      width="100%"
      height="100%"
      style={{
        overflow: 'hidden',
        touchAction: 'none',
        cursor: onTileClick ? 'pointer' : 'default',
      }}
    >
      <g transform={worldTransform}>{renderedTiles}</g>
    </svg>
  );
};
