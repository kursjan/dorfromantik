# Plan: Strict Placement Validator

Update the placement validator to enforce that "strict" terrains (Water, Rail, WaterOrPasture) can only be placed next to compatible edges. This logic will be hardcoded in the validator to avoid modifying the Terrain models.

## Changes

### 1. `src/models/PlacementValidator.ts`

- Update `isValidPlacement` signature to require a tile: `isValidPlacement(board: Board, coordinate: HexCoordinate, tile: Tile): boolean`.
- Add a helper `isStrict(terrain: Terrain)` which returns true if `terrain.id` is `'water'`, `'rail'`, or `'waterOrPasture'`.
- Iterate through existing neighbors. If either `myEdge` or `neighborEdge` `isStrict()`, enforce that `myEdge.matchesForEdge(neighborEdge)` must be true. If it is false, return false.

### 2. `src/models/Board.ts`

- Update `getValidPlacementCoordinates(tile: Tile): HexCoordinate[]` to accept a `Tile`.
- Pass the `tile` down through `getValidNeighborsOf(boardTile: BoardTile, tile: Tile)` into `isValidPlacement(this, neighborCoord, tile)`.

### 3. `src/models/GameHints.ts`

- Update `computeValidPlacements()` to pass `this.currentTile` to `this.board.getValidPlacementCoordinates(this.currentTile)`.

### 4. `src/models/Game.ts`

- Update `isValidPlacement(coord: HexCoordinate)`:
  ```typescript
  const tile = this.peek();
  if (!tile) return false;
  return isValidPlacement(this.board, coord, tile);
  ```

### 5. Update Tests

- **`src/models/PlacementValidator.test.ts`**: Update existing calls to pass `tile`. Add test cases ensuring water vs field fails, but water vs water succeeds.
- **`src/models/Board.test.ts`**: Update `getValidPlacementCoordinates` tests to pass a mock/test tile.
- **`src/models/Game.test.ts`**: Verify `game.isValidPlacement` fails for incompatible strict placements.

## Verification

- Run typecheck: `npm run typecheck`
- Run unit tests: `npm run test:unit`
- Manually open the game and attempt to place a water tile next to a non-water tile. It should show an invalid preview and block the placement.
