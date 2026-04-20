import { useSyncExternalStore, useCallback } from 'react';
import { DEFAULT_CAMERA_SNAPSHOT } from '../../common/camera/CameraSnapshot';
import type { CanvasController, DebugStats } from '../engine/CanvasController';

const emptySnapshot: DebugStats = {
  fps: 0,
  camera: { ...DEFAULT_CAMERA_SNAPSHOT },
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
