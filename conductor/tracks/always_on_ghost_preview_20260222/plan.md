# Plan: Always-on Ghost Preview (#18)

## Phase 1: Styling & Logic Preparation
- [x] Task: #18.1: Define `VALID_PREVIEW` and `INVALID_PREVIEW` constants in `src/canvas/graphics/HexStyles.ts`. [commit: de3e20d]
- [x] Task: #18.2: Ensure `TileRenderer.drawTileAtHex` handles very low opacity levels. [commit: de3e20d]

## Phase 2: Controller Update
- [x] Task: #18.3: Modify `CanvasController.render()` to draw the preview tile regardless of `isValidPlacement`. [commit: 008036b]
- [x] Task: #18.4: Apply `VALID_PREVIEW` or `INVALID_PREVIEW` styles based on `this.isValidPlacement(this.hoveredHex)`. [commit: 008036b]

## Phase 3: HUD Integration
- [x] Task: #18.5: Update `GameHUD.tsx` to include a "Next Tile" preview slot. [commit: 6300546]
- [x] Task: #18.6: Ensure `GameHUD` is synchronized with `game.peek()`. [commit: 6300546]

## Phase 4: Verification
- [x] Task: #18.7: Update `e2e/canvas.spec.ts` or add a new test to verify ghost visibility on invalid hexes. [commit: 9b1fffb]
- [x] Task: #18.8: Perform manual verification using `npm run dev`. [commit: 9b1fffb]
- [x] Task: #18.9: Final Verification & Sync. All build errors resolved, E2E tests passing, dynamic port configured. [commit: <COMMIT_SHA>]
