# Specification: Thorough Review of src/models

## Objective
The goal is to conduct a rigorous, line-by-line audit of the core data models (`src/models`) to ensure they adhere to strict engineering standards. This is a "Thorough Review" track, focusing on identifying architectural debt, performance bottlenecks (especially for ChromeOS/SVG rendering), and logical inconsistencies.

## Scope
The review targets the following files in `src/models`:

1.  `Board.ts`
2.  `Game.ts`
3.  `GameRules.ts`
4.  `GameScorer.ts`
5.  `HexCoordinate.ts`
6.  `Navigation.ts`
7.  `Session.ts`
8.  `Tile.ts`
9.  `User.ts`
10. `ARCHITECTURE.md`

## Review Criteria
Each file will be evaluated against the **Adversarial Senior Architect** checklist defined in `.gemini/reviewer.md`:

1.  **Hexagonal Math & Invariants:** Coordinate integrity, integer precision, wrap-around logic.
2.  **SVG & DOM Performance:** Re-render surface, GPU acceleration, DOM density (where applicable to model state).
3.  **State & Architecture:** Prop drilling (state passing), component purity (logic separation).
4.  **Engineering & Integrity:** SRP, context-aware analysis, consistent style/organization.
5.  **Testing:** 100% coverage of public methods, focused unit tests, minimal overlap.
6.  **Comments:** Class/method summaries, no "AI comments", consistency.
7.  **Architecture:** Synchronization with `ARCHITECTURE.md`.

## Deliverables
- A populated `REVIEW_FEEDBACK.md` file (or equivalent track output) listing all findings.
- Fixes applied to the code where issues are found (the "Fix Phase").
