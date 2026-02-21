# Implementation Plan: Expand Data Model (Session & Game)

## Phase 1: Foundation Models (Independent) [checkpoint: 8582288]

- [x] Task: #5.1: Define `User` Model Contract and write tests in `src/models/User.test.ts`. 47692b1
- [x] Task: #5.2: Define `GameRules` Model Contract and write tests in `src/models/GameRules.test.ts`. 22f056c
- [x] Task: Conductor - User Manual Verification 'Phase 1: Foundation Models' (Protocol in workflow.md)

## Phase 2: Core Game Logic [checkpoint: 511a7d0]

- [x] Task: #5.3: Define `Game` Model Contract (board, score, turns, tileQueue) and write tests in `src/models/Game.test.ts`. d284640
- [x] Task: #5.4: Implement `placeTile` & Scoring Logic (neighbor matching, score/turns update) and verify with integration tests. 028942f
- [x] Task: Conductor - User Manual Verification 'Phase 2: Core Game Logic' (Protocol in workflow.md)

## Phase 3: Session & Persistence Foundation [checkpoint: fe75f0f]

- [x] Task: #5.5: Define `Session` Model Contract (user, game history, active game) and write tests in `src/models/Session.test.ts`. f89154f
- [x] Task: Verify that `Session` can correctly transition games from active to history. f89154f
- [x] Task: Conductor - User Manual Verification 'Phase 3: Session & Persistence Foundation' (Protocol in workflow.md)

## Phase 4: Code Review & Refinement

- [x] Task: #5.6: Perform a comprehensive code review of the newly implemented models (`User`, `GameRules`, `Game`, `Session`). ebca26e
- [x] Task: Present review findings and architectural suggestions to the user. ebca26e
- [x] Task: Verify models with a "Full Game Session" integration test. ebca26e
- [ ] Task: Implement approved refinements and refactorings.
- [x] Task: #5.7: Centralize terrain logic in `Tile.ts` and use `Tile.createRandom` in `Game.ts`. 0b71d8d
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Code Review & Refinement' (Protocol in workflow.md)
