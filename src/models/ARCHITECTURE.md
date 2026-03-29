# Models Architecture

This directory contains the core data structures and business logic for the Dorfromantik clone. The models are designed to be framework-agnostic and focused on game state management and scoring logic.

## Key Components

### 1. Hexagonal Coordinate System (`HexCoordinate.ts`, `Navigation.ts`)

- **`HexCoordinate`**: Uses a Cube Coordinate system (q, r, s) where `q + r + s = 0`.
  - **Why not Axial?**: To maintain strict coordinate validation and improve readability, we explicitly use all three coordinates. A `fromAxial(q, r)` helper is deliberately not provided.
- **`Navigation`**: Provides geometric operations for finding neighbors and opposite sides.
  - **Orientation**: Flat-top hexagons.
  - **North**: defined as `(-1, 0, 1)`.

### 2. Terrain & Tiles (`Terrain.ts`, `Tile.ts`, `TileValidator.ts`)

- **`Terrain`**: Class-based terrains per edge (and optional tile center). **`TerrainType`** is the small palette used for random generation and color (`tree`, `house`, `water`, `pasture`, `rail`, `field`). **`TerrainId`** extends that with `waterOrPasture` for hybrid edges that may match water or pasture on the neighbor. **`Terrain.matchesForEdge(other)`** compares the two sides for placement and scoring using overlapping type sets. `WaterTerrain` and `RailTerrain` can optionally be configured with `linkToCenter`.
- **`Tile`**: Holds six `Terrain` sides plus optional `center`; omitted sides default to `PastureTerrain` at construction time.
  - **`getTerrains()` / `getTerrain(direction)`**: Return `Terrain` instances (use `.id` or helpers when a string key is needed).
  - **`rotateClockwise()` / `rotateCounterClockwise()`**: Return a _new_ `Tile` with rotated terrains; `id` is preserved for stable UI keys.
- **`TileValidator`**: Validates new tiles (real `Terrain` instances, linked-water vs center rules, etc.).

### 3. Board (`Board.ts`, `BoardNavigation.ts`)

- **`Board`**: Manages placement on the grid.
  - **`getValidPlacementCoordinates()`**: Empty cells adjacent to at least one tile — the geometric basis for valid placement. **`GameHints`** recomputes a cached `validPlacements` array from this (and related rules) so the canvas loop does not call into the board graph on every frame.
  - **`getExistingNeighborsAt(coord)`**: Directions to placed neighbor tiles (used by navigation helpers).
- **`BoardNavigation`**: Static board queries for now (no instance state). **`neighborEdgeTerrains(board, coord)`** returns, for each direction with a neighbor, the neighbor’s terrain on the shared edge — used when drawing tiles (e.g. `waterOrPasture`) against the real board.

### 4. User & Rules (`User.ts`, `GameRules.ts`)

- **`User`**: Represents a player identity. It supports both **Anonymous Guests** (auto-assigned on app load) and **Permanent Accounts** (linked via Google). It tracks `id`, `isAnonymous`, and `displayName`.
- **`GameRules`**: Configurable settings for a game (initial turns, points per match), tile generators, and test factories such as `createTest2()` (water-center starter, mixed water/pasture edges; queue tiles pasture with one rotating water edge).

### 5. Services & Providers

- **Auth / Firestore**: Accessed only via React context. `ServiceProvider` (see `src/services/ARCHITECTURE.md`) supplies `IAuthService` and `IFirestoreService` implementations; components use `useAuthService()` and `useFirestoreService()`.
- **`SessionProvider`**: A React context provider that manages the user's current session state (user, game history, and active game). It uses injected auth and firestore services to listen to auth changes, initialize the `User` model, and maintain the list of available saved games. It no longer handles game orchestration (logic moved to pages like `MainMenu`).

### 6. Game Engine (`Game.ts`)

The `Game` class is the central orchestrator of an active game.

- **State**: Tracks the `Board`, `Score`, `TileQueue`, and `GameHints`.
- **Turns as Tiles**: The game follows a "Tiles are Turns" philosophy. `remainingTurns` is a derived property of `tileQueue.length`.
- **GameHints**: Caches derived hints, such as `validPlacements`, to avoid recalculating complex board state on every frame. Invalidates cache on `placeTile` and tile rotation.
- **Lifecycle**:
  - **Start**: Typically created via static factory methods: `Game.create(rules)`. These methods handle initializing the `Board` and placing the initial "starter" tile at the origin `(0, 0, 0)`. In the current architecture, these factories are called by page components (e.g., `MainMenu`).
  - **Active**: Managed within the `ActiveGameContext`.
  - **Logic**:
    - **`isValidPlacement(coord)`**: Checks if a hex is empty, adjacent to at least one existing tile, and that strict edges (e.g., `water`, `rail`) match perfectly. It delegates to `PlacementValidator`. Used for UI validation and Ghost Preview.
    - **`placeTile(coord)`**: The primary game action. It places a tile, delegates scoring to `GameScorer`, and updates the score and queue.
    - **`rotateQueuedTileClockwise()` / `rotateQueuedTileCounterClockwise()`**: Rotates the tile currently at the head of the queue.
    - **`peek()`**: Allows the UI to preview the next tile in the queue.

### 7. Scoring Logic (`GameScorer.ts`)

Encapsulates all rules related to points and bonuses.

- **Separation of Concerns**: Extracted from `Game` to keep the engine focused on state orchestration.
- **`scorePlacement(board, tile)`**: Calculates the score for a newly placed tile, including:
  - **Match Points**: Points for each matching edge with a neighbor.
  - **Perfect Bonus**: Checks if the placed tile or any of its neighbors have become "Perfect".
- **`isPerfect(board, boardTile)`**: Helper to determine if a tile at the given coordinate has 6 matching neighbors.

### 8. Persistence & Serialization (`GameSerializer.ts`)

The `GameSerializer` class is responsible for converting complex class-based game state into plain JSON and back.

- **Goal:** Enable storing and loading game state from Firebase/Firestore without losing the behavioral methods and properties of the class instances.
- **Scope:** It recursively handles:
  - `Game` (ID, name, score, metadata)
  - `Board` (A Map of coordinates to tiles)
  - `Tile` (`TerrainId` per side and optional center in JSON; `toTerrain()` rebuilds class instances, rotation-stable tile `id`)
  - `HexCoordinate` (Cube coordinate system validation)
- **Pattern:** Each `serialize` method returns a `JSON` interface (e.g., `GameJSON`), and each `deserialize` method reconstructs the class instance (e.g., `new Game(...)`).

### 9. Perfect Placement Scoring

The game implements the "Perfect Placement" bonus (Steam rules):

- **Definition**: A tile is "Perfect" if all 6 of its neighbors exist and their touching terrains match exactly.
- **Bonus**: Each placement that results in a tile _becoming_ perfect awards:
  - **+60 points** (in addition to standard edge-matching points).
  - **+1 extra tile** added to the `tileQueue` (extending the game's duration).
- **Cascades**: A single placement can trigger up to 7 perfect bonuses (the newly placed tile + its 6 neighbors).

## Interactions

1.  **Placement Flow**: `Game` -> `Board.canPlace()` -> `Board.place()` -> `Navigation.getNeighbors()` -> `Tile.getTerrain()`.
2.  **Scoring**: When a tile is placed, the `Game` checks all 6 adjacent coordinates using `Navigation`. If a neighbor exists, it compares the two touching `Terrain` instances via `Terrain.matchesForEdge()` (after resolving opposite directions with `Navigation.getOpposite()`).

## Design Principles

- **Immutability where possible**: Entity properties like `HexCoordinate` and `GameRules` are `readonly`.
- **Explicit Accessors**: Methods like `Tile.getTerrain(direction)` are preferred over direct property access for clarity.
- **Single Source of Truth**: Game state (like turns) is derived from primary data (the queue) to prevent sync errors.
