import { forwardRef, useMemo } from 'react';
import { Board } from '../../../models/Board';
import type { ContainerPoint } from '../../common/ContainerPoint';
import type { CameraSnapshot } from '../../common/camera/CameraSnapshot';
import { HexTile } from '../tiles/HexTile';
import { SVG_HEX_RADIUS, hexToPixel } from '../tiles/SvgHexUtils';
import { buildSvgWorldTransformString } from '../svgBoardWorldTransform';

/** Flat-top hex height in SVG user units (matches {@link HexTile} viewBox). */
const SVG_HEX_HALF_HEIGHT = (Math.sqrt(3) * SVG_HEX_RADIUS) / 2;
const SVG_HEX_LAYOUT_WIDTH = SVG_HEX_RADIUS * 2;
const SVG_HEX_LAYOUT_HEIGHT = SVG_HEX_HALF_HEIGHT * 2;

export interface SvgBoardProps {
  board: Board;
  camera: CameraSnapshot;
  viewCenter: ContainerPoint;
  /**
   * When set, the world `<g>` has no `transform` attribute; the parent must set it (e.g. rAF keyboard
   * rotation + `applySvgWorldTransformToGroup`). Stories and tests keep the default `false`.
   */
  deferWorldTransformToParent?: boolean;
}

export const SvgBoard = forwardRef<SVGGElement, SvgBoardProps>(function SvgBoard(
  { board, camera, viewCenter, deferWorldTransformToParent = false },
  ref
) {
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

  const worldTransform = deferWorldTransformToParent
    ? undefined
    : buildSvgWorldTransformString(camera, viewCenter);

  return (
    <svg
      width="100%"
      height="100%"
      style={{
        overflow: 'hidden',
        touchAction: 'none',
      }}
    >
      <g ref={ref} transform={worldTransform}>
        {renderedTiles}
      </g>
    </svg>
  );
});
