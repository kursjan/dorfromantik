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
   - If a new branch is created, push it immediately:
     - `git push -u origin HEAD`

0. **Task Selection**
   - Open the relevant `conductor/tracks/<track_id>/plan.md`.
   - Identify the **current phase** (the one containing unchecked tasks).
   - Select the **next uncompleted task** in that phase.
   - Do not modify tasks from other phases.

1. **Execution**
   - Perform only the code changes required to complete the selected task.
   - Minimize file touches and avoid opportunistic refactors unless the plan or user explicitly asks for them.

2. **Quality Gate Verification**
   - Run **Unit Tests**:
     - Prefer `npm run test:unit` or the project’s documented unit-test command.
   - Run **Type Check**:
     - `npm run typecheck` (no errors).
   - Run **Linting**:
     - `npm run lint` (fix all auto-fixable issues, then re-run if needed).
   - Ensure that critical paths affected by the change are covered by tests.

3. **Persistence & Tracking**
   - Update the track’s `plan.md`:
     - Mark the current task as completed: change `- [ ]` to `- [x]` for that line only.
     - Do not alter unrelated tasks.
   - Commit the changes for this task **immediately after verification**:
     - Use a concise commit message that references the task and (optionally) the GitHub issue, e.g.:
       - `feat(auth): initialize anonymous session (refs #123)`

4. **Impact Summary (Response to User)**
   - List the **modified files** and briefly describe the main logic changes.
   - Summarize **verification results**:
     - Which commands were run (`typecheck`, `test:unit`, `lint`, etc.).
     - Whether they passed or failed.
   - Mention any new dependencies or notable side effects.

5. **Approval Gate**
   - End the response with the exact string:
     - `STATUS: WAITING_FOR_APPROVAL`
   - Do **not** proceed to any subsequent tasks or make further non-trivial changes until the user responds with an explicit approval (e.g. "APPROVED", "lgtm", "sgtm").

6. **Mark as Done**
   - Once the user approves, consider this task complete.
   - Only then may you move to the next uncompleted task (with a new invocation of this skill or explicit user request).

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

