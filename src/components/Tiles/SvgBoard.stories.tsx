import React, { useEffect, useState, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Board, type BoardTile } from '../../models/Board';
import { radians } from '../../utils/Angle';
import { SvgBoard, type Camera } from './SvgBoard';
import { HexCoordinate } from '../../models/HexCoordinate';
import { north, northEast, northWest, south, southEast, southWest } from '../../models/Navigation';
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

const ORIGIN = new HexCoordinate(0, 0, 0);

const singleTile: BoardTile[] = [
  {
    id: '0,0,0',
    coordinate: ORIGIN,
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

const flowerTiles: BoardTile[] = [
  {
    id: '0,0,0',
    coordinate: ORIGIN,
    tile: createTile(
      Array(6)
        .fill(null)
        .map(() => new HouseTerrain())
    ),
  },
  {
    id: '0,-1,1',
    coordinate: northWest(ORIGIN),
    tile: createTile(
      Array(6)
        .fill(null)
        .map(() => new TreeTerrain())
    ),
  },
  {
    id: '1,-1,0',
    coordinate: southWest(ORIGIN),
    tile: createTile(
      Array(6)
        .fill(null)
        .map(() => new FieldTerrain())
    ),
  },
  {
    id: '1,0,-1',
    coordinate: south(ORIGIN),
    tile: createTile(
      Array(6)
        .fill(null)
        .map(() => new WaterTerrain())
    ),
  },
  {
    id: '0,1,-1',
    coordinate: southEast(ORIGIN),
    tile: createTile(
      Array(6)
        .fill(null)
        .map(() => new RailTerrain())
    ),
  },
  {
    id: '-1,1,0',
    coordinate: northEast(ORIGIN),
    tile: createTile(
      Array(6)
        .fill(null)
        .map(() => new PastureTerrain())
    ),
  },
  {
    id: '-1,0,1',
    coordinate: north(ORIGIN),
    tile: createTile(
      Array(6)
        .fill(null)
        .map(() => new HouseTerrain())
    ),
  },
];

const scatteredTiles: BoardTile[] = [
  ...flowerTiles,
  {
    id: '2,-2,0',
    coordinate: southWest(southWest(ORIGIN)),
    tile: createTile(
      Array(6)
        .fill(null)
        .map(() => new WaterTerrain())
    ),
  },
  {
    id: '-2,2,0',
    coordinate: northEast(northEast(ORIGIN)),
    tile: createTile(
      Array(6)
        .fill(null)
        .map(() => new RailTerrain())
    ),
  },
  {
    id: '3,0,-3',
    coordinate: south(south(south(ORIGIN))),
    tile: createTile(
      Array(6)
        .fill(null)
        .map(() => new TreeTerrain())
    ),
  },
];

function boardFromTiles(tiles: BoardTile[]): Board {
  return new Board(new Map(tiles.map((bt) => [bt.coordinate.getKey(), bt])));
}

const singleTileBoard = boardFromTiles(singleTile);
const flowerBoard = boardFromTiles(flowerTiles);
const scatteredBoard = boardFromTiles(scatteredTiles);

/** Story viewport pivot (half of typical fullscreen); interactive stories measure their container. */
const defaultViewCenter = { x: 960, y: 540 };

const defaultCamera: Camera = { x: 400, y: 300, zoom: 1, rotation: radians(0) };

// --- Stories ---

export const SingleTile: Story = {
  args: {
    board: singleTileBoard,
    camera: defaultCamera,
    viewCenter: defaultViewCenter,
  },
};

export const FlowerCluster: Story = {
  args: {
    board: flowerBoard,
    camera: defaultCamera,
    viewCenter: defaultViewCenter,
  },
};

export const ScatteredCluster: Story = {
  args: {
    board: scatteredBoard,
    camera: defaultCamera,
    viewCenter: defaultViewCenter,
  },
};

// --- Interactive Story ---

const InteractiveBoard = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [viewCenter, setViewCenter] = useState(defaultViewCenter);
  const [camera, setCamera] = useState<Camera>({
    x: 400,
    y: 300,
    zoom: 1,
    rotation: radians(0),
  });
  const [isDragging, setIsDragging] = useState(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setViewCenter({ x: r.width / 2, y: r.height / 2 });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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

      return { ...prev, x: newX, y: newY, zoom: newZoom };
    });
  };

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
    >
      <SvgBoard board={scatteredBoard} camera={camera} viewCenter={viewCenter} />
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

/**
 * CSS 3D tilt (rotateX) + spin (rotateZ) around the board plane. SvgBoard camera zoom stays 1 — no zoom.
 * The map stays 2D; the “perspective” is the whole SVG treated as a card seen from an angle.
 */
const PerspectiveRotationBoard = () => {
  const boardWrapRef = useRef<HTMLDivElement>(null);
  const [viewCenter, setViewCenter] = useState(defaultViewCenter);
  const [tiltX, setTiltX] = useState(52);
  const [rotationZ, setRotationZ] = useState(12);
  const [autoRotate, setAutoRotate] = useState(false);

  useEffect(() => {
    if (!autoRotate) return;
    let frame = 0;
    const loop = () => {
      setRotationZ((z) => (z + 0.12) % 360);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [autoRotate]);

  useEffect(() => {
    const el = boardWrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setViewCenter({ x: r.width / 2, y: r.height / 2 });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const boardCamera: Camera = { x: 400, y: 300, zoom: 1, rotation: radians(0) };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #cfe8f5 0%, #a8d4ea 45%, #7eb8d6 100%)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: '1100px',
          perspectiveOrigin: '50% 42%',
        }}
      >
        <div
          ref={boardWrapRef}
          style={{
            width: 'min(92vw, 880px)',
            height: 'min(78vh, 640px)',
            transformStyle: 'preserve-3d',
            transform: `rotateX(${tiltX}deg) rotateZ(${rotationZ}deg)`,
            transition: autoRotate ? undefined : 'transform 0.08s ease-out',
          }}
        >
          <SvgBoard board={scatteredBoard} camera={boardCamera} viewCenter={viewCenter} />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          maxWidth: 320,
          background: 'rgba(255,255,255,0.92)',
          padding: '12px 16px',
          borderRadius: 10,
          boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
          fontSize: 13,
        }}
      >
        <p style={{ margin: '0 0 10px 0', fontWeight: 700 }}>
          Perspective & rotation (2D board as a tilted plane)
        </p>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Tilt (rotateX, °) — edge-on = 90, top-down = 0
          <input
            type="range"
            min={0}
            max={85}
            value={tiltX}
            onChange={(e) => setTiltX(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Rotation (rotateZ, °)
          <input
            type="range"
            min={0}
            max={359}
            value={Math.round(rotationZ) % 360}
            onChange={(e) => {
              setAutoRotate(false);
              setRotationZ(Number(e.target.value));
            }}
            style={{ width: '100%' }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={autoRotate}
            onChange={(e) => setAutoRotate(e.target.checked)}
          />
          Auto-rotate (orbit)
        </label>
        <p style={{ margin: '10px 0 0 0', fontSize: 11, color: '#555', lineHeight: 1.35 }}>
          Zoom is fixed (camera.zoom = 1). Foreshortening comes from CSS perspective + rotateX, not
          from SvgBoard scaling.
        </p>
      </div>
    </div>
  );
};

export const PerspectiveAndRotation: Story = {
  render: () => <PerspectiveRotationBoard />,
};
