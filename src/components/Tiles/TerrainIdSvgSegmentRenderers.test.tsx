import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Direction } from '../../models/Navigation';
import { TERRAIN_COLORS } from '../../canvas/graphics/HexStyles';
import { SVG_HEX_CENTER_CIRCLE_PATH, SVG_HEX_WEDGE_PATHS } from './SvgHexUtils';
import { CenterWedge } from './CenterWedge';
import { TERRAIN_ID_SVG_SEGMENT_RENDERERS } from './TerrainIdSvgSegmentRenderers';
import { Wedge } from './Wedge';

describe('Wedge', () => {
  it('renders the path matching the segment index', () => {
    const { container } = render(
      <svg>
        <Wedge segmentIndex={2} />
      </svg>
    );
    const path = container.querySelector('path');
    expect(path?.getAttribute('d')).toBe(SVG_HEX_WEDGE_PATHS[2]);
  });
});

describe('CenterWedge', () => {
  it('renders the center-circle path', () => {
    const { container } = render(
      <svg>
        <CenterWedge />
      </svg>
    );
    const path = container.querySelector('path');
    expect(path?.getAttribute('d')).toBe(SVG_HEX_CENTER_CIRCLE_PATH);
  });
});

describe('TERRAIN_ID_SVG_SEGMENT_RENDERERS', () => {
  it('defines wedge renderers for all terrain ids', () => {
    expect(TERRAIN_ID_SVG_SEGMENT_RENDERERS.wedge.tree).toBeTypeOf('function');
    expect(TERRAIN_ID_SVG_SEGMENT_RENDERERS.wedge.house).toBeTypeOf('function');
    expect(TERRAIN_ID_SVG_SEGMENT_RENDERERS.wedge.water).toBeTypeOf('function');
    expect(TERRAIN_ID_SVG_SEGMENT_RENDERERS.wedge.pasture).toBeTypeOf('function');
    expect(TERRAIN_ID_SVG_SEGMENT_RENDERERS.wedge.rail).toBeTypeOf('function');
    expect(TERRAIN_ID_SVG_SEGMENT_RENDERERS.wedge.field).toBeTypeOf('function');
    expect(TERRAIN_ID_SVG_SEGMENT_RENDERERS.wedge.waterOrPasture).toBeTypeOf('function');
  });

  it('renders a wedge path with the water terrain renderer', () => {
    const renderer = TERRAIN_ID_SVG_SEGMENT_RENDERERS.wedge.water;
    const { container } = render(
      <svg>{renderer({ terrainId: 'water', segmentIndex: 0, direction: Direction.North })}</svg>
    );
    const path = container.querySelector('path');
    expect(path?.getAttribute('d')).toBe(SVG_HEX_WEDGE_PATHS[0]);
    expect(path?.getAttribute('fill')).toBe(TERRAIN_COLORS.water);
  });

  it('maps all base terrain wedges to HexStyles colors', () => {
    const tree = TERRAIN_ID_SVG_SEGMENT_RENDERERS.wedge.tree;
    const house = TERRAIN_ID_SVG_SEGMENT_RENDERERS.wedge.house;
    const pasture = TERRAIN_ID_SVG_SEGMENT_RENDERERS.wedge.pasture;
    const rail = TERRAIN_ID_SVG_SEGMENT_RENDERERS.wedge.rail;
    const field = TERRAIN_ID_SVG_SEGMENT_RENDERERS.wedge.field;

    const { container } = render(
      <svg>
        {tree({ terrainId: 'tree', segmentIndex: 0, direction: Direction.North })}
        {house({ terrainId: 'house', segmentIndex: 1, direction: Direction.NorthEast })}
        {pasture({ terrainId: 'pasture', segmentIndex: 2, direction: Direction.SouthEast })}
        {rail({ terrainId: 'rail', segmentIndex: 3, direction: Direction.South })}
        {field({ terrainId: 'field', segmentIndex: 4, direction: Direction.SouthWest })}
      </svg>
    );
    const paths = container.querySelectorAll('path');
    expect(paths[0]?.getAttribute('fill')).toBe(TERRAIN_COLORS.tree);
    expect(paths[1]?.getAttribute('fill')).toBe(TERRAIN_COLORS.house);
    expect(paths[2]?.getAttribute('fill')).toBe(TERRAIN_COLORS.pasture);
    expect(paths[3]?.getAttribute('fill')).toBe(TERRAIN_COLORS.rail);
    expect(paths[4]?.getAttribute('fill')).toBe(TERRAIN_COLORS.field);
  });
});
