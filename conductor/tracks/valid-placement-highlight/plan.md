# Track: Highlight Valid Placement Coordinates

## Phase 1: Implementation
- [x] Define `VALID_PLACEMENT_STYLE` in `src/canvas/graphics/HexStyles.ts` using **task-conductor** skill.
- [x] Implement `cachedValidPlacements` logic and rendering in `src/canvas/engine/CanvasController.ts` using **task-conductor** skill.
- [x] **Phase Gate**: Verify the visual rendering and caching logic using **project-orchestrator** skill.

## Phase 2: Adversarial Review [checkpoint: 9122b188273a04c314ac780ce1b30aff56cf43fe]
- [x] Perform a rigorous file-by-file review of all changes in this branch against `main` using **quick-review** skill.
- [x] Address any feedback from `REVIEW_FEEDBACK.md` using **task-conductor** skill.
- [x] **Final Track Gate**: Final verification and Git commit using **project-orchestrator** skill.

## Phase 3: GameHints Architecture [checkpoint: 070932e7c5ee2d22cd1b8025767b22b142d8a51a]
- [x] Implement `src/models/GameHints.ts` and write exhaustive tests in `GameHints.test.ts` using **task-conductor** skill.
- [x] Integrate `GameHints` into `src/models/Game.ts`. Ensure the cache is invalidated on `placeTile` and tile rotation using **task-conductor** skill.
- [x] Restore `VALID_PLACEMENT_STYLE` in `HexStyles.ts` and update `CanvasController.ts` to consume `activeGame.hints.validPlacements` for rendering and hovering using **task-conductor** skill.
- [x] **Phase Gate**: Verify the new architecture and run all unit tests using **project-orchestrator** skill.

## Phase 4: Final Polish & Review
- [x] Perform a rigorous file-by-file review of the new architecture against `main` using **quick-review** skill.
- [x] Address any feedback from `REVIEW_FEEDBACK.md` using **task-conductor** skill.
- [ ] **Final Track Gate**: Final verification, PR update, and Git commit using **project-orchestrator** skill.
