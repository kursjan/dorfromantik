# Pages Architecture

The `src/pages/` directory contains top-level route components for the application.

## Structure
- `MainMenu.tsx`: The entry point of the application (`/`).
  - **Layout:** Two-column design with a sidebar for new game actions and a main section for continuing saved journeys.
  - **State:** Manages UI state for the `SettingsModal` and placeholder data for `GameCard` lists.
- `GameBoard.tsx`: The game session view (`/game`), wrapping the `CanvasView` and its associated state.
  - **State Management:** Uses React state to track the `saveStatus` (idle, saved, error) based on `GameAutosaver` callbacks.
  - **Save Status UI:** Renders a minimalist, non-intrusive status overlay in the bottom-right corner when a save completes or fails.
  - **Persistence Lifecycle:** Uses `useEffect` to initialize the `GameAutosaver` and ensures that all pending moves are flushed to Firestore during the cleanup phase (component unmount).

## Routing
Routing is managed in `src/App.tsx` using `react-router-dom`.
- `/`: `MainMenu`
- `/game`: `GameBoard`
