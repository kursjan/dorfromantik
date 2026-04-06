type WorldPointBrand = { readonly __brand: 'WorldPoint' };
export type WorldPoint = Readonly<{ x: number; y: number }> & WorldPointBrand;

function createWorldPoint(x: number, y: number): WorldPoint {
  return Object.freeze({ x, y }) as WorldPoint;
}

export const WorldPoint = {
  xy(x: number, y: number): WorldPoint {
    return createWorldPoint(x, y);
  },
};

export const WORLD_ORIGIN = WorldPoint.xy(0, 0);
