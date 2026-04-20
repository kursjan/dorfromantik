import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import type { Game } from '../../../models/Game';
import type { HexCoordinate } from '../../../models/HexCoordinate';
import type { ContainerPoint } from '../../common/ContainerPoint';
import { closestHexByWorldDistance } from '../../common/hex/HexUtils';
import { HEX_SIZE } from '../../common/hex/hexLayout';
import type {
  ContainerToWorldFn,
  SvgBoardPointerCameraCallbacks,
} from './useSvgBoardPointerCamera';

/**
 * Pointer-driven game actions for the SVG board (hover → valid hex, click → place, rotate queue).
 * Keeps {@link SvgGameView} as layout + composition; all snapshot reads/writes go through the bridge refs.
 */
export function useSvgBoardInteraction(
  getGameSnapshot: () => Game,
  setGameSnapshot: (game: Game) => void
): {
  cameraPointerCallbacks: SvgBoardPointerCameraCallbacks;
} {
  const getSnapshotRef = useRef(getGameSnapshot);
  const setSnapshotRef = useRef(setGameSnapshot);
  useLayoutEffect(() => {
    getSnapshotRef.current = getGameSnapshot;
    setSnapshotRef.current = setGameSnapshot;
  }, [getGameSnapshot, setGameSnapshot]);

  const hoveredHexRef = useRef<HexCoordinate | null>(null);

  const onHover = useCallback((point: ContainerPoint, containerToWorld: ContainerToWorldFn) => {
    const worldPos = containerToWorld(point);
    const validCoords = getSnapshotRef.current().hints.validPlacements;
    if (validCoords.length === 0) {
      hoveredHexRef.current = null;
      return;
    }
    hoveredHexRef.current = closestHexByWorldDistance(validCoords, worldPos, HEX_SIZE);
  }, []);

  const onLeave = useCallback(() => {
    hoveredHexRef.current = null;
  }, []);

  const onClick = useCallback((_point: ContainerPoint) => {
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
    () =>
      ({
        onHover,
        onLeave,
        onClick,
        onRotateClockwise,
        onRotateCounterClockwise,
      }) satisfies SvgBoardPointerCameraCallbacks,
    [onClick, onHover, onLeave, onRotateClockwise, onRotateCounterClockwise]
  );

  return { cameraPointerCallbacks };
}
