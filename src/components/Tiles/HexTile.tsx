import type { ComponentPropsWithoutRef } from 'react';
import { directions, type Direction } from '../../models/Navigation';
import { type TerrainType } from '../../models/Terrain';
import { type Tile } from '../../models/Tile';
import { TERRAIN_ID_SVG_SEGMENT_RENDERERS } from './TerrainIdSvgSegmentRenderers';

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
    <svg viewBox="-50 -50 100 100" role="img" aria-label="Hex tile" {...svgProps}>
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
