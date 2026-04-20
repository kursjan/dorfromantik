import { describe, it, expect, beforeEach } from 'vitest';
import { ClientDelta } from '../ClientPoint';
import { ContainerDelta, ContainerPoint } from '../ContainerPoint';
import { DEFAULT_CAMERA_SNAPSHOT, type CameraSnapshot } from './CameraSnapshot';
import { radians } from '../../../utils/Angle';
import { WorldPoint } from '../WorldPoint';
import {
  cameraContainerToWorld,
  panCameraSnapshotBy,
  rotateCameraSnapshotBy,
  zoomCameraSnapshotBy,
} from './cameraTransforms';

describe('cameraTransforms', () => {
  let snapshot: CameraSnapshot;

  beforeEach(() => {
    snapshot = { ...DEFAULT_CAMERA_SNAPSHOT };
  });

  it('default snapshot has expected values', () => {
    expect(snapshot.position.x).toBe(0);
    expect(snapshot.position.y).toBe(0);
    expect(snapshot.zoom).toBe(1);
  });

  it('panCameraSnapshotBy pans in container space', () => {
    const next = panCameraSnapshotBy(
      snapshot,
      ContainerDelta.fromClientDelta(ClientDelta.xy(10, 20))
    );
    expect(next.position.x).toBe(10);
    expect(next.position.y).toBe(20);
  });

  it('zoomCameraSnapshotBy clamps zoom', () => {
    let s = zoomCameraSnapshotBy(snapshot, 0.5, 0.5, 3.0);
    expect(s.zoom).toBe(1.5);

    s = zoomCameraSnapshotBy(s, 2.0, 0.5, 3.0);
    expect(s.zoom).toBe(3.0);

    s = zoomCameraSnapshotBy(s, -5.0, 0.5, 3.0);
    expect(s.zoom).toBe(0.5);
  });

  it('cameraContainerToWorld maps viewport center to world origin', () => {
    const result = cameraContainerToWorld(snapshot, ContainerPoint.xy(400, 300), 800, 600);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });

  it('rotateCameraSnapshotBy keeps world origin under the same container pixel', () => {
    const w = 800;
    const h = 600;
    const cx = w / 2;
    const cy = h / 2;
    const panned: CameraSnapshot = {
      ...snapshot,
      position: WorldPoint.xy(50, -30),
      zoom: 1.2,
      rotation: radians(0.2),
    };
    const cos = Math.cos(panned.rotation);
    const sin = Math.sin(panned.rotation);
    const px = panned.position.x;
    const py = panned.position.y;
    const rx = px * cos - py * sin;
    const ry = px * sin + py * cos;
    const screenOfWorldOrigin = ContainerPoint.xy(cx + panned.zoom * rx, cy + panned.zoom * ry);

    expect(cameraContainerToWorld(panned, screenOfWorldOrigin, w, h).x).toBeCloseTo(0, 10);
    expect(cameraContainerToWorld(panned, screenOfWorldOrigin, w, h).y).toBeCloseTo(0, 10);

    const stepped = rotateCameraSnapshotBy(panned, radians(0.05));
    const worldAfter = cameraContainerToWorld(stepped, screenOfWorldOrigin, w, h);
    expect(worldAfter.x).toBeCloseTo(0, 10);
    expect(worldAfter.y).toBeCloseTo(0, 10);
    expect(stepped.rotation).toEqual(radians(0.25));
  });
});
