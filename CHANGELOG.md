# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
### Added

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
