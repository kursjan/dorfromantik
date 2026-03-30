# Track: Immutable Game Model (#65)

Refactor `Board` and `Game` models to be immutable to align with React state management patterns.

## Phase 1: Immutable Board [DONE]

- [x] Ensure we are on working branch `worker1` using **task-conductor** skill.
- [x] Refactor `Board.ts` to use `ReadonlyMap` and return new instances from `place()` and `clear()` using **task-conductor** skill.
- [x] Update `Board.test.ts` to accommodate the new immutable signatures using **task-conductor** skill.
- [x] **Phase Gate**: Verify Board unit tests and sync state using **project-orchestrator** skill.

## Phase 2: Immutable Game [DONE]

- [x] Refactor `Game.ts` properties to be `readonly` and update action methods to return new `Game` instances using **task-conductor** skill.
- [x] Update `Game.test.ts` to verify immutable state transitions using **task-conductor** skill.
- [x] **Phase Gate**: Verify Game unit tests and sync state using **project-orchestrator** skill.

## Phase 3: Integration & Test Suite Cleanup [DONE]

- [x] Update `GameSerializer.ts` and its tests to handle immutable reconstruction using **task-conductor** skill.
- [x] Update `CanvasController.ts` to manage the mutable reference to the immutable `activeGame` using **task-conductor** skill.
- [x] Update remaining test files (`PlacementValidator.test.ts`, `GameScorer.test.ts`, `BoardNavigation.test.ts`, `src/printers/*.test.ts`) using **task-conductor** skill.
- [x] **Phase Gate**: Run full CI verification (`npm run test:ci`) and sync state using **project-orchestrator** skill.

## Phase 4: Canvas game snapshot API (single source of truth) [DONE]

Replace mirrored `Game` state and dual callbacks (`onStatsChange` + `onActiveGameChange`) with **`getGameSnapshot` + `setGameSnapshot`** (bridge to context’s `setActiveGame`): React owns the canonical snapshot; the controller reads via a getter (backed by a ref updated synchronously when setting the snapshot so the rAF loop never lags a frame).

- [x] Refactor `CanvasController.ts` to take `getGameSnapshot` and `setGameSnapshot` in constructor options; remove `this.activeGame`, `onStatsChange`, and `onActiveGameChange`; use the getter for all reads; after place/rotate call `setGameSnapshot(next)` only using **task-conductor** skill.
- [x] Refactor `CanvasView.tsx`: keep a ref to the latest `Game`; bridge `setActiveGame` from context so the ref updates **synchronously** with each new snapshot; derive HUD from `activeGame` (remove `onStatsChange` wiring); keep controller lifecycle keyed by `activeGame.id` using **task-conductor** skill.
- [x] Update `CanvasController.test.ts` and `CanvasView.test.ts` for the new constructor API and assertions using **task-conductor** skill.
- [x] Update `src/canvas/ARCHITECTURE.md` (and this track’s `spec.md` if the “bridge” wording should match) for the snapshot API using **task-conductor** skill.
- [x] **Phase Gate**: Run `npm run test:unit`, `npm run test:ci`, and `npm run test:e2e:ci`, then checkpoint using **project-orchestrator** skill.

## Phase 5: Adversarial Review

- [ ] Perform a rigorous file-by-file review of all changes in this branch against `main` using **quick-review** skill.
- [ ] Address any feedback from `REVIEW_FEEDBACK.md` using **task-conductor** skill.
- [ ] **Final Track Gate**: Final verification and Git commit using **project-orchestrator** skill.
