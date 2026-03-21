# Simple Test Game Spec

## Goal
Implement a simplified game mode ("Test Game") that is easier to play and test. This mode features a limited set of tiles (10 turns) and restricted terrain variety to increase the probability of matching edges.

## Context
Currently, the game only supports a "Standard" mode with random tile generation using all 6 terrain types equally. This makes it difficult to consistently test perfect placement logic or demonstrate specific game mechanics quickly.

## Requirements

### 1. Game Rules Configuration
- Extend `GameRules` to include a `terrainProbabilities` map: `Record<TerrainType, number>`.
- The sum of probabilities should be approximately 1.0.
- Default (Standard Game): Equal probability for all terrains.

### 2. Test Game Mode
- Implement `GameRules.createTestGame()` factory method.
- **Initial Turns:** 10.
- **Terrain Variety:**
  - High probability for 2 specific terrain types (e.g., 'field', 'water').
  - Low/Zero probability for others.
- **Initial Tile:** Fixed to 'pasture' (or a specific configuration defined in rules).

### 3. Tile Generation
- Refactor `Tile.createRandom(id)` to `Tile.create(id, rules: GameRules)`.
- The generation logic must respect the `terrainProbabilities` defined in the provided `GameRules`.

### 4. Game Logic
- Update `Game.ts` to pass the active `GameRules` when generating new tiles:
  - In `generateInitialQueue`.
  - In `placeTile` (when generating bonus tiles for perfect matches).

## Acceptance Criteria
- [ ] `GameRules.createTestGame()` returns a ruleset with ~10 turns and skewed probabilities.
- [ ] `Tile.create` generates tiles that statistically reflect the configured probabilities.
- [ ] The game initializes with the correct number of tiles.
- [ ] Placing a perfect match in Test Game mode generates bonus tiles that also respect the restricted probabilities.
