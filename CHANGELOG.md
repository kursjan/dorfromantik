# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- **Always-on Ghost Preview:** The game now continuously renders a preview of the next tile under the cursor, with distinct styles for valid and invalid placements.
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
