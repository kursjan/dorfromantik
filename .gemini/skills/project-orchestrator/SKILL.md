---
name: project-orchestrator
description: Use this skill when transitioning between phases or finalizing a track.
---

## Methodology

### Phase Completion Protocol

1. **Consistency Check**: Review all modified files against and update `ARCHITECTURE.md`, `change-log.md`, `tech-stack.md` and other relevant documentation to ensure they reflect the current state of the project.
2. **Verify Tasks**: Ensure all tasks in the current phase are marked as done.
3. **CI verification (before checkpoint / PR)**: Run `npm run test:ci`, then `npm run test:e2e:ci`. If either fails, do not proceed to checkpoint or PR; report the failure and stop. Only after both pass, continue.
4. **Test Plan**: Propose a detailed manual test plan for user review.
5. **Checkpoint Commit**: Create a final commit to finalize the phase and push it to the remote repository.
   - Execute the following exact commands to create and push the checkpoint:
     ```bash
     git add .
     git commit -m "Checkpoint end of Phase X: [summary of changes]"
     git push --no-verify origin HEAD
     ```
   - If there are no uncommitted changes, use the following to mark the phase boundary and push:
     ```bash
     git commit --allow-empty -m "Checkpoint end of Phase X: [summary of changes]"
     git push --no-verify origin HEAD
     ```
   - Use **`git push --no-verify`** when pushing right after step 3’s **`npm run test:ci`** and **`npm run test:e2e:ci`** succeeded and nothing changed in the tree since then, so local hooks do not repeat **`check:pre-push`**. Re-run step 3 after any post-verify edits.
6. **Draft PR Strategy**: Ensure a Pull Request exists for the current branch to allow for immediate review in Reviewable.
   - Check for an existing PR: `gh pr view`
   - If no PR exists, create a Draft PR: `gh pr create --draft --title "WIP: [Track Name]" --body "Tracking progress for [Track ID]"`
7. **Verification Report**: In the report, state that `npm run test:ci` and `npm run test:e2e:ci` were run and both passed. Attach the results of auto-tests + manual plan + user confirmation to the checkpoint commit using `git notes add -m "<report>"`.
8. **State Sync**:
   - Update the `plan.md` or track file to reflect the completed phase.
   - Mark the phase as complete with `[checkpoint: <sha>]`.
9. **Phase Gate**: Inform the user: "Phase X is pushed. You can now review the incremental changes in Reviewable."
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

   - End the response with: "STATUS: PHASE_COMPLETED_WAITING_FOR_REVIEW".

10. **Cleanup**: If a `REVIEW_FEEDBACK.md` file exists and all its issues have been addressed (verified by the completion of the corresponding Conductor task), delete the file and include this deletion in the checkpoint commit.

### Track Completion Protocol (Only if all phases are done)

1. **Architecture Sync**: Update `ARCHITECTURE.md` across the project to reflect new models, patterns, and decisions.
2. **Final Approval**: Ask for explicit user approval and present a final project status summary.
3. **PR Creation**: Create a Pull Request on GitHub and assign it to the user.
   - For final review handoff, the PR must be **ready for review** (not Draft):
     - If no PR exists, create a non-draft PR.
     - If a Draft PR exists, publish it before handoff (e.g. `gh pr ready`).
4. **Handover**: Present the link to the PR. You MUST NOT merge the PR yourself, user must do the code review.
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

5. **Termination**: End with "TRACK_COMPLETED: Ready for review".

## Major Rework Protocol (If major issues are found during review)

If the user identifies **Major Issues** (architectural flaws, missing features, complex bugs) that cannot be solved with minor remediation:

1. **Plan Update**: Immediately add a new "Phase: Rework" to the `plan.md` using the **planning-architect** skill.
2. **Task Creation**: Break the feedback into specific implementation tasks within that phase. Ensure each task specifies the **task-conductor** skill.
3. **Handover**: Explicitly state: "Major issues detected. Rework phase added. Please run `/conductor:implement` to resume execution."
4. **Termination**: End the response immediately. DO NOT attempt to fix major issues within this skill.

## Iteration Protocol

- User can request changes at end of phase or track completion.
- If the user requests changes, apply them, verify again, and provide an updated impact summary.
- This loop continues until the user explicitly approves the implementation by saying exactly "LGTM" or "approved" (case-insensitive).
- Once approved, make sure all changes are amended to the checkpoint commit and [summary of changes] is updated.
  - if at the end of track, make sure PR is ready for review with all changes included.

## Constraints

- Do not start NEW implementation tasks or features while this skill is active.
- Minor remediation fixes (bug fixes, small logic tweaks based on review) ARE permitted to ensure the current phase is finalized correctly and fulfills the Iteration Protocol.
- Focus primarily on project state, documentation, and architecture verification.
