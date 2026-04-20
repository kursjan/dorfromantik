# Pages Architecture

The `src/pages/` directory contains top-level route components for the application.

## Structure

- `MainMenu.tsx`: The entry point of the application (`/`).
  - **Layout:** Two-column design with a sidebar for new game actions and a main section for continuing saved journeys.
  - **State:** Manages UI state for the `SettingsModal`.
  - **Orchestration:** Responsible for instantiating `GameRules` and `Game` before starting a new game via `setActiveGame`. It also handles continuing existing games by selecting them from the `games` list (Game History Context).
- `GameBoard.tsx`: The active game view (`/game`), wrapping **`SvgGameView`** (dual-rendering track #75; canvas may return in a later phase) and its associated state. Board camera, pointer mapping, and shared **`CameraSnapshot`** / transform helpers are described in **`src/rendering/ARCHITECTURE.md`**; canvas-specific loop details in **`src/rendering/canvas/ARCHITECTURE.md`**.
  - **State Management:** Uses React state to track the `saveStatus` (idle, saved, error) based on `GameAutosaver` callbacks.
  - **Active Game Nullability Convention:** `ActiveGameContext` uses `Game | null` for `activeGame`. `null` is the explicit app-level "no active game" state, while `undefined` remains reserved for optional framework-level values (for example, missing context providers).
  - **Save Status UI:** Renders a minimalist, non-intrusive status overlay in the bottom-right corner when a save completes or fails.
  - **Persistence Lifecycle:** Uses `useEffect` to initialize the `GameAutosaver` and ensures that all pending moves are flushed to Firestore during the cleanup phase (component unmount).

## Routing

Routing is managed in `src/App.tsx` using `react-router-dom`.

- `/`: `MainMenu`
- `/game`: `GameBoard`
