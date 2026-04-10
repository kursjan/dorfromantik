# Rendering Architecture

Shared visuals and input for the board: **canvas** (rAF + `Context2D`), **SVG** (DOM game surface), and **common** math/types. Game chrome (HUD, reset, save status) lives in **`src/rendering/shell/`**.

| Area          | Role                                                                                                                                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`canvas/`** | `CanvasController` game loop, `InputManager`, `Context2D` renderers. See **`canvas/ARCHITECTURE.md`**.                                                                              |
| **`svg/`**    | `SvgGameView` composition, `SvgBoardCameraShell`, `SvgBoard`, `HexTile`, hooks (`useSvgBoardPointerCamera`, `useSvgWindowInput`, `useSvgGameViewLayout`, `useSvgBoardInteraction`). |
| **`common/`** | `CameraSnapshot`, `cameraTransforms`, `cameraInteraction`, hex layout (`HexUtils`, `hexLayout`), `useGameSnapshotBridge`, point types.                                              |

## Coordinate types (`common/*.ts`)

**`ClientPoint`** / **`ClientDelta`** → `common/ClientPoint.ts` (**`ClientPoint.xy`**, **`fromMouseEvent`**, **`ClientDelta.xy`** / **`between`** / **`absolute()`**). **`ContainerPoint`** / **`ContainerDelta`** → `common/ContainerPoint.ts` (**`ContainerPoint.xy`**, **`fromClientInElement`**, **`ContainerDelta.fromClientDelta`**). **`WorldPoint`** → `common/WorldPoint.ts` (**`WorldPoint.xy`**, **`WORLD_ORIGIN`**). Shapes are branded **`Readonly<{ x, y }>`** (plus **`ClientDelta.absolute()`**) with these meanings:

| Type                 | Meaning                                                                                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`ClientPoint`**    | Viewport pixels (`PointerEvent.clientX` / `clientY`). Built with **`ClientPoint.xy`** or **`fromMouseEvent`**. Used inside **`PointerPanZoomSession`** for drag threshold and pan steps (**`ClientDelta`**). |
| **`ClientDelta`**    | Δ in client axes (**`xy`**, **`between`**, **`absolute()`** for threshold checks). Session emits these for pan; **`bindPointerInteraction`** copies them to **`ContainerDelta`**.                            |
| **`ContainerPoint`** | Element-local pointer position via **`ContainerPoint.xy`** or **`fromClientInElement(client, rect)`**. Same space as **`cameraContainerToWorld`**, with that element’s width/height.                         |
| **`ContainerDelta`** | Pan step for **`panCameraSnapshotBy`**, from **`ContainerDelta.fromClientDelta`** (same numeric `x`/`y` as **`ClientDelta`** when the element’s rect is stable between moves).                               |
| **`WorldPoint`**     | Camera / hex **layout plane** (**`WorldPoint.xy`**, **`hexToPixel`** / **`pixelToHex`** / corner math). **`WORLD_ORIGIN`** is **`WorldPoint.xy(0, 0)`**.                                                     |

## Camera transforms (`common/camera/cameraTransforms.ts` + `cameraInteraction.ts`)

- **Pose type:** **`CameraSnapshot`** (**`Readonly<{ position; zoom; rotation }>`**) in **`CameraSnapshot.ts`** — replace the whole object to change pose; **`DEFAULT_CAMERA_SNAPSHOT`** is the canonical default.
- **`cameraContainerToWorld(snapshot, point, w, h)`**: inverse of the canvas/SVG camera transform — **container-local** pixel → **`WorldPoint`**.
- **`panCameraSnapshotBy`**, **`zoomCameraSnapshotBy`**, **`rotateCameraSnapshotBy`**: return updated snapshots (canvas and SVG paths assign the result to a field or ref).
- **`applyWheelDeltaYToCamera(snapshot, deltaY)`** (**`cameraInteraction.ts`**): wheel step with shared min/max zoom; returns a new **`CameraSnapshot`**.

## Pointer wiring (`common/camera/cameraInteraction.ts`)

**`PointerPanZoomSession`** runs in **client** space: **`ClientPoint`** anchors and **`ClientDelta.between`** / **`absolute()`** implement the click-vs-pan threshold (default **`ClientDelta.xy(5, 5)`** in module config). **`bindPointerInteraction`** maps each event with **`ClientPoint.fromMouseEvent`**, converts hover/click to **`ContainerPoint.fromClientInElement`**, and passes **`ContainerDelta.fromClientDelta`** into **`onPan`** so **`panCameraSnapshotBy`** stays in container-aligned pixel axes. **Canvas `InputManager`** and **SVG `useSvgBoardPointerCamera`** both use this stack.

## `CameraSnapshot` (`common/camera/CameraSnapshot.ts`)

**`CameraSnapshot`**: **`Readonly<{ position; zoom; rotation }>`** — treat as immutable; replace the whole object to change pose. Shared by **`SvgBoardCameraShell`** (via **`useSvgBoardPointerCamera`** / **`SvgGameView`**), canvas **`DebugStats.camera`**, and **`CanvasController.cameraSnapshot`**. **`DEFAULT_CAMERA_SNAPSHOT`** is the app-wide default (matches **`WORLD_ORIGIN`** pan).

## Hooks (SVG)

- **`useSvgBoardPointerCamera`**: keeps **`CameraSnapshot`** in a ref, returns **`camera`** (React state copy), **`cameraRef`**, **`syncCameraToReact`**, **`resetCamera`**, and **`containerToWorld`** (`ContainerToWorldFn`: `ContainerPoint` → `WorldPoint`). **`SvgGameView`** passes **`cameraRef`**, **`syncCameraToReact`**, and **`windowInputCallbacks`** into **`SvgBoardCameraShell`**.
- **`useSvgWindowInput`**: window **`keydown` / `keyup` / `resize`** aligned with canvas **`InputManager`**. Always registers listeners while **`SvgBoardCameraShell`** is mounted; **`windowInputCallbacks`** supplies R/F / resize / overlay hooks while Q/E drive camera rotation via **`getRotationDirection`**.
- **`SvgBoardCameraShell`**: world `<g>` **`transform`** (same order as canvas: center → rotation → zoom → pan); **`requestAnimationFrame`** for continuous camera rotation from **`getRotationDirection`** without per-frame **`setState`**; **`useSvgWindowInput(windowInputCallbacks)`**. Wraps **`SvgBoard`**. Callers (including Storybook) pass a **`cameraRef`** owned outside the shell so keyboard rotation and pointer camera share one mutable snapshot.
- **`useSvgGameViewLayout`**: **`ResizeObserver`** + **`viewSize`** / **`measureContainer`** for **`viewCenter`**.
- **`useSvgBoardInteraction`**: game actions from pointer; holds **`containerToWorldRef`** so hover can map **`ContainerPoint`** → world before **`closestHexByWorldDistance`**.

## Debug stats (canvas)

**`CanvasController`** publishes **`DebugStats.camera`** as **`CameraSnapshot`** for the overlay (same object as **`cameraSnapshot`**).
