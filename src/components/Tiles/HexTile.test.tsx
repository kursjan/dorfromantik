import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TERRAIN_COLORS } from '../../canvas/graphics/HexStyles';
import { HouseTerrain, RailTerrain, TreeTerrain, WaterTerrain } from '../../models/Terrain';
import { Tile } from '../../models/Tile';
import { SVG_HEX_CENTER_WATER_PATH, SVG_HEX_WEDGE_PATHS } from './SvgHexUtils';
import { HexTile } from './HexTile';

describe('HexTile', () => {
  it('renders six wedge segments for a tile', () => {
    const tile = new Tile({
      north: new TreeTerrain(),
      northEast: new HouseTerrain(),
      southEast: new WaterTerrain(),
      south: new RailTerrain(),
      southWest: new TreeTerrain(),
      northWest: new HouseTerrain(),
    });

    const { container } = render(<HexTile tile={tile} />);
    const paths = Array.from(container.querySelectorAll('path'));
    const wedgePaths = paths.filter((path) =>
      SVG_HEX_WEDGE_PATHS.includes(path.getAttribute('d') ?? '')
    );

    expect(wedgePaths).toHaveLength(6);
  });

  it('renders center segment when center terrain has a renderer', () => {
    const tile = new Tile({ center: new WaterTerrain() });

    const { container } = render(<HexTile tile={tile} />);
    const centerPath = Array.from(container.querySelectorAll('path')).find(
      (path) => path.getAttribute('d') === SVG_HEX_CENTER_WATER_PATH
    );

    expect(centerPath).toBeDefined();
    expect(centerPath?.getAttribute('fill')).toBe(TERRAIN_COLORS.water);
  });

  it('does not render center segment when center terrain has no renderer', () => {
    const tile = new Tile({ center: new TreeTerrain() });

    const { container } = render(<HexTile tile={tile} />);
    const centerPath = Array.from(container.querySelectorAll('path')).find(
      (path) => path.getAttribute('d') === SVG_HEX_CENTER_WATER_PATH
    );

    expect(centerPath).toBeUndefined();
  });
});
