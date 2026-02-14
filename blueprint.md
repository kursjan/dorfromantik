# Blueprint: Dorfromantik-Style Game

## 1. Overview

This document outlines the architecture, features, and development plan for a web-based, Dorfromantik-style hexagonal grid game.

The project uses a modern frontend stack with React and TypeScript. The UI is built for aesthetics and responsiveness using Tailwind CSS and the shadcn/ui component library. It includes a foundational setup for a Firebase backend to support future game logic, state management, and user data.

## 2. Instructions for Agent

- **Communication:** Be brief and professional. No excessive apologies or flattery.
- **Scope:** Make small changes. Minimize file touches. 
- **Never** do more than necessary or instructed.
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
- **Visualization:** ASCII-based printing for debugging (`BoardPrinter` - currently a stub).

## 4. Implemented Features
- [x] **Project Setup:** React, TypeScript, Tailwind, shadcn/ui (partial), Firebase (config).
- [x] **Verification:** CI-like checks (tsc, curl, vitest) on every change.
- [x] **Core Data Structures:**
  - `HexCoordinate` with validation.
  - `Tile` class with ASCII `print()` method (Flat-Top style).
  - `Board` class for managing tile placement.
  - `Navigation` class implementing neighbor calculations.
- [x] **Testing:** Comprehensive unit tests for models.

## 5. Current Plan
- [ ] **Board Visualization:** Implement `BoardPrinter` to render the full grid in ASCII.
- [ ] **Frontend:** Render the grid in React (Canvas or SVG).
