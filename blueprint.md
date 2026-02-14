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

## 3. Design Decisions
- Web-based app, with frontent and backend
- Use Cube coordinates to represent hexagonal grid
  - point up
- Data Model:
  - `Tile`: Explicit edge properties (northEast, east, etc.)
  - `Board`: **Class** encapsulating a `Map<string, BoardTile>`. Handles key generation internally.

## 4. Plan

- [x] Verify the app is running
- [x] Setup backend data model
  - [x] Tile interface
  - [x] HexCoordinate interface
  - [x] Board Class (Refactor from Map)
