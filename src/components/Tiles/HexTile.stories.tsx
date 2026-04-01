import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tile } from '../../models/Tile';
import {
  FieldTerrain,
  HouseTerrain,
  PastureTerrain,
  RailTerrain,
  TreeTerrain,
  WaterOrPastureTerrain,
  WaterTerrain,
} from '../../models/Terrain';
import { TilePreview } from '../../canvas/components/TilePreview';
import { HexTile } from './HexTile';

const meta: Meta<typeof HexTile> = {
  title: 'UI/Tiles/HexTile',
  component: HexTile,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HexTile>;

function tileWithSingleTerrain(
  terrain: TreeTerrain | HouseTerrain | WaterTerrain | PastureTerrain | RailTerrain | FieldTerrain
): Tile {
  return new Tile({
    north: terrain,
    northEast: terrain,
    southEast: terrain,
    south: terrain,
    southWest: terrain,
    northWest: terrain,
  });
}

export const BaseTerrains: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(130px, 1fr))', gap: 16 }}>
      <HexTile tile={tileWithSingleTerrain(new TreeTerrain())} width={120} height={120} />
      <HexTile tile={tileWithSingleTerrain(new HouseTerrain())} width={120} height={120} />
      <HexTile tile={tileWithSingleTerrain(new WaterTerrain())} width={120} height={120} />
      <HexTile tile={tileWithSingleTerrain(new PastureTerrain())} width={120} height={120} />
      <HexTile tile={tileWithSingleTerrain(new RailTerrain())} width={120} height={120} />
      <HexTile tile={tileWithSingleTerrain(new FieldTerrain())} width={120} height={120} />
    </div>
  ),
};

const mixedTile = new Tile({
  north: new TreeTerrain(),
  northEast: new HouseTerrain(),
  southEast: new WaterTerrain({ linkToCenter: true }),
  south: new RailTerrain({ linkToCenter: true }),
  southWest: new FieldTerrain(),
  northWest: new PastureTerrain(),
  center: new WaterTerrain(),
});

export const FullyRotatedTile: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <HexTile tile={mixedTile} width={120} height={120} />
      <HexTile tile={mixedTile.rotateClockwise()} width={120} height={120} />
      <HexTile tile={mixedTile.rotateClockwise().rotateClockwise()} width={120} height={120} />
      <HexTile
        tile={mixedTile.rotateClockwise().rotateClockwise().rotateClockwise()}
        width={120}
        height={120}
      />
      <HexTile
        tile={mixedTile.rotateClockwise().rotateClockwise().rotateClockwise().rotateClockwise()}
        width={120}
        height={120}
      />
      <HexTile tile={mixedTile.rotateCounterClockwise()} width={120} height={120} />
    </div>
  ),
};

const hybridTile = new Tile({
  north: new WaterTerrain({ linkToCenter: true }),
  northEast: new WaterOrPastureTerrain(),
  southEast: new RailTerrain({ linkToCenter: true }),
  south: new FieldTerrain(),
  southWest: new HouseTerrain(),
  northWest: new TreeTerrain(),
  center: new RailTerrain(),
});

export const HybridParityWithCanvas: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div>SVG</div>
        <HexTile
          tile={hybridTile}
          width={140}
          height={140}
          neighborEdgeTerrainTypes={{
            north: 'water',
            northEast: 'pasture',
            southEast: 'field',
          }}
        />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div>Canvas</div>
        <TilePreview
          tile={hybridTile}
          size={45}
          neighborEdgeTerrains={{
            north: new WaterTerrain(),
            northEast: new PastureTerrain(),
            southEast: new FieldTerrain(),
          }}
        />
      </div>
    </div>
  ),
};

const adjacentLeftTile = new Tile({
  north: new WaterTerrain(),
  northEast: new TreeTerrain(),
  southEast: new HouseTerrain(),
  south: new FieldTerrain(),
  southWest: new RailTerrain(),
  northWest: new PastureTerrain(),
});

const adjacentRightTile = new Tile({
  north: new RailTerrain(),
  northEast: new WaterTerrain(),
  southEast: new TreeTerrain(),
  south: new HouseTerrain(),
  southWest: new FieldTerrain(),
  northWest: new HouseTerrain(),
});

export const AdjacentAlignment: Story = {
  render: () => (
    <div style={{ padding: 20, border: '1px solid #ddd' }}>
      <div style={{ width: 175, height: 100, position: 'relative' }}>
        <HexTile
          tile={adjacentLeftTile}
          width={100}
          height={100}
          style={{ position: 'absolute', left: 0 }}
        />
        <HexTile
          tile={adjacentRightTile}
          width={100}
          height={100}
          style={{ position: 'absolute', left: 75 }}
        />
      </div>
    </div>
  ),
};
