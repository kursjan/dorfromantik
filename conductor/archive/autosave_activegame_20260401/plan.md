# Track: Autosave from activeGame transitions (#69)

Refactor autosave triggering in `GameBoard` so persistence is derived from canonical `activeGame` state transitions instead of imperative canvas callbacks.

## Phase 1: Planning and branch setup

- [x] Create and switch to feature branch `worker1` using **task-conductor** skill.
- [x] Validate issue scope and acceptance criteria against `#69` using **task-conductor** skill.
- [x] **Phase Gate**: Confirm planning readiness and sync state using **project-orchestrator** skill.

## Phase 2: State-driven autosave trigger

- [x] Remove autosave coupling to canvas `onTilePlaced` callback path (`CanvasView`/`GameBoard`) using **task-conductor** skill.
- [x] Implement `GameBoard` transition-based trigger using existing `activeGameRef` and a domain helper (e.g. `didGameplayStateChange`) using **task-conductor** skill.
- [x] Preserve autosaver stability semantics (`getActiveGame` ref access and unmount flush behavior) using **task-conductor** skill.
- [x] **Phase Gate**: Run `npm run typecheck` and `npm run test:unit`, then checkpoint using **project-orchestrator** skill.

## Phase 3: Tests and behavior verification

- [x] Add/update `GameBoard` autosave transition tests (meaningful transition triggers save, non-meaningful transition does not) using **task-conductor** skill.
- [x] Add/update regression tests for rapid transitions/debounce and unmount flush using **task-conductor** skill.
- [x] Decide and codify rotation-only behavior in tests/docs (default: no autosave on rotation-only changes) using **task-conductor** skill.
- [x] **Phase Gate**: Run `npm run test:ci` and `npm run test:e2e:ci`, then checkpoint using **project-orchestrator** skill.

## Phase 4: Adversarial review and handoff

- [x] Perform a rigorous file-by-file review of all changes in this branch against `main` using **quick-review** skill.
- [x] Address any feedback from `REVIEW_FEEDBACK.md` using **task-conductor** skill.
- [x] **Final Track Gate**: Final verification, PR readiness, and handoff using **project-orchestrator** skill.
