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

## Phase 3: Adversarial Review Fixes (Decouple activeGame)
- [x] Perform a file-by-file adversarial review of the changes against `main` using **quick-review** skill.
- [x] Refactor `SessionContextType` in `src/context/SessionContext.ts` to separate `user`, `games`, and `activeGame` using **task-conductor** skill.
- [x] Update `SessionProvider` in `src/context/SessionProvider.tsx` to use granular state hooks using **task-conductor** skill.
- [x] Update consuming components (`MainMenu.tsx`, `GameBoard.tsx`, `SettingsModal.tsx`) to match new context structure using **task-conductor** skill.
- [x] Fix tests (`SessionProvider.test.tsx`, `GameBoard.test.tsx`) and stories to align with the new Context shape using **task-conductor** skill.
- [x] Add `subscribeToGames` to `IFirestoreService` and implement in `InMemoryFirestoreService` and `FirebaseFirestoreService` using **task-conductor** skill.
- [x] Update `SessionProvider` to use `subscribeToGames` instead of `loadAllGames` to enable real-time history sync using **task-conductor** skill.
- [x] Remove complex lightweight integration test in favor of E2E using **task-conductor** skill.
- [x] Create `e2e/history-sync.spec.ts` and optimize `SAVE_DEBOUNCE_MS` for testing using **task-conductor** skill.
- [x] Perform another file-by-file adversarial review of the changes against `main` using **quick-review** skill.
## Phase 4: Rework & Architecture Fixes
- [x] Add unit tests for `src/pages/MainMenu.tsx` to achieve 100% coverage on the new orchestration logic using **task-conductor** skill.
- [x] Fix state bleed in `src/services/firestore/InMemoryFirestoreService.ts` by removing global variables and correcting the file header comment using **task-conductor** skill.
- [x] Fix inconsistent method binding in `CanvasController.ts` using **task-conductor** skill.
- [x] Fix React hook ordering in `src/pages/MainMenu.tsx` and `src/canvas/components/CanvasView.tsx` using **task-conductor** skill.
- [x] Remove the unused `Session` model (`src/models/Session.ts` and its test) to prevent architectural confusion using **task-conductor** skill.
- [x] Decouple `SessionProvider` state to prevent unnecessary re-renders (e.g., separate `UserProvider` / `GameHistoryProvider` from active game state) using **task-conductor** skill.
- [x] Perform a file-by-file adversarial review of the rework changes against `main` using **quick-review** skill.
- [x] Address all issues identified in `REVIEW_FEEDBACK.md` using **task-conductor** skill.
- [x] **Phase Gate**: Verify all unit, E2E, UI tests, and coverage using **project-orchestrator** skill.
- [x] **Final Track Gate**: Final verification, docs sync, and Git commit using **project-orchestrator** skill.
