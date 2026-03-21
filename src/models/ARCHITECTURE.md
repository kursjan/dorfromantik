# Models Architecture

This directory contains the core data structures and business logic for the Dorfromantik clone. The models are designed to be framework-agnostic and focused on game state management and scoring logic.

## Key Components

### 1. Hexagonal Coordinate System (`HexCoordinate.ts`, `Navigation.ts`)
- **`HexCoordinate`**: Uses a Cube Coordinate system (q, r, s) where `q + r + s = 0`.
  - **Why not Axial?**: To maintain strict coordinate validation and improve readability, we explicitly use all three coordinates. A `fromAxial(q, r)` helper is deliberately not provided.
- **`Navigation`**: Provides geometric operations for finding neighbors and opposite sides. 
  - **Orientation**: Flat-top hexagons.
  - **North**: defined as `(-1, 0, 1)`.

### 2. Game Entities (`Tile.ts`, `Board.ts`)
- **`Tile`**: Represents a single hexagonal tile with 6 sides of specific terrain types.
  - **`getTerrains()`**: Returns a `Record<Direction, TerrainType>` mapping all directions to their respective terrain types.
  - **`rotateClockwise()` / `rotateCounterClockwise()`**: Returns a *new* Tile instance with shifted terrain properties.

### 3. Session & Rules (`User.ts`, `GameRules.ts`, `Session.ts`)
- **`User`**: Represents a player identity. It supports both **Anonymous Guests** (auto-assigned on app load) and **Permanent Accounts** (linked via Google). It tracks `id`, `isAnonymous`, and `displayName`.
- **`GameRules`**: Configurable settings for a game (initial turns, points per match).
- **`Session`**: Manages a user's game lifecycle, including their current `activeGame` and a history of finished `games`.

### 4. Services & Providers
- **Auth / Firestore**: Accessed only via React context. `ServiceProvider` (see `src/services/ARCHITECTURE.md`) supplies `IAuthService` and `IFirestoreService` implementations; components use `useAuthService()` and `useFirestoreService()`.
- **`SessionProvider`**: A React context provider that manages the user's current `Session`. It uses injected auth and firestore services to listen to auth changes, initialize the `User` model, and maintain the list of available saved games. It no longer handles game orchestration (logic moved to pages like `MainMenu`).

### 5. Game Engine (`Game.ts`)
The `Game` class is the central orchestrator of an active session.
- **State**: Tracks the `Board`, `Score`, and the `TileQueue`.
- **Turns as Tiles**: The game follows a "Tiles are Turns" philosophy. `remainingTurns` is a derived property of `tileQueue.length`.
- **Lifecycle**:
  - **Start**: Typically created via static factory methods: `Game.create(rules)`. These methods handle initializing the `Board` and placing the initial "starter" tile at the origin `(0, 0, 0)`. In the current architecture, these factories are called by page components (e.g., `MainMenu`).
  - **Active**: Managed within a `Session`.
  - **Logic**:
    - **`isValidPlacement(coord)`**: Checks if a hex is empty and adjacent to at least one existing tile. Used for UI validation and Ghost Preview.
    - **`placeTile(coord)`**: The primary game action. It places a tile, delegates scoring to `GameScorer`, and updates the score and queue.
    - **`rotateQueuedTileClockwise()` / `rotateQueuedTileCounterClockwise()`**: Rotates the tile currently at the head of the queue.
    - **`peek()`**: Allows the UI to preview the next tile in the queue.

### 5. Scoring Logic (`GameScorer.ts`)
Encapsulates all rules related to points and bonuses.
- **Separation of Concerns**: Extracted from `Game` to keep the engine focused on state orchestration.
- **`scorePlacement(board, tile)`**: Calculates the score for a newly placed tile, including:
  - **Match Points**: Points for each matching edge with a neighbor.
  - **Perfect Bonus**: Checks if the placed tile or any of its neighbors have become "Perfect".
- **`isPerfect(board, boardTile)`**: Helper to determine if a tile at the given coordinate has 6 matching neighbors.

### 6. Persistence & Serialization (`GameSerializer.ts`)
The `GameSerializer` class is responsible for converting complex class-based game state into plain JSON and back.
- **Goal:** Enable storing and loading game state from Firebase/Firestore without losing the behavioral methods and properties of the class instances.
- **Scope:** It recursively handles:
  - `Game` (ID, name, score, metadata)
  - `Board` (A Map of coordinates to tiles)
  - `Tile` (Terrain types for all 6 sides, rotation-stable IDs)
  - `HexCoordinate` (Cube coordinate system validation)
- **Pattern:** Each `serialize` method returns a `JSON` interface (e.g., `GameJSON`), and each `deserialize` method reconstructs the class instance (e.g., `new Game(...)`).

### 7. Perfect Placement Scoring
The game implements the "Perfect Placement" bonus (Steam rules):
- **Definition**: A tile is "Perfect" if all 6 of its neighbors exist and their touching terrains match exactly.
- **Bonus**: Each placement that results in a tile *becoming* perfect awards:
  - **+60 points** (in addition to standard edge-matching points).
  - **+1 extra tile** added to the `tileQueue` (extending the game's duration).
- **Cascades**: A single placement can trigger up to 7 perfect bonuses (the newly placed tile + its 6 neighbors).

## Interactions

1.  **Placement Flow**: `Game` -> `Board.canPlace()` -> `Board.place()` -> `Navigation.getNeighbors()` -> `Tile.getTerrain()`.
2.  **Scoring**: When a tile is placed, the `Game` checks all 6 adjacent coordinates using `Navigation`. If a neighbor exists, it compares the touching terrains using `Navigation.getOpposite()`.

## Design Principles
- **Immutability where possible**: Entity properties like `HexCoordinate` and `GameRules` are `readonly`.
- **Explicit Accessors**: Methods like `Tile.getTerrain(direction)` are preferred over direct property access for clarity.
- **Single Source of Truth**: Game state (like turns) is derived from primary data (the queue) to prevent sync errors.
