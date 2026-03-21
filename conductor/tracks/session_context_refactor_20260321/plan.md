# Track: Session Context Lean Refactor

## Phase 1: Context & Provider Lean-out
- [x] Ensure we are on branch `worker1` and synchronized with `main` using **task-conductor** skill.
- [x] Update `src/context/SessionContext.ts` to replace game initialization methods with a generic `setActiveGame(game: Game)` using **task-conductor** skill.
- [x] Update `src/context/SessionProvider.tsx` to implement `setActiveGame` and remove legacy orchestration logic using **task-conductor** skill.
- [ ] **Phase Gate**: Verify architecture and test coverage using **project-orchestrator** skill.

## Phase 2: Migration & Implementation
- [x] Update `src/pages/MainMenu.tsx` to handle game orchestration (instantiating `GameRules`, calling `Game.create`, and invoking `setActiveGame`) using **task-conductor** skill.
- [x] Update tests in `SessionProvider.test.tsx` and `GameBoard.test.tsx` to align with the new `setActiveGame` interface using **task-conductor** skill.
- [x] Update `SettingsModal.stories.tsx` to provide the updated mock context using **task-conductor** skill.
- [x] **Phase Gate**: Verify all unit, E2E, and UI tests pass using **project-orchestrator** skill. [checkpoint: b7a0e51]

## Phase 3: Adversarial Review
- [x] Perform a file-by-file adversarial review of the changes against `main` using **quick-review** skill.
- [ ] Address any architectural or consistency issues found in `REVIEW_FEEDBACK.md` using **task-conductor** skill.
- [ ] **Final Track Gate**: Final verification and Git commit using **project-orchestrator** skill.
