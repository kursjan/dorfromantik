import React, { useMemo } from 'react';
import { Board } from '../../../models/Board';
import { radiansToDegrees } from '../../../utils/Angle';
import type { ContainerPoint } from '../../common/ContainerPoint';
import type { WorldPoint } from '../../common/WorldPoint';
import type { CameraSnapshot } from '../../common/camera/CameraSnapshot';
import { HexTile } from '../tiles/HexTile';
import { SVG_HEX_RADIUS, hexToPixel } from '../tiles/SvgHexUtils';

/** Flat-top hex height in SVG user units (matches {@link HexTile} viewBox). */
const SVG_HEX_HALF_HEIGHT = (Math.sqrt(3) * SVG_HEX_RADIUS) / 2;
const SVG_HEX_LAYOUT_WIDTH = SVG_HEX_RADIUS * 2;
const SVG_HEX_LAYOUT_HEIGHT = SVG_HEX_HALF_HEIGHT * 2;

export interface SvgBoardProps {
  board: Board;
  camera: CameraSnapshot;
  viewCenter: ContainerPoint;
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
            neighborEdgeTerrainTypes={{}}
            x={-SVG_HEX_RADIUS}
            y={-SVG_HEX_HALF_HEIGHT}
            width={SVG_HEX_LAYOUT_WIDTH}
            height={SVG_HEX_LAYOUT_HEIGHT}
          />
        </g>
      );
    });
  }, [board]);

  const position: WorldPoint = camera.position;
  const zoom = camera.zoom;
  const rotationDeg = radiansToDegrees(camera.rotation);

  const worldTransform = `translate(${viewCenter.x}, ${viewCenter.y}) rotate(${rotationDeg}) scale(${zoom}) translate(${position.x}, ${position.y})`;

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
