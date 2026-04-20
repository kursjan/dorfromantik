import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSvgBoardInteraction } from './useSvgBoardInteraction';
import { Game } from '../../../models/Game';
import { Board } from '../../../models/Board';
import { GameRules } from '../../../models/GameRules';
import { Tile } from '../../../models/Tile';

describe('useSvgBoardInteraction', () => {
  it('onRotateClockwise calls setGameSnapshot with rotated queue', () => {
    let game = new Game({
      board: new Board(),
      rules: new GameRules(),
      tileQueue: [new Tile(), new Tile()],
      score: 0,
    });
    const getGameSnapshot = () => game;
    const setGameSnapshot = vi.fn((next: Game) => {
      game = next;
    });

    const { result } = renderHook(() => useSvgBoardInteraction(getGameSnapshot, setGameSnapshot));

    const gameBeforeRotate = game;
    act(() => {
      result.current.cameraPointerCallbacks.onRotateClockwise();
    });

    expect(setGameSnapshot).toHaveBeenCalledTimes(1);
    const nextGame = setGameSnapshot.mock.calls[0][0];
    expect(nextGame).not.toBe(gameBeforeRotate);
  });
});
