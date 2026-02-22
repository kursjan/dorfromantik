# Plan: Always-on Ghost Preview (#18)

## Phase 1: Styling & Logic Preparation
- [ ] Task: #18.1: Define `VALID_PREVIEW` and `INVALID_PREVIEW` constants in `src/canvas/graphics/HexStyles.ts`.
- [ ] Task: #18.2: Ensure `TileRenderer.drawTileAtHex` handles very low opacity levels.

## Phase 2: Controller Update
- [ ] Task: #18.3: Modify `CanvasController.render()` to draw the preview tile regardless of `isValidPlacement`.
- [ ] Task: #18.4: Apply `VALID_PREVIEW` or `INVALID_PREVIEW` styles based on `this.isValidPlacement(this.hoveredHex)`.

## Phase 3: HUD Integration
- [ ] Task: #18.5: Update `GameHUD.tsx` to include a "Next Tile" preview slot.
- [ ] Task: #18.6: Ensure `GameHUD` is synchronized with `game.peek()`.

## Phase 4: Verification
- [ ] Task: #18.7: Update `e2e/canvas.spec.ts` or add a new test to verify ghost visibility on invalid hexes.
- [ ] Task: #18.8: Perform manual verification using `npm run dev`.
