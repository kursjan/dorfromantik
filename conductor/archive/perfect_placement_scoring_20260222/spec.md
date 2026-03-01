# Specification: Perfect Placement Scoring (#16)

## Problem Statement
Implement the "Perfect Placement" scoring and tile bonus rules based on the Dorfromantik Steam version.

## Requirements
- **Matching Edge Bonus:** 10 points for each matching edge (already partially implemented).
- **Perfect Tile Definition:** A tile that has 6 matching connections with 6 existing neighbors.
- **Perfect Bonus:** +60 points and +1 tile in the queue for each tile that becomes perfect.
- **Cascading Bonus:** A single placement can trigger multiple perfect bonuses (the newly placed tile + its 6 neighbors).
- **Update HUD:** Display the updated score and turns (already implemented via reactive state).

## Design
- `GameRules`: Add `pointsPerPerfect` (60) and `turnsPerPerfect` (1).
- `Game`:
    - `isPerfect(coord: HexCoordinate)`: Returns true if the tile at `coord` has 6 neighbors and all 6 edges match their neighbors' terrain.
    - `placeTile(coord: HexCoordinate)`:
        - Check which of the 7 candidate tiles (new tile + 6 neighbors) *become* perfect.
        - Award bonus (+60 pts, +1 tile) for each.
- `PlacementResult`: Add `perfectCount: number`.
