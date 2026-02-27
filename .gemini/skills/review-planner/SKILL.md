---
name: review-planner
description: Creates a detailed Conductor track for auditing code files against the strict criteria in reviewer.md.
---

This skill guides the creation of a rigorous audit plan (Conductor track) to review specific files against the project's quality standards.

## Phase 1: Context & Scope
**Goal:** Identify the files to be reviewed.
1.  **Identify Target:** Determine which files need review (e.g., from user request, git status, or specific directory).
2.  **Read Criteria:** Read `.gemini/reviewer.md` to load the current audit standards into context.

## Phase 2: Track Initialization
**Goal:** Generate the review plan.
**Trigger:** User request to plan a review.

**Action:**
1.  **Create Track:** Create a new directory `conductor/tracks/review_<date>_<topic>/`.
2.  **Generate Plan (`plan.md`):**
    *   **Structure:** Create a **separate Phase** for each target file.
    *   **Task Generation:** For *each* file-phase, generate a list of tasks derived directly from the "Critical Review Pillars" (numbered headers) in `.gemini/reviewer.md`. Ensure tasks explicitly instruct to **only log findings** to `REVIEW_FEEDBACK.md` and **not modify code**.
    *   **Example Tasks for a File Phase:**
        *   [ ] Verify Hexagonal Math & Invariants in `<filename>` and append findings to `REVIEW_FEEDBACK.md` using **task-conductor** skill.
        *   [ ] Check SVG & DOM Performance in `<filename>` and append findings to `REVIEW_FEEDBACK.md` using **task-conductor** skill.
        *   [ ] Review State & Architecture patterns in `<filename>` and append findings to `REVIEW_FEEDBACK.md` using **task-conductor** skill.
        *   [ ] Verify Engineering & Integrity (SRP, naming) in `<filename>` and append findings to `REVIEW_FEEDBACK.md` using **task-conductor** skill.
        *   [ ] Audit Testing coverage and quality for `<filename>` and append findings to `REVIEW_FEEDBACK.md` using **task-conductor** skill.
        *   [ ] Check Comments & AI artifacts in `<filename>` and append findings to `REVIEW_FEEDBACK.md` using **task-conductor** skill.
        *   [ ] Sync Architecture documentation for `<filename>` and append findings to `REVIEW_FEEDBACK.md` using **task-conductor** skill.
        *   [ ] **Phase Gate**: Commit review findings for `<filename>` using **project-orchestrator** skill.
    *   **Final Phase:** Add a final phase for "Report Aggregation".
        *   [ ] Consolidate all findings into `REVIEW_FEEDBACK.md` using **task-conductor** skill.
        *   [ ] **Track Gate**: Final commit using **project-orchestrator** skill.

3.  **Metadata:** Create `metadata.json` with the track details.
4.  **Register:** Add the track to `conductor/tracks.md`.

## Phase 3: Plan Review
**Goal:** Confirm the plan with the user.
1.  **Present Plan:** Show the user the generated `plan.md`.
2.  **Iterate:** Refine if the user wants to add/remove specific checks or files.
3.  **Wait for Approval:** Do not proceed to execution until explicitly approved.

## Phase 4: Handoff
**Goal:** Ready for execution.
1.  **Commit:** Stage and commit the track files.
2.  **Signal:** Inform the user "Review Track Initialized: Ready for /conductor:implement".

# Example Plan Structure
Use this format as the gold standard for all generated `plan.md` files.

```markdown
# Track: Review Game Logic

## Phase 1: Review Game.ts
- [ ] Verify Hexagonal Math & Invariants in `src/models/Game.ts` and append findings to `REVIEW_FEEDBACK.md` using **task-conductor** skill.
- [ ] Check SVG & DOM Performance in `src/models/Game.ts` and append findings to `REVIEW_FEEDBACK.md` using **task-conductor** skill.
- [ ] Review State & Architecture patterns in `src/models/Game.ts` and append findings to `REVIEW_FEEDBACK.md` using **task-conductor** skill.
- [ ] Verify Engineering & Integrity (SRP, naming) in `src/models/Game.ts` and append findings to `REVIEW_FEEDBACK.md` using **task-conductor** skill.
- [ ] Audit Testing coverage and quality for `src/models/Game.ts` and append findings to `REVIEW_FEEDBACK.md` using **task-conductor** skill.
- [ ] Check Comments & AI artifacts in `src/models/Game.ts` and append findings to `REVIEW_FEEDBACK.md` using **task-conductor** skill.
- [ ] Sync Architecture documentation for `src/models/Game.ts` and append findings to `REVIEW_FEEDBACK.md` using **task-conductor** skill.
- [ ] **Phase Gate**: Commit review findings for `src/models/Game.ts` using **project-orchestrator** skill.

## Phase 2: Review HexRenderer.ts
- [ ] Verify Hexagonal Math & Invariants in `src/canvas/graphics/HexRenderer.ts` and append findings to `REVIEW_FEEDBACK.md` using **task-conductor** skill.
- [ ] Check SVG & DOM Performance in `src/canvas/graphics/HexRenderer.ts` and append findings to `REVIEW_FEEDBACK.md` using **task-conductor** skill.
- [ ] Review State & Architecture patterns in `src/canvas/graphics/HexRenderer.ts` and append findings to `REVIEW_FEEDBACK.md` using **task-conductor** skill.
- [ ] Verify Engineering & Integrity (SRP, naming) in `src/canvas/graphics/HexRenderer.ts` and append findings to `REVIEW_FEEDBACK.md` using **task-conductor** skill.
- [ ] Audit Testing coverage and quality for `src/canvas/graphics/HexRenderer.ts` and append findings to `REVIEW_FEEDBACK.md` using **task-conductor** skill.
- [ ] Check Comments & AI artifacts in `src/canvas/graphics/HexRenderer.ts` and append findings to `REVIEW_FEEDBACK.md` using **task-conductor** skill.
- [ ] Sync Architecture documentation for `src/canvas/graphics/HexRenderer.ts` and append findings to `REVIEW_FEEDBACK.md` using **task-conductor** skill.
- [ ] **Phase Gate**: Commit review findings for `src/canvas/graphics/HexRenderer.ts` using **project-orchestrator** skill.

## Phase 3: Report Aggregation
- [ ] Consolidate all findings into `REVIEW_FEEDBACK.md` using **task-conductor** skill.
- [ ] **Track Gate**: Final commit using **project-orchestrator** skill.
```
