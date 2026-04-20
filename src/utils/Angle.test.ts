import { describe, expect, it } from 'vitest';
import { radians, radiansToDegrees } from './Angle';

describe('Angle', () => {
  it('converts π radians to 180 degrees', () => {
    expect(radiansToDegrees(radians(Math.PI))).toBe(180);
  });

  it('converts zero', () => {
    expect(radiansToDegrees(radians(0))).toBe(0);
  });
});
