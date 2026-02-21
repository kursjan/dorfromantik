# Implementation Plan: Board Integration & Basic Tile Rendering

## Phase 1: Data Binding & React HUD

- [ ] Task: #4.1: Update `CanvasController` constructor to accept and store a `Session` instance.
- [ ] Task: #4.2: Create a `GameHUD` React component (`src/canvas/components/GameHUD.tsx`) to display score and remaining turns.
- [ ] Task: #4.3: Add `GameHUD.stories.tsx` to verify the HUD's visual representation for various game states.
- [ ] Task: #4.4: Integrate `GameHUD` as an overlay in `CanvasView.tsx`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Data Binding & HUD' (Protocol in workflow.md)

## Phase 2: Canvas Tile Visualization

- [ ] Task: #4.5: Add `TerrainStyles` (colors for each `TerrainType`) to `src/canvas/graphics/HexStyles.ts`.
- [ ] Task: #4.6: Implement `TileRenderer.ts` in `src/canvas/graphics/` to draw 6-sided terrains.
- [ ] Task: #4.7: Update `CanvasController.render()` to iterate through the `Board` and render all placed tiles.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Canvas Tile Visualization' (Protocol in workflow.md)

## Phase 3: Interaction & Preview

- [ ] Task: #4.8: Implement `isValidPlacement(coord)` in `CanvasController` (check empty and adjacent).
- [ ] Task: #4.9: Implement "Ghost Preview" in `CanvasController` render loop for the hovered valid hex.
- [ ] Task: #4.10: Connect `InputManager` click events to `game.placeTile(coord)` and verify HUD/Board updates.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Interaction & Preview' (Protocol in workflow.md)

## Phase 4: Polish & Verification

- [ ] Task: Update `ARCHITECTURE.md` to reflect the Session/HUD/TileRenderer patterns.
- [ ] Task: Ensure all commit messages for this track include "fixes #4" or reference Issue #4.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Polish & Verification' (Protocol in workflow.md)
