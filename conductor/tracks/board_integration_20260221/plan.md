# Implementation Plan: Board Integration & Basic Tile Rendering

## Phase 1: Data Binding & React HUD [checkpoint: 9179454]

- [x] Task: #4.1: Update `CanvasController` constructor to accept and store a `Session` instance. (dc633d8)
- [x] Task: #4.2: Create a `GameHUD` React component (`src/canvas/components/GameHUD.tsx`) to display score and remaining turns. (dc633d8)
- [x] Task: #4.3: Add `GameHUD.stories.tsx` to verify the HUD's visual representation for various game states. (dc633d8)
- [x] Task: #4.4: Integrate `GameHUD` as an overlay in `CanvasView.tsx`. (9179454)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Data Binding & HUD' (Protocol in workflow.md) (9179454)

## Phase 2: Canvas Tile Visualization [checkpoint: 8af7c96]

- [x] Task: #4.5: Add `TerrainStyles` (colors for each `TerrainType`) to `src/canvas/graphics/HexStyles.ts`. (7b604f1)
- [x] Task: #4.6: Implement `TileRenderer.ts` in `src/canvas/graphics/` to draw 6-sided terrains. (c94bf21)
- [x] Task: #4.7: Update `CanvasController.render()` to iterate through the `Board` and render all placed tiles. (ac1202b)
- [x] Task: Conductor - User Manual Verification 'Phase 2: Canvas Tile Visualization' (Protocol in workflow.md) (8af7c96)

## Phase 3: Interaction & Preview [checkpoint: 228a948]

- [x] Task: #4.8: Implement `isValidPlacement(coord)` in `CanvasController` (check empty and adjacent). (228a948)
- [x] Task: #4.9: Implement "Ghost Preview" in `CanvasController` render loop for the hovered valid hex. (228a948)
- [x] Task: #4.10: Connect `InputManager` click events to `game.placeTile(coord)` and verify HUD/Board updates. (228a948)

## Phase 3.1: Interaction Polish

- [ ] Task: #4.11: Refactor `InputManager` to use a distance-based threshold (e.g., 5px) before initiating `onPan`.
- [ ] Task: #4.12: Ensure `onClick` triggers correctly on `mouseup` if the drag threshold was never exceeded.
- [ ] Task: Conductor - User Manual Verification 'Phase 3.1: Interaction Polish' (Protocol in workflow.md)

## Phase 4: Polish & Verification

- [ ] Task: Update `ARCHITECTURE.md` to reflect the Session/HUD/TileRenderer patterns.
- [ ] Task: Ensure all commit messages for this track include "fixes #4" or reference Issue #4.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Polish & Verification' (Protocol in workflow.md)
