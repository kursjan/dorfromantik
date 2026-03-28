# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- **Highlight Valid Placement Coordinates:**
  - **GameHints Architecture:** Extracted derived board state (like `validPlacements`) into a dedicated `GameHints` model. This cache is invalidated on tile placement and rotation, avoiding expensive coordinate recalculations on every frame.
  - **UI Visualization:** Implemented a new `VALID_PLACEMENT_STYLE` to visually highlight all valid empty hexes on the board, aiding the player in finding valid placement spots.
  - **Controller Integration:** `CanvasController` now consumes `activeGame.hints.validPlacements` for rendering highlights and optimizing hover detection.

- **Session Context Lean Refactor:**
  - **Granular Contexts:** Decoupled the monolithic `SessionProvider` state into `UserContext`, `GameHistoryContext`, and `ActiveGameContext` to prevent unnecessary component re-renders (e.g., `GameBoard` no longer re-renders when a background auto-save updates the game history list).
  - **Model Cleanup:** Removed the legacy `Session` domain model, migrating its orchestration logic directly to `MainMenu` and `SessionProvider`.
  - **Orchestration Tests:** Added 100% test coverage for `MainMenu.tsx` game creation and orchestration logic.
  - **E2E Synchronization:** Added E2E tests (`e2e/history-sync.spec.ts`) to verify that auto-saves correctly propagate to the main menu without regressions.
  - **Service Isolation:** Fixed state bleed in `InMemoryFirestoreService` by moving mock state from global variables to class instance properties.

- **Autosaver Reliability:** Improved the reliability and visibility of the game's auto-save functionality.
  - **Save on Unmount:** `GameAutosaver` now immediately flushes any pending saves when the user navigates away from the game board, preventing data loss.
  - **Status UI:** Added a non-intrusive status indicator to `GameBoard` (Saving..., Saved, Error) that responds to new lifecycle callbacks in `GameAutosaver`.

- **Service DI Refactor (#50):** Replaced legacy monolithic `AuthService` and `FirestoreService` with a React DI pattern.
  - **Interfaces:** `IAuthService` (with `AuthUser` DTO) and `IFirestoreService`; implementations: `FirebaseAuthService` / `InMemoryAuthService`, `FirebaseFirestoreService` / `InMemoryFirestoreService`.
  - **Wiring:** `ServiceProvider` provides implementations (from `VITE_USE_MOCK_AUTH` or optional injection for tests); `useAuthService()` and `useFirestoreService()` are the only way app code accesses these services.
  - **Consumers:** `SessionProvider`, `UserAccount`, `CanvasView`, and `MainMenu` migrated to use the hooks. Legacy `AuthService.ts` and `FirestoreService.ts` removed.

- **Firestore Integration (Phase 3):** Cloud persistence for game state.
  - **Data Model:** `UserProfileDoc` and `SavedGameDoc` Firestore document interfaces with schema versioning (`SAVED_GAME_VERSION`).
  - **FirestoreService:** Save/load/list game state via `users/{uid}/savedGames/{gameId}` sub-collection, with in-memory mock store for CI/E2E.
  - **Security Rules:** `firestore.rules` enforcing user-scoped read/write (`request.auth.uid == uid`).
  - **Auto-Save:** Debounced save (2s) after each tile placement via `CanvasController.onTilePlaced` callback.
  - **Auto-Load:** `SessionProvider` loads saved games from Firestore on auth, replacing hardcoded demo data.
- **Auth Testing & Coverage (Phase 2.3):** Comprehensive test coverage for the authentication subsystem.
  - **SessionProvider Context Tests:** 8 unit tests verifying `onAuthStateChanged` orchestration, anonymous fallback, session creation for both user types, error states, and cleanup.
  - **E2E Auth Flow Tests:** 8 Playwright tests (mock auth) covering the full login/logout visual flow including anonymous state, Google sign-in upgrade, sign-out, and a regression test for the re-auth cycle (guards against `linkWithPopup` reintroduction).
  - **AuthService Regression Test:** Unit test verifying `signInWithPopup` is always used instead of `linkWithPopup`, even for anonymous users.
- **Mock Auth Strategy (Phase 2.2):** Introduced a robust "Mock Auth" mode to the `AuthService` to unblock CI and E2E testing.
  - **Offline Testing:** When `VITE_USE_MOCK_AUTH=true` is set, the app bypasses the real Firebase SDK and uses deterministic mock users, allowing tests to pass in environments without real API keys (like GitHub Actions).
  - **CI Environment Config:** Added `.env.ci` for dummy credentials and a new `npm run test:e2e:ci` script to run Playwright with CI-specific settings.
  - **GitHub Actions Integration:** Updated the CI workflow to use the new mock-enabled E2E test script, resulting in stable and passing builds.
- **Firebase Authentication (Phase 2):** Implemented full authentication lifecycle using Firebase.
  - **Anonymous Sessions:** Players are automatically assigned a guest ID on app load, allowing immediate play.
  - **Google Account Linking:** Integrated Google Sign-In to allow users to upgrade from a guest session to a permanent account.
  - **User Profile UI:** Added a `UserAccount` component and updated the `MainMenu` and `SettingsModal` to display player identity and login status.
- **Firebase Integration (Initial):** Added the `firebase` SDK and initialization logic for Authentication and Firestore.
- **Game Serialization:** Implemented `GameSerializer` to convert complex class-based game state (Game, Board, Tile, HexCoordinate) into plain JSON for persistent storage and back into functional class instances. This is a critical foundation for cross-session play and cloud saving.
- **Always-on Ghost Preview:** The game now continuously renders a preview of the next tile under the cursor, with distinct styles for valid and invalid placements.
  ...
- **Interactive Camera:** Implemented Panning (drag), Zooming (scroll), and Rotation (Q/E keys).
- **Hex Interaction:** Added "Hex Picking" to detect and highlight the hexagon currently under the mouse cursor.
- **Reset View Button:** Added a polished, styled UI component in the top-right corner to restore the camera to its default state.
- **Storybook Integration:** Set up Storybook for isolated UI component development; added stories for the `ResetViewButton`.
- **E2E Testing:** Configured Playwright for the Vite/Nix environment; added tests for canvas rendering, zooming, and the reset view functionality.
- **Specialized Renderers:** Refactored the canvas engine to use specialized renderers (`Background`, `Hex`, `Debug`) orchestrated by a central `CanvasController`.
- **Rotated Hex System:** Implemented a custom hexagonal coordinate system where "North" is defined as `(-1, 0, 1)` to align with the desired visual orientation.
- **GameScorer:** Extracted scoring logic into a dedicated service for better testability and separation of concerns.

### Fixed

- **Build Stability:** Resolved over 50 TypeScript compilation errors by enforcing stricter type checks (`erasableSyntaxOnly`), correcting domain types (e.g., 'tree' vs 'forest'), and ensuring React component prop safety. This fixed previously failing E2E tests.
- **E2E Test Configuration:** Made the Playwright test runner robust to multi-worktree environments by using environment variables for the server port.
- **Coordinate Mapping:** Fixed an issue where world-to-hex conversion didn't account for camera rotation.
- **Animation Frame Mocks:** Updated unit test mocks to use `globalThis.requestAnimationFrame` for better compatibility.
- **Git Tracking:** Removed accidentally tracked `test-results/` files from version control.
