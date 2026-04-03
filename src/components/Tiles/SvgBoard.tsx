import React, { useMemo } from 'react';
import { Board } from '../../models/Board';
import { type Radians, radiansToDegrees } from '../../utils/Angle';
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
  rotation: Radians;
}

export interface SvgBoardProps {
  board: Board;
  camera: Camera;
  viewCenter: { x: number; y: number };
}

export const SvgBoard: React.FC<SvgBoardProps> = ({ board, camera, viewCenter }) => {
  // TODO(#73): Per-row memoization or virtualize for large boards.
  const renderedTiles = useMemo(() => {
    return Array.from(board.getAll(), ({ id, tile, coordinate }) => {
      const { x, y } = hexToPixel(coordinate);

      return (
        <g key={id} transform={`translate(${x}, ${y})`}>
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
  }, [board]);

  const { x, y, zoom, rotation } = camera;
  const rotationDeg = radiansToDegrees(rotation);

  const worldTransform = `translate(${viewCenter.x}, ${viewCenter.y}) rotate(${rotationDeg}) scale(${zoom}) translate(${x}, ${y})`;

  return (
    <svg
      width="100%"
      height="100%"
      style={{
        overflow: 'hidden',
        touchAction: 'none',
      }}
    >
      <g transform={worldTransform}>{renderedTiles}</g>
    </svg>
  );
};
