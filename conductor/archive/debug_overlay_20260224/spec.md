# Specification: Debug Overlay

## Goal
Implement a React-based Debug Overlay to replace the existing Canvas-based `DebugRenderer`. The overlay will provide real-time performance metrics and game state information to assist in development and debugging.

## Features
1.  **FPS Counter:** Displays current Frames Per Second.
2.  **Cursor Coordinates:** Displays the hex coordinates `(q, r, s)` of the tile under the mouse cursor.
3.  **Camera Info:** Displays current camera position `(x, y)` and zoom level.
4.  **Toggle Visibility:** The overlay can be shown/hidden by pressing `F3`.
5.  **Deprecation:** The old `DebugRenderer` class will be marked as obsolete (but not deleted).

## User Interface
-   **Position:** Top-left corner of the screen.
-   **Style:** Semi-transparent black background with white monospaced text.
-   **Content Example:**
    ```
    FPS: 60
    Camera: (100.5, -50.2) Zoom: 1.50
    Hover: (2, -3, 1)
    ```

## Architecture
-   **`CanvasController` (Engine):**
    -   Calculates FPS using a simple rolling average or frame delta.
    -   Exposes an `onDebugStatsChange` callback to push updates to React.
    -   Continues to use `DebugRenderer` for now, but its usage will be removed once the React overlay is stable.
-   **`DebugOverlay` (React Component):**
    -   Subscribes to `CanvasController` updates.
    -   Listens for `F3` key to toggle visibility.
-   **`CanvasView` (Integration):**
    -   Hosts the `DebugOverlay` component.
