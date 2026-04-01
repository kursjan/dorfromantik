import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tile } from '../../models/Tile';
import { PastureTerrain, RailTerrain } from '../../models/Terrain';
import { HexTile } from './HexTile';

const pasture = () => new PastureTerrain();

const meta: Meta<typeof HexTile> = {
  title: 'SVG/Tiles/Rail',
  component: HexTile,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HexTile>;

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
    width: 120,
    height: 120,
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
    width: 120,
    height: 120,
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
    width: 120,
    height: 120,
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
    width: 120,
    height: 120,
  },
};
