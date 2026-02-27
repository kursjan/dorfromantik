# Track: Main Menu UI and Routing

## Phase 1: Setup Routing & Barebones Menu
- [ ] Create and switch to feature branch `feat/main-menu-ui` using **task-conductor** skill.
- [ ] Install `react-router-dom` using **task-conductor** skill.
- [ ] Update all existing Playwright E2E tests (`canvas.spec.ts`, `rotation.spec.ts`, `reset-view.spec.ts`, `grid.spec.ts`, `debug-overlay.spec.ts`, `hud.spec.ts`) to navigate directly to `/game` using **task-conductor** skill.
- [ ] Create a minimal `src/pages/MainMenu.tsx` with a plain HTML `<button>` labeled "Start Game" that routes to `/game` using **task-conductor** skill.
- [ ] Create `src/pages/GameBoard.tsx` to wrap `CanvasView` using **task-conductor** skill.
- [ ] Refactor `src/App.tsx` to include `<BrowserRouter>` and define routes: `/` and `/game` using **task-conductor** skill.
- [ ] Create a basic E2E test `e2e/main-menu.spec.ts` to verify clicking the unstyled button routes to `/game` using **task-conductor** skill.
- [ ] **Phase Gate**: User manually verifies the barebones menu routes to the game successfully using **project-orchestrator** skill.

## Phase 2: Main Menu UI Implementation
- [ ] Create `src/components/GameCard.tsx` and a placeholder `src/components/SettingsModal.tsx` using **task-conductor** skill.
- [ ] Implement the Forest Green/Parchment styling and glassmorphism look on `MainMenu.tsx` using **task-conductor** skill.
- [ ] Add the full layout to `MainMenu.tsx`: Game List placeholders, "Start Standard Game", "Start Test Game", "Settings" (toggles modal), and "Logout" using **task-conductor** skill.
- [ ] **Phase Gate**: Verify UI components and styling rendering properly using **project-orchestrator** skill.

## Phase 3: Data Integration & Menu E2E Test
- [ ] Connect the `Session` model to the `MainMenu` to correctly populate the scrollable list of saved games using **task-conductor** skill.
- [ ] Ensure the styled "Start Game" buttons correctly trigger a new game state and navigate to `/game` using **task-conductor** skill.
- [ ] Update the `e2e/main-menu.spec.ts` test to verify the new styled buttons and the Settings modal toggle using **task-conductor** skill.
- [ ] **Final Track Gate**: Final verification and Git commit using **project-orchestrator** skill.