import { Terrain, WaterTerrain, RailTerrain } from '../../../models/Terrain';

export function isLinkedToCenter(terrain: Terrain | undefined): boolean {
  if (terrain instanceof WaterTerrain) return terrain.linkToCenter;
  if (terrain instanceof RailTerrain) return terrain.linkToCenter;
  return false;
}

export function getCorner(index: number): { x: number; y: number } {
  const angle = (Math.PI / 180) * 60 * index;
  return { x: 50 * Math.cos(angle), y: 50 * Math.sin(angle) };
}

export function getEdgeMidpoint(segmentIndex: number): { x: number; y: number } {
  const startCorner = getCorner((segmentIndex + 4) % 6);
  const endCorner = getCorner((segmentIndex + 5) % 6);
  return {
    x: (startCorner.x + endCorner.x) / 2,
    y: (startCorner.y + endCorner.y) / 2,
  };
}
