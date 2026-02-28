# Specification: Refactor src/models

## Context
This track implements the findings from the "Thorough Review of src/models" track (Issue #36). The review identified several areas for improvement, including code cleanup, ID generation safety, and architectural consistency.

## Objectives
- **Robust ID Generation:** Eliminate the use of `Date.now()` in tight loops for Tile and Game generation to prevent ID collisions.
- **API Consistency:** Ensure methods like `Board.getExistingNeighbors` accept `HexCoordinate` for broader utility.
- **Architectural Cleanup:** Remove redundant factory methods and clarify mutability in models.
- **Performance:** Optimize `GameScorer` to avoid redundant neighbor lookups.
- **Static Utilities:** Convert `Navigation` to a fully static utility class.

## Changes Required

### 1. Board.ts
- **`getExistingNeighbors`:** Change signature to accept `HexCoordinate` instead of `BoardTile`.
- **Cleanup:** Remove redundant comments.

### 2. Game.ts
- **Cleanup:** Remove `Game.createStandard()` (use `GameRules.createStandard` instead).
- **ID Generation:** Refactor `placeTile` (bonus tiles) and `generateInitialQueue` to use a collision-safe ID generation strategy (e.g., from `TileGenerator` or a dedicated util).

### 3. GameRules.ts
- **Validation:** Clean up constructor validation logic.
- **Deprecation:** Remove or fix `@deprecated` `create` method and update consumers.
- **Tile Generators:** Update `RandomTileGenerator` and `PastureTileGenerator` to use robust unique IDs (e.g., UUID or high-resolution counter + random).

### 4. GameScorer.ts
- **Navigation:** Use the static `Navigation` class instead of instantiating it.
- **Optimization:** In `scorePlacement`, pass the already-known neighbors to `isPerfect` (or refactor `isPerfect` to accept them) to avoid re-querying the board.

### 5. HexCoordinate.ts
- **Factory:** Add `static fromAxial(q, r)` helper.

### 6. Navigation.ts
- **Static:** Convert all instance methods to static methods. Remove instantiation usage across the codebase.

### 7. Session.ts
- **Mutability:** Clarify `games` property mutability (remove `readonly` or keep as is if reference immutability is the only goal).

### 8. Tile.ts
- **Naming:** Rename `TileProps` to `TileOptions`.
- **Cleanup:** Update `print()` to return a string instead of logging.
- **ID Generation:** Fix default ID generation in constructor.

## Verification Plan
- **Unit Tests:** All existing tests in `src/models/*.test.ts` must pass.
- **Refactor Safety:** Ensure no regressions in `Game` logic or `Board` interactions.
- **Type Check:** `npm run typecheck` must pass.
