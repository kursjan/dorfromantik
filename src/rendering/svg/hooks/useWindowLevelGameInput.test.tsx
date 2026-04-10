import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { useWindowLevelGameInput } from './useWindowLevelGameInput';

describe('useWindowLevelGameInput', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('invokes onRotateClockwise when R is pressed', () => {
    const onRotateClockwise = vi.fn();
    renderHook(() =>
      useWindowLevelGameInput({
        onRotateClockwise,
        onRotateCounterClockwise: vi.fn(),
        onResize: vi.fn(),
      })
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'R' }));
    });

    expect(onRotateClockwise).toHaveBeenCalledTimes(1);
  });

  it('invokes onRotateCounterClockwise when F is pressed', () => {
    const onRotateCounterClockwise = vi.fn();
    renderHook(() =>
      useWindowLevelGameInput({
        onRotateClockwise: vi.fn(),
        onRotateCounterClockwise,
        onResize: vi.fn(),
      })
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }));
    });

    expect(onRotateCounterClockwise).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleDebugOverlay and preventDefault for F3', () => {
    const onToggleDebugOverlay = vi.fn();
    renderHook(() =>
      useWindowLevelGameInput({
        onRotateClockwise: vi.fn(),
        onRotateCounterClockwise: vi.fn(),
        onResize: vi.fn(),
        onToggleDebugOverlay,
      })
    );

    act(() => {
      const e = new KeyboardEvent('keydown', { key: 'F3', cancelable: true, bubbles: true });
      expect(window.dispatchEvent(e)).toBe(false);
    });

    expect(onToggleDebugOverlay).toHaveBeenCalledTimes(1);
  });

  it('reports rotation direction for held Q and E', () => {
    const { result, unmount } = renderHook(() =>
      useWindowLevelGameInput({
        onRotateClockwise: vi.fn(),
        onRotateCounterClockwise: vi.fn(),
        onResize: vi.fn(),
      })
    );

    expect(result.current.getRotationDirection()).toBe(0);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'q' }));
    });
    expect(result.current.getRotationDirection()).toBe(-1);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }));
    });
    expect(result.current.getRotationDirection()).toBe(0);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'q' }));
    });
    expect(result.current.getRotationDirection()).toBe(1);

    unmount();
  });

  it('still cancels F3 when onToggleDebugOverlay is omitted', () => {
    renderHook(() =>
      useWindowLevelGameInput({
        onRotateClockwise: vi.fn(),
        onRotateCounterClockwise: vi.fn(),
        onResize: vi.fn(),
      })
    );

    act(() => {
      const e = new KeyboardEvent('keydown', { key: 'F3', cancelable: true, bubbles: true });
      expect(window.dispatchEvent(e)).toBe(false);
    });
  });

  it('invokes onResize on window resize', () => {
    const onResize = vi.fn();
    renderHook(() =>
      useWindowLevelGameInput({
        onRotateClockwise: vi.fn(),
        onRotateCounterClockwise: vi.fn(),
        onResize,
      })
    );

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(onResize).toHaveBeenCalledTimes(1);
  });
});
