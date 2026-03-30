# Review Feedback

## Summary

- **Overall risk:** Medium. Core canvas snapshot bridge and controller API are coherent; the main concerns are **persistence lifecycle** interacting with per-placement context updates, **documentation drift** around `Game` “immutability,” and **comment / test hygiene** on new glue code.
- **Top themes:** (1) `GameBoard` + `GameAutosaver` effect dependencies vs new `Game` identity every move. (2) `Game` returns a new instance while also mutating `this`, which is easy to misuse and under-documented. (3) `useGameSnapshotBridge` lacks focused unit tests; coverage on that file is thin.

## Findings

### src/pages/GameBoard.tsx

- [severity: high] Autosaver effect runs on every `activeGame` identity change
  - Why: `useEffect` depends on `[firestoreService, user, activeGame]`. With the snapshot API, **each** place/rotate commits a **new** `Game` instance via `setActiveGame`, so this effect re-runs very often. Cleanup calls `forceSaveAndDispose()`, which clears any pending debounce and **calls `executeSave()` immediately** using the **previous** render’s `getActiveGame` closure—typically **one snapshot behind** the current UI. A new `GameAutosaver` is constructed each time. That risks **redundant writes**, **debounce never winning** (immediate save on every transition), and **races** with the debounced path that intends to persist the latest snapshot.
  - Evidence: `GameBoard.tsx` effect cleanup + `GameAutosaver.forceSaveAndDispose`; compare with `CanvasView` / context now updating `activeGame` every controller action.
  - Suggested fix: Keep a **stable** `GameAutosaver` instance (effect deps without `activeGame`, or only `activeGame.id` if you must reset on game switch). Provide `getActiveGame` via a **ref** (`activeGameRef.current = activeGame` each render) so `executeSave` always reads the latest snapshot. Add a regression test that places two tiles quickly and asserts a single debounced save (or expected save count) without firing an extra “stale” save from effect churn.

### src/models/Game.ts

- [severity: medium] “Immutable transition” API is dual-natured (new instance + mutated receiver)
  - Why: `placeTile` / rotates build `nextGame` with `new Game(...)`, return it (and `PlacementResult.game`), but **`applyFrom`** copies fields back onto **`this`**. Callers can hold two different `Game` references that were briefly meant to represent the same logical step; the model is harder to reason about than “always replace reference” or “always mutate in place.”
  - Evidence: `buildNextGame`, `applyFrom`, return `nextGame` from `rotate*` / `placeTile`.
  - Suggested fix: Prefer a single story: either **pure** functions that return `Game` and do not mutate `this`, or document the contract explicitly in `Game`’s class comment (and `src/models/ARCHITECTURE.md`) so serializers and UI always use the returned instance as canonical.

- [severity: low] Prohibited / unprofessional “AI agent” constructor comment
  - Why: Project reviewer standards ask to remove leftover AI-style comments.
  - Evidence: `Game` constructor JSDoc (“Instructions for AI agent…”).
  - Suggested fix: Replace with a neutral maintainer note (e.g. “Prefer `Game.create()` unless deserializing or tests require the constructor.”).

- [severity: low] Typo in constructor comment
  - Why: Hurts polish and searchability.
  - Evidence: `"explcit"` → should be `"explicit"`.

### src/models/ARCHITECTURE.md

- [severity: medium] Immutability story is out of sync with `Game.ts`
  - Why: Section 6 still reads like in-place lifecycle (“Invalidates cache on placeTile”) and does not describe the **returned `Game`** / `applyFrom` split. The “Design Principles” bullet on immutability does not mention `Game`’s hybrid pattern.
  - Evidence: compare §6 and “Design Principles” with current `Game` implementation.
  - Suggested fix: Update §6 to describe snapshots, `PlacementResult.game`, and when callers should prefer the returned instance vs context-held instance.

### src/canvas/hooks/useGameSnapshotBridge.ts

- [severity: medium] No dedicated unit tests; statement coverage ~78% on this file in `npm run test:coverage`
  - Why: Review standards expect new orchestration (ref sync + synchronous `setActiveGame`) to be covered explicitly—especially the interaction between `useLayoutEffect` (external context updates) and `setGameSnapshot` (controller updates).
  - Evidence: coverage report for `useGameSnapshotBridge.ts`; no `useGameSnapshotBridge.test.ts`.
  - Suggested fix: Add RTL/hook tests: simulate prop swap (`activeGame` A → B) and assert `getGameSnapshot` tracks; call `setGameSnapshot` and assert ref + `setActiveGame` invocation order/concurrency assumptions you rely on.

### src/canvas/ARCHITECTURE.md

- [severity: low] Section 4 “CanvasController” still says it “Owns State: … (Future: Board)” and omits the snapshot getter/setter as the game-state boundary
  - Why: Section 5 corrects this, but the earlier bullet is misleading for readers skimming.
  - Evidence: §4 vs §5 “React & Controller Synchronization.”
  - Suggested fix: One-line update in §4 to point at `getGameSnapshot` / `setGameSnapshot` and defer detail to §5.
