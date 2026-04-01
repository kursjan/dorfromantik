# Review Feedback

## Summary

- **Risk:** Low for current Storybook-only prototype; **medium** once `SvgBoard` backs real gameplay at non-trivial board sizes or shares live state with parents that pass fresh callbacks each render.
- **Themes:** (1) duplicated hex projection vs canvas, (2) memoization / dependency accuracy, (3) no automated tests for board placement math, (4) minor docs and story ergonomics.

## Findings

### src/components/Tiles/SvgBoard.tsx

- [severity: low] useMemo comment does not match dependencies
  - Why: Comment refers to “tile id and its rotation,” but the dependency array is `[tiles, onTileClick]` only. Rotation is not an explicit dependency; identity changes come only through `tiles` / `tile` references. Misleading for future editors.
  - Evidence: `useMemo` at lines 33–58.
  - Suggested fix: Reword to “rebuild when `tiles` or `onTileClick` changes,” or add a stable serialized key if you need finer control.

- [severity: medium] No row-level memoization for many tiles
  - Why: Project reviewer standards call out re-rendering hundreds of SVG paths on interaction. `SvgBoard` re-renders all tile groups when `tiles` or `onTileClick` changes; `HexTile` is not memoized in this path. Acceptable for small stories; risky for large boards + frequent parent updates.
  - Evidence: `tiles.map` inside `useMemo` always rebuilds full list when deps change; child `HexTile` is plain function component.
  - Suggested fix: `React.memo(HexTile)` with custom compare, or split static terrain vs volatile props; virtualize if tile count grows past hundreds.

- [severity: medium] `onTileClick` in `useMemo` deps encourages full tile-tree rebuilds
  - Why: Inline lambdas from parents (`onTileClick={(c) => ...}`) change every render → `useMemo` invalidates every frame → defeats memoization of rendered tiles.
  - Evidence: Dependency `[tiles, onTileClick]`.
  - Suggested fix: Document that callers must pass `useCallback`-stable handlers, or store handler in a ref and omit from deps (pattern: ref.current).

### src/components/Tiles/SvgHexUtils.ts

- [severity: medium] `hexToPixel` duplicates `canvas/utils/HexUtils.hexToPixel`
  - Why: Same cube→flat-top mapping and `q`/`r` swap; only `size` is fixed to `SVG_HEX_RADIUS`. Two implementations can drift if one is fixed for a camera bug.
  - Evidence: Compare `hexToPixel` here with `HexUtils.hexToPixel(hex, size)`.
  - Suggested fix: Implement `hexToPixel` as `HexUtils.hexToPixel(hex, SVG_HEX_RADIUS)` or move shared math to `src/models` / single helper used by both canvas and SVG.

### src/components/Tiles/SvgBoard.stories.tsx

- [severity: low] `PerspectiveRotationBoard` drives React state every animation frame
  - Why: `requestAnimationFrame` + `setRotationZ` re-renders the whole story subtree each frame. Fine for Storybook demos; not a pattern to copy into the live game loop.
  - Evidence: `useEffect` loop lines 296–304.
  - Suggested fix: None required for stories; if reused in app, prefer CSS `animation` or imperative transform on a ref.

- [severity: low] `InteractiveBoard` root `div` has no `position: 'relative'`
  - Why: Child panel uses `position: 'absolute'`. Positioning is relative to the nearest positioned ancestor or the initial containing block; layout can differ between Storybook and embedded contexts.
  - Evidence: Lines 249–256 vs overlay 262–277.
  - Suggested fix: Add `position: 'relative'` to the root `div` so the overlay anchors predictably.

### src/components/ARCHITECTURE.md

- [severity: low] `SvgBoard` not mentioned alongside `HexTile` / `SvgHexUtils`
  - Why: Board-level SVG composition (camera group, nested `HexTile` sizing) is part of the public surface; docs still describe only single-tile prototype.
  - Evidence: “Tiles/” section lists `HexTile` and geometry file, not `SvgBoard.tsx`.
  - Suggested fix: Add one short paragraph: `SvgBoard` orchestrates multiple `HexTile` instances with `hexToPixel` and camera `translate`/`scale`.

## Coverage note

- Automated tests for `SvgBoard` / `SvgHexUtils.hexToPixel` parity with canvas were **not** added in this review pass (review-only). Reviewer policy would call for focused unit tests before treating this as production-ready.
