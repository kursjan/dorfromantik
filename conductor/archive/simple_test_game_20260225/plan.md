# Track: Simple Test Game (#34)

## Phase 1: Setup
- [ ] Create and switch to feature branch `feat/simple-test-game` using **task-conductor** skill.
- [ ] **Phase Gate**: Verify branch creation and clean state using **project-orchestrator** skill.

## Phase 2: GameRules Implementation
- [ ] Modify `src/models/GameRules.ts` to add `terrainProbabilities`, validation, and `createTestGame` factory using **task-conductor** skill.
- [ ] Create `src/models/GameRules.test.ts` to verify `createTestGame` returns correct turns and probabilities using **task-conductor** skill.
- [ ] **Phase Gate**: Verify GameRules changes and tests pass using **project-orchestrator** skill.

## Phase 3: Tile Implementation
- [ ] Modify `src/models/Tile.ts`: Rename `createRandom` to `create(id, rules)` and implement weighted generation using **task-conductor** skill.
- [ ] Update `src/models/Tile.test.ts` to verify `Tile.create` respects probabilities using **task-conductor** skill.
- [ ] **Phase Gate**: Verify Tile generation changes and tests pass using **project-orchestrator** skill.

## Phase 4: Game Logic Implementation
- [ ] Modify `src/models/Game.ts`: Update `generateInitialQueue` and `placeTile` to use `Tile.create(id, this.rules)` using **task-conductor** skill.
- [ ] Create `src/models/TestGame.test.ts` (Part 1): Verify `Game.create(GameRules.createTestGame())` initializes with 10 tiles using **task-conductor** skill.
- [ ] Update `src/models/TestGame.test.ts` (Part 2): Verify placing a perfect match generates bonus tiles respecting restricted probabilities using **task-conductor** skill.
- [ ] **Phase Gate**: Verify Game logic integration and end-to-end test scenarios using **project-orchestrator** skill.

## Phase 5: Final Verification
- [ ] Run full project verification (typecheck, lint, all tests) using **task-conductor** skill.
- [ ] **Final Track Gate**: Final verification and Git commit using **project-orchestrator** skill.
