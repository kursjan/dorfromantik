# Implementation Plan: InputManager Refactor (State Machine)

## Phase 1: State Machine Setup

- [ ] Task: #7.1: Define `InputState` union and add a `private state: InputState = 'IDLE'` to `InputManager.ts`.
- [ ] Task: #7.2: Create a `private transition(newState: InputState)` helper to centralize cursor changes (e.g., setting `grab` vs `grabbing`).

## Phase 2: Refactoring Event Handlers

- [ ] Task: #7.3: Rewrite `handleMouseDown` to transition to `MOUSE_DOWN_POTENTIAL_CLICK`.
- [ ] Task: #7.4: Refactor `handleMouseMove` to switch between `IDLE`, `MOUSE_DOWN_POTENTIAL_CLICK`, and `PANNING`.
- [ ] Task: #7.5: Consolidate `handleMouseUp` and `handleMouseLeave` to use the same logic for cleanup and `onClick` triggering.

## Phase 3: Verification & Polish

- [ ] Task: Update `ARCHITECTURE.md` to reflect the new state machine approach for InputManager.
- [ ] Task: Verify that all tests in `InputManager.test.ts` pass without any changes to the test file itself.
- [ ] Task: Conductor - User Manual Verification (Protocol in workflow.md)
