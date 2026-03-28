---
name: task-conductor
description: Use this skill for any coding or implementation task defined in a Conductor track.
---

## Methodology

0. **Verify Git Branch**: Never develop on main. Reuse a suitable branch or create a new one.
1. **Task Selection**: Always select the next uncompleted task from the current phase in `conductor/tracks/<track_id>/plan.md` and mark it as selected.
2. **Execution**: Perform the requested code changes using available tools.
3. **Quality Gate Verification**:
   - Run **Unit Tests**: `npm test:unit` (Ensure all pass).
   - Run **Unit Tests**: `npm test:ui` (if suitable).
   - Run **Type Check**: `npm run typecheck` (No errors).
   - Run **Linting**: `npm run lint` (Fix all auto-fixable issues).
   - **Code Coverage**: Verify critical paths are covered.
   - **Documentation**: Ensure new public functions/classes have JSDoc.
4. **Persistence & Tracking**:
   - **Track Workflow**: Mark the task as completed in `conductor/tracks/<track_id>/plan.md` (e.g., `- [x] Task Name`).
   - **Commit**: Commit the changes for this task immediately after verification. Use a clear commit message referencing the task. (refs #42)
5. **Impact Summary**: Immediately after execution and verification, provide a concise summary including:
   - Modified files and specific logic changes.
   - Verification results (Test pass/fail, lint status).
   - Any new dependencies or side effects introduced.
6. **Approval Gate**: You MUST end the response with the string: "STATUS: WAITING_FOR_APPROVAL".
7. **Termination**: Do not proceed to any subsequent tasks or steps until the user responds with exactly "LGTM" or "approved" (case-insensitive).
8. **Mark as done**: Mark the task as done.

## Iteration Protocol

- If the user requests changes, apply them, verify again, and provide an updated impact summary.
- This loop continues until the user explicitly approves the implementation by saying "LGTM" or "approved".

## Constraints

- Never combine multiple Conductor tasks into a single execution cycle.
- If the workflow requires a test, wait for approval of the code before running the test.
