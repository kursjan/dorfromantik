import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tile } from '../../models/Tile';
import { PastureTerrain, WaterOrPastureTerrain } from '../../models/Terrain';
import { HexTile } from './HexTile';

const pasture = () => new PastureTerrain();

const meta: Meta<typeof HexTile> = {
  title: 'SVG/Tiles/WaterOrPasture',
  component: HexTile,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HexTile>;

export const NeighborWater: Story = {
  args: {
    tile: new Tile({
      id: 'svg-wop-n-water',
      north: new WaterOrPastureTerrain({ linkToCenter: false }),
      northEast: pasture(),
      southEast: pasture(),
      south: pasture(),
      southWest: pasture(),
      northWest: pasture(),
    }),
    neighborEdgeTerrainTypes: { north: 'water' },
    width: 120,
    height: 120,
  },
};

export const NeighborPasture: Story = {
  args: {
    tile: new Tile({
      id: 'svg-wop-n-pasture',
      north: new WaterOrPastureTerrain({ linkToCenter: false }),
      northEast: pasture(),
      southEast: pasture(),
      south: pasture(),
      southWest: pasture(),
      northWest: pasture(),
    }),
    neighborEdgeTerrainTypes: { north: 'pasture' },
    width: 120,
    height: 120,
  },
};
