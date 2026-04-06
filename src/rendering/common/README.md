# `rendering/common`

Code **used by both** the canvas engine and the SVG path (or otherwise engine-level shared math). No `HTMLCanvasElement` or SVG-specific JSX here.

- **`camera/`** — `Camera` (constructed from `CameraSnapshot`, usually `DEFAULT_CAMERA_SNAPSHOT`), `CameraSnapshot` + `DEFAULT_CAMERA_SNAPSHOT`, and pointer / wheel helpers (`cameraInteraction`).
- **`bridge/`** — React `useGameSnapshotBridge` for immutable `Game` snapshots.
- **`hex/`** — `HexUtils`, `HEX_SIZE` (`hexLayout`), `TERRAIN_COLORS` (`terrainPalette`).

Canvas-only drawing styles stay under `rendering/canvas/graphics/HexStyles.ts` (imports layout / palette from here).
