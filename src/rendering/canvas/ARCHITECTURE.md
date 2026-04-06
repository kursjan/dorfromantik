# Canvas Engine Architecture

The canvas visualization logic is separated from the React component tree to ensure performance, testability, and clean separation of concerns. This directory structure implements a "Controller Pattern".

## 1. Design Philosophy

- **React for UI:** React manages the DOM overlay (HUD, menus) and the `<canvas>` lifecycle.
- **Pure TS for Game Loop:** The game simulation and rendering loop run in a pure TypeScript class (`CanvasController`) outside of the React render cycle. This prevents React overhead from affecting 60fps rendering and avoids complex `useEffect` chains for game state.
- **Input Decoupling:** DOM events are captured and normalized before reaching the game logic.
- **Specialized Renderers:** Rendering logic is split into specialized classes (Hex, Background, Debug), each with its own style configuration. This keeps the Controller clean and focused on orchestration.

## 2. Directory Structure

Canvas-only code lives under **`src/rendering/canvas/`**. Shared camera / hex math / React game bridge is in **`src/rendering/common/`**. Game chrome (HUD, reset, save status) is in **`src/rendering/shell/`**. Firestore debounced saves: **`src/services/GameAutosaver.ts`** (see `src/services/ARCHITECTURE.md`). Cross-cutting **coordinate types, `Camera`, `CameraSnapshot`, and pointer binding** are summarized in **`../ARCHITECTURE.md`** (rendering root).

```
src/rendering/canvas/
├── components/
│   ├── TilePreview.tsx     # Small canvas preview of a tile (optional neighborEdgeTerrains for hybrid edges)
│   ├── Tiles/              # Storybook stories (canvas tile previews)
│   ├── CanvasView.tsx      # Entry: canvas + shell imports + debug overlay
│   ├── DebugOverlay.tsx    # React technical overlay (FPS, camera); fed by CanvasController
│   └── DebugOverlay.css
├── hooks/
│   └── useCanvasControllerDebugStats.ts  # useSyncExternalStore bridge for DebugOverlay
├── engine/
│   ├── CanvasController.ts # rAF loop, state holder, viewport-centered Context2D camera chain
│   └── InputManager.ts       # Canvas DOM listeners
├── graphics/               # Context2D renderers + HexStyles (imports shared hex layout / palette from ../common)
└── ARCHITECTURE.md         # This file
```

## 3. Coordinate Systems

Understanding the coordinate spaces is critical for this engine. Branded **`Client*`** / **`Container*`** / **`WorldPoint`** types and factories live in **`src/rendering/common/`** (see **`../ARCHITECTURE.md`**).

1.  **Client viewport (`ClientPoint` / `ClientDelta`):**
    - Used inside **`PointerPanZoomSession`** (threshold vs pan) before the canvas callbacks run.
    - **`bindPointerInteraction`** converts to container types on the way in/out.

2.  **Container-local pixels (`ContainerPoint`):**
    - Origin `(0, 0)` is the **top-left of the canvas element** (**`ContainerPoint.fromClientInElement`** with `getBoundingClientRect()`).
    - **`InputManager`** passes **`ContainerPoint`** to **`onHover`** / **`onClick`**.
    - **`Camera.containerToWorld(point, canvas.width, canvas.height)`** expects this space for `point`.

3.  **Pointer drag delta (`ContainerDelta` for pan):**
    - **`onPan(delta)`** receives **`ContainerDelta`** produced by **`ContainerDelta.fromClientDelta`** (same components as Δ`clientX` / Δ`clientY` when layout is stable).
    - **`Camera.panBy(delta)`** rotates that vector and applies it to world **`pan`**.

4.  **World space (`WorldPoint`):**
    - Infinite 2D plane in **layout units** (hex geometry, camera pan).
    - Origin `(0, 0)` is the center of the initial view before pan.
    - **Transformation (conceptual):** container pixel = center + rotate + scale × (world + camera pan). Inverting that chain is **`containerToWorld`**.
    - **`Camera.pan`** is the world offset (`WorldPoint`). **`DebugStats.camera`** is **`CameraSnapshot`** with **`position`** equal to **`camera.pan`**; SVG uses the same **`CameraSnapshot`** type.

5.  **Hex space (cube coordinates):**
    - Integer coordinates `(q, r, s)` where `q + r + s = 0`.
    - Used for game logic (Tile storage, Adjacency).
    - _Conversion:_ world → hex via **`HexUtils.pixelToHex`** (argument is **`WorldPoint`**).
    - **CRITICAL:** This project uses a **Rotated Coordinate System**.
      - **North is (-1, 0, 1)**.
      - Standard "Flat Top" usually implies North is `(0, -1, 1)`.
      - Ensure `HexUtils.ts` logic (swapped q/r) is respected when calculating neighbors or rendering.

## 4. Core Modules

### CanvasController (`engine/CanvasController.ts`)

The central hub. It:

- **Owns State:** Camera, hovered hex, debug snapshot publishing, and input wiring. Game board data is read from `getGameSnapshot()` and committed via `setGameSnapshot(game)` (see §5).
- **Runs Loop:** Manages `requestAnimationFrame`.
- **Orchestrates:** `InputManager` callbacks -> updates State -> delegates drawing to Renderers.
- **Validation:** Provides `isValidPlacement(coord)` by delegating to the `Game` model, ensuring the UI only allows valid actions.
- **Tile Rotation:** Responds to `onRotateClockwise` and `onRotateCounterClockwise` callbacks by delegating to the `Game` model's rotation logic for the active tile.
- **Ghost Preview:** In the render loop, if the hovered hex is valid, it draws a semi-transparent "ghost" of the next tile from the game queue.
- **Stats Publishing:** Calculates FPS and publishes throttled debug stats (FPS, Camera, Hover) to listeners (like `DebugOverlay`).
- **Does NOT Render:** It strictly delegates actual canvas API calls to the specialized renderers.

### Camera (`../common/camera/Camera.ts`)

Manages the view transform (shared with the SVG board path).

- **Pan:** **`pan`** getter — world-space offset (**`WorldPoint`**); same values as SVG **`CameraSnapshot.position`** (see **`useCameraControls`** → **`readTransform`**).
- **Zoom / rotation:** scalars; **`zoomBy`**, **`rotateBy`**, **`reset`** match config defaults.
- **Canvas draw path:** **`CanvasController`** applies center translate → rotate → scale → **`camera.pan`** translate on the `Context2D` (matches SVG **`SvgBoard`** transform order).
- **Methods:** **`containerToWorld(point, w, h)`**, **`panBy(ContainerDelta)`**, **`zoomBy`**, **`rotateBy`**, **`reset`**.

### InputManager (`engine/InputManager.ts`)

DOM abstraction layer. Pointer behavior is delegated to **`../common/camera/cameraInteraction`** (`bindPointerInteraction`, **`PointerPanZoomSession`**) — the same primitives as the SVG **`useCameraControls`** path.

- **Role:** Translates raw DOM events (`wheel`, `keydown`, etc.) into abstract actions. Pointer move/down/up go through the shared pan/zoom session.
- **Callbacks (types):** **`onPan(delta: ContainerDelta)`**, **`onZoom(deltaY: number)`**, **`onHover` / `onClick(point: ContainerPoint)`**, rotation and **`onToggleDebugOverlay`** (F3 from **`CanvasView`**).
- **State machine:** `IDLE`, `MOUSE_DOWN_POTENTIAL_CLICK`, `PANNING` — distinguishes click vs pan and drives cursor style via **`cameraInteraction`** helpers.
- **Context Menu:** The browser's default context menu is disabled to support right-click-based tile rotation.
- **Hygiene:** Explicitly attaches and detaches listeners to prevent memory leaks.
- **Normalization:** Handles cross-browser differences (e.g., wheel delta).
- **Keyboard Tracking:** Maintains a Set of active keys for continuous actions like camera rotation.

### Renderers (`graphics/*Renderer.ts`)

Stateless rendering utilities. They receive the `Context2D` and necessary data to draw.

- **BackgroundRenderer:** Handles clearing the screen and drawing the background color.
- **HexRenderer:** Draws the game grid and debug highlights. It uses `HexStyles.ts` for configuration.
- **TileRenderer:** Draws the 6-sided terrain wedges for placed tiles. For each direction it builds a `WedgeDrawContext` and dispatches to `TERRAIN_ID_SEGMENT_RENDERERS[tileSide.id]`, passing the terrain across the shared edge on the neighbor tile when provided (`TileDrawOptions.neighborEdgeTerrains` or `BoardNavigation.neighborEdgeTerrains` when a `board` is passed to `drawTileAtHex`). This keeps hybrid terrains (e.g. `waterOrPasture`) visually consistent with neighbors. When `tile.center` is set, it looks up `TERRAIN_ID_CENTER_SEGMENT_RENDERERS` (e.g. `WaterCenterSegmentRenderer` for water, `RailCenterSegmentRenderer` for rail) and draws the inner hex via `CenterDrawContext`.
- **(Deprecated) DebugRenderer:** Canvas `Context2D` debug text — **to be migrated** fully to an HTML overlay (`DebugOverlay` + `CanvasController` debug subscription), then removed.

### Persistence (`src/services/GameAutosaver.ts`)

- **GameAutosaver:** Debounced Firestore saves for the active game (used from `GameBoard`, not from the canvas package).
  - **Debouncing:** By default, saves are debounced by 2 seconds after a tile placement to prevent excessive writes.
  - **Lifecycle Callbacks:** Supports `onSaveStart`, `onSaveSuccess`, and `onSaveError` to allow UI components (like `GameBoard`) to provide visual feedback to the player.
  - **Reliability:** Implements `forceSaveAndDispose()`, which is called when a component unmounts to ensure any pending saves are immediately flushed to the server before the context is lost.

See **`src/services/ARCHITECTURE.md`** for the broader service layer.

### Styles (`graphics/*Styles.ts`)

Configuration files for their respective renderers.

- Defines colors, line widths, fonts, and constants.
- **Rule:** Every renderer must have a corresponding styles file.

## 5. React & Controller Synchronization

While the Controller runs independently for performance, the React tree must hold the **canonical immutable `Game` snapshot** (via `ActiveGameContext`) so persistence (`GameAutosaver`) and the HUD see the same state.

- **Pattern:** `CanvasController` is constructed with **`getGameSnapshot()`** and **`setGameSnapshot(game)`**. It does not mirror `Game` on `this`; it reads the latest snapshot from the getter each frame and calls **`setGameSnapshot`** after place / rotate with the returned snapshot.
- **`CanvasView`:** Receives **`activeGame`** and **`setActiveGame`** from the parent (e.g. **`GameBoard`** from **`useActiveGame()`**). Uses **`useGameSnapshotBridge`**: syncs a **ref** from **`activeGame`** (e.g. **`useLayoutEffect`**) and wraps **`setActiveGame`** into **`setGameSnapshot`**, which updates the ref **synchronously** with each new snapshot (avoids the rAF loop lagging React by one frame). The HUD reads **score / turns / next tile** from the **`activeGame` prop**, not a separate stats callback.
- **Nullability Convention:** For app state, "no active game" is represented by **`null`** (`Game | null`) across `ActiveGameContext`, `GameBoard`, and `GameAutosaver`. This keeps absence explicit and avoids mixing domain state with optional-property `undefined`.
- **Debug stats:** `CanvasController` exposes **`subscribeDebug`** and **`getDebugSnapshot`** for high-frequency updates (FPS, camera **`pan` as `WorldPoint`**, zoom, rotation, hover) consumed by **`DebugOverlay`** via **`useSyncExternalStore`**. **`pan`** matches **`Camera.pan`**.

## 6. Data Flow Example: Hovering (Magnetic Snapping)

1.  **Browser:** User moves mouse; position relative to the canvas is **`ContainerPoint`** e.g. `{ x: 500, y: 300 }`.
2.  **InputManager / `bindPointerInteraction`:** Emits **`onHover`** with that **`ContainerPoint`**.
3.  **CanvasController:**
    - Calls `camera.containerToWorld({ x: 500, y: 300 }, canvas.width, canvas.height)` → applies inverse rotate, inverse scale, inverse translate → world `(120.5, -40.2)`.
    - Reads `activeGame.hints.validPlacements` (immutable pre-computed array).
    - Finds the valid coordinate with the minimum `distanceToHex` from the World `(120.5, -40.2)`.
    - Updates `this.hoveredHex` to that closest valid coordinate (snapping effect).
4.  **Render Loop:**
    - Calls `backgroundRenderer.draw()`.
    - Applies the camera transform on `ctx` (center → rotate → scale → pan).
    - Calls `hexRenderer.drawHighlight(this.hoveredHex)`.
    - Calls `ctx.restore()` (Reverts transform).
    - Publishes debug snapshot.
5.  **Screen:** The nearest valid Hex glows yellow, correctly positioned even if rotated.
