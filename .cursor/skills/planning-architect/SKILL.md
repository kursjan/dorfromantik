---
name: planning-architect
description: Design and initialize Conductor tracks for complex changes, producing plan.md/spec.md and handing off to task-conductor and project-orchestrator.
---

# Planning Architect (Cursor)

Use this skill when the user requests a **non-trivial feature, refactor, or multi-step change** that deserves a formal Conductor track (under `conductor/tracks/**/`). The goal is to move from an idea to a clear, executable plan (`plan.md` + optionally `spec.md` + metadata).

## Phase 1: Discovery & Drafting

**Goal:** Understand the user's intent and propose a high-level strategy.

1. **Analyze Request**
   - Clarify what the user wants:
     - New feature, refactor, bug fix, or audit.
   - Identify affected areas:
     - Code paths (e.g., `src/models`, `src/context`, `src/canvas`),
     - External services (Firebase, routing, etc.).

2. **Research (Optional)**
   - If needed, skim relevant files to validate assumptions before proposing a plan.

3. **Draft Proposal**
   - Present a concise, high-level plan:
     - Major milestones or phases.
     - Key risks or design decisions.
   - Do **not** create or modify files yet; stay at the “what/why” level.

4. **Iterate with User**
   - Discuss and refine the proposal until the user explicitly confirms to proceed, e.g.:
     - "Let's plan it", "Go ahead and create a track", etc.

## Phase 2: Track Initialization

**Goal:** Turn the agreed strategy into a concrete Conductor track.
**Trigger:** Explicit user approval of the draft proposal.

1. **Create GitHub Issue (Optional but Recommended)**
   - If there is no issue yet, propose creating one that:
     - Summarizes the task and context.
     - Can be referenced from commits.
   - If the user prefers manual issue management, respect that.

2. **Create Track Files**
   - In `conductor/tracks/<track_id>/`, create:
     - `plan.md` – phases and tasks.
     - Optionally `spec.md` and `metadata.json` if the pattern is already used in this repo.
   - Ensure the plan follows the existing structure used by other tracks (phases with checkbox tasks).
   - The **first task of the first phase** must be:
     - "Create and switch to feature branch `<branch_name>` using **task-conductor** skill." (or equivalent wording).

3. **Register Track**
   - If the project uses a `conductor/tracks.md` registry:
     - Add a short entry describing the track, including:
       - Track id,
       - Summary,
       - Related issue (if any).

4. **Skill Mapping (CRITICAL)**
   - For every implementation/coding/testing task, append explicit text:
     - `using **task-conductor** skill`
   - For each phase/track gate (checkpoint, finalization), append:
     - `using **project-orchestrator** skill`
   - By default, append a final review phase after implementation phases:
     - `## Phase <N>: Adversarial Review`
     - `- [ ] Perform a rigorous file-by-file review of all changes in this branch against \`main\` using **quick-review** skill.`
     - `- [ ] Address any feedback from \`REVIEW_FEEDBACK.md\` using **task-conductor** skill.`
     - `- [ ] **Final Track Gate**: Final verification and Git commit using **project-orchestrator** skill.`
   - This mirrors the Magnetic Snapping track pattern and should be included unless the user explicitly opts out.

## Phase 3: Plan Review & Refinement

**Goal:** Ensure the generated plan is executable by an independent agent.

1. **Present Plan**
   - Show the user the content of the new track files:
     - `conductor/tracks/<track_id>/plan.md`
     - And `spec.md`/`metadata.json` if created.

2. **Review & Feedback**
   - Ask for feedback:
     - Are phases well-scoped?
     - Do tasks feel actionable and small enough?
   - If changes are requested:
     - Update the plan and show it again.
   - **Exit Condition:** The user explicitly approves the plan (e.g. "LGTM", "Approved", "Looks good").

## Phase 4: Finalization

**Goal:** Commit the plan and hand off to execution skills.
**Trigger:** User’s explicit approval of the plan files.

1. **Commit Track Files**
   - Stage the new track files and registry updates:
     ```bash
     git add conductor/tracks/<track_id> conductor/tracks.md
     ```
   - Commit with a clear message, for example:
     ```bash
     git commit -m "feat(conductor): initialize track <track_name> [short summary]"
     ```

2. **Handoff**
   - Inform the user that the track is ready for implementation.
   - Suggest the next step, e.g.:
     - "You can now ask the agent to implement the track using the task-conductor skill."
   - Optionally mark with:
     - `TRACK_INITIALIZED: Ready for /conductor:implement`

## Constraints

- Do not start implementing or refactoring code while this skill is active.
  - Only read, plan, and create/update Conductor files.
- Every phase in `plan.md` should end with a **project-orchestrator** task to handle checkpointing and phase transitions.
- Ensure every task in `plan.md` clearly indicates which skill should execute it (e.g. `using **task-conductor** skill`).
- Default all new plans to include a final **Adversarial Review** phase (`quick-review` -> feedback fixes -> final gate), unless the user asks to skip it.
