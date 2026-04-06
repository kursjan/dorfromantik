import { useSyncExternalStore, useCallback } from 'react';
import { radians } from '../../../utils/Angle';
import { WORLD_ORIGIN } from '../../common/WorldPoint';
import type { CanvasController, DebugStats } from '../engine/CanvasController';
import type { CameraSnapshot } from '@/rendering/common/camera/CameraSnapshot';

const emptySnapshot: DebugStats = {
  fps: 0,
  camera: { position: WORLD_ORIGIN, zoom: 1, rotation: radians(0) } satisfies CameraSnapshot,
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
