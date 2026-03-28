# Tech Stack

This document defines the core technologies, architectural patterns, and quality standards for the Dorfromantik clone project.

## Core Language & Frameworks

- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode enabled)
- **Frontend Framework:** [React 19](https://react.dev/) (Functional components with Hooks)
- **Routing:** [React Router 7](https://reactrouter.com/)
- **State Management:** React Context API (Granular contexts: User, GameHistory, ActiveGame)
- **Runtime Optimization:** React Compiler (Enabled by default for automatic memoization)
- **Build Tool:** [Vite](https://vitejs.dev/)

## Infrastructure & Deployment

- **Platform:** [Firebase](https://firebase.google.com/) (Auth & Firestore)
- **Development Environment:** [Project IDX](https://idx.google.com/) (Configured via `.idx/dev.nix`)
- **IDE:** Code OSS (Integrated with Firebase Studio)

## Architectural Patterns (High Performance 2D)

### Persistence & Serialization

- **GameSerializer:** A specialized utility to convert complex class-based game state (Game, Board, Tile, HexCoordinate) into plain JSON for Firebase storage and back into class instances.
- **Auth & Firestore (DI):** Auth and Firestore are accessed only via React context. `ServiceProvider` supplies `IAuthService` and `IFirestoreService` implementations; components use `useAuthService()` and `useFirestoreService()`. Real implementations use Firebase; in-memory implementations support tests and CI/E2E.
- **Firestore:** Persistent storage for user profiles and saved game states.

### Canvas Controller Pattern

- **Pattern:** Decouples React from the Canvas API.
- **React's Role:** Manages the `<canvas>` element lifecycle and hosts DOM-based UI overlays (HUD, menus).
- **Controller's Role:** A pure TypeScript class (`CanvasController`) that owns the game state, handles the `requestAnimationFrame` loop, and orchestrates specialized renderers.

### Domain-Driven Design & Centralization

- **"Tiles are Turns" Philosophy:** `remainingTurns` is a derived property (getter) of `tileQueue.length`.
- **GameHints Caching:** Derived game state properties (like valid placements) are cached in a `GameHints` model and invalidated upon board mutations (e.g. tile placement, rotation) to avoid expensive recalculations on every frame.
- **Geometric Logic Centralization:** All directional logic (neighbors, opposite sides) must reside in the `Navigation` service.
- **Explicit Domain Accessors:** Prefer explicit methods like `Tile.getTerrain(direction)` over direct property access.
- **Terrain instances:** Tile edges (and optional centers) are `Terrain` subclasses in `Terrain.ts` (`TerrainId`, `TerrainType`, `matchesForEdge` for scoring and placement). Saves store `TerrainId` strings per cell and reconstruct via `toTerrain()`.
- **Fail-Fast State:** The `CanvasController` throws an error if `activeGame` is missing.

### Graphics & Rendering

- **Rotated Hexagonal Coordinate System:** "Flat-Top" orientation where North is `(-1, 0, 1)`.
- **Terrain segment renderers:** `TileRenderer` dispatches each wedge to a per-`TerrainId` renderer under `src/canvas/graphics/segmentRenderers/`, with optional neighbor edge terrain for hybrid drawing.
- **Type Safety:** Use `import type` for model imports in graphics files to ensure clean browser stripping.

## Styling & UI

- **Primary Styling:** Vanilla CSS and CSS Modules (for maximum flexibility and performance).
- **Iconography:** Interactive iconography and modern UI components (cards with depth, glow effects on interactive elements).
- **Responsive Design:** Mobile-first approach, ensuring functionality across mobile and web.

## Testing & Quality Assurance

- **Unit & Integration Testing:** [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **End-to-End (E2E) Testing:** [Playwright](https://playwright.dev/)
- **Component Development & Documentation:** [Storybook](https://storybook.js.org/) (including Vitest-based stories where configured via `.storybook/vitest.setup.ts`)
- **Automated Refactoring:** [Putout](https://github.com/coderaiser/putout)
- **Code Quality:** [ESLint](https://eslint.org/) (for linting) and [Prettier](https://prettier.io/) (for formatting)
- **Quality Gates:** Target >80% code coverage for all new modules.

## Project Management

- **Task Tracking:** Conductor (via `plan.md` and `spec.md` in `conductor/tracks/`)
- **Issue Tracking:** GitHub Issues
- **Source Control:** Git (Task-based branching strategy)
