# Specification: CanvasController Test Coverage

## Goal
Increase the unit test coverage of `src/canvas/engine/CanvasController.ts` to >90% (currently ~61%). The focus is on verifying its internal state management, input handling (hover, click, rotate, zoom), and state synchronization callbacks to React, reducing the need for E2E tests to verify these core interactions.

## Scope
1.  **Input Handling:** Write unit tests simulating callbacks from `InputManager` to verify correct behavior for zooming, hovering, rotating, and clicking.
2.  **State Synchronization:** Verify that `onStatsChange` is fired correctly when the game state changes (e.g., after a valid tile placement or rotation).
3.  **Camera Logic:** Ensure `handleZoom` correctly calls `camera.zoomBy` with the appropriate math and bounds.
4.  **Error Handling:** Ensure invalid placements are ignored and do not trigger state changes.

## Out of Scope
*   Modifying the actual rendering logic of the graphics renderers (HexRenderer, TileRenderer).
*   Adding new features to the CanvasController.
*   Writing tests for `SessionContext` or other files (handled in a separate track).

## Technical Requirements
*   **Testing Framework:** Vitest.
*   **Mocking:** Use `vi.fn()` and `vi.spyOn()` to mock the `CanvasRenderingContext2D`, `Camera`, and `InputManager`. Avoid any actual DOM rendering.
*   **Validation:** Use `npm run test:coverage -- src/canvas/engine/CanvasController.ts` to verify the coverage target is met.