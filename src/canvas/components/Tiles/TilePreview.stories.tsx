import type { Meta, StoryObj } from '@storybook/react-vite';
import { TilePreview } from '../TilePreview';
import { Tile } from '../../../models/Tile';
import type { Terrain } from '../../../models/Terrain';
import {
  FieldTerrain,
  HouseTerrain,
  PastureTerrain,
  RailTerrain,
  TreeTerrain,
} from '../../../models/Terrain';

function tileUniformEdges(create: () => Terrain): Tile {
  return new Tile({
    north: create(),
    northEast: create(),
    southEast: create(),
    south: create(),
    southWest: create(),
    northWest: create(),
  });
}

const meta: Meta<typeof TilePreview> = {
  title: 'UI/Tiles',
  component: TilePreview,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TilePreview>;

export const Tree: Story = {
  args: {
    tile: tileUniformEdges(() => new TreeTerrain()),
    size: 48,
  },
};

export const House: Story = {
  args: {
    tile: tileUniformEdges(() => new HouseTerrain()),
    size: 48,
  },
};

export const Pasture: Story = {
  args: {
    tile: tileUniformEdges(() => new PastureTerrain()),
    size: 48,
  },
};

export const Rail: Story = {
  args: {
    tile: tileUniformEdges(() => new RailTerrain()),
    size: 48,
  },
};

export const Field: Story = {
  args: {
    tile: tileUniformEdges(() => new FieldTerrain()),
    size: 48,
  },
};
