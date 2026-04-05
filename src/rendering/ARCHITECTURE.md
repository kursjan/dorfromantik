# Rendering Architecture

Shared visuals and input for the board: **canvas** (rAF + `Context2D`), **SVG** (DOM game surface), and **common** math/types. Game chrome (HUD, reset, save status) lives in **`src/rendering/shell/`**.

| Area          | Role                                                                                                       |
| ------------- | ---------------------------------------------------------------------------------------------------------- |
| **`canvas/`** | `CanvasController` game loop, `InputManager`, `Context2D` renderers. See **`canvas/ARCHITECTURE.md`**.     |
| **`svg/`**    | `SvgGameView` composition, `SvgBoard`, `HexTile`, hooks (`useCameraControls`, `useSvgBoardInteraction`).   |
| **`common/`** | `Camera`, `cameraInteraction`, hex layout (`HexUtils`, `hexLayout`), `useGameSnapshotBridge`, point types. |

## Coordinate types (`common/*.ts`)

**`ContainerPoint`** and **`ContainerDelta`** both live in **`common/ContainerPoint.ts`**. All of these shapes are **`Readonly<{ x: number; y: number }>`** with different meanings:

| Type                 | Meaning                                                                                                                                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`ClientPoint`**    | Viewport pixels (`PointerEvent.clientX` / `clientY`). Used inside **`PointerPanZoomSession`** to compute **`ContainerDelta`** for pan.                                                                          |
| **`ContainerPoint`** | Pointer position **relative to the interaction element** (`clientX/Y − getBoundingClientRect().left/top`). Same space as the first argument to **`Camera.containerToWorld`**, with that element’s width/height. |
| **`ContainerDelta`** | `{x,y}` **delta** in the same axes as **`ContainerPoint`** (pan step between moves; numerically Δ`clientX`/`clientY` when layout is stable). Not a position.                                                    |
| **`WorldPoint`**     | Camera / hex **layout plane** (same as `hexToPixel` centers, `pixelToHex` input). **`WORLD_ORIGIN`** is `{ x: 0, y: 0 }`.                                                                                       |

## `Camera` (`common/camera/Camera.ts`)

- **`pan`** (getter): world-space **pan** offset (`WorldPoint`). **`useCameraControls`** copies these values into React-facing **`CameraSnapshot.position`** for **`SvgBoard`**.
- **`containerToWorld(point, containerWidth, containerHeight)`**: inverse of the canvas/SVG camera transform — **container-local** pixel → **`WorldPoint`**.
- **`panBy(delta: ContainerDelta)`**: drag step in container/client pixel axes, rotated/scaled into world pan.
- **`zoomBy`**, **`rotateBy`**, **`reset`**: zoom limits, rotation, restore constructor defaults.

## Pointer wiring (`common/camera/cameraInteraction.ts`)

**`bindPointerInteraction`** (and **`PointerPanZoomSession`**) normalize pointer events on a DOM element: they emit **`ContainerPoint`** for hover/click and **`ContainerDelta`** for pan. **Canvas `InputManager`** and **SVG `useCameraControls`** both use this stack so behavior stays aligned.

## SVG camera snapshot (`svg/cameraSnapshot.ts`)

**`CameraSnapshot`**: `{ position: WorldPoint; zoom; rotation }` — React-facing pose for **`SvgBoard`** transforms (not used by the canvas rAF loop).

## Hooks (SVG)

- **`useCameraControls`**: owns a **`Camera`** instance, returns **`transform`**, **`resetCamera`**, and **`containerToWorld`** (`ContainerToWorldFn`: `ContainerPoint` → `WorldPoint`).
- **`useSvgBoardInteraction`**: game actions from pointer; holds **`containerToWorldRef`** so hover can map **`ContainerPoint`** → world before **`closestHexByWorldDistance`**.

## Debug stats (canvas)

**`CanvasController`** publishes **`DebugStats.camera`** as a **flat** `{ x, y, zoom, rotation }` for the overlay; values come from **`camera.pan.x` / `.y`** (same numbers as **`WorldPoint`** pan and **`CameraSnapshot.position`**).
