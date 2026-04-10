# Review Feedback

Branch: `worker1` vs `main` (dual rendering / #75). Standards: `.gemini/reviewer.md`.

## Summary

- **Overall risk:** Medium — core pointer/camera plumbing is coherent and tested, but **SVG gameplay parity** and **render performance** lag canvas; several gaps are already called out in `plan.md` Phase 4/7.
- **Top themes:** (1) Missing **keyboard** and **on-board preview** vs canvas. (2) **Pan/zoom drives full React re-renders** of every `HexTile`. (3) **E2E** still assumes `game-canvas`. (4) `HexTile` is not memoized despite reviewer performance expectations.

## Findings

### `src/rendering/svg/tiles/HexTile.tsx`

- [severity: medium] **No `React.memo` on presentational tile**
  - Why: Reviewer standard expects memoization so pointer/camera updates do not re-render hundreds of wedge paths. Today any parent re-render recomputes all wedges for every placed tile.
  - Evidence: `export function HexTile(...)` — plain function component; `SvgBoard` maps `board.getAll()` into `<HexTile />` with no memo wrapper.
  - Suggested fix: `export const HexTile = React.memo(function HexTile(...) { ... });` with stable props (tile identity, neighbor map), or memoize row/cell subtrees in `SvgBoard`.

### `src/rendering/svg/hooks/useCameraControls.ts`

- [severity: medium] **`setCamera` on every pan/wheel step**
  - Why: Each `sync()` after `panCameraSnapshotBy` / wheel updates React state → `SvgGameView` re-renders → `SvgBoard` recomputes → all tiles re-render. Canvas path avoids React for the hot loop.
  - Evidence: `onPan` / `onZoom` assign `cameraRef` then `sync()` → `setCamera({ ...cameraRef.current })`.
  - Suggested fix (align with Phase 4 plan): drive **SVG `<g>` transform** from a ref + `requestAnimationFrame` or direct DOM write for pan/zoom; sync `CameraSnapshot` to React only on **pointer up** / **wheel end** (debounced), or split “view transform ref” from “committed snapshot” for HUD/debug.

### `src/rendering/svg/components/SvgBoard.tsx`

- [severity: low] **Camera changes bust `useMemo` only keyed on `board`**
  - Why: `renderedTiles` memo depends on `[board]` only (good), but **parent still re-renders** and re-executes `worldTransform` string + reconciles children; without `HexTile.memo`, children still reconcile deeply.
  - Evidence: `useMemo(() => ..., [board])` while `camera` / `viewCenter` apply outside memo on `<g transform={worldTransform}>`.
  - Suggested fix: Combine with `HexTile` memoization; optional `memo` on `SvgBoard` with custom compare for `camera` if transform moved to CSS/`transform` on a wrapper.

### `src/rendering/svg/components/SvgGameView.tsx`

- [severity: medium] **No window keyboard handlers (R / F / Q / E / F3)**
  - Why: Canvas `InputManager` handles discrete rotation and continuous camera rotation keys; SVG surface only gets **pointer** events via `bindPointerInteraction`. User-visible: **R/F do not rotate queue tile** or update HUD.
  - Evidence: No `keydown` / `keyup` subscriptions; `useSvgBoardInteraction` exposes rotate callbacks used only from **right-click** in `cameraInteraction`.
  - Suggested fix: Phase 4 task — mirror `InputManager` semantics (including `preventDefault` for F3) with focus model; wire to same `setGameSnapshot` / rotation helpers.

### `src/rendering/svg/hooks/useSvgBoardInteraction.ts`

- [severity: low] **Hover hex only in ref — no ghost / highlight**
  - Why: Matches canvas “hovered hex” for placement, but **no React state** → no on-board **ghost tile** or valid-hex highlights (`GameHints.validPlacements`).
  - Evidence: `hoveredHexRef` updated in `onHover`; `SvgBoard` receives neither hover nor `peek()` tile.
  - Suggested fix: Lift hover (+ optional `validPlacements` subset) into state throttled with `requestAnimationFrame`, or draw preview in a dedicated layer; mirror `CanvasController` preview styles.

### `e2e/test-utils.ts` / Playwright specs

- [severity: medium] **Selectors assume `canvas[data-testid="game-canvas"]`**
  - Why: Default game UI is `SvgGameView` (`data-testid="game-svg"`). Suite fails at “wait for canvas” — not a product bug, **test debt**.
  - Evidence: `startTestGame` waits on `game-canvas`; 16 failures in last run.
  - Suggested fix: Phase 7 — shared locator (`game-board` wrapper), branch on engine, or SVG-specific interaction tests.

### `src/rendering/ARCHITECTURE.md` / `src/rendering/canvas/ARCHITECTURE.md`

- [severity: low] **Docs updated for `cameraTransforms`; Phase 4 still lists unbuilt behavior**
  - Why: Paragraphs describe pointer stack accurately; keyboard/F3/debug parity is **planned**, not implemented — readers may assume parity today.
  - Evidence: Plan Phase 4 unchecked items vs current `SvgGameView`.
  - Suggested fix: One-line “SVG: pointer parity only; keyboard/debug in Phase 4” in rendering README or plan only (already partially in plan).

---

## Coverage note

Per `.gemini/reviewer.md`, changed files should meet high coverage bars. Not re-run `npm run test:coverage` in this pass; **`cameraTransforms` / `useGameSnapshotBridge`** have focused tests — **`useSvgBoardInteraction`** has minimal hook coverage for click/rotate paths. Recommend running `npm run test:coverage` before merge and adding tests when implementing Phase 4.
