# Blueprint: Dorfromantik-Style Game

## 1. Overview

This document outlines the architecture, features, and development plan for a web-based, Dorfromantik-style hexagonal grid game.

The project uses a modern frontend stack with React and TypeScript. The UI is built for aesthetics and responsiveness using Tailwind CSS and the shadcn/ui component library. It includes a foundational setup for a Firebase backend to support future game logic, state management, and user data.

## 2. Instructions for Agent

- **Communication:** Be brief and professional. No excessive apologies or flattery.
- **Scope:** Make small changes. Minimize file touches. 
- **Never** do more than necessary or instructed.
- **Never** do anything unless explicitly asked. 
- **Update tests** remember to update tests after changing business logic.
- **Verification Protocol:** 
  - **AUTOMATIC EXECUTION:** After *every* code change, you MUST automatically run the following commands. **Do not ask for permission. Do not announce you are going to do it. Just run them and report the results.**
  1. **Type Check:** `npx tsc` (Ensure no compilation errors)
  2. **Server Check:** `curl -I http://localhost:9002/` (Ensure server is reachable). Note: Port may vary.
  3. **Test Check:** `npx vitest run` (Ensure all tests pass)
  4. **Test Check:** use `npx vitest run` instead of `pnx vitest`

## 3. Design Decisions
- **Architecture:** Web-based React app + Firebase backend (planned).
- **Grid System:** Hexagonal Grid using **Cube Coordinates** (`q, r, s`).
- **Orientation:** **Flat-Top** Hexagons.
  - Neighbors: North, North-East, South-East, South, South-West, North-West.
- **Navigation (Cube Coordinates):**
  - **Center:** (0, 0, 0)
  - **North:** (-1, 0, 1)
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

## 4. Implemented Features
- [x] **Project Setup:** React, TypeScript, Tailwind, shadcn/ui (partial), Firebase (config).
- [x] **Verification:** CI-like checks (tsc, curl, vitest) on every change.
- [x] **Core Data Structures:**
  - `HexCoordinate` with validation.
  - `Tile` class with ASCII `print()` method (Flat-Top style).
  - `Board` class for managing tile placement.
  - `Navigation` class implementing neighbor calculations.
- [x] **Testing:** Comprehensive unit tests for models.
- [x] **Board Visualization:** Implemented `BoardPrinter`, `Canvas`, and `TilePrinter` to render the full grid in ASCII.

## 5. Current Plan
Role: You are a Senior Graphics Engineer specializing in TypeScript and High-Performance Canvas Rendering.
Goal: Implement a 2D Camera system for a DorfRomantik game that supports Zoom, Pan, Rotation, and "Mouse-to-Hex" picking.

1. Architectural Requirements
Decoupled State: Maintain a strict separation between WorldSpace (Hex coordinates) and ScreenSpace (Canvas pixels).

Transformation Matrix: Do not manually offset every hex. Use the Canvas context.save(), translate(), scale(), rotate(), and restore() pattern for the global camera.

The Model: Use the existing model: Board, Tile, HexCoordinates, Navigation ...

The Viewport: Define a Camera type: { x: number, y: number, zoom: number, rotation: number }.

2. Core Functions to Implement
hexToWorld(q, r, size): Convert Axial/Cube to pixel (x, y) in world space.

worldToHex(x, y, size): The inverse. Must include a cubeRound() helper to handle floating-point results from mouse clicks.

renderLoop(): A high-performance loop using requestAnimationFrame.

handleInput(): Implement "Click-to-Select" logic that uses the worldToHex function to identify which BoardTile was clicked.

3. Coding Standards
Strict Typing: Use the HexCoordinate and BoardTile interfaces already defined.

Performance: Avoid object allocation inside the renderLoop.

React Integration: The Canvas should be managed via a useRef<HTMLCanvasElement> and its size should be responsive to the window.