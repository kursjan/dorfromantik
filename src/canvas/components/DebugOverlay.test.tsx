import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DebugOverlay } from './DebugOverlay';
import { CanvasController } from '../engine/CanvasController';
import { HexCoordinate } from '../../models/HexCoordinate';

// Mock CanvasController
const mockController = {
  addDebugStatsListener: vi.fn(),
} as unknown as CanvasController;

describe('DebugOverlay', () => {
  let statsCallback: any;

  beforeEach(() => {
    vi.clearAllMocks();
    (mockController.addDebugStatsListener as any).mockImplementation((cb: any) => {
      statsCallback = cb;
      return vi.fn(); // Unsubscribe function
    });
  });

  it('should not be visible by default', () => {
    render(<DebugOverlay controller={mockController} />);
    expect(screen.queryByTestId('debug-overlay')).not.toBeInTheDocument();
  });

  it('should toggle visibility when F3 is pressed', () => {
    render(<DebugOverlay controller={mockController} />);
    
    // Press F3
    fireEvent.keyDown(window, { key: 'F3' });
    
    // Should still not be visible because we don't have stats yet
    expect(screen.queryByTestId('debug-overlay')).not.toBeInTheDocument();

    // Push some stats
    act(() => {
      if (statsCallback) {
        statsCallback({
          fps: 60,
          camera: { x: 10, y: 20, zoom: 1.5 },
          hoveredHex: new HexCoordinate(1, -1, 0)
        });
      }
    });

    // Now it should be visible
    expect(screen.getByTestId('debug-overlay')).toBeInTheDocument();
    expect(screen.getByText(/FPS: 60/)).toBeInTheDocument();
    expect(screen.getByText(/Camera: \(10.0, 20.0\) Zoom: 1.50/)).toBeInTheDocument();
    expect(screen.getByText(/Hover: \(1, -1, 0\)/)).toBeInTheDocument();

    // Toggle off
    fireEvent.keyDown(window, { key: 'F3' });
    expect(screen.queryByTestId('debug-overlay')).not.toBeInTheDocument();
  });

  it('should update stats when controller notifies change', () => {
    render(<DebugOverlay controller={mockController} />);
    fireEvent.keyDown(window, { key: 'F3' });

    // Initial stats
    act(() => {
      if (statsCallback) {
        statsCallback({
          fps: 60,
          camera: { x: 0, y: 0, zoom: 1.0 },
          hoveredHex: null
        });
      }
    });
    expect(screen.getByText(/FPS: 60/)).toBeInTheDocument();

    // Updated stats
    act(() => {
      if (statsCallback) {
        statsCallback({
          fps: 30,
          camera: { x: 100, y: -50, zoom: 2.0 },
          hoveredHex: new HexCoordinate(2, -3, 1)
        });
      }
    });
    expect(screen.getByText(/FPS: 30/)).toBeInTheDocument();
    expect(screen.getByText(/Camera: \(100.0, -50.0\) Zoom: 2.00/)).toBeInTheDocument();
    expect(screen.getByText(/Hover: \(2, -3, 1\)/)).toBeInTheDocument();
  });
});
