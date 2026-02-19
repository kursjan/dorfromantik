# Blueprint: Dorfromantik-Style Game

## 1. Overview

This document outlines the architecture, features, and development plan for a web-based, Dorfromantik-style hexagonal grid game.

The project uses a modern frontend stack with React and TypeScript. The UI is built for aesthetics and responsiveness using Tailwind CSS and the shadcn/ui component library. It includes a foundational setup for a Firebase backend to support future game logic, state management, and user data.

## 2. Implemented Features
- [x] **Project Setup:** React, TypeScript, Tailwind, shadcn/ui (partial), Firebase (config).
- [x] **Verification:** CI-like checks (tsc, curl, vitest) on every change.
- [x] **Core Data Structures:**
  - `HexCoordinate` with validation.
  - `Tile` class with ASCII `print()` method (Flat-Top style).
  - `Board` class for managing tile placement.
  - `Navigation` class implementing neighbor calculations.
- [x] **Testing:** Comprehensive unit tests for models.
- [x] **Board Visualization:** Implemented `BoardPrinter`, `Canvas`, and `TilePrinter` to render the full grid in ASCII.
- [x] **Board Visualization (Canvas):**
  - Basic `CanvasView` component with a render loop.
  - `HexUtils` updated for custom coordinate system (North is `-1, 0, 1` relative to center).
  - `HexStyles` configuration for centralized styling.
  - `drawDebugGrid` for visualizing the hex grid and coordinates.
  - **Interactive Camera:** Pan (drag) and Zoom (scroll) implemented.
  - **Hex Interaction:** Mouse hover highlighting (Hex Picking) implemented.
  - **Refactored Rendering:** Separated rendering logic into specialized renderers (`BackgroundRenderer`, `HexRenderer`, `DebugRenderer`) orchestrated by `CanvasController`.
- [x] **E2E Testing:** Configured Playwright for Vite + Nix environment. Added tests for Canvas rendering and zooming.
- [x] **Infrastructure:**
  - Configured Path Aliases (`@/*`) for clean imports.
  - Set up Prettier (`npm run format`) for consistent code style.
  - Added UI foundations (`clsx`, `tailwind-merge`) for Shadcn/UI integration.
  - Exposed `window.canvas` for runtime debugging.

## 3. Architecture & Documentation

### 3.1. Core Data Model
- **Grid System:** Hexagonal Grid using **Cube Coordinates** (`q, r, s`).
- **Orientation:** **Flat-Top** Hexagons.
  - Neighbors: North, North-East, South-East, South, South-West, North-West.
- **Navigation (Cube Coordinates):**
  - **Center:** (0, 0, 0)
  - **North:** (-1, 0, 1) (Rotated system)
  - **North-East:** (-1, 1, 0)
  - **South-East:** (0, 1, -1)
  - **South:** (1, 0, -1)
  - **South-West:** (1, -1, 0)
  - **North-West:** (0, -1, 1)
- **Data Model:**
  - `HexCoordinate`: Enforces integer coordinates and zero-sum constraint.
  - `Tile`: Class with explicit edge properties (e.g., `north`, `northEast`). Includes `print()` for single tile ASCII art.
  - `Board`: Class encapsulating a `Map` of tiles, indexed by coordinate key. Prevents placement on occupied spots.
- **Visualization:** ASCII-based printing for debugging (`BoardPrinter`).

### 3.2. System Architecture
- **Frontend:** React (Vite) + TypeScript.
- **Canvas Engine:** Custom Controller Pattern (Separated from React).
  - **Pattern:** `React Component` -> `CanvasController` -> `Renderers` (`Hex`, `Background`, `Debug`) / `InputManager`.
  - **Documentation:** See **[src/canvas/ARCHITECTURE.md](./src/canvas/ARCHITECTURE.md)** for the detailed breakdown of the Canvas architecture.
- **Backend:** Firebase (Hosting, Firestore, Auth - *Planned*).

## 4. Current Plan
### Phase 1: Canvas and Camera Foundation [DONE]

### Phase 1a: Code Review: [DONE]

### Phase 2: Interaction & Input Handling
**Role:** Senior Graphics Engineer (TypeScript/Canvas).
**Goal:** Integrate the Board data model with the interactive Canvas.

- [x] **Step 2.1: Mouse Handling (Pan & Zoom)**
    - Implement `onMouseDown`, `onMouseMove`, `onMouseUp` for panning.
    - Implement `onWheel` for zooming.
- [x] **Step 2.2: Hex Picking (Hover)**
    - Calculate mouse position in "World Space" (accounting for Camera transform).
    - Use `pixelToHex` to determine the hovered hex coordinate.
    - Store `hoveredHex` in state.
- [x] **Checkpoint 2:**
    - [x] Run app.
    - [x] Verify dragging moves the camera (Pan).
    - [x] Verify scrolling zooms the camera (Zoom).
    - [x] Verify hovering highlights the correct hexagon.
- [x] **Step 2.3: Rotation**
    - [x] **Input Decision:** Use **Q** (Left) and **E** (Right) keys to rotate.
    - [x] **InputManager:** Implement `keydown`/`keyup` listeners to track rotation state. Expose `getRotationDirection()`.
    - [x] **Camera:** Add `rotation` state (radians). Update `applyTransform` (rotate) and `screenToWorld` (inverse rotate). Update `pan` to be screen-relative (rotate vector).
    - [x] **Controller:** Update `update()` loop to check input state and apply rotation to camera.
- [ ] **Step 2.4: Reset Camera Button** 
    - [x] **Camera:** Implement `reset()` method to restore default x, y, zoom, and rotation.
    - [x] **CanvasController API:** Expose a `resetCamera()` method in `CanvasController`.
    - [ ] **UI Infrastructure (Storybook):**
        - [ ] Initialize Storybook: `npx storybook@latest init --yes`.
        - [ ] Verify Storybook runs: `npm run storybook`.
    - [ ] **UI Implementation (Isolated):**
        - [ ] Create `src/canvas/components/ResetViewButton.tsx` as a standalone, styled component.
        - [ ] Create `src/canvas/components/ResetViewButton.stories.tsx` to develop and refine the button's look and feel in isolation.
    - [ ] **UI Integration:**
        - [ ] Create `src/canvas/components/ControlsOverlay.tsx` to house UI elements over the canvas.
        - [ ] Integrate `ResetViewButton` into `ControlsOverlay`.
        - [ ] Use `absolute` positioning to overlay controls on the canvas.
        - [ ] Integrate `ControlsOverlay` into `CanvasView.tsx`.
        - [ ] Connect the button to `controller.resetCamera()`.
    - [ ] **Verification:**
        - [ ] **E2E Test:** Create `e2e/reset-view.spec.ts` to verify:
            - Button is visible on initial load.
            - Panning/Zooming changes the view.
            - Clicking the button restores the initial camera state.

### Phase 3: Board Integration & Rendering
- [ ] **Step 3.1: Connect Board Model**
    - Instantiate a `Board` in the parent component (`App.tsx`).
    - Pass `Board` to `CanvasView`.
- [ ] **Step 3.2: Render Tiles**
    - Iterate through `board.getAll()` in `renderLoop`.
    - Render specific visuals based on `Tile` terrain properties (colors for now).
- [ ] **Checkpoint 3:**
    - [ ] Run app.
    - [ ] Place a few test tiles in code.
    - [ ] Verify tiles appear at correct coordinates with correct terrain colors.

### Phase 4: Placement Logic (UI)
- [ ] **Step 4.1: Selection & Placement**
    - visual cue for "valid placement" vs "invalid placement" (using `board.canPlace`).
    - Handle click to place a tile.


## Backlog (Low Priority)
The following tasks were not implemented because of their low-priority.

- [ ] 1. **Optimization:** Memoize grid coordinates in `CanvasController` to reduce GC pressure (Finding 1).
- [ ] 2. **Test Coverage:** Create `src/canvas/graphics/BackgroundRenderer.test.ts` to verify basic draw calls.
- [ ] 3. **Test Coverage:** Create `src/canvas/graphics/DebugRenderer.test.ts` to verify text output.

## Decision Log