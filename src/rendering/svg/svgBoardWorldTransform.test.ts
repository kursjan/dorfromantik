import { describe, expect, it } from 'vitest';
import { ContainerPoint } from '../common/ContainerPoint';
import { WORLD_ORIGIN } from '../common/WorldPoint';
import { DEFAULT_CAMERA_SNAPSHOT } from '../common/camera/CameraSnapshot';
import { radians } from '../../utils/Angle';
import { buildSvgWorldTransformString } from './svgBoardWorldTransform';

describe('buildSvgWorldTransformString', () => {
  it('builds translate / rotate / scale / translate chain', () => {
    const camera = {
      ...DEFAULT_CAMERA_SNAPSHOT,
      position: WORLD_ORIGIN,
      zoom: 1,
      rotation: radians(0),
    };
    const vc = ContainerPoint.xy(100, 50);
    expect(buildSvgWorldTransformString(camera, vc)).toBe(
      'translate(100, 50) rotate(0) scale(1) translate(0, 0)'
    );
  });

  it('converts rotation to degrees for SVG rotate()', () => {
    const camera = {
      ...DEFAULT_CAMERA_SNAPSHOT,
      rotation: radians(Math.PI / 2),
    };
    const vc = ContainerPoint.xy(0, 0);
    expect(buildSvgWorldTransformString(camera, vc)).toContain('rotate(90)');
  });
});
