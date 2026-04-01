import type { ComponentPropsWithoutRef } from 'react';
import { SVG_HEX_CENTER_CIRCLE_PATH } from './SvgHexUtils';

export type CenterWedgeProps = Omit<ComponentPropsWithoutRef<'path'>, 'd'>;

export function CenterWedge(pathProps: CenterWedgeProps) {
  return <path d={SVG_HEX_CENTER_CIRCLE_PATH} {...pathProps} />;
}
