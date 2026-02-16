# Blueprint: Dorfromantik-Style Game

## 1. Overview

This document outlines the architecture, features, and development plan for a web-based, Dorfromantik-style hexagonal grid game.

The project uses a modern frontend stack with React and TypeScript. The UI is built for aesthetics and responsiveness using Tailwind CSS and the shadcn/ui component library. It includes a foundational setup for a Firebase backend to support future game logic, state management, and user data.

## 2. Instructions for Agent
These are the most important instructions with the hightest priority. Always follow these instructions.

**Refer to `GEMINI.md` for the complete Operational Directives (Communication, Scope, Refactoring Rules).**

## 3. Implemented Features
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
  - Basic `GameCanvas` component with a render loop.
  - `HexUtils` updated for custom coordinate system (North is `-1, 0, 1` relative to center).
  - `HexStyles` configuration for centralized styling.
  - `drawDebugGrid` for visualizing the hex grid and coordinates.
  - **Interactive Camera:** Pan (drag) and Zoom (scroll) implemented.
  - **Hex Interaction:** Mouse hover highlighting (Hex Picking) implemented.
- [x] **E2E Testing:** Configured Playwright for Vite + Nix environment. Added tests for Canvas rendering and zooming.
- [x] **Infrastructure:**
  - Configured Path Aliases (`@/*`) for clean imports.
  - Set up Prettier (`npm run format`) for consistent code style.
  - Added UI foundations (`clsx`, `tailwind-merge`) for Shadcn/UI integration.
  - Exposed `window.game` for runtime debugging.

## 4. Architecture & Documentation

### 4.1. Core Data Model
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

### 4.2. System Architecture
- **Frontend:** React (Vite) + TypeScript.
- **Game Engine:** Custom Controller Pattern (Separated from React).
  - **Pattern:** `React Component` -> `GameController` -> `HexRenderer` / `InputManager`.
  - **Documentation:** See **[src/game/ARCHITECTURE.md](./src/game/ARCHITECTURE.md)** for the detailed breakdown of the Canvas architecture.
- **Backend:** Firebase (Hosting, Firestore, Auth - *Planned*).

## 5. Current Plan
**Role:** Senior Graphics Engineer (TypeScript/Canvas).
**Goal:** Integrate the Game Board data model with the interactive Canvas.

### Phase 1: Canvas & Camera Foundation
- [x] **Step 1.1: Canvas Setup**
    - Create `src/components/GameCanvas.tsx`.
    - Setup full-screen responsive canvas with `useRef`.
    - Implement basic `renderLoop` using `requestAnimationFrame`.
- [x] **Step 1.2: Coordinate System (Hex <-> Pixel)**
    - Implement `hexToPixel(q, r, size)`: Convert axial coordinates to screen coordinates (Flat-Top).
    - Implement `pixelToHex(x, y, size)`: Inverse operation (including `cubeRound` for float handling).
- [x] **Step 1.3: Camera Transform & Grid Rendering**
    - Define `Camera` state: `{ x, y, zoom }` (Rotation is optional for now).
    - Implement `transform` logic in `renderLoop` using `ctx.translate` and `ctx.scale`.
    - Center the coordinate system (0,0) to the middle of the canvas.
    - **Draw a visible grid of hexagons** to verify the layout immediately.
- [x] **Checkpoint 1:**
    - [x] Run app.
    - [x] Verify a grid of empty hexes is drawn.
    - [x] Verify `hexToPixel` matches the visual grid.

### Phase 2: Interaction & Input Handling
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

### Phase 3: Board Integration & Rendering
- [ ] **Step 3.1: Connect Board Model**
    - Instantiate a `Board` in the parent component (`App.tsx` or `Game.tsx`).
    - Pass `Board` to `GameCanvas`.
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
