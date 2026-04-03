import type { Meta, StoryObj } from '@storybook/react-vite';
import { TilePreview } from '../TilePreview';
import { Tile } from '../../../../models/Tile';
import { PastureTerrain, WaterOrPastureTerrain, WaterTerrain } from '../../../../models/Terrain';

const pasture = () => new PastureTerrain();

const meta: Meta<typeof TilePreview> = {
  title: 'UI/Tiles/WaterOrPasture',
  component: TilePreview,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TilePreview>;

export const NeighborWater: Story = {
  args: {
    tile: new Tile({
      id: 'wop-n-water',
      north: new WaterOrPastureTerrain({ linkToCenter: false }),
      northEast: pasture(),
      southEast: pasture(),
      south: pasture(),
      southWest: pasture(),
      northWest: pasture(),
    }),
    neighborEdgeTerrains: { north: new WaterTerrain() },
    size: 48,
  },
};

export const NeighborPasture: Story = {
  args: {
    tile: new Tile({
      id: 'wop-n-pasture',
      north: new WaterOrPastureTerrain({ linkToCenter: false }),
      northEast: pasture(),
      southEast: pasture(),
      south: pasture(),
      southWest: pasture(),
      northWest: pasture(),
    }),
    neighborEdgeTerrains: { north: pasture() },
    size: 48,
  },
};
