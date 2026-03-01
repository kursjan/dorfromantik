# Specification: Board Integration & Basic Tile Rendering

## Goals
Connect the `Session` and `Game` models to the Canvas rendering engine and React UI. This track enables board visualization, specialized tile rendering, ghosted previews, and a dedicated React HUD for game stats.

## Functional Requirements
- **Session-Driven State:** `CanvasController` uses a `Session` instance as its data source.
- **Specialized Tile Rendering (Canvas):** 
    - `TileRenderer.draw(ctx, tile, coord, options)`: Renders 6-sided terrains with support for `opacity`.
- **Game Status Visualization (React HUD):**
    - Create a specialized `GameHUD` component to display `score` and `remainingTurns`.
    - This component must be an overlay on the canvas.
- **Placement Preview & Interaction:**
    - Continuous "ghost" preview of `game.peek()` on valid hovered coordinates.
    - Click to execute `game.placeTile(coord)`.
- **UI Synchronization:** The HUD must reflect state changes immediately after a tile is placed.

## Non-functional Requirements
- **Commit Linking:** Every commit MUST reference **Issue #4**.
- **Architectural Integrity:** Follow the "Controller Pattern" (Logic in `Game`, Rendering in `TileRenderer`/`GameHUD`).

## Implementation Details
- **Hex Styling:** Update `HexStyles.ts` to include colors/styles for different `TerrainType` values.
- **Interaction Logic:** `CanvasController` will use `InputManager`'s hover data to determine the preview position.
- **React-Canvas Bridge:** Ensure `App.tsx` or a sub-component can read and display `Game` stats from the `Session`.
