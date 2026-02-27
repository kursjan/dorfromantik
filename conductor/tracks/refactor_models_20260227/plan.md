# Plan: Refactor src/models

This plan executes the refactoring tasks identified in `REVIEW_FEEDBACK.md`.

## Phase 1: Core Utilities Refactor
- [ ] Create and switch to feature branch `refactor/models` using **task-conductor** skill.
- [ ] Refactor `HexCoordinate.ts` to add `fromAxial` static helper using **task-conductor** skill.
- [ ] Convert `Navigation.ts` to a fully static utility class and update all consumers using **task-conductor** skill.
- [ ] Refactor `Tile.ts` to rename `TileProps` to `TileOptions` and improve `print()` using **task-conductor** skill.
- [ ] **Phase Gate**: Verify core utilities and update tests using **project-orchestrator** skill.

## Phase 2: Game Logic Cleanup
- [ ] Refactor `Board.ts` so `getExistingNeighbors` accepts `HexCoordinate` using **task-conductor** skill.
- [ ] Clean up `GameRules.ts` constructor and fix ID generation in `TileGenerator` implementations using **task-conductor** skill.
- [ ] Optimize `GameScorer.ts` to use static `Navigation` and avoid redundant neighbor lookups using **task-conductor** skill.
- [ ] **Phase Gate**: Verify game logic with unit tests using **project-orchestrator** skill.

## Phase 3: State Management & Integration
- [ ] Refactor `Game.ts` to use safe ID generation and remove redundant factory methods using **task-conductor** skill.
- [ ] Clarify `Session.ts` mutability (remove `readonly` from `games` array) using **task-conductor** skill.
- [ ] **Final Track Gate**: Run full test suite and commit changes using **project-orchestrator** skill.
