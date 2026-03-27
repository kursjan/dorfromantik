import { describe, expect, it } from 'vitest';
import { PastureTerrain, TreeTerrain, WaterOrPastureTerrain, WaterTerrain } from './Terrain';

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
    expect(new WaterTerrain().matchesForEdge(new WaterOrPastureTerrain())).toBe(true);
  });
});

describe('WaterOrPastureTerrain', () => {
  it('matches water, pasture, and itself', () => {
    const wop = new WaterOrPastureTerrain();
    expect(wop.matchesForEdge(new WaterTerrain())).toBe(true);
    expect(wop.matchesForEdge(new PastureTerrain())).toBe(true);
    expect(wop.matchesForEdge(new WaterOrPastureTerrain())).toBe(true);
    expect(wop.matchesForEdge(new TreeTerrain())).toBe(false);
  });
});

describe('PastureTerrain', () => {
  it('matches waterOrPasture on edge', () => {
    expect(new PastureTerrain().matchesForEdge(new WaterOrPastureTerrain())).toBe(true);
  });
});
