export class HexCoordinate {
  readonly q: number;
  readonly r: number;
  readonly s: number;

  constructor(q: number, r: number, s: number) {
    if (!Number.isInteger(q) || !Number.isInteger(r) || !Number.isInteger(s)) {
      throw new Error(`Invalid HexCoordinate: ${q},${r},${s}. Coordinates must be integers.`);
    }
    if (Math.round(q + r + s) !== 0) {
      throw new Error(`Invalid HexCoordinate: ${q},${r},${s}. Sum must be 0.`);
    }
    this.q = q;
    this.r = r;
    this.s = s;
  }

  getKey(): string {
    return `${this.q},${this.r},${this.s}`;
  }

  equals(other: HexCoordinate): boolean {
    return this.q === other.q && this.r === other.r && this.s === other.s;
  }
}
