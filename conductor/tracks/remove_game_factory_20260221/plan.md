# Implementation Plan: Remove GameFactory (Issue #7)

## Phase 1: Game Factory Method Implementation

- [x] Task: #7.1: Implement `Game.create(rules: GameRules)` and `Game.createStandard()` in `src/models/Game.ts`. (refs #7)
- [x] Task: #7.2: Update `src/App.tsx` and all callers to use the new `Game.createStandard()` factory method. (refs #7)
- [x] Task: #7.3: Create/Update `src/models/Game.test.ts` to include tests for the new factory methods. (refs #7)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Factory Migration' (Protocol in workflow.md)

## Phase 2: Cleanup & Documentation

- [x] Task: #7.4: Remove `src/models/GameFactory.ts` and `src/models/GameFactory.test.ts`. (refs #7)
- [x] Task: #7.5: Update `src/models/ARCHITECTURE.md` to reflect the static factory method pattern in `Game.ts`. (refs #7)
- [x] Task: Ensure all commit messages for this track reference Issue #7 and use `fixes #7` in the final commit.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Cleanup' (Protocol in workflow.md)
