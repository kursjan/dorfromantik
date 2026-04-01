import React, { useState, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SvgBoard, type SvgBoardTile, type Camera } from './SvgBoard';
import { HexCoordinate } from '../../models/HexCoordinate';
import { Tile } from '../../models/Tile';
import {
  TreeTerrain,
  HouseTerrain,
  WaterTerrain,
  PastureTerrain,
  RailTerrain,
  FieldTerrain,
  Terrain,
} from '../../models/Terrain';

const meta: Meta<typeof SvgBoard> = {
  title: 'SVG/Board',
  component: SvgBoard,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh', backgroundColor: '#e8f4f8' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SvgBoard>;

// Helper to create a basic tile
const createTile = (terrains: Terrain[]): Tile => {
  return new Tile({
    north: terrains[0] || new PastureTerrain(),
    northEast: terrains[1] || new PastureTerrain(),
    southEast: terrains[2] || new PastureTerrain(),
    south: terrains[3] || new PastureTerrain(),
    southWest: terrains[4] || new PastureTerrain(),
    northWest: terrains[5] || new PastureTerrain(),
  });
};

// --- Mock Data ---

const singleTile: SvgBoardTile[] = [
  {
    id: '0,0,0',
    coordinate: new HexCoordinate(0, 0, 0),
    tile: createTile([
      new TreeTerrain(),
      new PastureTerrain(),
      new WaterTerrain(),
      new WaterTerrain(),
      new PastureTerrain(),
      new TreeTerrain(),
    ]),
  },
];

const flowerTiles: SvgBoardTile[] = [
  {
    id: '0,0,0',
    coordinate: new HexCoordinate(0, 0, 0),
    tile: createTile(
      Array(6)
        .fill(null)
        .map(() => new HouseTerrain())
    ),
  },
  {
    id: '0,-1,1',
    coordinate: new HexCoordinate(0, -1, 1),
    tile: createTile(
      Array(6)
        .fill(null)
        .map(() => new TreeTerrain())
    ),
  },
  {
    id: '1,-1,0',
    coordinate: new HexCoordinate(1, -1, 0),
    tile: createTile(
      Array(6)
        .fill(null)
        .map(() => new FieldTerrain())
    ),
  },
  {
    id: '1,0,-1',
    coordinate: new HexCoordinate(1, 0, -1),
    tile: createTile(
      Array(6)
        .fill(null)
        .map(() => new WaterTerrain())
    ),
  },
  {
    id: '0,1,-1',
    coordinate: new HexCoordinate(0, 1, -1),
    tile: createTile(
      Array(6)
        .fill(null)
        .map(() => new RailTerrain())
    ),
  },
  {
    id: '-1,1,0',
    coordinate: new HexCoordinate(-1, 1, 0),
    tile: createTile(
      Array(6)
        .fill(null)
        .map(() => new PastureTerrain())
    ),
  },
  {
    id: '-1,0,1',
    coordinate: new HexCoordinate(-1, 0, 1),
    tile: createTile(
      Array(6)
        .fill(null)
        .map(() => new HouseTerrain())
    ),
  },
];

const scatteredTiles: SvgBoardTile[] = [
  ...flowerTiles,
  {
    id: '2,-2,0',
    coordinate: new HexCoordinate(2, -2, 0),
    tile: createTile(
      Array(6)
        .fill(null)
        .map(() => new WaterTerrain())
    ),
  },
  {
    id: '-2,2,0',
    coordinate: new HexCoordinate(-2, 2, 0),
    tile: createTile(
      Array(6)
        .fill(null)
        .map(() => new RailTerrain())
    ),
  },
  {
    id: '3,0,-3',
    coordinate: new HexCoordinate(3, 0, -3),
    tile: createTile(
      Array(6)
        .fill(null)
        .map(() => new TreeTerrain())
    ),
  },
];

const defaultCamera: Camera = { x: 400, y: 300, zoom: 1 };

// --- Stories ---

export const SingleTile: Story = {
  args: {
    tiles: singleTile,
    camera: defaultCamera,
  },
};

export const FlowerCluster: Story = {
  args: {
    tiles: flowerTiles,
    camera: defaultCamera,
  },
};

export const ScatteredCluster: Story = {
  args: {
    tiles: scatteredTiles,
    camera: defaultCamera,
  },
};

// --- Interactive Story ---

const InteractiveBoard = () => {
  const [camera, setCamera] = useState<Camera>({ x: 400, y: 300, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    lastMouse.current = { x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;

    setCamera((prev) => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;

    // Zoom towards mouse cursor
    const rect = (e.currentTarget as Element).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setCamera((prev) => {
      const newZoom = Math.max(0.2, Math.min(prev.zoom * zoomDelta, 3));

      // Adjust x and y so the point under the mouse stays in the same place
      const scaleChange = newZoom / prev.zoom;
      const newX = mouseX - (mouseX - prev.x) * scaleChange;
      const newY = mouseY - (mouseY - prev.y) * scaleChange;

      return { x: newX, y: newY, zoom: newZoom };
    });
  };

  return (
    <div
      style={{ width: '100%', height: '100%', cursor: isDragging ? 'grabbing' : 'grab' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
    >
      <SvgBoard
        tiles={scatteredTiles}
        camera={camera}
        onTileClick={(coord) => console.log('Clicked tile at', coord.getKey())}
      />
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          background: 'white',
          padding: '8px 16px',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <p style={{ margin: 0, fontWeight: 'bold' }}>Interactive Camera</p>
        <p style={{ margin: '4px 0 0 0', fontSize: 12 }}>Drag to pan, scroll to zoom.</p>
        <p style={{ margin: '4px 0 0 0', fontSize: 12, fontFamily: 'monospace' }}>
          x: {Math.round(camera.x)}, y: {Math.round(camera.y)}, zoom: {camera.zoom.toFixed(2)}x
        </p>
      </div>
    </div>
  );
};

export const InteractiveCamera: Story = {
  render: () => <InteractiveBoard />,
};
