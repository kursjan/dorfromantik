/**
 * x/y in the camera **world** plane (layout units, not CSS pixels).
 * Same space as hex centers from `hexToPixel` and as `Camera.containerToWorld` output.
 */
export type WorldPoint = Readonly<{ x: number; y: number }>;

export const WORLD_ORIGIN = { x: 0, y: 0 } as const satisfies WorldPoint;
