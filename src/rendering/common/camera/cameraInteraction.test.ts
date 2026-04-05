import { describe, expect, it, vi } from 'vitest';
import type { ClientPoint } from '../ClientPoint';
import { Camera } from './Camera';
import {
  CAMERA_INTERACTION,
  PointerPanZoomSession,
  applyWheelDeltaYToCamera,
  cursorForPointerPanZoomState,
} from './cameraInteraction';

describe('CAMERA_INTERACTION + applyWheelDeltaYToCamera', () => {
  it('applies wheel delta via zoomBy with shared limits', () => {
    const camera = new Camera();
    const zoomBy = vi.spyOn(camera, 'zoomBy');

    applyWheelDeltaYToCamera(camera, 100);

    expect(zoomBy).toHaveBeenCalledWith(
      -100 * CAMERA_INTERACTION.zoomSensitivity,
      CAMERA_INTERACTION.minZoom,
      CAMERA_INTERACTION.maxZoom
    );
  });
});

describe('cursorForPointerPanZoomState', () => {
  it('uses grabbing only while panning', () => {
    expect(cursorForPointerPanZoomState('IDLE')).toBe('grab');
    expect(cursorForPointerPanZoomState('MOUSE_DOWN_POTENTIAL_CLICK')).toBe('grab');
    expect(cursorForPointerPanZoomState('PANNING')).toBe('grabbing');
  });
});

function cp(x: number, y: number): ClientPoint {
  return { x, y } satisfies ClientPoint;
}

describe('PointerPanZoomSession', () => {
  it('does not pan until drag passes threshold', () => {
    const session = new PointerPanZoomSession(5);
    session.beginLeftDrag(cp(100, 100));

    expect(session.move(cp(104, 100))).toEqual({ type: 'none' });
    expect(session.state).toBe('MOUSE_DOWN_POTENTIAL_CLICK');
  });

  it('enters pan and resets anchor when threshold is crossed', () => {
    const session = new PointerPanZoomSession(5);
    session.beginLeftDrag(cp(100, 100));

    expect(session.move(cp(110, 100))).toEqual({ type: 'entered_pan' });
    expect(session.state).toBe('PANNING');
  });

  it('emits pan deltas from movement after panning', () => {
    const session = new PointerPanZoomSession(5);
    session.beginLeftDrag(cp(100, 100));
    session.move(cp(110, 100));

    expect(session.move(cp(120, 100))).toEqual({ type: 'pan', delta: { x: 10, y: 0 } });
  });

  it('isAwaitingClick only in potential-click state', () => {
    const session = new PointerPanZoomSession(5);
    expect(session.isAwaitingClick()).toBe(false);

    session.beginLeftDrag(cp(0, 0));
    expect(session.isAwaitingClick()).toBe(true);

    session.move(cp(20, 0));
    expect(session.isAwaitingClick()).toBe(false);

    session.endDrag();
    expect(session.isAwaitingClick()).toBe(false);
  });
});
