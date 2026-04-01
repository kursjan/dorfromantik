# Specification: SVG HexTile Prototype (#19)

## Overview

As discussed in Issue #19, we are pivoting towards HTML/SVG rendering to improve accessibility, testability, and adherence to modern React patterns. This track represents the foundational first step: creating a pure React `<HexTile />` component that perfectly mimics the visual output of the imperative `CanvasController`.

## Goals

- Replace the imperative `TileRenderer.ts` and `segmentRenderers` (Canvas 2D API) with a declarative, SVG-based component hierarchy.
- Prove that complex hybrid terrains (like Water meeting Water, or Rails meeting Rails across tile boundaries) can be rendered accurately with SVG paths.
- Establish a Storybook-driven workflow for verifying visual components independently of the main game engine.

## Requirements

1. **Zero Canvas API:** The new component must rely entirely on SVG `<path>`, `<polygon>`, or `<circle>` elements.
2. **Visual Parity:** The Storybook outputs should match the existing `TilePreview.tsx` visually. Colors must be identical to `HexStyles.ts`.
3. **Data-Driven:** The `<HexTile />` must accept a `Tile` model (from `src/models/Tile.ts`) and derive its 6 wedges and optional center segment directly from the model data.
4. **Coordinate System:** The component must honor the rotated "Flat Top" orientation where North is `(-1, 0, 1)`. The top vertex of the hexagon points straight up.
5. **Hybrid Terrain Support:** The component must accept `neighborEdgeTerrains` (a partial map of directions to terrain types) and use this to adjust drawing paths, exactly as the canvas `TileRenderer` does for water and rails.

## Non-Goals

- Do not attempt to replace the `CanvasController` or integrate this component into the main game board yet. This track is strictly for prototyping the single-tile rendering in Storybook.
- Do not implement interaction logic (clicks, hovers) beyond what Storybook provides for inspection.
