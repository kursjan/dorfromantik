# Specification: Autosave from activeGame transitions (#69)

## Problem

`GameBoard` autosave currently depends on an imperative `onTilePlaced` callback chain from canvas components. This is less aligned with current architecture where React context owns the canonical immutable `activeGame` snapshot.

## Goals

- Drive autosave from `activeGame` transitions in `GameBoard`.
- Reduce imperative coupling between canvas event paths and persistence.
- Preserve current debounce, save, and unmount-flush reliability.

## Non-goals

- No broad rewrite of `GameAutosaver`.
- No unrelated gameplay or rendering refactors.
- No persistence API contract changes unless required for naming clarity.

## Proposed design

- Keep using existing `activeGameRef` in `GameBoard` to access the latest snapshot in autosaver callbacks.
- Add transition detection in `GameBoard` effect:
  - Compare previous snapshot vs current `activeGame`.
  - Use domain-oriented fields for comparison (board, tile queue, score, remaining turns) instead of trivial reference-only checks.
  - Trigger autosaver only when meaningful gameplay state changed.
- Extract a domain-oriented helper:
  - Example: `didGameplayStateChange(prev, next): boolean`.
  - Default behavior excludes rotation-only transitions from autosave unless explicitly changed.
  - Load/restore hydration transitions should not trigger immediate autosave by default.

## Acceptance criteria

- `onTilePlaced` callback is not required for autosave triggering.
- Autosave is triggered from `activeGame` transitions in `GameBoard`.
- No stale-save or debounce regressions.
- Unmount flush behavior remains correct.

## Verification

- Unit tests for transition trigger behavior:
  - placement/progression transition triggers save
  - non-meaningful transition does not trigger save
  - rapid transitions debounce correctly
- Regression test for unmount flush.
- Full validation gates:
  - `npm run typecheck`
  - `npm run test:unit`
  - `npm run test:ci`
  - `npm run test:e2e:ci`
