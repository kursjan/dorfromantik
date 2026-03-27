# Magnetic Snapping Specification

## Overview
Currently, the ghost tile preview only appears if the exact hex coordinate mathematically beneath the mouse cursor is a valid placement spot (empty and adjacent to an existing tile). 

This feels rigid. We want to implement a "magnetic" snapping feel, especially useful for gamepad or imprecise mouse movements.

## Requirements
1. The game must calculate all valid placement coordinates around the current board edge.
2. During the hover loop, the `CanvasController` must determine which of those valid coordinates is physically closest (in continuous 2D space) to the mouse cursor's exact world position.
3. The ghost tile should snap to that closest valid coordinate, even if the mouse is hovering over the "void" or an existing tile.

## Technical Details
*   **Board Logic:** `Board.ts` needs a way to return `getValidPlacementCoordinates(): HexCoordinate[]`.
*   **Math:** `HexUtils.ts` needs a `distanceToHexCenter` function that takes a `HexCoordinate` and a continuous `(worldX, worldY)` point, converting the hex to its center pixel and using the Pythagorean theorem to find the distance.
*   **Controller Loop:** In `CanvasController.handleHover`, instead of doing `pixelToHex -> isValid`, we do `getValidPlacements -> map distances -> find minimum -> set hoveredHex`.
*   **Edge Cases:** If the mouse is extremely far away, we might want to cap the snapping distance, or we might just snap infinitely. Let's start with infinite snapping to the nearest valid point for simplicity, as it matches the controller experience well.