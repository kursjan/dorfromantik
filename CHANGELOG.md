# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Interactive Camera:** Implemented Panning (drag), Zooming (scroll), and Rotation (Q/E keys).
- **Hex Interaction:** Added "Hex Picking" to detect and highlight the hexagon currently under the mouse cursor.
- **Reset View Button:** Added a polished, styled UI component in the top-right corner to restore the camera to its default state.
- **Storybook Integration:** Set up Storybook for isolated UI component development; added stories for the `ResetViewButton`.
- **E2E Testing:** Configured Playwright for the Vite/Nix environment; added tests for canvas rendering, zooming, and the reset view functionality.
- **Specialized Renderers:** Refactored the canvas engine to use specialized renderers (`Background`, `Hex`, `Debug`) orchestrated by a central `CanvasController`.
- **Rotated Hex System:** Implemented a custom hexagonal coordinate system where "North" is defined as `(-1, 0, 1)` to align with the desired visual orientation.

### Fixed
- **Coordinate Mapping:** Fixed an issue where world-to-hex conversion didn't account for camera rotation.
- **Animation Frame Mocks:** Updated unit test mocks to use `globalThis.requestAnimationFrame` for better compatibility.
- **Git Tracking:** Removed accidentally tracked `test-results/` files from version control.
