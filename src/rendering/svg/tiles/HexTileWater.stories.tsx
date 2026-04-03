import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tile } from '../../../models/Tile';
import { PastureTerrain, WaterTerrain } from '../../../models/Terrain';
import { HexTile } from './HexTile';

const pasture = () => new PastureTerrain();

const meta: Meta<typeof HexTile> = {
  title: 'SVG/Tiles/Water',
  component: HexTile,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HexTile>;

export const WaterWithoutCenter: Story = {
  args: {
    tile: new Tile({
      north: new WaterTerrain(),
      northEast: new WaterTerrain(),
      southEast: new WaterTerrain(),
      south: new WaterTerrain(),
      southWest: new WaterTerrain(),
      northWest: new WaterTerrain(),
    }),
    width: 120,
    height: 120,
  },
};

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
    width: 120,
    height: 120,
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
    width: 120,
    height: 120,
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
    width: 120,
    height: 120,
  },
};
