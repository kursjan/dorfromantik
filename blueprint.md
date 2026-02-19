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
  - **Interactive Camera:** Pan (drag), Zoom (scroll), and Rotation (Q/E) implemented.
  - **Hex Interaction:** Mouse hover highlighting (Hex Picking) implemented.
  - **Refactored Rendering:** Separated rendering logic into specialized renderers (`BackgroundRenderer`, `HexRenderer`, `DebugRenderer`) orchestrated by `CanvasController`.
  - **Reset Camera Button:** Added a polished UI component with Storybook stories and E2E verification.
- [x] **E2E Testing:** Configured Playwright for Vite + Nix environment. Added tests for Canvas rendering, zooming, and camera reset.
- [x] **Infrastructure:**
  - Configured Path Aliases (`@/*`) for clean imports.
  - Set up Prettier (`npm run format`) for consistent code style.
  - Added UI foundations (`clsx`, `tailwind-merge`) for Shadcn/UI integration.
  - Exposed `window.canvas` for runtime debugging.
  - Set up Storybook for UI component isolation.

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

## Decision Log
