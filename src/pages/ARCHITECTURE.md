# Pages Architecture

The `src/pages/` directory contains top-level route components for the application.

## Structure
- `MainMenu.tsx`: The entry point of the application (`/`).
  - **Layout:** Two-column design with a sidebar for new game actions and a main section for continuing saved journeys.
  - **State:** Manages UI state for the `SettingsModal` and placeholder data for `GameCard` lists.
- `GameBoard.tsx`: The game session view (`/game`), wrapping the `CanvasView` and its associated state.

## Routing
Routing is managed in `src/App.tsx` using `react-router-dom`.
- `/`: `MainMenu`
- `/game`: `GameBoard`
