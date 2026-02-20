# Specification: Expand Data Model (Session & Game)

## Goals
Expand the project's data model to support persistent game sessions, comprehensive game state, and scoring logic. This will enable session-based progress and a fully functional game loop.

## Functional Requirements
- **User Management:** Support a basic `User` model compatible with Firebase authentication.
- **Game Configuration:** Define `GameRules` for flexible game setup (turns, points, etc.).
- **Game State Representation:** 
  - Capture all essential information for a single game (score, board state, turns remaining).
  - Manage a queue of tiles (`tileQueue`) for the player to place.
- **Core Game Logic:** 
  - Implement `placeTile` behavior: pop from queue, place on board, check neighbors, update score and turns.
  - Detect game over condition (`remainingTurns <= 0`).
- **Session Persistence:** Track active and finished games within a `Session` associated with a `User`.

## Data Models (Based on blueprint.md)

### User
- `id`: String (Firebase UID compatible).
- Validation: Ensures non-empty ID.

### GameRules
- `initialTurns`: Number.
- `pointsPerMatch`: Number.

### Game
- `board`: `Board` instance.
- `rules`: `GameRules` instance.
- `score`: Number.
- `remainingTurns`: Number.
- `tileQueue`: `Tile[]`.

### Session
- `user`: `User` instance.
- `games`: `Game[]` (history).
- `activeGame`: (Optional) Current `Game` instance.

## Non-functional Requirements
- **Test-Driven Development (TDD):** Every public method and model behavior must have a corresponding unit test.
- **Logic Isolation:** Business logic for scoring and tile management must be isolated from rendering and UI.
