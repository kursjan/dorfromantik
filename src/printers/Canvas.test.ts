import { describe, it, expect } from 'vitest';
import { Canvas } from './Canvas';

describe('Canvas', () => {
  it('should initialize with the correct bounds', () => {
    const canvas = new Canvas(-10, -5, 10, 5);
    // @ts-expect-error Accessing private members for testing
    expect(canvas.minX).toBe(-10);
    // @ts-expect-error Accessing private members for testing
    expect(canvas.minY).toBe(-5);
    // @ts-expect-error Accessing private members for testing
    expect(canvas.maxX).toBe(10);
    // @ts-expect-error Accessing private members for testing
    expect(canvas.maxY).toBe(5);
  });

  it('should set and get a character within bounds', () => {
    const canvas = new Canvas(0, 0, 10, 10);
    canvas.set(5, 5, 'X');
    expect(canvas.get(5, 5)).toBe('X');
  });

  it('should throw an error when setting a character out of bounds', () => {
    const canvas = new Canvas(0, 0, 10, 10);
    expect(() => canvas.set(11, 5, 'X')).toThrow();
    expect(() => canvas.set(5, 11, 'X')).toThrow();
    expect(() => canvas.set(-1, 5, 'X')).toThrow();
    expect(() => canvas.set(5, -1, 'X')).toThrow();
  });

  it('should handle negative coordinates', () => {
    const canvas = new Canvas(-10, -10, 0, 0);
    canvas.set(-5, -5, 'N');
    expect(canvas.get(-5, -5)).toBe('N');
  });

  it('should render correctly with toString()', () => {
    const canvas = new Canvas(0, 0, 4, 2);
    canvas.set(1, 1, 'A');
    canvas.set(3, 1, 'B');
    const expected = 
`     
 A B 
     `;
    expect(canvas.toString()).toBe(expected);
  });

  it('should return an empty string for an empty canvas', () => {
    const canvas = new Canvas(0, 0, 10, 10);
    expect(canvas.toString()).toBe('');
  });

  it('should throw an error for floating point coordinates', () => {
    const canvas = new Canvas(0, 0, 10, 10);
    expect(() => canvas.set(4.6, 5, 'Z')).toThrow();
    expect(() => canvas.get(5, 5.4)).toThrow();
  });

  it('should throw an error when overwriting a character with a different one', () => {
    const canvas = new Canvas(0, 0, 10, 10);
    canvas.set(5, 5, 'A');
    expect(() => canvas.set(5, 5, 'B')).toThrow();
  });

  it('should not throw an error when overwriting a character with the same one', () => {
    const canvas = new Canvas(0, 0, 10, 10);
    canvas.set(5, 5, 'A');
    expect(() => canvas.set(5, 5, 'A')).not.toThrow();
  });

  it('should allow overwriting a space', () => {
    const canvas = new Canvas(0, 0, 10, 10);
    canvas.set(5, 5, ' ');
    expect(() => canvas.set(5, 5, 'A')).not.toThrow();
  });
});
