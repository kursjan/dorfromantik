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

  beforeEach(() => {
    vi.useFakeTimers();

    saveGameStateSpy = vi.fn().mockResolvedValue(undefined);

    firestoreService = {
      // Only the method used by GameAutosaver needs to be defined for this test.
      saveGameState: saveGameStateSpy,
    } as unknown as IFirestoreService;

    getUserId = () => 'user-1';
    getActiveGame = vi.fn(() => ({ id: 'game-1' } as unknown as Game));

    autosaver = new GameAutosaver({
      firestoreService,
      getUserId,
      getActiveGame,
      debounceMs: 2000,
    });
  });

  afterEach(() => {
    autosaver.dispose();
    vi.useRealTimers();
  });

  it('saves once after debounce when a tile is placed', async () => {
    autosaver.handleTilePlaced();

    // Move time forward past the debounce delay
    vi.advanceTimersByTime(2000);

    expect(saveGameStateSpy).toHaveBeenCalledTimes(1);
    expect(saveGameStateSpy).toHaveBeenCalledWith('user-1', expect.any(Object));
  });

  it('debounces multiple tile placements into a single save', () => {
    autosaver.handleTilePlaced();
    vi.advanceTimersByTime(1000);
    autosaver.handleTilePlaced();
    vi.advanceTimersByTime(1000);
    autosaver.handleTilePlaced();

    // Total advanced so far: 2000ms; last call scheduled at t=2000.
    // Advance one more debounce window from the last call.
    vi.advanceTimersByTime(2000);

    expect(saveGameStateSpy).toHaveBeenCalledTimes(1);
  });

  it('does not save when there is no active game at fire time', () => {
    // First call uses a game
    autosaver.handleTilePlaced();

    // Update provider to simulate game ending before timer fires
    getActiveGame = () => undefined;
    // @ts-expect-error - overriding for test; autosaver captures the function reference
    autosaver['getActiveGame'] = getActiveGame;

    vi.advanceTimersByTime(2000);

    expect(saveGameStateSpy).not.toHaveBeenCalled();
  });

  it('cancels pending save on dispose', () => {
    autosaver.handleTilePlaced();

    autosaver.dispose();

    vi.advanceTimersByTime(2000);

    expect(saveGameStateSpy).not.toHaveBeenCalled();
  });
});

