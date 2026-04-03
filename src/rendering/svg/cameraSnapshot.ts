import type { Camera } from '../common/camera/Camera';

/** React-facing copy of {@link Camera} pose for the SVG path (`useCameraControls` → `SvgBoard`). Not used by the canvas rAF loop. */
export type CameraSnapshot = Pick<Camera, 'x' | 'y' | 'zoom' | 'rotation'>;
