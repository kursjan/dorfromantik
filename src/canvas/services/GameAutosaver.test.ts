import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { IFirestoreService } from '../../services/firestore/IFirestoreService';
import type { Game } from '../../models/Game';
import { GameAutosaver } from './GameAutosaver';

describe('GameAutosaver', () => {
  let firestoreService: IFirestoreService;
  let saveGameStateSpy: ReturnType<typeof vi.fn>;
  let getUserId: () => string;
  let getActiveGame: () => Game | undefined;
  let autosaver: GameAutosaver;
  let onSaveStartSpy: ReturnType<typeof vi.fn>;
  let onSaveSuccessSpy: ReturnType<typeof vi.fn>;
  let onSaveErrorSpy: ReturnType<typeof vi.fn>;
  const previousGame = {
    id: 'game-1',
    board: { v: 1 },
    score: 0,
    remainingTurns: 10,
  } as unknown as Game;
  const nextGame = {
    id: 'game-1',
    board: { v: 2 },
    score: 10,
    remainingTurns: 9,
  } as unknown as Game;

  beforeEach(() => {
    vi.useFakeTimers();

    saveGameStateSpy = vi.fn().mockResolvedValue(undefined);

    firestoreService = {
      // Only the method used by GameAutosaver needs to be defined for this test.
      saveGameState: saveGameStateSpy,
    } as unknown as IFirestoreService;

    getUserId = () => 'user-1';
    getActiveGame = vi.fn(() => ({ id: 'game-1' }) as unknown as Game);
    onSaveStartSpy = vi.fn();
    onSaveSuccessSpy = vi.fn();
    onSaveErrorSpy = vi.fn();

    autosaver = new GameAutosaver({
      firestoreService,
      getUserId,
      getActiveGame,
      debounceMs: 2000,
      onSaveStart: onSaveStartSpy as any,
      onSaveSuccess: onSaveSuccessSpy as any,
      onSaveError: onSaveErrorSpy as any,
    });
  });

  afterEach(() => {
    autosaver.dispose();
    vi.useRealTimers();
  });

  it('saves once after debounce when a tile is placed', async () => {
    autosaver.handleGameChanged(previousGame, nextGame);

    // Move time forward past the debounce delay
    vi.advanceTimersByTime(2000);

    expect(saveGameStateSpy).toHaveBeenCalledTimes(1);
    expect(saveGameStateSpy).toHaveBeenCalledWith('user-1', expect.any(Object));
  });

  it('debounces rapid meaningful transitions into a single save', () => {
    autosaver.handleGameChanged(previousGame, nextGame);
    vi.advanceTimersByTime(1000);
    autosaver.handleGameChanged(previousGame, nextGame);
    vi.advanceTimersByTime(1000);
    autosaver.handleGameChanged(previousGame, nextGame);

    // Total advanced so far: 2000ms; last call scheduled at t=2000.
    // Advance one more debounce window from the last call.
    vi.advanceTimersByTime(2000);

    expect(saveGameStateSpy).toHaveBeenCalledTimes(1);
  });

  it('does not cancel pending save when transition is non-meaningful', () => {
    autosaver.handleGameChanged(previousGame, nextGame);
    vi.advanceTimersByTime(1000);

    const equivalentGame = {
      ...nextGame,
      board: nextGame.board,
      score: nextGame.score,
      remainingTurns: nextGame.remainingTurns,
    } as unknown as Game;

    // Non-meaningful transition should not clear/restart the active debounce timer.
    autosaver.handleGameChanged(nextGame, equivalentGame);

    vi.advanceTimersByTime(1000);
    expect(saveGameStateSpy).toHaveBeenCalledTimes(1);
  });

  it('does not save when there is no active game at fire time', () => {
    // First call uses a game
    autosaver.handleGameChanged(previousGame, nextGame);

    // Update provider to simulate game ending before timer fires
    getActiveGame = () => undefined;
    // @ts-expect-error - overriding for test; autosaver captures the function reference
    autosaver['getActiveGame'] = getActiveGame;

    vi.advanceTimersByTime(2000);

    expect(saveGameStateSpy).not.toHaveBeenCalled();
  });

  it('cancels pending save on dispose', () => {
    autosaver.handleGameChanged(previousGame, nextGame);

    autosaver.dispose();

    vi.advanceTimersByTime(2000);

    expect(saveGameStateSpy).not.toHaveBeenCalled();
  });

  it('invokes callbacks on successful save', async () => {
    autosaver.handleGameChanged(previousGame, nextGame);
    await vi.advanceTimersByTimeAsync(2000);

    expect(onSaveStartSpy).toHaveBeenCalledTimes(1);
    expect(onSaveSuccessSpy).toHaveBeenCalledTimes(1);
    expect(onSaveErrorSpy).not.toHaveBeenCalled();
  });

  it('invokes error callback on failed save', async () => {
    const error = new Error('Save failed');
    saveGameStateSpy.mockRejectedValueOnce(error);

    autosaver.handleGameChanged(previousGame, nextGame);
    await vi.advanceTimersByTimeAsync(2000);

    expect(onSaveStartSpy).toHaveBeenCalledTimes(1);
    expect(onSaveSuccessSpy).not.toHaveBeenCalled();
    expect(onSaveErrorSpy).toHaveBeenCalledTimes(1);
    expect(onSaveErrorSpy).toHaveBeenCalledWith(error);
  });

  it('triggers onSaveError if save hangs for more than 5 seconds', async () => {
    // Mock saveGameState to return a promise that never resolves
    saveGameStateSpy.mockReturnValueOnce(new Promise(() => {}));

    autosaver.handleGameChanged(previousGame, nextGame);

    // Advance past the 2-second debounce to start the save
    await vi.advanceTimersByTimeAsync(2000);
    expect(onSaveStartSpy).toHaveBeenCalledTimes(1);
    expect(onSaveErrorSpy).not.toHaveBeenCalled();

    // Advance 4.9 seconds into the save (total 6.9s)
    await vi.advanceTimersByTimeAsync(4900);
    expect(onSaveErrorSpy).not.toHaveBeenCalled();

    // Advance past the 5-second timeout (total 7s+)
    await vi.advanceTimersByTimeAsync(100);

    expect(onSaveSuccessSpy).not.toHaveBeenCalled();
    expect(onSaveErrorSpy).toHaveBeenCalledTimes(1);
    expect(onSaveErrorSpy).toHaveBeenCalledWith(expect.any(Error));
    expect(onSaveErrorSpy.mock.calls[0][0].message).toMatch(/Save timeout/i);
  });

  it('recovers and calls onSaveSuccess when a hung save eventually succeeds', async () => {
    let resolveSave: () => void;
    const hangingPromise = new Promise<void>((resolve) => {
      resolveSave = resolve;
    });
    saveGameStateSpy.mockReturnValueOnce(hangingPromise);

    autosaver.handleGameChanged(previousGame, nextGame);

    // Advance past the 2-second debounce to start the save
    await vi.advanceTimersByTimeAsync(2000);
    expect(onSaveStartSpy).toHaveBeenCalledTimes(1);

    // Advance past the 5-second timeout
    await vi.advanceTimersByTimeAsync(5000);
    expect(onSaveErrorSpy).toHaveBeenCalledTimes(1);

    // Now simulate the network returning and the save succeeding
    resolveSave!();
    // allow microtasks to resolve
    await vi.advanceTimersByTimeAsync(100);

    // The UI should be notified that the save finally succeeded
    expect(onSaveSuccessSpy).toHaveBeenCalledTimes(1);
  });

  it('forces save and clears timer on forceSaveAndDispose', () => {
    autosaver.handleGameChanged(previousGame, nextGame);

    // Do not advance timers; call forceSaveAndDispose directly
    autosaver.forceSaveAndDispose();

    expect(saveGameStateSpy).toHaveBeenCalledTimes(1);

    // Timer should be cleared so moving time forward shouldn't trigger another save
    vi.advanceTimersByTime(2000);
    expect(saveGameStateSpy).toHaveBeenCalledTimes(1);
  });

  it('does not save on forceSaveAndDispose if no timer is pending', () => {
    autosaver.forceSaveAndDispose();
    expect(saveGameStateSpy).not.toHaveBeenCalled();
  });

  it('does not schedule save when games are the same reference', () => {
    autosaver.handleGameChanged(previousGame, previousGame);
    vi.advanceTimersByTime(2000);
    expect(saveGameStateSpy).not.toHaveBeenCalled();
  });

  it('does not schedule save when game id changes', () => {
    const differentGame = { ...nextGame, id: 'game-2' } as unknown as Game;
    autosaver.handleGameChanged(previousGame, differentGame);
    vi.advanceTimersByTime(2000);
    expect(saveGameStateSpy).not.toHaveBeenCalled();
  });

  it('does not schedule save for rotation-only transition', () => {
    const rotationOnlyGame = {
      ...previousGame,
      tileQueue: [{ id: 'rotated' }],
      score: previousGame.score,
      remainingTurns: previousGame.remainingTurns,
      board: previousGame.board,
    } as unknown as Game;

    autosaver.handleGameChanged(previousGame, rotationOnlyGame);
    vi.advanceTimersByTime(2000);
    expect(saveGameStateSpy).not.toHaveBeenCalled();
  });
});
