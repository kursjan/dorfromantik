import type { ComponentPropsWithoutRef } from 'react';
import { directions, type Direction } from '../../models/Navigation';
import { type TerrainType } from '../../models/Terrain';
import { type Tile } from '../../models/Tile';
import { TERRAIN_ID_SVG_SEGMENT_RENDERERS } from './TerrainIdSvgSegmentRenderers';

const HEX_RADIUS = 50;
const HEX_HALF_HEIGHT = (Math.sqrt(3) * HEX_RADIUS) / 2;
const HEX_VIEWBOX = `${-HEX_RADIUS} ${-HEX_HALF_HEIGHT} ${HEX_RADIUS * 2} ${HEX_HALF_HEIGHT * 2}`;

export interface HexTileProps extends Omit<ComponentPropsWithoutRef<'svg'>, 'viewBox'> {
  tile: Tile;
  neighborEdgeTerrainTypes?: Partial<Record<Direction, TerrainType>>;
}

export function HexTile({ tile, neighborEdgeTerrainTypes, ...svgProps }: HexTileProps) {
  const terrainsByDirection = tile.getTerrains();
  const centerTerrain = tile.center;
  const centerRenderer = centerTerrain
    ? TERRAIN_ID_SVG_SEGMENT_RENDERERS.center[centerTerrain.id]
    : undefined;

  return (
    <svg viewBox={HEX_VIEWBOX} role="img" aria-label="Hex tile" {...svgProps}>
      {directions.map((direction, segmentIndex) => {
        const terrain = terrainsByDirection[direction];
        const renderWedge = TERRAIN_ID_SVG_SEGMENT_RENDERERS.wedge[terrain.id];
        return (
          <g key={direction} data-direction={direction}>
            {renderWedge({
              terrainId: terrain.id,
              segmentIndex,
              direction,
              neighborEdgeTerrainType: neighborEdgeTerrainTypes?.[direction],
              terrain,
            })}
          </g>
        );
      })}
      {centerTerrain && centerRenderer ? (
        <g data-center-terrain={centerTerrain.id}>
          {centerRenderer({ terrainId: centerTerrain.id })}
        </g>
      ) : null}
    </svg>
  );
}
