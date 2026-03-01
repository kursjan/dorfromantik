export class HexCoordinate {
  readonly q: number;
  readonly r: number;
  readonly s: number;

  /**
   * Creates a new HexCoordinate using the Cube Coordinate system (q, r, s).
   *
   * **Note:** We deliberately avoid using an `axial` factory helper (q, r)
   * to ensure that the zero-sum invariant (`q + r + s = 0`) is explicitly
   * defined and validated by the caller. This improves code readability
   * and prevents "magic" coordinate derivation.
   *
   * @param q The column coordinate.
   * @param r The row coordinate.
   * @param s The third coordinate (must be equal to -q - r).
   */
  constructor(q: number, r: number, s: number) {
    if (!Number.isInteger(q) || !Number.isInteger(r) || !Number.isInteger(s)) {
      throw new Error(`Invalid HexCoordinate: ${q},${r},${s}. Coordinates must be integers.`);
    }
    if (q + r + s !== 0) {
      throw new Error(`Invalid HexCoordinate: ${q},${r},${s}. Sum must be 0.`);
    }
    // Normalize -0 to 0
    this.q = q === 0 ? 0 : q;
    this.r = r === 0 ? 0 : r;
    this.s = s === 0 ? 0 : s;
  }

  getKey(): string {
    return `${this.q},${this.r},${this.s}`;
  }

  equals(other: HexCoordinate): boolean {
    return this.q === other.q && this.r === other.r && this.s === other.s;
  }
}
