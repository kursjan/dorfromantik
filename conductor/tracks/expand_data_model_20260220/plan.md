# Implementation Plan: Expand Data Model (Session & Game)

## Phase 1: Foundation Models (Independent)

- [ ] Task: #5.1: Define `User` Model Contract and write tests in `src/models/User.test.ts`.
- [ ] Task: #5.2: Define `GameRules` Model Contract and write tests in `src/models/GameRules.test.ts`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Foundation Models' (Protocol in workflow.md)

## Phase 2: Core Game Logic

- [ ] Task: #5.3: Define `Game` Model Contract (board, score, turns, tileQueue) and write tests in `src/models/Game.test.ts`.
- [ ] Task: #5.4: Implement `placeTile` & Scoring Logic (neighbor matching, score/turns update) and verify with integration tests.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Core Game Logic' (Protocol in workflow.md)

## Phase 3: Session & Persistence Foundation

- [ ] Task: #5.5: Define `Session` Model Contract (user, game history, active game) and write tests in `src/models/Session.test.ts`.
- [ ] Task: Verify that `Session` can correctly transition games from active to history.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Session & Persistence Foundation' (Protocol in workflow.md)
