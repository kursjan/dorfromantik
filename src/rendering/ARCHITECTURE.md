# Rendering Architecture

Shared visuals and input for the board: **canvas** (rAF + `Context2D`), **SVG** (DOM game surface), and **common** math/types. Game chrome (HUD, reset, save status) lives in **`src/rendering/shell/`**.

| Area          | Role                                                                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **`canvas/`** | `CanvasController` game loop, `InputManager`, `Context2D` renderers. See **`canvas/ARCHITECTURE.md`**.                       |
| **`svg/`**    | `SvgGameView` composition, `SvgBoard`, `HexTile`, hooks (`useCameraControls`, `useSvgBoardInteraction`).                     |
| **`common/`** | `Camera`, `CameraSnapshot`, `cameraInteraction`, hex layout (`HexUtils`, `hexLayout`), `useGameSnapshotBridge`, point types. |

## Coordinate types (`common/*.ts`)

**`ClientPoint`** / **`ClientDelta`** → `common/ClientPoint.ts` (**`ClientPoint.xy`**, **`fromMouseEvent`**, **`ClientDelta.xy`** / **`between`** / **`absolute()`**). **`ContainerPoint`** / **`ContainerDelta`** → `common/ContainerPoint.ts` (**`ContainerPoint.xy`**, **`fromClientInElement`**, **`ContainerDelta.fromClientDelta`**). **`WorldPoint`** → `common/WorldPoint.ts` (**`WorldPoint.xy`**, **`WORLD_ORIGIN`**). Shapes are branded **`Readonly<{ x, y }>`** (plus **`ClientDelta.absolute()`**) with these meanings:

| Type                 | Meaning                                                                                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`ClientPoint`**    | Viewport pixels (`PointerEvent.clientX` / `clientY`). Built with **`ClientPoint.xy`** or **`fromMouseEvent`**. Used inside **`PointerPanZoomSession`** for drag threshold and pan steps (**`ClientDelta`**). |
| **`ClientDelta`**    | Δ in client axes (**`xy`**, **`between`**, **`absolute()`** for threshold checks). Session emits these for pan; **`bindPointerInteraction`** copies them to **`ContainerDelta`**.                            |
| **`ContainerPoint`** | Element-local pointer position via **`ContainerPoint.xy`** or **`fromClientInElement(client, rect)`**. Same space as **`Camera.containerToWorld`**, with that element’s width/height.                        |
| **`ContainerDelta`** | Pan step for **`Camera.panBy`**, from **`ContainerDelta.fromClientDelta`** (same numeric `x`/`y` as **`ClientDelta`** when the element’s rect is stable between moves).                                      |
| **`WorldPoint`**     | Camera / hex **layout plane** (**`WorldPoint.xy`**, **`hexToPixel`** / **`pixelToHex`** / corner math). **`WORLD_ORIGIN`** is **`WorldPoint.xy(0, 0)`**.                                                     |

## `Camera` (`common/camera/Camera.ts`)

- **Construction:** **`new Camera(snapshot)`** clones an initial **`CameraSnapshot`** (typically **`DEFAULT_CAMERA_SNAPSHOT`**). Internal state stays a single mutable snapshot object.
- **`pan`**, **`zoom`**, **`rotation`** (getters): read through from that snapshot (**`pan`** is **`snapshot.position`**).
- **`containerToWorld(point, containerWidth, containerHeight)`**: inverse of the canvas/SVG camera transform — **container-local** pixel → **`WorldPoint`**.
- **`panBy(delta: ContainerDelta)`**: drag step in container/client pixel axes, rotated/scaled into world pan.
- **`zoomBy`**, **`rotateBy`**, **`reset`**: zoom limits, rotation, **`reset`** restores **`DEFAULT_CAMERA_SNAPSHOT`** (cloned).

## Pointer wiring (`common/camera/cameraInteraction.ts`)

**`PointerPanZoomSession`** runs in **client** space: **`ClientPoint`** anchors and **`ClientDelta.between`** / **`absolute()`** implement the click-vs-pan threshold (default **`ClientDelta.xy(5, 5)`** in module config). **`bindPointerInteraction`** maps each event with **`ClientPoint.fromMouseEvent`**, converts hover/click to **`ContainerPoint.fromClientInElement`**, and passes **`ContainerDelta.fromClientDelta`** into **`onPan`** so **`Camera.panBy`** stays in container-aligned pixel axes. **Canvas `InputManager`** and **SVG `useCameraControls`** both use this stack.

## `CameraSnapshot` (`common/camera/CameraSnapshot.ts`)

**`CameraSnapshot`**: `{ position: WorldPoint; zoom; rotation }` — shared pose type for **`SvgBoard`** (via **`useCameraControls`**), canvas **`DebugStats.camera`**, and **`Camera`**. **`DEFAULT_CAMERA_SNAPSHOT`** is the app-wide default (matches **`WORLD_ORIGIN`** pan). **`position`** matches **`Camera.pan`**.

## Hooks (SVG)

- **`useCameraControls`**: owns a **`Camera`** instance, returns **`camera`** (**`CameraSnapshot`**), **`resetCamera`**, and **`containerToWorld`** (`ContainerToWorldFn`: `ContainerPoint` → `WorldPoint`). **`SvgGameView`** passes that snapshot straight into **`SvgBoard`** as the **`camera`** prop.
- **`useSvgBoardInteraction`**: game actions from pointer; holds **`containerToWorldRef`** so hover can map **`ContainerPoint`** → world before **`closestHexByWorldDistance`**.

## Debug stats (canvas)

**`CanvasController`** publishes **`DebugStats.camera`** as **`CameraSnapshot`** for the overlay (**`position`** is **`Camera.pan`**).
