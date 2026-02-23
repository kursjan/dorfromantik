# Plan: Refactor Game Scoring Logic

## Tasks

- [ ] **Task 1: Create GameScorer Class**
  - Create `src/models/GameScorer.ts`.
  - Move `isPerfect` logic from `Game` to `GameScorer`.
  - Implement `scorePlacement` method in `GameScorer`.
  - Add unit tests in `src/models/GameScorer.test.ts`.

- [ ] **Task 2: Integrate GameScorer into Game**
  - Update `Game` to use `GameScorer`.
  - Remove `isPerfect` and scoring logic from `Game`.
  - Ensure `Game.test.ts` passes without modification (or minimal updates if internal methods were tested).

- [ ] **Task 3: Final Verification**
  - Run all tests.
  - Update `conductor/tracks.md`.
