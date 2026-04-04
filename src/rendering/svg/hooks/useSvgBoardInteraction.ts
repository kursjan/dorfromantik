import { useCallback, useLayoutEffect, useMemo, useRef, type MutableRefObject } from 'react';
import type { Game } from '../../../models/Game';
import type { HexCoordinate } from '../../../models/HexCoordinate';
import { closestHexByWorldDistance } from '../../common/hex/HexUtils';
import { HEX_SIZE } from '../../common/hex/hexLayout';
import type { UseCameraControlsCallbacks } from './useCameraControls';

/**
 * Pointer-driven game actions for the SVG board (hover → valid hex, click → place, rotate queue).
 * Keeps {@link SvgGameView} as layout + composition; all snapshot reads/writes go through the bridge refs.
 */
export function useSvgBoardInteraction(
  getGameSnapshot: () => Game,
  setGameSnapshot: (game: Game) => void
): {
  cameraPointerCallbacks: UseCameraControlsCallbacks;
  screenToWorldRef: MutableRefObject<
    ((x: number, y: number) => { x: number; y: number }) | undefined
  >;
} {
  const screenToWorldRef = useRef<((x: number, y: number) => { x: number; y: number }) | undefined>(
    undefined
  );

  const getSnapshotRef = useRef(getGameSnapshot);
  const setSnapshotRef = useRef(setGameSnapshot);
  useLayoutEffect(() => {
    getSnapshotRef.current = getGameSnapshot;
    setSnapshotRef.current = setGameSnapshot;
  }, [getGameSnapshot, setGameSnapshot]);

  const hoveredHexRef = useRef<HexCoordinate | null>(null);

  const onHover = useCallback((mouseX: number, mouseY: number) => {
    const stw = screenToWorldRef.current;
    if (!stw) return;
    const worldPos = stw(mouseX, mouseY);
    const validCoords = getSnapshotRef.current().hints.validPlacements;
    if (validCoords.length === 0) {
      hoveredHexRef.current = null;
      return;
    }
    hoveredHexRef.current = closestHexByWorldDistance(
      validCoords,
      worldPos.x,
      worldPos.y,
      HEX_SIZE
    );
  }, []);

  const onLeave = useCallback(() => {
    hoveredHexRef.current = null;
  }, []);

  const onClick = useCallback((_mouseX: number, _mouseY: number) => {
    const game = getSnapshotRef.current();
    if (!game.inProgress()) return;
    const hex = hoveredHexRef.current;
    if (!hex) return;
    if (!game.isValidPlacement(hex)) return;
    const { game: nextGame } = game.placeTile(hex);
    setSnapshotRef.current(nextGame);
  }, []);

  const onRotateClockwise = useCallback(() => {
    const nextGame = getSnapshotRef.current().rotateQueuedTileClockwise();
    setSnapshotRef.current(nextGame);
  }, []);

  const onRotateCounterClockwise = useCallback(() => {
    const nextGame = getSnapshotRef.current().rotateQueuedTileCounterClockwise();
    setSnapshotRef.current(nextGame);
  }, []);

  const cameraPointerCallbacks = useMemo(
    (): UseCameraControlsCallbacks => ({
      onHover,
      onLeave,
      onClick,
      onRotateClockwise,
      onRotateCounterClockwise,
    }),
    [onClick, onHover, onLeave, onRotateClockwise, onRotateCounterClockwise]
  );

  return { cameraPointerCallbacks, screenToWorldRef };
}
