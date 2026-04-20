import { useRef, useCallback, useLayoutEffect } from 'react';
import type { Game } from '../../../models/Game';

export interface GameSnapshotBridge {
  /** Latest `Game` from a ref (rAF, pointer handlers, etc.—not tied to the last render). */
  getGameSnapshot: () => Game;
  /** Updates ref and calls `setActiveGame` so imperative code and React stay aligned. */
  setGameSnapshot: (newGame: Game) => void;
}

/**
 * Ref mirror of `activeGame`: imperative code sees the current snapshot immediately; `setGameSnapshot` keeps
 * context in sync for HUD/autosave. Prop changes (e.g. load game) copy in via `useLayoutEffect`.
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
