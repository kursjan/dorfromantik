import { describe, it, expect, beforeEach } from 'vitest';
import { ClientDelta } from '../ClientPoint';
import { ContainerDelta, ContainerPoint } from '../ContainerPoint';
import { DEFAULT_CAMERA_SNAPSHOT, type CameraSnapshot } from './CameraSnapshot';
import {
  cameraContainerToWorld,
  panCameraSnapshotBy,
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
});
