import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, expect, it, afterEach } from 'vitest';
import { useCameraControls, type UseCameraControlsCallbacks } from './useCameraControls';

const stubCallbacks = {
  onHover: () => {},
  onClick: () => {},
  onRotateClockwise: () => {},
  onRotateCounterClockwise: () => {},
  onLeave: () => {},
} satisfies UseCameraControlsCallbacks;

describe('useCameraControls', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('zooms out when wheel deltaY is positive', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const ref = { current: container };

    const { result } = renderHook(() => useCameraControls(ref, stubCallbacks));

    expect(result.current.transform.zoom).toBe(1);

    act(() => {
      container.dispatchEvent(
        new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true })
      );
    });

    await waitFor(() => {
      expect(result.current.transform.zoom).toBeCloseTo(0.9, 5);
    });
  });

  it('pans after drag passes threshold', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const ref = { current: container };

    const { result } = renderHook(() => useCameraControls(ref, stubCallbacks));

    act(() => {
      container.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true, clientX: 100, clientY: 100, button: 0 })
      );
      container.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true, clientX: 112, clientY: 100 })
      );
      container.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true, clientX: 122, clientY: 100 })
      );
    });

    await waitFor(() => {
      expect(result.current.transform.position.x).toBeCloseTo(10, 5);
      expect(result.current.transform.position.y).toBe(0);
    });
  });

  it('resetCamera restores defaults', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const ref = { current: container };

    const { result } = renderHook(() => useCameraControls(ref, stubCallbacks));

    act(() => {
      container.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -500, bubbles: true, cancelable: true })
      );
    });

    await waitFor(() => {
      expect(result.current.transform.zoom).toBeGreaterThan(1);
    });

    act(() => {
      result.current.resetCamera();
    });

    expect(result.current.transform.zoom).toBe(1);
    expect(result.current.transform.position.x).toBe(0);
    expect(result.current.transform.position.y).toBe(0);
  });
});
