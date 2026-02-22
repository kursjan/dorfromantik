# Implementation Plan: InputManager Refactor (State Machine) [checkpoint: 1f4b4bc]

## Phase 1: State Machine Setup

- [x] Task: #7.1: Define `InputState` union and add a `private state: InputState = 'IDLE'` to `InputManager.ts`. (1f4b4bc)
- [x] Task: #7.2: Create a `private transition(newState: InputState)` helper to centralize cursor changes (e.g., setting `grab` vs `grabbing`). (1f4b4bc)

## Phase 2: Refactoring Event Handlers

- [x] Task: #7.3: Rewrite `handleMouseDown` to transition to `MOUSE_DOWN_POTENTIAL_CLICK`. (1f4b4bc)
- [x] Task: #7.4: Refactor `handleMouseMove` to switch between `IDLE`, `MOUSE_DOWN_POTENTIAL_CLICK`, and `PANNING`. (1f4b4bc)
- [x] Task: #7.5: Consolidate `handleMouseUp` and `handleMouseLeave` to use the same logic for cleanup and `onClick` triggering. (1f4b4bc)

## Phase 3: Verification & Polish

- [x] Task: Update `ARCHITECTURE.md` to reflect the new state machine approach for InputManager. (1f4b4bc)
- [x] Task: Verify that all tests in `InputManager.test.ts` pass without any changes to the test file itself. (1f4b4bc)
- [x] Task: Conductor - User Manual Verification (Protocol in workflow.md) (1f4b4bc)
