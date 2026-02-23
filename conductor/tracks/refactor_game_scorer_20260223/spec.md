# Track: Refactor Game Scoring Logic

**Goal:** Extract scoring logic and "perfect placement" checks from the `Game` class into a dedicated `GameScorer` service.

## Core Requirements

1.  **Separation of Concerns:**
    - `Game` should focus on orchestration (turns, queue, board state).
    - `GameScorer` should focus on calculating points and bonuses based on board state.

2.  **Functionality Preservation:**
    - The refactoring must strictly preserve existing behavior.
    - Standard matching points.
    - Perfect placement bonuses (points + extra tiles).
    - Cascading perfect updates (when a neighbor becomes perfect).

3.  **API Structure:**
    - `GameScorer` should likely be instantiated with `GameRules` (to know point values).
    - `GameScorer` needs access to the `Board` to check neighbors.
    - Public method: `scorePlacement(board: Board, placement: HexCoordinate, tile: Tile): PlacementResult`.

## Implementation Details

- **`GameScorer` Class:**
    - Methods:
        - `getScore(board: Board, coordinate: HexCoordinate): PlacementResult` (or similar)
        - `isPerfect(board: Board, coordinate: HexCoordinate): boolean` (moved from `Game`)
- **`Game` Class:**
    - Remove `isPerfect`.
    - Instantiate `scorer = new GameScorer(this.rules)`.
    - In `placeTile`, call `this.scorer.scorePlacement(...)`.

## Verification

- `npm test` must pass.
- Specific check on `Game.test.ts` to ensure no regressions.
