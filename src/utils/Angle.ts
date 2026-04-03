declare const radiansBrand: unique symbol;

/**
 * Angle in radians (2π = full turn). Compile-time only: still a `number` at runtime.
 * Use {@link radians} at trust boundaries (config, literals, external APIs).
 */
export type Radians = number & { readonly [radiansBrand]: never };

/** Wrap a plain number as radians (trust boundary). */
export function radians(value: number): Radians {
  return value as Radians;
}

/** Degrees for SVG `rotate()`, CSS, or display. */
export function radiansToDegrees(rad: Radians): number {
  return (rad * 180) / Math.PI;
}
