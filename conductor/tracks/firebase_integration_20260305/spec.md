# Specification: Firebase Auth & Storage Integration

## Goal
Implement Firebase Authentication to allow players to start playing instantly (anonymous auth) and later upgrade to a permanent account (e.g., Google or Email). Implement Firestore to persistently save the game state so players can resume their games across sessions and devices.

## Scope
1.  **Firebase Infrastructure:** Setup `firebase` SDK and initialization logic.
2.  **Serialization:** Create a robust `GameSerializer` to convert complex game class instances (Board, Tile, HexCoordinate) into plain JSON and back.
3.  **Authentication:**
    *   Anonymous login by default on app load.
    *   UI to upgrade to a permanent account.
    *   State management via `SessionContext`.
4.  **Firestore Sync:**
    *   Data models for `users` and `games`.
    *   Debounced saving of the game state to Firestore after each turn.
    *   Loading game state on initialization.

## Out of Scope
*   Complex social features (friends lists, multiplayer).
*   Global leaderboards (will focus purely on saving current game state and local user profile for now).
*   Migrating existing browser `localStorage` data (we are starting fresh with Firebase).

## Technical Requirements
*   **Firebase:** Use the official `firebase` npm package.
*   **Testing:** Heavily mock Firebase services in unit tests (Vitest). Do not rely on local emulators for automated tests in this track to ensure reliability.
*   **Serialization:** The `GameSerializer` must be rigorously tested to ensure no state loss (especially deep objects like `HexCoordinate` inside `Tile` instances on the `Board`).