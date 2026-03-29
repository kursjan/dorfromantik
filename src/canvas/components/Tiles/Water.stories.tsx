import type { Meta, StoryObj } from '@storybook/react-vite';
import { TilePreview } from '../TilePreview';
import { Tile } from '../../../models/Tile';
import { PastureTerrain, WaterTerrain } from '../../../models/Terrain';

const pasture = () => new PastureTerrain();

const meta: Meta<typeof TilePreview> = {
  title: 'UI/Tiles/Water',
  component: TilePreview,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TilePreview>;

export const WaterLinkedToCenter: Story = {
  args: {
    tile: new Tile({
      center: new WaterTerrain(),
      north: new WaterTerrain({ linkToCenter: true }),
      northEast: pasture(),
      southEast: pasture(),
      south: pasture(),
      southWest: pasture(),
      northWest: pasture(),
    }),
    size: 48,
  },
};

export const WaterNotLinkedToCenter: Story = {
  args: {
    tile: new Tile({
      center: new WaterTerrain(),
      north: new WaterTerrain({ linkToCenter: false }),
      northEast: pasture(),
      southEast: pasture(),
      south: pasture(),
      southWest: pasture(),
      northWest: pasture(),
    }),
    size: 48,
  },
};

export const MultiWaterMixedLinks: Story = {
  args: {
    tile: new Tile({
      center: new WaterTerrain(),
      north: new WaterTerrain({ linkToCenter: true }),
      northEast: new WaterTerrain({ linkToCenter: false }),
      southEast: new WaterTerrain({ linkToCenter: true }),
      south: pasture(),
      southWest: new WaterTerrain({ linkToCenter: false }),
      northWest: pasture(),
    }),
    size: 48,
  },
};
