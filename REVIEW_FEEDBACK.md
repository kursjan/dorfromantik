# Review Feedback - src/models Audit

## Phase 1: Board.ts

- [ ] **Cleanup:** `BoardTile.id` comment `// "q,r,s"` is redundant if `coordinate` is present, but harmless.
  - **Reason:** Minor cleanup.
  - **Location:** `src/models/Board.ts`

## Phase 2: Game.ts

- [ ] **Cleanup:** Remove `Game.createStandard()` which duplicates `GameRules.createStandard()`.
  - **Reason:** `Game.create(GameRules.createStandard())` is sufficient and clearer.
  - **Location:** `src/models/Game.ts`

- [ ] **Refactor:** `generateInitialQueue` uses a simple loop and string concatenation for IDs.
  - **Reason:** It would be cleaner to delegate ID generation to the `TileGenerator` entirely, or ensure uniqueness more robustly.
  - **Location:** `src/models/Game.ts`

## Phase 3: GameRules.ts

- [ ] **Refactor:** `GameRules` constructor has many `if` checks.
  - **Reason:** Could be cleaner with a validation method, but low priority.
  - **Location:** `src/models/GameRules.ts`

- [ ] **Cleanup:** `GameRules.create` is marked `@deprecated` but used in `Game.test.ts`.
  - **Reason:** Should update tests to use the constructor or standard creation methods.
  - **Location:** `src/models/GameRules.ts`

- [ ] **Fix:** `PastureTileGenerator` generates IDs with `start-tile`. It should be randomized.
  - **Reason:** Potential for collision if PastureTile is used for queue generation.
  - **Location:** `src/models/GameRules.ts`

## Phase 4: Navigation.ts

- [ ] **Refactor:** Mix of static and instance methods.
  - **Reason:** `Navigation` class usage is slightly inconsistent. Make it fully static.
  - **Location:** `src/models/Navigation.ts`

## Phase 5: HexCoordinate.ts

- [ ] **Refactor:** Constructor requires 3 arguments `(q, r, s)`.
  - **Reason:** A helper `HexCoordinate.fromAxial(q, r)` would be convenient and reduce verbosity.
  - **Location:** `src/models/HexCoordinate.ts`


## Phase 6: GameScorer.ts

- [ ] **Refactor:** `GameScorer` instantiates its own `Navigation`. Once Naviation is static, it should not be problem any more.
  - **Reason:** Should ideally share the same instance as `Game` or accept it in constructor for consistency.
  - **Location:** `src/models/GameScorer.ts`

## Phase 7: Session.ts

- [ ] **Refactor:** `this.games` is mutable but marked `readonly`.
  - **Reason:** `readonly` only protects the reference. Consider if mutation is intended (it seems so).
  - **Location:** `src/models/Session.ts`

## Phase 8: Tile.ts

- [ ] **Cleanup:** `print()` uses `console.log`.
  - **Reason:** Should return a string.
  - **Location:** `src/models/Tile.ts`

- [ ] **Refactor:** Rename `TileProps` to `TileOptions`.
  - **Reason:** Consistency with `GameRulesOptions` and project standards (models use Options, React components use Props).
  - **Location:** `src/models/Tile.ts`

## Phase 9: User.ts

- [ ] **No Issues:** `User.ts` is simple and correct.