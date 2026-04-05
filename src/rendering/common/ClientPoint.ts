/**
 * Pixel position in the browser **client / viewport** space (same as `PointerEvent.clientX` / `clientY`).
 * Not element-local; see {@link ContainerPoint}.
 */
export type ClientPoint = Readonly<{ x: number; y: number }>;
