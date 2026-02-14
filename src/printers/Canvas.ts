export class Canvas {
  private grid = new Map<string, string>();
  private minX: number;
  private maxX: number;
  private minY: number;
  private maxY: number;

  constructor(minX: number, minY: number, maxX: number, maxY: number) {
    if (![minX, minY, maxX, maxY].every(Number.isInteger)) {
      throw new Error('Canvas bounds must be integers.');
    }
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  }

  set(x: number, y: number, char: string): void {
    if (!Number.isInteger(x) || !Number.isInteger(y)) {
      throw new Error(`Coordinates must be integers. Received (${x}, ${y}).`);
    }

    if (x < this.minX || x > this.maxX || y < this.minY || y > this.maxY) {
      throw new Error(`Coordinates (${x}, ${y}) are out of bounds. Bounds are [${this.minX}, ${this.minY}] to [${this.maxX}, ${this.maxY}].`);
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
    for (let y = this.minY; y <= this.maxY; y++) {
      let line = '';
      for (let x = this.minX; x <= this.maxX; x++) {
        const char = this.grid.get(`${x},${y}`);
        line += char || ' ';
      }
      lines.push(line);
    }
    return lines.join('\n');
  }
}
