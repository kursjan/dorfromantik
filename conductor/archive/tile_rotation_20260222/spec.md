# Specification: Tile Rotation Logic

## Goal
Implement a mechanism to rotate the tile currently at the head of the game queue using keyboard (R/F) and mouse (Right-Click) inputs.

## Requirements
- **Immutability:** Rotating a tile should return a *new* instance of the `Tile` class with the same `id` but shifted terrain properties.
- **Clockwise Rotation (60°):**
  - North -> NorthWest
  - NorthEast -> North
  - SouthEast -> NorthEast
  - South -> SouthEast
  - SouthWest -> South
  - NorthWest -> SouthWest
- **Counter-Clockwise Rotation (60°):**
  - North -> NorthEast
  - NorthEast -> SouthEast
  - SouthEast -> South
  - South -> SouthWest
  - SouthWest -> NorthWest
  - NorthWest -> North
- **Input Mapping:**
  - `R` key: Clockwise rotation.
  - `F` key: Counter-clockwise rotation.
  - `Right-Click`: Clockwise rotation.
  - `Shift + Right-Click`: Counter-clockwise rotation.
- **UI Interaction:** The rotation must be immediately reflected in the "Ghost" preview on the canvas.
- **Game State:** The `Game` class should own the rotation logic for the active tile in its `tileQueue`.

## User Interface Impact
- The user can orient tiles before placement to maximize score or match terrains.
- The context menu on the canvas will be disabled to support right-click rotation.
