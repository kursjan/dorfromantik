---
name: project-orchestrator
description: Handle Conductor phase and track completion in this repo, including checkpoints, docs sync, PRs, and approval gates.
---

# Project Orchestrator (Cursor)

Use this skill when **transitioning between phases** or **finalizing a Conductor track** defined under `conductor/tracks/**/plan.md`, especially when the plan says "using **project-orchestrator** skill" or the user asks to "complete the phase/track".

## Methodology

### Phase Completion Protocol

1. **Consistency Check**
   - Review all code changes associated with the current phase.
   - Ensure that high-level docs reflect the current architecture and decisions:
     - `ARCHITECTURE.md`
     - `tech-stack.md`
     - `CHANGELOG.md` or equivalent
     - Any track-specific docs (e.g. `conductor/tracks/<track_id>/spec.md`)
   - Update these docs as needed, keeping edits concise and focused.

2. **Verify Tasks**
   - Open `conductor/tracks/<track_id>/plan.md`.
   - Confirm that **all tasks in the current phase** are marked as done (`[x]`).
   - If any tasks remain unchecked, do **not** run this protocol; instead, return to task execution (using `task-conductor`).

3. **CI verification (before checkpoint / PR)**
   - Run `npm run test:ci`. If it fails, do not proceed to checkpoint or PR; report the failure and stop.
   - Run `npm run test:e2e:ci`. If it fails, do not proceed; report the failure and stop.
   - Only after both pass, continue to the next step.

4. **Test Plan**
   - Propose a **manual test plan** summarizing key flows that should be tested by the user.
   - Focus on areas touched in this phase (auth, canvas, routing, etc.).

5. **Checkpoint Commit**
   - Create a final commit marking the end of this phase and push it to the remote.
   - Use commands like:
     ```bash
     git add .
     git commit -m "Checkpoint end of Phase X: <short summary>"
     git push origin HEAD
     ```
   - If there are no pending changes but a phase boundary still needs to be recorded:
     ```bash
     git commit --allow-empty -m "Checkpoint end of Phase X: <short summary>"
     git push origin HEAD
     ```

6. **Draft PR Strategy**
   - Ensure a Pull Request exists for the current branch:
     - Check: `gh pr view`
     - If no PR exists, create a **Draft PR**:
       ```bash
       gh pr create --draft --title "WIP: <Track Name>" --body "Tracking progress for <Track ID>"
       ```

7. **Verification Report**
   - Prepare a short report summarizing:
     - That `npm run test:ci` and `npm run test:e2e:ci` were run and both passed (or which failed and that the phase was not completed until fixed).
     - Other automated tests run and their results.
     - Manual test plan and any findings.
     - Notable architecture or API changes.
   - Attach this report to the checkpoint commit using `git notes` if the user wants that convention preserved (e.g. `git notes add -m "<report>" <sha>`).

8. **State Sync**
   - Update the track’s `plan.md` to indicate the phase boundary:
     - Optionally annotate the phase with `[checkpoint: <sha>]` if that pattern is in use.

9. **Phase Gate**
   - Inform the user that the phase is ready for review and include:
     - The branch name.
     - The PR link (if any).
     - A brief summary of what the phase accomplished.
   - Include a ready-to-send sync request so the user does not need to write it manually. Use this template and fill placeholders:

     ```text
     Please sync and review Phase <PHASE_NUMBER> for track <TRACK_ID>.
     Branch: <BRANCH_NAME>
     PR: <PR_URL_OR_NONE>
     Checkpoint: <CHECKPOINT_SHA>

     What changed:
     - <BULLET_1>
     - <BULLET_2>
     - <BULLET_3>

     Verification run:
     - npm run test:ci: <PASS_OR_FAIL>
     - npm run test:e2e:ci: <PASS_OR_FAIL>

     Manual test focus:
     - <MANUAL_TEST_ITEM_1>
     - <MANUAL_TEST_ITEM_2>

     Please comment "approved" or list requested changes.
     ```

   - End the response with:
     - `STATUS: PHASE_COMPLETED_WAITING_FOR_REVIEW`

### Track Completion Protocol

Use this once **all phases** in a track are complete.

1. **Architecture Sync**
   - Ensure `ARCHITECTURE.md` and related docs are fully updated for the new feature set or refactor introduced by the track.

2. **Final Approval**
   - Provide a final summary of the track:
     - Scope, major changes, key files.
     - Verification status.
   - Ask explicitly for user approval to consider the track complete.

3. **PR Creation / Finalization**
   - Ensure there is a PR for the track branch and that it includes all changes.
   - For final review handoff, the PR must be **ready for review** (not Draft):
     - If no PR exists, create a non-draft PR.
     - If a Draft PR exists, publish it before handoff (e.g. `gh pr ready`).
   - Present the PR link to the user.
   - Do **not** merge the PR yourself; the user is responsible for final review and merge.

4. **Handover**
   - Once everything is synchronized and the PR is ready for review, clearly state that the track is ready for review and that no further changes will be made without user request.
   - Include a ready-to-send track sync request so the user does not need to write one manually:

     ```text
     Please sync and review completed track <TRACK_ID>.
     Branch: <BRANCH_NAME>
     PR: <PR_URL>
     Final checkpoint: <CHECKPOINT_SHA>

     Track outcomes:
     - <OUTCOME_1>
     - <OUTCOME_2>
     - <OUTCOME_3>

     Final verification:
     - npm run test:ci: <PASS_OR_FAIL>
     - npm run test:e2e:ci: <PASS_OR_FAIL>

     Please review in Reviewable/GitHub and share final approval.
     ```

   - You may use a marker like:
     - `TRACK_COMPLETED: Ready for review`

## Iteration Protocol

- If the user or an external review (e.g., REVIEW_FEEDBACK.md) uncovers **major issues**:
  - Consider adding a new "Phase: Rework" to the track using the `planning-architect` skill.
  - Convert feedback into concrete tasks in that new phase, tagged with `task-conductor`.
- For **minor fixes** (small bugs, doc corrections) related to this phase/track:
  - It is acceptable to perform them while this skill is active, as long as they stay within the scope of finalizing the phase/track.

## Constraints

- Do **not** start new features or unrelated refactors while this skill is active.
- Focus on:
  - Project state,
  - Documentation,
  - Verification,
  - Checkpoints and PR readiness.
