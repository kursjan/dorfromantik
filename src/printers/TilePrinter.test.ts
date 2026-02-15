import { describe, it, expect } from 'vitest';
import { TilePrinter } from './TilePrinter';
import { Canvas } from './Canvas';
import { Tile } from '../models/Tile';

describe('TilePrinter', () => {
  it('should print a tile correctly onto the canvas', () => {
    const canvas = new Canvas(0, 0, 8, 4);
    const tile = new Tile({
      id: 'test',
      north: 'tree',
      northEast: 'house',
      southEast: 'water',
      south: 'pasture',
      southWest: 'rail',
      northWest: 'field',
    });

    const printer = new TilePrinter(canvas);
    printer.print(tile, 0, 0);

    const expected = String.raw`   _ _   
 /  T  \ 
/F     H\
\R     W/
 \ _P_ / `;

    expect(canvas.toString()).toBe(expected);
  });

  it('should print two tiles touching at the SE corner', () => {
    const canvas = new Canvas(0, 0, 15, 6);
    const tile1 = new Tile({
      id: 'test1',
      north: 'tree',
      northEast: 'house',
      southEast: 'water',
      south: 'pasture',
      southWest: 'rail',
      northWest: 'field',
    });
    const tile2 = new Tile({
      id: 'test2',
      north: 'field',
      northEast: 'pasture',
      southEast: 'water',
      south: 'field',
      southWest: 'water',
      northWest: 'house',
    });

    const printer = new TilePrinter(canvas);
    printer.print(tile1, 0, 0);
    printer.print(tile2, 7, 2);

    const expected = String.raw`   _ _          
 /  T  \        
/F     H\ _ _   
\R     W/  F  \ 
 \ _P_ /H     P\
       \W     W/
        \ _F_ / `;

    expect(canvas.toString()).toBe(expected);
  });

  it('should print two tiles vertically, sharing the N/S edge', () => {
    const canvas = new Canvas(0, 0, 8, 8);
    const tile1 = new Tile({ 
      id: 'tile1',
      north: 'tree',
      northEast: 'house',
      southEast: 'water',
      south: 'pasture',
      southWest: 'rail',
      northWest: 'field',
    });
    const tile2 = new Tile({
      id: 'tile2',
      north: 'tree',
      northEast: 'house',
      southEast: 'water',
      south: 'pasture',
      southWest: 'rail',
      northWest: 'field',
    });

    const printer = new TilePrinter(canvas);
    printer.print(tile1, 0, 0);
    printer.print(tile2, 0, 4);

    const expected = String.raw`   _ _   
 /  T  \ 
/F     H\
\R     W/
 \ _P_ / 
 /  T  \ 
/F     H\
\R     W/
 \ _P_ / `;

    expect(canvas.toString()).toBe(expected);
  });

  it('should print three tiles in a triangular formation', () => {
    const canvas = new Canvas(0, 0, 15, 8);
    const tile1 = new Tile({
      id: 'tile1',
      north: 'tree',
      northEast: 'house',
      southEast: 'water',
      south: 'pasture',
      southWest: 'rail',
      northWest: 'field',
    });
    const tile2 = new Tile({
      id: 'tile2',
      north: 'field',
      northEast: 'pasture',
      southEast: 'water',
      south: 'field',
      southWest: 'water',
      northWest: 'house',
    });
    const tile3 = new Tile({
      id: 'tile3',
      north: 'water',
      northEast: 'rail',
      southEast: 'field',
      south: 'tree',
      southWest: 'house',
      northWest: 'pasture',
    });

    const printer = new TilePrinter(canvas);
    printer.print(tile1, 0, 0);
    printer.print(tile2, 0, 4);
    printer.print(tile3, 7, 2);

    const expected = String.raw`   _ _          
 /  T  \        
/F     H\ _ _   
\R     W/  W  \ 
 \ _P_ /P     R\
 /  F  \H     F/
/H     P\ _T_ / 
\W     W/       
 \ _F_ /        `;
    
    expect(canvas.toString()).toBe(expected);
  });

  it('should print three tiles in a western triangular formation', () => {
    const canvas = new Canvas(-7, 0, 8, 8);
    const tile1 = new Tile({
      id: 'tile1',
      north: 'tree', northEast: 'house', southEast: 'water',
      south: 'pasture', southWest: 'rail', northWest: 'field',
    });
    const tile2 = new Tile({
      id: 'tile2',
      north: 'field', northEast: 'pasture', southEast: 'water',
      south: 'field', southWest: 'water', northWest: 'house',
    });
    const tile3 = new Tile({
      id: 'tile3',
      north: 'water', northEast: 'rail', southEast: 'field',
      south: 'tree', southWest: 'house', northWest: 'pasture',
    });

    const printer = new TilePrinter(canvas);
    printer.print(tile1, 0, 0);
    printer.print(tile2, 0, 4);
    printer.print(tile3, -7, 2);

    const expected = String.raw`          _ _   
        /  T  \ 
   _ _ /F     H\
 /  W  \R     W/
/P     R\ _P_ / 
\H     F/  F  \ 
 \ _T_ /H     P\
       \W     W/
        \ _F_ / `;
    
    expect(canvas.toString()).toBe(expected);
  });
});
