# Plan: Dual Rendering Engines (Canvas & SVG) (#75)

## Phase 1: SVG Engine Integration

- [ ] Ensure we are on the `worker1` branch using **task-conductor** skill.
- [ ] Create a `useCameraControls` hook to manage pan (drag) and zoom (scroll) state using standard DOM events using **task-conductor** skill.
- [ ] Create `SvgGameView.tsx` (matching `CanvasView` props) that maps `activeGame.board` to `SvgBoardTile[]` and integrates the camera hook. Temporarily hardcode `GameBoard.tsx` to render only `SvgGameView` using **task-conductor** skill.
- [ ] **Phase Gate**: Verify basic SVG rendering and camera interactions using **project-orchestrator** skill.

## Phase 2: Settings & Dual Rendering

- [ ] Update the Game Settings state/context to include `renderingEngine` ('canvas' | 'svg') and a `splitView` boolean using **task-conductor** skill.
- [ ] Update `SettingsModal.tsx` to expose the "Rendering Engine" toggle to all users, and conditionally expose the "Split View" toggle only when in dev mode (`import.meta.env.DEV`) using **task-conductor** skill.
- [ ] Update `GameBoard.tsx` to read these settings and conditionally render `<CanvasView>`, `<SvgGameView>`, or both side-by-side in a CSS grid/flex layout for visual parity testing using **task-conductor** skill.
- [ ] **Phase Gate**: Verify settings toggles and split view functionality using **project-orchestrator** skill.

## Phase 3: Adversarial Review

- [ ] Perform a rigorous file-by-file review of all changes in this branch against `main` using **quick-review** skill.
- [ ] Address any feedback from `REVIEW_FEEDBACK.md` using **task-conductor** skill.
- [ ] **Final Track Gate**: Final verification and Git commit using **project-orchestrator** skill.
