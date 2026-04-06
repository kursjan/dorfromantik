# `rendering/common`

Code **used by both** the canvas engine and the SVG path (or otherwise engine-level shared math). No `HTMLCanvasElement` or SVG-specific JSX here.

- **`camera/`** — `Camera` (immutable `CameraSnapshot` reassigned on each change), `CameraSnapshot` + `DEFAULT_CAMERA_SNAPSHOT`, and pointer / wheel helpers (`cameraInteraction`).
- **`bridge/`** — React `useGameSnapshotBridge` for immutable `Game` snapshots.
- **`hex/`** — `HexUtils`, `HEX_SIZE` (`hexLayout`), `TERRAIN_COLORS` (`terrainPalette`).

Canvas-only drawing styles stay under `rendering/canvas/graphics/HexStyles.ts` (imports layout / palette from here).
