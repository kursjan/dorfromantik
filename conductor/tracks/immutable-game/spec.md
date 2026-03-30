# Specification: Immutable Game Model (#65)

## Problem

`Game` and `Board` models are currently mutated in place during play (placing tiles, rotating the queue, etc.). React components like `CanvasView` do not observe these mutations directly and instead rely on imperative bridges (historically e.g. stats callbacks) to sync state. The target model is a **single source of truth**: `CanvasController` uses **`getActiveGame` / `setActiveGame`** so the canonical `Game` snapshot lives in React context, not duplicated on the controller.

## Goals

Refactor the core models (`Board` and `Game`) to be immutable, allowing React to track state changes via standard reference equality checks.

- **Immutability**: Methods that modify state (e.g., `place()`, `rotate()`) should return a new instance of the model.
- **Structural Sharing**: Minimize performance overhead by reusing parts of the state that haven't changed (e.g., the tile map in `Board` or unchanged properties in `Game`).
- **React Alignment**: Simplify the connection between the game logic and React UI by passing the `activeGame` instance through context or props, enabling reactive updates without ad-hoc callbacks.

## Requirements

- `Board.ts` must be refactored to be immutable.
- `Game.ts` must be refactored to be immutable.
- `GameSerializer.ts` must support reconstructing immutable instances.
- `CanvasController.ts` must be updated to manage the reference to the current immutable `Game` instance.
- All existing tests must pass with the new immutable API.

## Success Criteria

- [ ] `Board` and `Game` instances are never mutated after creation.
- [ ] State-changing operations return new instances.
- [ ] HUD and other UI components can reflect game stats by observing the `activeGame` reference.
- [ ] No regressions in placement, rotation, scoring, or save/load functionality.
