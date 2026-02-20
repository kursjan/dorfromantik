# Product Guide

## Initial Concept
A web-based, casual strategy game inspired by Dorfromantik, built with React and HTML5 Canvas. The core mechanic involves placing hexagonal tiles to build a sprawling landscape.

## Vision
To create a relaxing, puzzle-like experience for casual gamers where they can build beautiful landscapes without the pressure of time limits or complex resource management.

## Key Features
- **Hexagonal Grid System:** A robust coordinate system for tile management.
- **Tile Placement:** Intuitive drag-and-drop or click-to-place mechanics for expanding the board.
- **Dynamic Rendering:** Smooth 2D canvas rendering with pan and zoom capabilities.
- **Minimalist Aesthetic:** Clean, flat vector graphics that are easy on the eyes.

## Technical Architecture

### Core Data Model
- **Grid System:** Hexagonal Grid using **Cube Coordinates** (`q, r, s`).
- **Orientation:** **Flat-Top** Hexagons.
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
  - `Tile`: Class with explicit edge properties (e.g., `north`, `northEast`).
  - `Board`: Class encapsulating a `Map` of tiles, indexed by coordinate key. Prevents placement on occupied spots.

### System Architecture
- **Frontend:** React (Vite) + TypeScript.
- **Canvas Engine:** Custom Controller Pattern (Decoupled from React).
  - **Pattern:** `React Component` -> `CanvasController` -> `Renderers` / `InputManager`.
  - **Documentation:** See **[src/canvas/ARCHITECTURE.md](./src/canvas/ARCHITECTURE.md)**.
- **Backend:** Firebase (Hosting, Firestore, Auth).

## Project Metadata
- **Target Audience:** Casual gamers looking for a low-stress, creative outlet.
- **Platform:** Desktop Web (Mouse/Keyboard controls).

## Roadmap & Planning
The project roadmap is managed via **Conductor**. See **[conductor/tracks.md](./tracks.md)** for current and planned tracks.

## Implemented Features

- [x] **Project Setup:** React, TypeScript, Tailwind, shadcn/ui (partial), Firebase (config).
- [x] **Verification:** CI-like checks (tsc, curl, vitest) on every change.
- [x] **Core Data Structures:**
  - `HexCoordinate` with validation.
  - `Tile` class with ASCII `print()` method (Flat-Top style).
  - `Board` class for managing tile placement.
  - `Navigation` class implementing neighbor calculations.
- [x] **Board Visualization (Canvas):**
  - Basic `CanvasView` component with a render loop.
  - `HexUtils` updated for custom coordinate system (North is `-1, 0, 1` relative to center).
  - `HexStyles` configuration for centralized styling.
  - `drawDebugGrid` for visualizing the hex grid and coordinates.
  - **Interactive Camera:** Pan (drag), Zoom (scroll), and Rotation (Q/E) implemented.
  - **Hex Interaction:** Mouse hover highlighting (Hex Picking) implemented.
  - **Refactored Rendering:** Separated rendering logic into specialized renderers (`BackgroundRenderer`, `HexRenderer`, `DebugRenderer`) orchestrated by `CanvasController`.
  - **Reset Camera Button:** Added a polished UI component with Storybook stories and E2E verification.
- [x] **Testing & Infrastructure:**
  - Configured Playwright for Vite + Nix environment.
  - Set up Prettier (`npm run format`) and Path Aliases (`@/*`).
  - Set up Storybook for UI component isolation.
