import { type RefObject, useCallback, useLayoutEffect, useState } from 'react';

/**
 * Tracks the game board container size for SVG view centering and hit-testing,
 * using {@link ResizeObserver} plus an initial {@link requestAnimationFrame} measure
 * (avoids synchronous setState inside layout effects).
 */
export function useSvgGameViewLayout(containerRef: RefObject<HTMLElement | null>): {
  viewSize: { width: number; height: number };
  measureContainer: () => void;
} {
  const [viewSize, setViewSize] = useState({ width: 0, height: 0 });

  const measureContainer = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let w = r.width;
    let h = r.height;
    if (w === 0 && h === 0 && typeof window !== 'undefined') {
      w = window.innerWidth;
      h = window.innerHeight;
    }
    setViewSize({ width: w, height: h });
  }, [containerRef]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const frame = requestAnimationFrame(() => {
      measureContainer();
    });

    if (typeof ResizeObserver === 'undefined') {
      return () => cancelAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => measureContainer());
    ro.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [containerRef, measureContainer]);

  return { viewSize, measureContainer };
}
