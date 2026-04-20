---
name: task-conductor
description: Execute a single Conductor plan.md coding task with tests, typecheck, lint, commit, and explicit user approval before moving on.
---

# Task Conductor (Cursor)

Use this skill for any **coding or implementation task** defined in a Conductor track (`conductor/tracks/**/plan.md`) when the plan explicitly says "using **task-conductor** skill" or when the user asks to "implement the next Conductor task".

## Methodology

0. **Verify Git Branch**
   - Never develop on `main`.
   - Reuse a suitable feature/track branch or create a new one.

1. **Task Selection**
   - Open the relevant `conductor/tracks/<track_id>/plan.md`.
   - Identify the **current phase** (the one containing unchecked tasks).
   - Select the **next uncompleted task** in that phase.
   - Mark the current task as in progress: `- [~]` for that line only
   - Do not modify tasks from other phases.

2. **Execution**
   - Perform only the code changes required to complete the selected task.
   - Minimize file touches and avoid opportunistic refactors unless the plan or user explicitly asks for them.

3. **Quality Gate Verification**
   - Run commands from the **project root**; do not use `cd` (shell is already there). Use e.g. `npm run test:unit`, `npm run typecheck`, `npm run lint`.
   - Run **Unit Tests**:
     - Prefer `npm run test:unit` or the project’s documented unit-test command.
   - Run **Type Check**:
     - `npm run typecheck` (no errors).
   - Run **Linting**:
     - `npm run lint` (fix all auto-fixable issues, then re-run if needed).
   - Ensure that critical paths affected by the change are covered by tests.

4. **Persistence & Tracking**
   - Update the track’s `plan.md`:
     - Mark the current task as completed: change `- [~]` or `- [ ]` to `- [x]` for that line only (clear the in-progress marker).
     - Do not alter unrelated tasks.
   - Commit the changes for this task **immediately after verification**:
     - Use a concise commit message that references the task and (optionally) the GitHub issue, e.g.:
       - `feat(auth): initialize anonymous session (refs #123)`

5. **Impact Summary (Response to User)**
   - List the **modified files** and briefly describe the main logic changes.
   - Summarize **verification results**:
     - Which commands were run (`typecheck`, `test:unit`, `lint`, etc.).
     - Whether they passed or failed.
   - Mention any new dependencies or notable side effects.

6. **Approval Gate**
   - End the response with the exact string:
     - `STATUS: WAITING_FOR_APPROVAL`
   - Do **not** proceed to any subsequent tasks or make further non-trivial changes until the user responds with an explicit approval (e.g. "APPROVED", "lgtm", "sgtm").

7. **Mark as Done & `approved/<branch>` tag**
   - Once the user approves, consider **that** task complete.
   - Mark the task `[X]` (with capital X) to mark task as complete by AI and approved by user.
     - if not explicitly stated, LGTM approves the latest task marked as `[x]`
   - **Move `approved/<branch>`**, in response to their approval, and only to the commit they are approving:
     - Run `git tag -f approved/<branch>`
   - If the user says e.g. **“lgtm, do next”** in one line:
     - (1) move the tag to the current `[x]`, change to `[X]` (the just-approved task),
     - (2) **then** implement the next unfinished task.
   - Only after moving the tag (when applicable) may you proceed to the next uncompleted task.

## Iteration Protocol

- If the user requests changes after reviewing your work:
  - Apply the requested changes while respecting the same quality gates (tests, typecheck, lint).
  - Update the impact summary.
  - End again with `STATUS: WAITING_FOR_APPROVAL`.
- Repeat this loop until the user explicitly approves the implementation.

## Constraints

- Never combine **multiple** Conductor tasks into a single execution cycle.
- Do not silently skip tests or typecheck; if they are slow or failing in ways you cannot fix, clearly explain the situation.
- Keep changes scoped narrowly to the selected task unless the user explicitly allows a broader refactor.
