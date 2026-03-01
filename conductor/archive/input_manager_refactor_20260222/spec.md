# Track Specification: InputManager Refactor (State Machine)

## Context
The current `InputManager` uses multiple boolean flags (`isMouseDown`, `isPanning`) to manage interaction states. This results in nested if-else blocks in `handleMouseMove`, `handleMouseUp`, and `handleMouseLeave`, making the logic difficult to follow and maintain.

## Objective
Refactor the `InputManager` to use an explicit **State Machine** pattern. This will:
1.  **Centralize State Logic:** All transitions and side effects (like cursor changes) will happen in a controlled manner.
2.  **Eliminate Nested Ifs:** Event handlers will become flatter and more readable.
3.  **Prepare for Future Features:** Adding Right Click (Rotate) or Touch Support will be much cleaner.

## Proposed States
- `IDLE`: No mouse buttons are pressed.
- `MOUSE_DOWN_POTENTIAL_CLICK`: The left mouse button is down, but the mouse hasn't moved beyond the `DRAG_THRESHOLD`.
- `PANNING`: The mouse has moved beyond the `DRAG_THRESHOLD`, and we are actively panning the camera.

## Refactor Strategy
1.  **Define `InputState` enum/union:** Represent the possible states.
2.  **Add `transition(newState)` method:** Centralize side effects like `canvas.style.cursor`.
3.  **Rewrite Event Handlers:** Each handler will `switch` on the current state and perform only the relevant actions.
4.  **Preserve Public API:** `InputCallbacks` and the `getRotationDirection()` method should remain unchanged.
5.  **Verify with Tests:** The existing `InputManager.test.ts` should pass with zero changes.
