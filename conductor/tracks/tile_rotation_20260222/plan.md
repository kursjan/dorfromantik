# Plan: Tile Rotation Logic (Issue #17)

## Research & Strategy
- **File Analysis:** We've analyzed `src/models/Tile.ts`, `src/models/Game.ts`, `src/canvas/engine/InputManager.ts`, and `src/canvas/engine/CanvasController.ts`.
- **Logic:** We'll implement a functional rotation that returns new `Tile` instances. The `Game` class will manage the replacement in the queue.
- **Input:** `InputManager` will normalize `keydown` and `mousedown` events into an `onRotate` callback.

## Tasks

- [x] **Task 1: Model Implementation**
  - Add `rotateClockwise(): Tile` and `rotateCounterClockwise(): Tile` to `src/models/Tile.ts`.
  - Add `rotateQueuedTileClockwise(): void` and `rotateQueuedTileCounterClockwise(): void` to `src/models/Game.ts`.
  - **Verification:**
    - Unit test for `Tile` rotation logic.
    - Unit test for `Game.rotateQueuedTile` behavior.

- [x] **Task 2: Input & Controller Integration**
  - Add `onRotateClockwise()` and `onRotateCounterClockwise()` to `InputCallbacks` in `src/canvas/engine/InputManager.ts`.
  - Handle `R`, `F`, and right-click combinations in `InputManager`.
  - Implement `handleRotateClockwise` and `handleRotateCounterClockwise` in `src/canvas/engine/CanvasController.ts`.
  - **Verification:**
    - `npm run test` for all unit tests.
    - Manual verification of rotation and preview in the browser.

- [x] **Task 3: Final Verification & Sync**
  - Run full test suite (`npm test`, `npx playwright test`).
  - Update `ARCHITECTURE.md` if necessary.
  - Final commit with `fixes #<issue_number>`.
