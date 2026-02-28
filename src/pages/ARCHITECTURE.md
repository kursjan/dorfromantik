# Pages Architecture

The `src/pages/` directory contains top-level route components for the application.

## Structure
- `MainMenu.tsx`: The entry point of the application (`/`), providing game session management and settings.
- `GameBoard.tsx`: The game session view (`/game`), wrapping the `CanvasView` and its associated state.

## Routing
Routing is managed in `src/App.tsx` using `react-router-dom`.
- `/`: `MainMenu`
- `/game`: `GameBoard`
