# Track: Magnetic Snapping

## Objective
Implement "magnetic snapping" for the ghost tile preview in Dorfromantik. Instead of rendering the ghost tile only when the exact hex under the mouse is valid, the game will find the closest valid placement spot to the mouse's continuous world position and snap the ghost tile there.

## Issue Link
Fixes #59

## Phase 1: Domain Logic & Mathematics [checkpoint: ad6c887ed2b2138132f4407c0d9e7a2737225c15]
- [x] Switch to feature branch `worker1` using **task-conductor** skill.
- [x] Add `getValidPlacementCoordinates()` method to `Board.ts` that returns all empty coordinates adjacent to at least one placed tile, and write unit tests for it in `Board.test.ts` using **task-conductor** skill.
- [x] Add `distanceToHexCenter(hex: HexCoordinate, worldX: number, worldY: number, hexSize: number): number` utility to `HexUtils.ts` and write unit tests in `HexUtils.test.ts` using **task-conductor** skill.
- [x] **Phase Gate**: Verify all unit tests for the domain logic pass using **project-orchestrator** skill.

## Phase 2: Controller Integration & Validation
- [x] Refactor `CanvasController.ts` `handleHover` method:
    - Get all valid placement coordinates from the `Board`.
    - Find the coordinate with the minimum `distanceToHexCenter` from the mouse's world position.
    - Set that closest coordinate as `hoveredHex`.
- [x] Update `CanvasController.test.ts` to assert the new "nearest valid" hovering behavior using **task-conductor** skill.
- [ ] **Phase Gate**: Run E2E tests and perform visual verification of the snapping behavior in the browser using **project-orchestrator** skill.

## Phase 3: Adversarial Review
- [ ] Perform a rigorous file-by-file review of all changes in this branch against `main` using **quick-review** skill.
- [ ] Address any feedback from `REVIEW_FEEDBACK.md` using **task-conductor** skill.
- [ ] **Final Track Gate**: Final verification and Git commit using **project-orchestrator** skill.