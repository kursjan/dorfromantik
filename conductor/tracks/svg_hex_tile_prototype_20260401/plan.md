# Plan: SVG HexTile Prototype (#19)

## Phase 1: SVG Geometry & Base Components

- [ ] Create and switch to feature branch `feat/svg-hextile` using **task-conductor** skill.
- [x] Implement `src/components/Tiles/SvgHexUtils.ts` to export standard SVG paths for the 6 hexagonal wedges and the center circle using **task-conductor** skill.
- [x] Define the `TerrainIdSvgSegmentRenderers` interface/registry and create base SVG `<Wedge />` and `<CenterWedge />` wrapper components using **task-conductor** skill.
- [ ] Create the core `<HexTile tile={tile} />` container component that orchestrates 6 wedges and 1 center component using **task-conductor** skill.
- [ ] **Phase Gate**: Verify architecture and test coverage using **project-orchestrator** skill.

## Phase 2: Terrain Implementations & Storybook

- [ ] Implement concrete SVG wedge components for all base terrain types (Grass, Forest, Water, Field, House, Rail) mapping colors from `HexStyles.ts` using **task-conductor** skill.
- [ ] Implement complex "hybrid" blending logic for Water and Rail segments based on `neighborEdgeTerrains` using **task-conductor** skill.
- [ ] Create `HexTile.stories.tsx` showcasing all base terrain types, a fully rotated tile, and complex hybrid tiles side-by-side with the old Canvas renderer (if possible) for visual parity using **task-conductor** skill.
- [ ] Implement a specific Storybook story demonstrating two `<HexTile />` components placed exactly adjacent to each other (e.g., sharing an edge with matching terrains) to verify spacing and SVG boundary alignment using **task-conductor** skill.
- [ ] **Phase Gate**: Verify visual fidelity in Storybook and test coverage using **project-orchestrator** skill.

## Phase 3: Adversarial Review

- [ ] Perform a rigorous file-by-file review of all changes in this branch against `main` using **quick-review** skill.
- [ ] Address any feedback from `REVIEW_FEEDBACK.md` using **task-conductor** skill.
- [ ] **Final Track Gate**: Final verification and Git commit using **project-orchestrator** skill.
