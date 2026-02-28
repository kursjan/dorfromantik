# Plan: Refactor src/models

This plan executes the refactoring tasks identified in `REVIEW_FEEDBACK.md`.

## Phase 1: Core Utilities Refactor
- [x] Create and switch to feature branch `refactor/models` using **task-conductor** skill.
- [x] Refactor `HexCoordinate.ts` to clarify that helper `fromAxial` is not preferred, perhaps update Architecture.md to reflect this as well. Using **task-conductor** skill.
- [x] Convert `Navigation.ts` to a fully static utility class and update all consumers using **task-conductor** skill.
- [x] Refactor `Tile.ts` to rename `TileProps` to `TileOptions` and improve `print()` using **task-conductor** skill.
- [ ] **Phase Gate**: Verify core utilities and update tests using **project-orchestrator** skill.

## Phase 2: Game Logic Cleanup
- [x] Clarify `Board.ts` `getExistingNeighbors` that it intentionally accepts `BoardTile` using **task-conductor** skill.
- [x] Clean up `GameRules.ts` constructor and fix ID generation in `TileGenerator` implementations using **task-conductor** skill.
- [x] Optimize `GameScorer.ts` to use static `Navigation` using **task-conductor** skill.
- [x] **Phase Gate**: Verify game logic with unit tests using **project-orchestrator** skill.

## Phase 3: State Management & Integration
- [x] Refactor `Game.ts` to use safe ID generation and remove redundant factory methods using **task-conductor** skill.
- [x] Clarify `Session.ts` mutability (remove `readonly` from `games` array) using **task-conductor** skill.
      - User input: YES, games is meant to be mutable, in sense new tiles are added/removed. I don't know what is the right way to express it in TS.
- [x] **Final Track Gate**: Run full test suite and commit changes using **project-orchestrator** skill.
