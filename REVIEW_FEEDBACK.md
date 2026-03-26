# Review Feedback

## Summary
- Overall risk: medium-high for persistence correctness, because newly introduced terrain-specific state is not preserved across serialization.
- Top themes: domain model evolved to object-based terrains, but serializer and renderer tests still validate mostly shallow behavior.

## Findings

### src/models/GameSerializer.ts
- [severity: high] Terrain-specific properties are dropped during save/load
  - Why: `Tile` now supports richer terrain objects (`WaterTerrain.linkToCenter`), but serialization stores only terrain names and reconstructs default terrain instances.
  - Evidence: `serializeTile()` writes `tile.<side>.name`; `deserializeTile()` passes only names to `new Tile(...)`.
  - Suggested fix: introduce structured terrain JSON per side (e.g. `{ type: 'water', linkToCenter: true }`) and a `Terrain` serializer/deserializer so all per-terrain properties round-trip.

### src/canvas/graphics/TileRenderer.test.ts
- [severity: medium] Water rendering tests do not verify linked-vs-unlinked geometry behavior
  - Why: current tests assert call counts only, so regressions in actual line endpoints (center vs midpoint) will not be caught.
  - Evidence: tests check `beginPath/moveTo/lineTo` counts but do not inspect coordinates for `WaterTerrain(true)` vs `WaterTerrain(false)`.
  - Suggested fix: assert concrete `moveTo/lineTo` arguments for at least one linked and one unlinked water segment, and verify center-water mini-hex coordinates are rendered at center.
