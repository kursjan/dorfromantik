---
name: planning-architect
description: Use this skill to collaboratively design and plan complex changes, resulting in a formal Conductor track.
---

# Planning Architect Workflow

This skill guides the process from initial idea to a confirmed implementation plan.

## Phase 1: Discovery & Drafting
**Goal:** Understand the user's intent and propose a high-level strategy.
1.  **Analyze Request:** Understand the goal (feature, refactor, bug fix).
2.  **Research (Optional):** If needed, explore the codebase to validate assumptions.
3.  **Draft Proposal:** Present a high-level plan or strategy to the user.
    *   Do NOT create files yet.
    *   Focus on "What" and "Why".
4.  **Iterate:** Discuss and refine the proposal until the user confirms to proceed (e.g., "Let's plan it", "Go ahead").

## Phase 2: Track Initialization
**Goal:** Formalize the agreed strategy into a Conductor track.
**Trigger:** User approval of the draft proposal.

**Action:**
1.  **Create Track Files:** Generate the standard Conductor track artifacts (fo example `spec.md`, `plan.md`, `metadata.json`) in a new track directory `conductor/tracks/<track_id>/`.
    *   Ensure the plan follows the project's task breakdown structure.
2.  **Register:** Add the new track to the registry in `conductor/tracks.md`.

## Phase 3: Plan Review & Refinement
**Goal:** Ensure the generated plan is exacutable by an independent AI agent.

**Loop:**
1.  **Present Plan:** Show the user the content of the generated files.
2.  **Review:** Ask the user for feedback.
    *   If changes are requested: Update the files and re-present.
    *   **Exit Condition:** The user explicitly approves the plan (e.g., "LGTM", "Approved").

## Phase 4: Finalization
**Goal:** Commit the plan and hand off to execution.
**Trigger:** User's Explicit Approval of the plan files.

**Action:**
1.  **Commit:**
    *   Stage the new track files: `git add conductor/tracks/<track_id> conductor/tracks.md`
    *   Commit with message: `feat(conductor): initialize track <track_name> [track summary]`
2.  **Handoff:**
    *   Inform the user the track is ready.
    *   Ask for next steps. 
