import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameHints } from './GameHints';
import { Board } from './Board';
import { HexCoordinate } from './HexCoordinate';

describe('GameHints', () => {
  let board: Board;
  let gameHints: GameHints;

  beforeEach(() => {
    board = new Board();
    gameHints = new GameHints(board);
  });

  it('computes validPlacements on first access and caches the result', () => {
    const mockValidPlacements = [new HexCoordinate(1, 0, -1)];
    const spy = vi.spyOn(board, 'getValidPlacementCoordinates').mockReturnValue(mockValidPlacements);

    // First access - should compute
    const firstResult = gameHints.validPlacements;
    expect(spy).toHaveBeenCalledTimes(1);
    expect(firstResult).toBe(mockValidPlacements);

    // Second access - should return cached value
    const secondResult = gameHints.validPlacements;
    expect(spy).toHaveBeenCalledTimes(1); // Still 1
    expect(secondResult).toBe(mockValidPlacements);
  });

  it('recomputes validPlacements after invalidation', () => {
    const mockValidPlacements1 = [new HexCoordinate(1, 0, -1)];
    const mockValidPlacements2 = [new HexCoordinate(2, -1, -1)];
    
    const spy = vi.spyOn(board, 'getValidPlacementCoordinates');
    spy.mockReturnValueOnce(mockValidPlacements1);
    spy.mockReturnValueOnce(mockValidPlacements2);

    // First access
    expect(gameHints.validPlacements).toBe(mockValidPlacements1);
    expect(spy).toHaveBeenCalledTimes(1);

    // Invalidate
    gameHints.invalidate();

    // Second access
    expect(gameHints.validPlacements).toBe(mockValidPlacements2);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('invalidates cache when updateState is called', () => {
    const mockValidPlacements1 = [new HexCoordinate(1, 0, -1)];
    const mockValidPlacements2 = [new HexCoordinate(2, -1, -1)];
    
    const spy = vi.spyOn(board, 'getValidPlacementCoordinates');
    spy.mockReturnValueOnce(mockValidPlacements1);
    spy.mockReturnValueOnce(mockValidPlacements2);

    // First access
    expect(gameHints.validPlacements).toBe(mockValidPlacements1);
    
    // Update state
    gameHints.updateState(board);

    // Second access
    expect(gameHints.validPlacements).toBe(mockValidPlacements2);
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
