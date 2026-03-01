# Specification: Remove GameFactory (Issue #7)

## Problem Statement
The current `GameFactory` class creates an unnecessary layer of abstraction for `Game` initialization. It should be replaced with a more idiomatic static factory method pattern within the `Game` class itself.

## Requirements
- **Static Methods in `Game.ts`:**
  - `Game.create(rules: GameRules): Game`: Orchestrates the initialization of a `Board`, placing the initial tile, and creating the `Game` instance.
  - `Game.createStandard(): Game`: Shorthand for creating a game with `GameRules.createStandard()`.
- **Refactoring:**
  - Update `src/App.tsx` and all tests to use the new `Game.create...` methods.
  - Delete `src/models/GameFactory.ts` and `src/models/GameFactory.test.ts`.
- **Documentation:**
  - Update `src/models/ARCHITECTURE.md` to reflect the new factory pattern.

## Non-Functional Requirements
- **Zero Behavioral Change:** The game initialization logic (initial tile at origin, turn queue generation) must remain identical.
- **Verification:** Full suite passing (lint, tsc, test, e2e).
