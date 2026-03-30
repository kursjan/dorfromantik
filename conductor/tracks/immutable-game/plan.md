# Track: Immutable Game Model (#65)

Refactor `Board` and `Game` models to be immutable to align with React state management patterns.

## Phase 1: Immutable Board

- [x] Ensure we are on working branch `worker1` using **task-conductor** skill.
- [x] Refactor `Board.ts` to use `ReadonlyMap` and return new instances from `place()` and `clear()` using **task-conductor** skill.
- [x] Update `Board.test.ts` to accommodate the new immutable signatures using **task-conductor** skill.
- [x] **Phase Gate**: Verify Board unit tests and sync state using **project-orchestrator** skill.

## Phase 2: Immutable Game

- [x] Refactor `Game.ts` properties to be `readonly` and update action methods to return new `Game` instances using **task-conductor** skill.
- [ ] Update `Game.test.ts` to verify immutable state transitions using **task-conductor** skill.
- [ ] **Phase Gate**: Verify Game unit tests and sync state using **project-orchestrator** skill.

## Phase 3: Integration & Test Suite Cleanup

- [ ] Update `GameSerializer.ts` and its tests to handle immutable reconstruction using **task-conductor** skill.
- [ ] Update `CanvasController.ts` to manage the mutable reference to the immutable `activeGame` using **task-conductor** skill.
- [ ] Update remaining test files (`PlacementValidator.test.ts`, `GameScorer.test.ts`, `BoardNavigation.test.ts`, `src/printers/*.test.ts`) using **task-conductor** skill.
- [ ] **Phase Gate**: Run full CI verification (`npm run test:ci`) and sync state using **project-orchestrator** skill.

## Phase 4: Adversarial Review

- [ ] Perform a rigorous file-by-file review of all changes in this branch against `main` using **quick-review** skill.
- [ ] Address any feedback from `REVIEW_FEEDBACK.md` using **task-conductor** skill.
- [ ] **Final Track Gate**: Final verification and Git commit using **project-orchestrator** skill.
