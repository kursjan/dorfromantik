# `rendering/common`

Shared **view math and bridges** used by both the canvas engine and the SVG board. No `HTMLCanvasElement` or SVG-specific JSX here.

- **`camera/`** — `Camera` class and pointer / wheel helpers (`cameraInteraction`).
- **`bridge/`** — React `useGameSnapshotBridge` for immutable `Game` snapshots.
- **`hex/`** — `HexUtils`, `HEX_SIZE` (`hexLayout`), `TERRAIN_COLORS` (`terrainPalette`).

Canvas-only drawing styles stay under `rendering/canvas/graphics/HexStyles.ts` (imports layout / palette from here).
