# Plan: Dual Rendering Engines (Canvas & SVG) (#75)

## Input parity scope (canvas reference)

The canvas path implements board interaction through `InputManager` + `CanvasController` (`src/rendering/canvas/engine/`). SVG must match this **behavior** (not necessarily the same class layout):

| Channel  | Canvas behavior (reference)                                                                                                                                                         |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pointer  | Hover (local px → world/hex), wheel zoom, left-drag pan after threshold vs left-click place, right-click rotate CW, Shift+right-click CCW, `contextmenu` suppressed                 |
| Keyboard | **R** / **F** discrete tile rotation; **Q** / **E** held → continuous camera rotation (via `getRotationDirection` in the rAF loop); **F3** toggles debug overlay (`preventDefault`) |
| Window   | `resize` invalidates layout / hit-testing as on canvas                                                                                                                              |
| Bridge   | Same game snapshot bridge as `CanvasView` (`useGameSnapshotBridge`, placement, scoring)                                                                                             |

**Split view (later phase):** When two boards are mounted, define a **focus model** (e.g. last pointer-down on a surface receives window keyboard until focus moves) so **Q/E/R/F/F3** are unambiguous.

---

## Phase 1: SVG Engine Integration

- [x] Ensure we are on the `worker1` branch using **task-conductor** skill.
- [x] Create a `useSvgBoardPointerCamera` hook to manage pan (drag) and zoom (scroll) state using standard DOM events using **task-conductor** skill.
- [x] Create `SvgGameView.tsx` (matching `CanvasView` props) that maps `activeGame.board` to `SvgBoardTile[]` and integrates the camera hook. Temporarily hardcode `GameBoard.tsx` to render only `SvgGameView` using **task-conductor** skill.
- [x] **Phase Gate**: Verify basic SVG rendering and camera (pan/zoom) interactions using **project-orchestrator** skill.

## Phase 2: SVG Input Parity (Pointer & Basic)

- [x] Implement a single coordinated **pointer layer** on the SVG board surface: hover with local coordinates, **wheel** zoom and **left-drag pan** after the shared drag threshold (reuse `PointerPanZoomSession` / `useSvgBoardPointerCamera` patterns), **left-click** placement when below threshold, **right-click** / **Shift+right-click** tile rotation, and `contextmenu` prevention — equivalent to canvas pointer handling. Prefer **DRY** shared helpers over duplicating `InputManager` line-by-line. using **task-conductor** skill.
- [x] **Phase Gate**: Verify pointer interactions using **project-orchestrator** skill.

## Phase 3: In-the-Middle Adversarial Review

- [x] Perform a rigorous file-by-file review of all changes in this branch against `main` using **quick-review** skill.
- [x] Triage in-the-middle adversarial review findings using **task-conductor** skill (no persistent `REVIEW_FEEDBACK.md` in repo).
- [x] **Phase Gate**: Final verification of the in-the-middle code review changes using **project-orchestrator** skill. _(Closed by maintainer LGTM; `npm run test:ci` / `npm run test:e2e:ci` not re-run — known failures.)_

## Phase 4: SVG Input Parity (Keyboard & Window)

- [x] Implement **window-level** parity: `keydown` / `keyup` for **Q**, **E**, **R**, **F**, and **F3** with the same semantics and `preventDefault` behavior as `InputManager`; track held keys for Q/E; subscribe to **`resize`** and refresh layout/hit-testing as the canvas path does. using **task-conductor** skill.
- [x] Add an **`requestAnimationFrame` loop** (or equivalent) on the SVG path that applies **continuous camera rotation** from held Q/E, mirroring `CanvasController.processContinuousInput`. **CRITICAL for SVG performance:** Do NOT trigger React renders (`setState`) inside this loop. Instead, use a `ref` to directly mutate the SVG `<g>` transform attribute frame-by-frame, and only sync the final rotation back to **`CameraSnapshot`** / React when the key is released. using **task-conductor** skill.
- [ ] Wire **F3** to the same debug overlay behavior as `CanvasView` (toggle visibility; overlay consumes `CanvasController` today — extend or abstract so SVG mode is supported without regressing canvas). using **task-conductor** skill.
- [ ] Add **unit tests** (and hook tests where practical) for new shared modules and critical input paths; keep tests explicit (no gratuitous loops per project test style). using **task-conductor** skill.
- [ ] **Phase Gate**: Manually verify full **input parity checklist** (pointer, R/F, Q/E hold, F3, resize, placement) for SVG-only mode; document any intentional deltas in the track README or a one-line note in this plan. using **project-orchestrator** skill.

## Phase 5: Settings & Dual Rendering

- [ ] Update the Game Settings state/context to include `renderingEngine` ('canvas' | 'svg') and a `splitView` boolean using **task-conductor** skill.
- [ ] Update `SettingsModal.tsx` to expose the "Rendering Engine" toggle to all users, and conditionally expose the "Split View" toggle only when in dev mode (`import.meta.env.DEV`) using **task-conductor** skill.
- [ ] Update `GameBoard.tsx` to read these settings and conditionally render `<CanvasView>`, `<SvgGameView>`, or both side-by-side in a CSS grid/flex layout for visual parity testing using **task-conductor** skill.
- [ ] Implement or verify the **keyboard/pointer focus model** for split view so only the intended board receives window keys (per scope above). using **task-conductor** skill.
- [ ] **Phase Gate**: Verify settings toggles, split view, and **dual-board focus** behavior using **project-orchestrator** skill.

## Phase 6: Adversarial Review

- [ ] Perform a rigorous file-by-file review of all changes in this branch against `main` using **quick-review** skill.
- [ ] Address findings from Phase 6 adversarial review using **task-conductor** skill.
- [ ] **Phase Gate**: Final verification of code review changes using **project-orchestrator** skill.

## Phase 7: E2E Test Migration & Parity

- [ ] Update `e2e/test-utils.ts` and shared selectors to support both `game-canvas` and `game-svg` (or a unified `data-testid`), ensuring navigation and HUD tests pass regardless of the active engine. using **task-conductor** skill.
- [ ] Refactor or branch canvas-specific E2E tests (e.g., debug grid, ghost preview, rotation) to either run only when the canvas engine is active, or implement equivalent SVG assertions where parity exists. using **task-conductor** skill.
- [ ] Add new E2E coverage specifically for the engine toggle in settings and the split-view mode (if applicable to the test environment). using **task-conductor** skill.
- [ ] **Final Track Gate**: Verify `npm run test:e2e:ci` passes reliably and Git commit using **project-orchestrator** skill.
