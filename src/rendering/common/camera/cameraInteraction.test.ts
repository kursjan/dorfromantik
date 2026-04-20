import { describe, expect, it } from 'vitest';
import { ClientDelta, ClientPoint } from '../ClientPoint';
import { DEFAULT_CAMERA_SNAPSHOT } from './CameraSnapshot';
import { zoomCameraSnapshotBy } from './cameraTransforms';
import { PointerPanZoomSession, applyWheelDeltaYToCamera } from './cameraInteraction';

describe('applyWheelDeltaYToCamera', () => {
  it('returns snapshot zoomed with shared limits', () => {
    const next = applyWheelDeltaYToCamera(DEFAULT_CAMERA_SNAPSHOT, 100);
    expect(next).toEqual(zoomCameraSnapshotBy(DEFAULT_CAMERA_SNAPSHOT, -0.1, 0.5, 3.0));
  });
});

function cp(x: number, y: number): ClientPoint {
  return ClientPoint.xy(x, y);
}

describe('PointerPanZoomSession', () => {
  it('does not pan until drag passes threshold', () => {
    const session = new PointerPanZoomSession(ClientDelta.xy(5, 5));
    session.beginLeftButton(cp(100, 100));

    expect(session.onClientMove(cp(104, 100))).toEqual({ type: 'none' });
    expect(session.isAwaitingClick()).toBe(true);
  });

  it('enters pan and resets anchor when threshold is crossed', () => {
    const session = new PointerPanZoomSession(ClientDelta.xy(5, 5));
    session.beginLeftButton(cp(100, 100));

    expect(session.onClientMove(cp(110, 100))).toEqual({ type: 'entered_pan' });
    expect(session.cursorStyle()).toBe('grabbing');
  });

  it('emits pan deltas from movement after panning', () => {
    const session = new PointerPanZoomSession(ClientDelta.xy(5, 5));
    session.beginLeftButton(cp(100, 100));
    session.onClientMove(cp(110, 100));

    expect(session.onClientMove(cp(120, 100))).toMatchObject({
      type: 'pan',
      delta: { x: 10, y: 0 },
    });
  });

  it('isAwaitingClick only in potential-click state', () => {
    const session = new PointerPanZoomSession(ClientDelta.xy(5, 5));
    expect(session.isAwaitingClick()).toBe(false);

    session.beginLeftButton(cp(0, 0));
    expect(session.isAwaitingClick()).toBe(true);

    session.onClientMove(cp(20, 0));
    expect(session.isAwaitingClick()).toBe(false);

    session.endLeftButton();
    expect(session.isAwaitingClick()).toBe(false);
  });
});
