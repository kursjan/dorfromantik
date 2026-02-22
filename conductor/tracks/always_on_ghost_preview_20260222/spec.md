# Specification: Always-on Ghost Preview (#18)

## Goal
To improve the user experience during tile placement by ensuring the "next tile" (in-hand) is always visible on the hex grid while hovering, regardless of whether the current position is a valid placement or not.

## Context
Currently, the `CanvasController` only renders the ghost preview if `isValidPlacement(this.hoveredHex)` is true. This leads to a "flashing" or disappearing tile effect that feels unresponsive to players.

## Requirements

### Visual Behavior
1. **Always Snapped:** The ghost tile should always follow the mouse, snapped to the nearest hex coordinate.
2. **Dynamic Styling:**
   - **Valid Placement:** The tile should be rendered with higher opacity (e.g., 0.6) and standard colors.
   - **Invalid Placement:** The tile should be rendered with lower opacity (e.g., 0.2) and a slight red tint (if possible) or just lower opacity to signal "not allowed."
3. **Ghost Rendering:** Use existing `TileRenderer.drawTileAtHex` but with a more sophisticated `HexStyle` configuration based on placement validity.

### UI Integration
- The HUD should display a "Current Tile" slot to provide a clear view of the tile even when the mouse is off-grid.

## Components Involved
- `CanvasController`: Update the render loop logic for ghost previews.
- `HexStyles`: Add `VALID_PREVIEW` and `INVALID_PREVIEW` constants for consistency.
- `GameHUD`: Add a visual slot for the `activeGame.peek()` tile.
- `TileRenderer`: Ensure it can handle the low-opacity/tinted styles properly.

## Acceptance Criteria
- [ ] Next tile is ALWAYS visible as a ghost when hovering over the grid.
- [ ] Ghost tile is clearly distinguishable when in an invalid placement (lower opacity).
- [ ] Ghost tile is clearly distinguishable when in a valid placement (higher opacity).
- [ ] No regressions in placement logic (clicking only works on valid hexes).
- [ ] E2E tests verify the preview remains visible on "invalid" hexes.
