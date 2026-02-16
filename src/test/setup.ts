import '@testing-library/jest-dom'
import { vi } from 'vitest';

// Mock Canvas getContext
// @ts-expect-error We are mocking the getContext method for testing purposes.
HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
  if (contextId === '2d') {
    return {
      fillStyle: '',
      fillRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      font: '',
      textAlign: '',
      textBaseline: '',
    } as unknown as CanvasRenderingContext2D;
  }
  return null;
});

// Mock requestAnimationFrame
// @ts-expect-error We are mocking requestAnimationFrame for testing purposes.
global.requestAnimationFrame = vi.fn((callback) => setTimeout(callback, 0));
// @ts-expect-error We are mocking cancelAnimationFrame for testing purposes.
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id));
