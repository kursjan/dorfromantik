import { describe, it, expect } from 'vitest';
import { Board } from './Board';
import { Tile } from './Tile';
import { toTerrain } from './Terrain';
import { HexCoordinate } from './HexCoordinate';
import { north, northEast, southEast, south, southWest, northWest } from './Navigation';
describe('Board', () => {
  const coord = new HexCoordinate(0, 0, 0);
  it('should place a tile correctly', () => {
    // Arrange
    const originalBoard = new Board();
    const tile = new Tile({ id: 'test-tile' });

    // Act
    const board = originalBoard.withTile(tile, coord);

    // Assert
    expect(board.has(coord)).toBe(true);
    expect(board.get(coord)?.tile).toBe(tile);
    // Ensure original board is not mutated
    expect(originalBoard.has(coord)).toBe(false);
  });

  it('should throw an error when placing a tile on an occupied spot', () => {
    const tile = new Tile({ id: 'test-tile' });
    const board = Board.withTile(tile, coord);
    const placeOnOccupied = () => board.place(tile, coord);
    expect(placeOnOccupied).toThrowError(/occupied/);
  });

  it('should canPlace return true for empty spot', () => {
    const board = new Board();
    const result = board.canPlace(coord);
    expect(result).toBe(true);
  });

  it('should canPlace return false for occupied spot', () => {
    const tile = new Tile({ id: 'test-tile' });
    const board = Board.withTile(tile, coord);
    const result = board.canPlace(coord);
    expect(result).toBe(false);
  });

  it('should return all tiles', () => {
    // Arrange
    const tile1 = new Tile({ id: 'test-tile-1' });
    const tile2 = new Tile({ id: 'test-tile-2' });
    const coord2 = southWest(coord);
    const board = Board.withTile(tile1, coord).withTile(tile2, coord2);

    // Act
    const all = Array.from(board.getAll());

    // Assert
    expect(all.length).toBe(2);
    expect(all.some((t) => t.tile === tile1)).toBe(true);
    expect(all.some((t) => t.tile === tile2)).toBe(true);
  });

  it('should return existing neighbors correctly', () => {
    // Arrange
    const tile1 = new Tile({ id: 'origin-tile' });
    const tile2 = new Tile({ id: 'neighbor-tile' });
    const tile3 = new Tile({ id: 'far-tile' });
    const neighborCoord = north(coord);
    const nonNeighborCoord = north(north(coord));
    const board = new Board()
      .withTile(tile1, coord)
      .withTile(tile2, neighborCoord)
      .withTile(tile3, nonNeighborCoord);
    const placedTile = board.get(coord)!;

    // Act
    const neighbors = board.getExistingNeighbors(placedTile);

    // Assert
    expect(Object.keys(neighbors).length).toBe(1);
    expect(neighbors.north?.coordinate).toEqual(neighborCoord);
  });

  it('should return valid placement coordinates filtered by strict matching', () => {
    // Arrange
    const placedTile = new Tile({
      id: 'origin-tile',
      southEast: toTerrain('water'),
      southWest: toTerrain('rail'),
    });
    const board = Board.withTile(placedTile, coord);
    const freeTile = new Tile({ id: 'free-tile' });

    // Act
    const validCoords = board.getValidPlacementCoordinates(freeTile);

    // Assert
    expect(validCoords.length).toBe(4);
    expect(validCoords).toContainEqual(north(coord));
    expect(validCoords).toContainEqual(northEast(coord));
    expect(validCoords).toContainEqual(south(coord));
    expect(validCoords).toContainEqual(northWest(coord));
    expect(validCoords).not.toContainEqual(southEast(coord));
    expect(validCoords).not.toContainEqual(southWest(coord));
  });

  it('should include strict coordinates if the tile matches them', () => {
    // Arrange
    const placedTile = new Tile({
      id: 'origin-tile',
      southEast: toTerrain('water'),
      southWest: toTerrain('rail'),
    });
    const board = Board.withTile(placedTile, coord);
    const matchingTile = new Tile({
      id: 'matching-tile',
      northWest: toTerrain('water'),
      northEast: toTerrain('rail'),
    });

    // Act
    const validCoords = board.getValidPlacementCoordinates(matchingTile);

    // Assert
    expect(validCoords.length).toBe(6);
  });

  it('should return unique placement coordinates when multiple tiles are placed', () => {
    // Arrange
    const placedTile1 = new Tile({
      id: 'tile-1',
      southEast: toTerrain('water'),
      southWest: toTerrain('rail'),
    });
    const coord2 = southWest(coord);
    const placedTile2 = new Tile({
      id: 'tile-2',
      southEast: toTerrain('water'),
      southWest: toTerrain('rail'),
    });
    const board = Board.withTile(placedTile1, coord).withTile(placedTile2, coord2);
    const freeTile = new Tile({ id: 'free-tile' });

    // Act
    const validCoords = board.getValidPlacementCoordinates(freeTile);

    // Assert
    expect(validCoords.length).toBe(5);
  });
});
