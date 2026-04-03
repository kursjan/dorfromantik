import { useSyncExternalStore, useCallback } from 'react';
import { radians } from '../../utils/Angle';
import type { CanvasController, DebugStats } from '../engine/CanvasController';

const emptySnapshot: DebugStats = {
  fps: 0,
  camera: { x: 0, y: 0, zoom: 1, rotation: radians(0) },
  hoveredHex: null,
};

export function useCanvasControllerDebugStats(controller: CanvasController | null): DebugStats {
  const subscribe = useCallback(
    (listener: () => void) => {
      if (!controller) return () => {};
      return controller.subscribeDebug(listener);
    },
    [controller]
  );

  const getSnapshot = useCallback(() => {
    if (!controller) return emptySnapshot;
    return controller.getDebugSnapshot();
  }, [controller]);

  const getServerSnapshot = useCallback(() => emptySnapshot, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
