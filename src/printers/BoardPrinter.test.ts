import { describe, it, expect } from 'vitest';
import { Board } from '../models/Board';
import { Tile } from '../models/Tile';
import { HexCoordinate } from '../models/HexCoordinate';
import { BoardPrinter } from './BoardPrinter';

describe('BoardPrinter', () => {
  describe('print', () => {
    it('should print an empty board as an empty string', () => {
      const board = new Board();
      const printer = new BoardPrinter();
      expect(printer.print(board)).toBe('');
    });

    it('should print a single tile correctly', () => {
      const board = new Board();
      const tile = new Tile({
        id: 'test',
        north: 'tree',
        northEast: 'house',
        southEast: 'water',
        south: 'pasture',
        southWest: 'rail',
        northWest: 'field',
      });
      const coord = new HexCoordinate(0, 0, 0);
      board.place(tile, coord);

      const printer = new BoardPrinter();
      const output = printer.print(board);

      const expected = String.raw`   _ _   
 /  T  \ 
/F     H\
\R     W/
 \ _P_ / `;

      expect(output).toBe(expected);
    });

    it('should print a single tile at far positive coordinates correctly', () => {
      const board = new Board();
      const tile = new Tile({
        id: 'test',
        north: 'tree',
        northEast: 'house',
        southEast: 'water',
        south: 'pasture',
        southWest: 'rail',
        northWest: 'field',
      });
      const coord = new HexCoordinate(10, 10, -20);
      board.place(tile, coord);

      const printer = new BoardPrinter();
      const output = printer.print(board);

      const expected = String.raw`   _ _   
 /  T  \ 
/F     H\
\R     W/
 \ _P_ / `;

      expect(output).toBe(expected);
    });

    it('should print a single tile at far negative coordinates correctly', () => {
      const board = new Board();
      const tile = new Tile({
        id: 'test',
        north: 'tree',
        northEast: 'house',
        southEast: 'water',
        south: 'pasture',
        southWest: 'rail',
        northWest: 'field',
      });
      const coord = new HexCoordinate(-10, -10, 20);
      board.place(tile, coord);

      const printer = new BoardPrinter();
      const output = printer.print(board);

      const expected = String.raw`   _ _   
 /  T  \ 
/F     H\
\R     W/
 \ _P_ / `;

      expect(output).toBe(expected);
    });

    it('should print two tiles vertically (South neighbor)', () => {
      const board = new Board();
      const tile1 = new Tile({
        id: 't1',
        north: 'tree',
        northEast: 'house',
        southEast: 'water',
        south: 'pasture',
        southWest: 'rail',
        northWest: 'field',
      });
      const tile2 = new Tile({
        id: 't2',
        north: 'field',
        northEast: 'pasture',
        southEast: 'water',
        south: 'field',
        southWest: 'water',
        northWest: 'house',
      });

      board.place(tile1, new HexCoordinate(0, 0, 0));
      board.place(tile2, new HexCoordinate(1, 0, -1));

      const printer = new BoardPrinter();
      const output = printer.print(board);

      const expected = String.raw`   _ _   
 /  T  \ 
/F     H\
\R     W/
 \ _P_ / 
 /  F  \ 
/H     P\
\W     W/
 \ _F_ / `;

      expect(output).toBe(expected);
    });

    it('should print two tiles diagonally (SouthEast neighbor)', () => {
      const board = new Board();
      const tile1 = new Tile({
        id: 't1',
        north: 'tree',
        northEast: 'house',
        southEast: 'water',
        south: 'pasture',
        southWest: 'rail',
        northWest: 'field',
      });
      const tile2 = new Tile({
        id: 't2',
        north: 'field',
        northEast: 'pasture',
        southEast: 'water',
        south: 'field',
        southWest: 'water',
        northWest: 'house',
      });

      board.place(tile1, new HexCoordinate(0, 0, 0));
      board.place(tile2, new HexCoordinate(0, 1, -1));

      const printer = new BoardPrinter();
      const output = printer.print(board);

      // Line length must be 16.
      // Spaces must exactly match what Canvas outputs.
      const expected = String.raw`   _ _          
 /  T  \        
/F     H\ _ _   
\R     W/  F  \ 
 \ _P_ /H     P\
       \W     W/
        \ _F_ / `;

      expect(output).toBe(expected);
    });

    it('should print a tile in negative coordinates correctly', () => {
      const board = new Board();
      const tile = new Tile({
        id: 'test',
        north: 'tree',
        northEast: 'house',
        southEast: 'water',
        south: 'pasture',
        southWest: 'rail',
        northWest: 'field',
      });
      const coord = new HexCoordinate(-1, -1, 2);
      board.place(tile, coord);

      const printer = new BoardPrinter();
      const output = printer.print(board);

      const expected = String.raw`   _ _   
 /  T  \ 
/F     H\
\R     W/
 \ _P_ / `;

      expect(output).toBe(expected);
    });
  });
});
