import { useRef, useCallback, useLayoutEffect } from 'react';
import type { Game } from '../../../models/Game';

export interface GameSnapshotBridge {
  /** Always returns the latest immutable snapshot (ref), for imperative canvas code that outlives renders. */
  getGameSnapshot: () => Game;
  /** Updates ref synchronously and React context so canvas + UI stay aligned. */
  setGameSnapshot: (newGame: Game) => void;
}

/**
 * Bridge between React’s `activeGame` (context) and the imperative {@link CanvasController}:
 * stable `getGameSnapshot` / `setGameSnapshot` so the rAF render loop always sees the latest
 * immutable snapshot without waiting for React to commit, while `setGameSnapshot` still updates
 * context for the HUD and autosaver. Ref is synced from the `activeGame` prop via `useLayoutEffect`
 * when context updates (e.g. load game); controller-driven updates still use synchronous ref writes in `setGameSnapshot`.
 */
export function useGameSnapshotBridge(
  activeGame: Game,
  setActiveGame: (game: Game) => void
): GameSnapshotBridge {
  const gameRef = useRef(activeGame);

  useLayoutEffect(() => {
    gameRef.current = activeGame;
  }, [activeGame]);

  const setGameSnapshot = useCallback(
    (newGame: Game) => {
      gameRef.current = newGame;
      setActiveGame(newGame);
    },
    [setActiveGame]
  );

  const getGameSnapshot = useCallback(() => gameRef.current, []);

  return { getGameSnapshot, setGameSnapshot };
}
