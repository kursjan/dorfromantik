# Canvas Engine Architecture

The canvas visualization logic is separated from the React component tree to ensure performance, testability, and clean separation of concerns. This directory structure implements a "Controller Pattern".

## 1. Design Philosophy

- **React for UI:** React manages the DOM overlay (HUD, menus) and the `<canvas>` lifecycle.
- **Pure TS for Game Loop:** The game simulation and rendering loop run in a pure TypeScript class (`CanvasController`) outside of the React render cycle. This prevents React overhead from affecting 60fps rendering and avoids complex `useEffect` chains for game state.
- **Input Decoupling:** DOM events are captured and normalized before reaching the game logic.
- **Specialized Renderers:** Rendering logic is split into specialized classes (Hex, Background, Debug), each with its own style configuration. This keeps the Controller clean and focused on orchestration.

## 2. Directory Structure

```
src/canvas/
├── components/        # React Components
│   ├── CanvasView.tsx      # Entry point (Main container, manages HUD/Canvas sync)
│   ├── GameHUD.tsx         # Score and Turn counter overlay
│   ├── GameHUD.css         # HUD styling
│   ├── ResetViewButton.tsx # UI Overlay for camera control
│   └── ResetViewButton.css # Button styling
├── engine/            # Core Game Loop & State
│   ├── CanvasController.ts # The "Main Loop" & State Holder
│   ├── Camera.ts        # Math for World <-> Screen transforms (Pan, Zoom, Rotate, Reset)
│   └── InputManager.ts  # DOM Event Listeners (Mouse, Keyboard)
├── graphics/          # Rendering Logic
│   ├── BackgroundRenderer.ts # Clears and draws background
│   ├── BackgroundStyles.ts   # Background configuration
│   ├── DebugRenderer.ts      # Draws debug overlay (HUD)
│   ├── DebugStyles.ts        # Debug overlay configuration
│   ├── HexRenderer.ts        # Main game world rendering (Grid, Highlights)
│   ├── HexStyles.ts          # Hex visual configuration
│   ├── TileRenderer.ts       # Specialized renderer for 6-sided tiles
│   └── HexStyles.ts          # Hex visual configuration
└── ARCHITECTURE.md    # This file
```

## 3. Coordinate Systems

Understanding the coordinate spaces is critical for this engine:

1.  **Screen Space (Pixels):**
    - Origin `(0, 0)` is the top-left corner of the canvas.
    - Used for mouse events (`InputManager`).
    - Positive Y is **Down**.

2.  **World Space (Logical Units):**
    - Infinite 2D plane.
    - Origin `(0, 0)` is the center of the initial view.
    - Used for camera positioning.
    - **Transformation:** `Screen = Center + Rotate((World + CameraPos) * Zoom)`
      - Note the rotation step, which complicates `screenToWorld` mapping.

3.  **Hex Space (Cube Coordinates):**
    - Integer coordinates `(q, r, s)` where `q + r + s = 0`.
    - Used for game logic (Tile storage, Adjacency).
    - _Conversion:_ `World -> Hex` via `HexUtils.pixelToHex`.
    - **CRITICAL:** This project uses a **Rotated Coordinate System**.
      - **North is (-1, 0, 1)**.
      - Standard "Flat Top" usually implies North is `(0, -1, 1)`.
      - Ensure `HexUtils.ts` logic (swapped q/r) is respected when calculating neighbors or rendering.

## 4. Core Modules

### CanvasController (`engine/CanvasController.ts`)

The central hub. It:

- **Owns State:** Camera, Hovered Hex, (Future: Board).
- **Runs Loop:** Manages `requestAnimationFrame`.
- **Orchestrates:** `InputManager` callbacks -> updates State -> delegates drawing to Renderers.
- **Validation:** Provides `isValidPlacement(coord)` by delegating to the `Game` model, ensuring the UI only allows valid actions.
- **Tile Rotation:** Responds to `onRotateClockwise` and `onRotateCounterClockwise` callbacks by delegating to the `Game` model's rotation logic for the active tile.
- **Ghost Preview:** In the render loop, if the hovered hex is valid, it draws a semi-transparent "ghost" of the next tile from the game queue.
- **Does NOT Render:** It strictly delegates actual canvas API calls to the specialized renderers.

### Camera (`engine/Camera.ts`)

Manages the view transform.

- **Pan:** `x, y` (World Units).
- **Zoom:** Scalar value (clamped).
- **Rotation:** Radians (for rotating the view).
- **Methods:** `screenToWorld()`, `applyTransform()`, `pan()`, `rotateBy()`.

### InputManager (`engine/InputManager.ts`)

DOM abstraction layer.

- **Role:** Translates raw DOM events (`mousedown`, `wheel`, `keydown`, etc.) into abstract Game Actions (`onPan`, `onZoom`, `onHover`, `getRotationDirection`, `onRotateClockwise`, `onRotateCounterClockwise`).
- **State Machine:** Uses an explicit state machine (`IDLE`, `MOUSE_DOWN_POTENTIAL_CLICK`, `PANNING`) to distinguish between clicks and pans. This centralizes transition logic and cursor management.
- **Context Menu:** The browser's default context menu is disabled to support right-click-based tile rotation.
- **Hygiene:** Explicitly attaches and detaches listeners to prevent memory leaks.
- **Normalization:** Handles cross-browser differences (e.g., wheel delta).
- **Keyboard Tracking:** Maintains a Set of active keys for continuous actions like camera rotation.

### Renderers (`graphics/*Renderer.ts`)

Stateless rendering utilities. They receive the `Context2D` and necessary data to draw.

- **BackgroundRenderer:** Handles clearing the screen and drawing the background color.
- **HexRenderer:** Draws the game grid and debug highlights. It uses `HexStyles.ts` for configuration.
- **TileRenderer:** Draws the 6-sided terrain wedges for placed tiles. It aligns the model's terrain mapping with the canvas orientation.
- **DebugRenderer:** Draws technical info (camera pos, zoom, rotation, etc.) on top of the scene.

### Styles (`graphics/*Styles.ts`)

Configuration files for their respective renderers.

- Defines colors, line widths, fonts, and constants.
- **Rule:** Every renderer must have a corresponding styles file.

## 5. React & Controller Synchronization

While the Controller runs independently for performance, the React-based HUD needs to reflect the current game state (score, turns).

- **Pattern:** `CanvasController` exposes an `onStatsChange` callback.
- **Registration:** `CanvasView` (React) registers a listener in its `useEffect` hook.
- **Execution:** When the game state changes (e.g., tile placed), the Controller invokes the callback, triggering a `useState` update in React.
- **Why:** This maintains the "Pure TS for Game Loop" principle while keeping the UI reactive.

## 6. Data Flow Example: Hovering

1.  **Browser:** User moves mouse to pixel `(500, 300)`.
2.  **InputManager:** Catches `mousemove`, calls `callbacks.onHover(500, 300)`.
3.  **CanvasController:**
    - Calls `camera.screenToWorld(500, 300)` -> applies Inverse Rotate, Inverse Scale, Inverse Translate -> gets World `(120.5, -40.2)`.
    - Calls `pixelToHex(120.5, -40.2)` -> gets Hex `(2, -1, -1)`.
    - Updates `this.hoveredHex`.
4.  **Render Loop:**
    - Calls `backgroundRenderer.draw()`.
    - Calls `camera.applyTransform()` (Translate Center -> Rotate -> Scale -> Translate Camera).
    - Calls `hexRenderer.drawHighlight(this.hoveredHex)`.
    - Calls `ctx.restore()` (Reverts transform).
    - Calls `debugRenderer.drawOverlay(...)`.
5.  **Screen:** Hex at `(2, -1, -1)` glows yellow, correctly positioned even if rotated.
