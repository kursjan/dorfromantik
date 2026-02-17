# Canvas Engine Architecture

The canvas visualization logic is separated from the React component tree to ensure performance, testability, and clean separation of concerns. This directory structure implements a "Controller Pattern".

## 1. Design Philosophy

*   **React for UI:** React manages the DOM overlay (HUD, menus) and the `<canvas>` lifecycle.
*   **Pure TS for Game Loop:** The game simulation and rendering loop run in a pure TypeScript class (`CanvasController`) outside of React's render cycle. This prevents React overhead from affecting 60fps rendering and avoids complex `useEffect` chains for game state.
*   **Input Decoupling:** DOM events are captured and normalized before reaching the game logic.
*   **Specialized Renderers:** Rendering logic is split into specialized classes (Hex, Background, Debug), each with its own style configuration. This keeps the Controller clean and focused on orchestration.

## 2. Directory Structure

```
src/canvas/
├── components/        # React Components
│   └── CanvasView.tsx   # Entry point (thin wrapper)
├── engine/            # Core Game Loop & State
│   ├── CanvasController.ts # The "Main Loop" & State Holder
│   ├── Camera.ts        # Math for World <-> Screen transforms
│   └── InputManager.ts  # DOM Event Listeners
├── graphics/          # Rendering Logic
│   ├── BackgroundRenderer.ts # Clears and draws background
│   ├── BackgroundStyles.ts   # Background configuration
│   ├── DebugRenderer.ts      # Draws debug overlay (HUD)
│   ├── DebugStyles.ts        # Debug overlay configuration
│   ├── HexRenderer.ts        # Main game world rendering (Hexes, Grid)
│   └── HexStyles.ts          # Hex visual configuration
└── ARCHITECTURE.md    # This file
```

## 3. Coordinate Systems

Understanding the coordinate spaces is critical for this engine:

1.  **Screen Space (Pixels):**
    *   Origin `(0, 0)` is the top-left corner of the canvas.
    *   Used for mouse events (`InputManager`).
    *   Positive Y is **Down**.

2.  **World Space (Logical Units):**
    *   Infinite 2D plane.
    *   Origin `(0, 0)` is the center of the initial view.
    *   Used for camera positioning.
    *   *Transformation:* `Screen = Center + (World + CameraPos) * Zoom`

3.  **Hex Space (Cube Coordinates):**
    *   Integer coordinates `(q, r, s)` where `q + r + s = 0`.
    *   Used for game logic (Tile storage, Adjacency).
    *   *Conversion:* `World -> Hex` via `HexUtils.pixelToHex`.
    *   **CRITICAL:** This project uses a **Rotated Coordinate System**.
        *   **North is (-1, 0, 1)**.
        *   Standard "Flat Top" usually implies North is `(0, -1, 1)`.
        *   Ensure `HexUtils.ts` logic (swapped q/r) is respected when calculating neighbors or rendering.

## 4. Core Modules

### CanvasController (`engine/CanvasController.ts`)
The central hub. It:
*   **Owns State:** Camera, Hovered Hex, (Future: Board).
*   **Runs Loop:** Manages `requestAnimationFrame`.
*   **Orchestrates:** `InputManager` callbacks -> updates State -> delegates drawing to Renderers.
*   **Does NOT Render:** It strictly delegates actual canvas API calls to the specialized renderers.

### Camera (`engine/Camera.ts`)
Manages the view transform.
*   **Pan:** `x, y` (World Units).
*   **Zoom:** Scalar value (clamped).
*   **Methods:** `screenToWorld()`, `applyTransform()`.

### Renderers (`graphics/*Renderer.ts`)
Stateless rendering utilities. They receive the `Context2D` and necessary data to draw.
*   **BackgroundRenderer:** Handles clearing the screen and drawing the background color.
*   **HexRenderer:** Draws the game grid, tiles, and highlights.
*   **DebugRenderer:** Draws technical info (camera pos, zoom, etc.) on top of the scene.

### Styles (`graphics/*Styles.ts`)
Configuration files for their respective renderers.
*   Defines colors, line widths, fonts, and constants.
*   **Rule:** Every renderer must have a corresponding styles file.

### InputManager (`engine/InputManager.ts`)
DOM abstraction layer.
*   Attaches `wheel`, `mousedown`, `mousemove` to the canvas.
*   Calculates deltas (e.g., `dx, dy` for panning).
*   Emits abstract events (`onPan`, `onZoom`, `onHover`) to the Controller.

## 5. Data Flow Example: Hovering

1.  **Browser:** User moves mouse to pixel `(500, 300)`.
2.  **InputManager:** Catches `mousemove`, calls `controller.onHover(500, 300)`.
3.  **CanvasController:**
    *   Calls `camera.screenToWorld(500, 300)` -> gets World `(120.5, -40.2)`.
    *   Calls `pixelToHex(120.5, -40.2)` -> gets Hex `(2, -1, -1)`.
    *   Updates `this.hoveredHex`.
4.  **Render Loop:**
    *   Calls `backgroundRenderer.draw()`.
    *   Calls `hexRenderer.drawHighlight(this.hoveredHex)`.
    *   Calls `debugRenderer.drawOverlay(...)`.
5.  **Screen:** Hex at `(2, -1, -1)` glows yellow.
