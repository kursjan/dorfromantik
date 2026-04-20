import { useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { useGameSnapshotBridge, type GameSnapshotBridge } from './useGameSnapshotBridge';
import { Game } from '../../../models/Game';
import { Board } from '../../../models/Board';
import { GameRules } from '../../../models/GameRules';
import { Tile } from '../../../models/Tile';

function makeGame(score: number): Game {
  return new Game({
    board: new Board(),
    rules: new GameRules(),
    tileQueue: [new Tile()],
    score,
  });
}

function HookHarness(props: {
  activeGame: Game;
  setActiveGame: (game: Game) => void;
  onBridge: (bridge: GameSnapshotBridge) => void;
}) {
  const { activeGame, setActiveGame, onBridge } = props;
  const bridge = useGameSnapshotBridge(activeGame, setActiveGame);

  useEffect(() => {
    onBridge(bridge);
  }, [bridge, onBridge]);

  return null;
}

describe('useGameSnapshotBridge', () => {
  it('syncs getGameSnapshot with prop updates', () => {
    const setActiveGame = vi.fn();
    const onBridge = vi.fn();
    const gameA = makeGame(10);
    const gameB = makeGame(20);

    const { rerender } = render(
      <HookHarness activeGame={gameA} setActiveGame={setActiveGame} onBridge={onBridge} />
    );

    const bridgeAfterFirstRender = onBridge.mock.lastCall?.[0] as GameSnapshotBridge;
    expect(bridgeAfterFirstRender.getGameSnapshot()).toBe(gameA);

    rerender(<HookHarness activeGame={gameB} setActiveGame={setActiveGame} onBridge={onBridge} />);

    const bridgeAfterSecondRender = onBridge.mock.lastCall?.[0] as GameSnapshotBridge;
    expect(bridgeAfterSecondRender.getGameSnapshot()).toBe(gameB);
  });

  it('setGameSnapshot updates ref immediately and calls setActiveGame', () => {
    const setActiveGame = vi.fn();
    const onBridge = vi.fn();
    const gameA = makeGame(5);
    const gameB = makeGame(15);

    render(<HookHarness activeGame={gameA} setActiveGame={setActiveGame} onBridge={onBridge} />);

    const bridge = onBridge.mock.lastCall?.[0] as GameSnapshotBridge;
    bridge.setGameSnapshot(gameB);

    expect(bridge.getGameSnapshot()).toBe(gameB);
    expect(setActiveGame).toHaveBeenCalledTimes(1);
    expect(setActiveGame).toHaveBeenCalledWith(gameB);
  });
});
