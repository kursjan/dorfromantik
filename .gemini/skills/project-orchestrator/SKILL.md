---
name: project-orchestrator
description: Use this skill when transitioning between phases or finalizing a track.
---

## Methodology

### Phase Completion Protocol
1. **Consistency Check**: Review all modified files against and update `ARCHITECTURE.md`, `change-log.md`, `tech-stack.md` and other relevant documentation to ensure they reflect the current state of the project.
2. **Verify Tasks**: Ensure all tasks in the current phase are marked as done.
3. **Test Plan**: Propose a detailed manual test plan for user review.
4. **Checkpoint Commit**: Create a commit with the message `Checkpoint end of Phase X: [summary of changes]`.
5. **Verification Report**: Attach the results of auto-tests + manual plan + user confirmation to the checkpoint commit using `git notes add -m "<report>"`.
6. **State Sync**: 
   - Update the `plan.md` or track file to reflect the completed phase.
   - Mark the phase as complete with `[checkpoint: <sha>]`.
7. **Phase Gate**: End the response with: "STATUS: PHASE_COMPLETED_WAITING_FOR_REVIEW".

### Track Completion Protocol (Only if all phases are done)
1. **Architecture Sync**: Update `ARCHITECTURE.md` across the project to reflect new models, patterns, and decisions.
2. **Final Approval**: Ask for explicit user approval and present a final project status summary.
3. **PR Creation**: Create a Pull Request on GitHub and assign it to the user.
4. **Handover**: Present the link to the PR. You MUST NOT merge the PR yourself, user must do the code review.
5. **Termination**: End with "TRACK_COMPLETED: Ready for review".

## Major Rework Protocol (If major issues are found during review)
If the user identifies **Major Issues** (architectural flaws, missing features, complex bugs) that cannot be solved with minor remediation:

1. **Plan Update**: Immediately add a new "Phase: Rework" to the `plan.md`.
2. **Task Creation**: Break the feedback into specific implementation tasks within that phase. Ensure each task specifies the **task-conductor** skill.
3. **Handover**: Explicitly state: "Major issues detected. Rework phase added. Please run `/conductor:implement` to resume execution."
4. **Termination**: End the response immediately. DO NOT attempt to fix major issues within this skill.

## Iteration Protocol
- User can request changes at end of phase or track completion. 
- If the user requests changes, apply them, verify again, and provide an updated impact summary.
- This loop continues until the user explicitly approves the implementation (`lgtm`, `sgtm`, etc.).
- Once approved, make sure all changes are amended to the checkpoint commit and [summary of changes] is updated. 
  - if at the end of track, make sure PR is ready for review with all changes included.

## Constraints
- Do not start NEW implementation tasks or features while this skill is active.
- Minor remediation fixes (bug fixes, small logic tweaks based on review) ARE permitted to ensure the current phase is finalized correctly and fulfills the Iteration Protocol.
- Focus primarily on project state, documentation, and architecture verification.
