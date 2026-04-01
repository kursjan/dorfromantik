import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Direction } from '../../models/Navigation';
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

  it('renders a wedge path with the base terrain renderer', () => {
    const renderer = TERRAIN_ID_SVG_SEGMENT_RENDERERS.wedge.water;
    const { container } = render(
      <svg>{renderer({ terrainId: 'water', segmentIndex: 0, direction: Direction.North })}</svg>
    );
    const path = container.querySelector('path');
    expect(path?.getAttribute('d')).toBe(SVG_HEX_WEDGE_PATHS[0]);
  });
});
