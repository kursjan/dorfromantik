# Plan: Perfect Placement Scoring (#16)

## Research & Strategy
- **Logic:** We'll use the `isPerfect` helper. To avoid double-counting, we'll identify neighbors that *could* become perfect.
- **Simplification:** A tile at `coord` can only *become* perfect if it currently has < 6 neighbors and the placement of a new tile makes it have 6 matching neighbors.
- **New Tile:** The newly placed tile at `coord` can also be perfect if all its 6 neighbors exist and match.

## Tasks

- [x] **Task 1: Model Update (GameRules & Game)**
  - Add `pointsPerPerfect` (60) and `turnsPerPerfect` (1) to `GameRules`.
  - Implement `Game.isPerfect(coord: HexCoordinate): boolean`.
  - Update `Game.placeTile` to identify and reward perfect placements.
  - Update `PlacementResult` interface to include `perfectCount`.
  - **Verification:**
    - Unit test for `Game.isPerfect`.
    - Unit test for `Game.placeTile` with 1 perfect tile.
    - Unit test for `Game.placeTile` with cascading perfect bonuses (neighbor becomes perfect).
    - Unit test for turn bonus (+1 tile). (Commit SHA: f13a34e)

- [x] **Task 2: HUD & Integration**
  - Verify `GameHUD` reflects the added turns and score.
  - Manual verification in the browser.
  - **Verification:**
    - `npm test`
    - Browser test using `npm run dev`. (Commit SHA: 6230971)

- [x] **Task 3: Final Verification**
  - Full test suite run.
  - Update `ARCHITECTURE.md` if necessary.
  - Final commit with `fixes #16`. (Commit SHA: 6c507a2)
