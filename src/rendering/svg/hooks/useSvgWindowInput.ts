import { useCallback, useLayoutEffect, useRef } from 'react';

/** Parity with canvas {@link InputManager} for `window` keyboard and resize. */
export interface SvgWindowInputCallbacks {
  onRotateClockwise: () => void;
  onRotateCounterClockwise: () => void;
  onResize: () => void;
  onToggleDebugOverlay?: () => void;
}

export function useSvgWindowInput(callbacks: SvgWindowInputCallbacks): {
  getRotationDirection: () => number;
} {
  const keysRef = useRef<Set<string>>(new Set());
  const callbacksRef = useRef(callbacks);

  useLayoutEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useLayoutEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);

      if (e.key === 'F3') {
        e.preventDefault();
        callbacksRef.current.onToggleDebugOverlay?.();
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        callbacksRef.current.onRotateClockwise();
      }
      if (e.key === 'f' || e.key === 'F') {
        callbacksRef.current.onRotateCounterClockwise();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };

    const handleResize = () => {
      callbacksRef.current.onResize();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getRotationDirection = useCallback((): number => {
    let dir = 0;
    const keys = keysRef.current;
    if (keys.has('q') || keys.has('Q')) dir -= 1;
    if (keys.has('e') || keys.has('E')) dir += 1;
    return dir;
  }, []);

  return { getRotationDirection };
}
