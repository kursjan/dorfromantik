# Models Architecture

This directory contains the core data structures and business logic for the Dorfromantik clone. The models are designed to be framework-agnostic and focused on game state management and scoring logic.

## Key Components

### 1. Hexagonal Coordinate System (`HexCoordinate.ts`, `Navigation.ts`)
- **`HexCoordinate`**: Uses a Cube Coordinate system (q, r, s) where `q + r + s = 0`.
- **`Navigation`**: Provides geometric operations for finding neighbors and opposite sides. 
  - **Orientation**: Flat-top hexagons.
  - **North**: defined as `(-1, 0, 1)`.

### 2. Game Entities (`Tile.ts`, `Board.ts`)
- **`Tile`**: Represents a single hexagonal tile with 6 sides of specific terrain types.
- **`Board`**: A collection of placed tiles mapped to their coordinates. It handles spatial queries and placement validation.

### 3. Session & Rules (`User.ts`, `GameRules.ts`, `Session.ts`)
- **`User`**: Basic user identity, compatible with Firebase UID.
- **`GameRules`**: Configurable settings for a game (initial turns, points per match).
- **`Session`**: Manages a user's game lifecycle, including their current `activeGame` and a history of finished `games`.

### 4. Game Engine (`Game.ts`)
The `Game` class is the central orchestrator of an active session.
- **State**: Tracks the `Board`, `Score`, and the `TileQueue`.
- **Turns as Tiles**: The game follows a "Tiles are Turns" philosophy. `remainingTurns` is a derived property of `tileQueue.length`.
- **Logic**:
  - **`placeTile(coord)`**: The primary game action. It pops a tile from the queue, places it on the board, and calculates matching terrain scores with all neighbors.
  - **`peek()`**: Allows the UI to preview the next tile in the queue.

## Interactions

1.  **Placement Flow**: `Game` -> `Board.canPlace()` -> `Board.place()` -> `Navigation.getNeighbors()` -> `Tile.getTerrain()`.
2.  **Scoring**: When a tile is placed, the `Game` checks all 6 adjacent coordinates using `Navigation`. If a neighbor exists, it compares the touching terrains using `Navigation.getOpposite()`.

## Design Principles
- **Immutability where possible**: Entity properties like `HexCoordinate` and `GameRules` are `readonly`.
- **Explicit Accessors**: Methods like `Tile.getTerrain(direction)` are preferred over direct property access for clarity.
- **Single Source of Truth**: Game state (like turns) is derived from primary data (the queue) to prevent sync errors.
