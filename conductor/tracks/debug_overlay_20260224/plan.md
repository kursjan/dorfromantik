# Plan: Debug Overlay Implementation (Issue #29)

## Phase 1: Engine Preparation (using **task-conductor** skill)
- [x] **Task 1: Mark DebugRenderer as Obsolete** [2a336f3b8922e3591bc659d5f595a11bf6d227b3]
  - Add JSDoc `@deprecated` to `src/canvas/graphics/DebugRenderer.ts`.
- [ ] **Task 2: Update CanvasController with Debug Stats**
  - Implement FPS calculation logic in the `loop()` method.
  - Add `onDebugStatsChange` callback property.
  - Invoke `onDebugStatsChange` in the `render()` loop (throttled to 500ms).
  - **Verification:** Unit test to ensure `onDebugStatsChange` is called with correct types.

## Phase 2: React Component (using **task-conductor** skill)
- [ ] **Task 3: Create DebugOverlay Component**
  - Create `src/canvas/components/DebugOverlay.tsx` and `src/canvas/components/DebugOverlay.css`.
  - Implement `F3` key listener for visibility toggle.
  - Subscribe to `controller.onDebugStatsChange`.
  - **Verification:** Vitest/React Testing Library test for visibility toggle and data display.
- [ ] **Task 4: Integrate into CanvasView**
  - Add `DebugOverlay` to `src/canvas/components/CanvasView.tsx`.
  - **Verification:** Manual check in browser (press F3, verify stats).

## Phase 3: Cleanup & Finalization (using **project-orchestrator** skill)
- [ ] **Task 5: Final Verification & Commit**
  - Run all tests (`npm test`, `npm e2e`, `npm run typecheck`).
  - Update `ARCHITECTURE.md` if needed, `GEMINI.md` if necessary.
  - Final commit with `fixes #29`.
