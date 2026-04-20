import type { Meta, StoryObj } from '@storybook/react-vite';
import { TilePreview } from '../TilePreview';
import { Tile } from '../../../../models/Tile';
import { PastureTerrain, RailTerrain } from '../../../../models/Terrain';

const pasture = () => new PastureTerrain();

const meta: Meta<typeof TilePreview> = {
  title: 'UI/Tiles/Rail',
  component: TilePreview,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TilePreview>;

export const RailWithoutCenter: Story = {
  args: {
    tile: new Tile({
      north: new RailTerrain(),
      northEast: new RailTerrain(),
      southEast: new RailTerrain(),
      south: new RailTerrain(),
      southWest: new RailTerrain(),
      northWest: new RailTerrain(),
    }),
    size: 48,
  },
};

export const RailLinkedToCenter: Story = {
  args: {
    tile: new Tile({
      center: new RailTerrain(),
      north: new RailTerrain({ linkToCenter: true }),
      northEast: pasture(),
      southEast: pasture(),
      south: pasture(),
      southWest: pasture(),
      northWest: pasture(),
    }),
    size: 48,
  },
};

export const RailNotLinkedToCenter: Story = {
  args: {
    tile: new Tile({
      center: new RailTerrain(),
      north: new RailTerrain({ linkToCenter: false }),
      northEast: pasture(),
      southEast: pasture(),
      south: pasture(),
      southWest: pasture(),
      northWest: pasture(),
    }),
    size: 48,
  },
};

export const MultiRailMixedLinks: Story = {
  args: {
    tile: new Tile({
      center: new RailTerrain(),
      north: new RailTerrain({ linkToCenter: true }),
      northEast: new RailTerrain({ linkToCenter: false }),
      southEast: new RailTerrain({ linkToCenter: true }),
      south: pasture(),
      southWest: new RailTerrain({ linkToCenter: false }),
      northWest: pasture(),
    }),
    size: 48,
  },
};
