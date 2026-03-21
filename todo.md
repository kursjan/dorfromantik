# Track: Autosaver Reliability

**Goal:** Prevent data loss by flushing pending saves when the game board unmounts, and provide clear visual feedback to the player about the current save status (Saving, Saved, Error).

## Phase 1: Implementation & UI
- [x] Update `GameAutosaver.ts` to implement `forceSaveAndDispose()` and add lifecycle callbacks (`onSaveStart`, `onSaveSuccess`, `onSaveError`) using **task-conductor** skill.
- [x] Update `GameAutosaver.test.ts` to verify `forceSaveAndDispose()` and callback logic using **task-conductor** skill.
- [ ] Update `GameBoard.tsx` to manage `saveStatus` state, pass callbacks to `GameAutosaver`, and display a small `SaveStatusIndicator` UI component using **task-conductor** skill.
- [ ] Update `GameBoard.test.tsx` to assert the new UI states and verify the component flushes the autosaver on unmount using **task-conductor** skill.
- [ ] **Final Track Gate**: Final verification and Git commit using **project-orchestrator** skill.