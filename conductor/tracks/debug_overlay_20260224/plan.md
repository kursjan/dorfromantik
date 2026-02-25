# Plan: Debug Overlay Implementation (Issue #29)

## Phase 1: Engine Preparation (using **task-conductor** skill)
- [x] **Task 1: Mark DebugRenderer as Obsolete** [2a336f3b8922e3591bc659d5f595a11bf6d227b3]
  - Add JSDoc `@deprecated` to `src/canvas/graphics/DebugRenderer.ts`.
- [x] **Task 2: Update CanvasController with Debug Stats** [ec3e7de01482de5d725a0a2b70ed15fb8ad3db55]
  - Implement FPS calculation logic in the `loop()` method.
  - Add `onDebugStatsChange` callback property.
  - Invoke `onDebugStatsChange` in the `render()` loop (throttled to 500ms).
  - **Verification:** Unit test to ensure `onDebugStatsChange` is called with correct types.

## Phase 2: React Component (using **task-conductor** skill)
- [x] **Task 3: Create DebugOverlay Component** [013e5e9c9ce90d1e1d2f8709ab5fdf735cf8ce48]
  - Create `src/canvas/components/DebugOverlay.tsx` and `src/canvas/components/DebugOverlay.css`.
  - Implement `F3` key listener for visibility toggle.
  - Subscribe to `controller.onDebugStatsChange`.
  - **Verification:** Vitest/React Testing Library test for visibility toggle and data display.
- [x] **Task 4: Integrate into CanvasView** [e52011d]
  - Add `DebugOverlay` to `src/canvas/components/CanvasView.tsx`.
  - **Verification:** Manual check in browser (press F3, verify stats).

## Phase 3: Cleanup & Finalization (using **project-orchestrator** skill)
- [x] **Task 5: Final Verification & Commit** [b7d480dcc1ef1196e60bf4ca40002e6e0d101bef]
  - Run all tests (`npm test`, `npm e2e`, `npm run typecheck`).
  - Update `ARCHITECTURE.md` if needed, `GEMINI.md` if necessary.
  - Final commit with `fixes #29`.

## Phase: Rework (using **task-conductor** skill)
- [x] **Task 6: Implement E2E Test for Debug Overlay**
  - Create `e2e/debug-overlay.spec.ts`.
  - Test:
    - Default state (hidden).
    - Press `F3` -> visible.
    - Press `F3` again -> hidden.
    - Verify content (FPS, Camera, Hover) presence when visible.
  - **Verification:** `npx playwright test e2e/debug-overlay.spec.ts`.

## Phase: Finalization (using **project-orchestrator** skill)
- [ ] **Task 7: Final verification and commit**
  - Run all tests (`npm test`, `npm e2e`, `npm run typecheck`).
  - Final commit with `fixes #29`.
