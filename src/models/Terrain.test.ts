import { describe, expect, it } from 'vitest';
import { TreeTerrain, WaterTerrain } from './Terrain';

describe('WaterTerrain', () => {
  it('sets linkToCenter to false by default', () => {
    const terrain = new WaterTerrain();
    expect(terrain.linkToCenter).toBe(false);
  });

  it('allows overriding linkToCenter', () => {
    const terrain = new WaterTerrain(true);
    expect(terrain.linkToCenter).toBe(true);
  });

  it('matches by terrain category for edge checks', () => {
    expect(new WaterTerrain().matchesForEdge(new WaterTerrain(true))).toBe(true);
    expect(new WaterTerrain().matchesForEdge(new TreeTerrain())).toBe(false);
  });
});
