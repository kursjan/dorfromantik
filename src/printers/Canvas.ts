export interface Point {
  x: number;
  y: number;
}

export interface CanvasBounds {
  topLeft: Point;
  bottomRight: Point;
}

export class Canvas {
  private grid = new Map<string, string>();
  private bounds: CanvasBounds;

  constructor(bounds: CanvasBounds) {
    if (![bounds.topLeft.x, bounds.topLeft.y, bounds.bottomRight.x, bounds.bottomRight.y].every(Number.isInteger)) {
      throw new Error('Canvas bounds must be integers.');
    }
    this.bounds = bounds;
  }

  set(x: number, y: number, char: string): void {
    if (!Number.isInteger(x) || !Number.isInteger(y)) {
      throw new Error(`Coordinates must be integers. Received (${x}, ${y}).`);
    }

    if (x < this.bounds.topLeft.x || x > this.bounds.bottomRight.x || y < this.bounds.topLeft.y || y > this.bounds.bottomRight.y) {
      throw new Error(`Coordinates (${x}, ${y}) are out of bounds. Bounds are [${this.bounds.topLeft.x}, ${this.bounds.topLeft.y}] to [${this.bounds.bottomRight.x}, ${this.bounds.bottomRight.y}].`);
    }

    const key = `${x},${y}`;
    const existingChar = this.grid.get(key);

    if (existingChar && existingChar !== ' ' && existingChar !== char) {
      throw new Error(`Cannot overwrite character "${existingChar}" with "${char}" at (${x}, ${y}).`);
    }

    this.grid.set(key, char);
  }

  get(x: number, y: number): string | undefined {
    if (!Number.isInteger(x) || !Number.isInteger(y)) {
      throw new Error(`Coordinates must be integers. Received (${x}, ${y}).`);
    }
    return this.grid.get(`${x},${y}`);
  }

  toString(): string {
    if (this.grid.size === 0) {
      return '';
    }

    const lines: string[] = [];
    for (let y = this.bounds.topLeft.y; y <= this.bounds.bottomRight.y; y++) {
      let line = '';
      for (let x = this.bounds.topLeft.x; x <= this.bounds.bottomRight.x; x++) {
        const char = this.grid.get(`${x},${y}`);
        line += char || ' ';
      }
      lines.push(line);
    }
    return lines.join('\n');
  }
}
