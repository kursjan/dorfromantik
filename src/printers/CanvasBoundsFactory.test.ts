import { describe, it, expect } from 'vitest';
import {
  UninitializedCanvasBoundsFactory,
  InitializedCanvasBoundsFactory,
} from './CanvasBoundsFactory';
import { Board } from '../models/Board';
import { Tile } from '../models/Tile';
import { HexCoordinate } from '../models/HexCoordinate';

describe('CanvasBoundsFactory', () => {
  describe('UninitializedCanvasBoundsFactory', () => {
    it('should return zero bounds from getCanvasBounds', () => {
      const factory = new UninitializedCanvasBoundsFactory();
      const bounds = factory.getCanvasBounds();
      expect(bounds.topLeft).toEqual({ x: 0, y: 0 });
      expect(bounds.bottomRight).toEqual({ x: 0, y: 0 });
    });

    it('stretch() should return an InitializedCanvasBoundsFactory with the bounds of the first tile', () => {
      const factory = new UninitializedCanvasBoundsFactory();
      const board = new Board();
      const tile = new Tile({ id: 'test' });
      const coord = new HexCoordinate(5, -10, 5);
      board.place(tile, coord);
      const boardTile = board.get(coord)!;

      const newFactory = factory.stretch(boardTile);
      expect(newFactory).toBeInstanceOf(InitializedCanvasBoundsFactory);

      const bounds = newFactory.getCanvasBounds();

      expect(bounds.topLeft).toEqual({ x: -70, y: 0 });
      expect(bounds.bottomRight).toEqual({ x: -62, y: 4 });
    });
  });

  describe('InitializedCanvasBoundsFactory', () => {
    it('should return the bounds it was initialized with', () => {
      const initialBounds = {
        topLeft: { x: -10, y: -10 },
        bottomRight: { x: 10, y: 10 },
      };
      const factory = new InitializedCanvasBoundsFactory(initialBounds);
      const bounds = factory.getCanvasBounds();
      expect(bounds).toEqual(initialBounds);
    });

    it('stretch() should expand the bounds to include a new tile', () => {
      const initialBounds = {
        topLeft: { x: 0, y: 0 },
        bottomRight: { x: 8, y: 4 },
      };
      const factory = new InitializedCanvasBoundsFactory(initialBounds);

      const board = new Board();
      const tile = new Tile({ id: 'test' });
      const coord = new HexCoordinate(1, 0, -1); // Placed to the south-east of the initial bounds
      board.place(tile, coord);
      const boardTile = board.get(coord)!;

      const newFactory = factory.stretch(boardTile);
      const newBounds = newFactory.getCanvasBounds();

      expect(newBounds.topLeft.x).toBe(0);
      expect(newBounds.topLeft.y).toBe(0);
      expect(newBounds.bottomRight.x).toBe(8);
      expect(newBounds.bottomRight.y).toBe(8);
    });

    it('stretch() should expand the bounds correctly for a tile in negative coordinates', () => {
      const initialBounds = {
        topLeft: { x: 0, y: 0 },
        bottomRight: { x: 8, y: 4 },
      };
      const factory = new InitializedCanvasBoundsFactory(initialBounds);

      const board = new Board();
      const tile = new Tile({ id: 'test' });
      const coord = new HexCoordinate(-1, 0, 1); // Placed to the north-west of the initial bounds
      board.place(tile, coord);
      const boardTile = board.get(coord)!;

      const newFactory = factory.stretch(boardTile);
      const newBounds = newFactory.getCanvasBounds();

      expect(newBounds.topLeft.x).toBe(0);
      expect(newBounds.topLeft.y).toBe(-4);
      expect(newBounds.bottomRight.x).toBe(8);
      expect(newBounds.bottomRight.y).toBe(4);
    });
  });
});
