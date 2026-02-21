import '@testing-library/jest-dom';
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
      rotate: vi.fn(),
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
// Use a simple mock that returns a fixed ID and doesn't auto-execute to avoid infinite loops across tests
globalThis.requestAnimationFrame = vi.fn().mockReturnValue(1);
globalThis.cancelAnimationFrame = vi.fn();
