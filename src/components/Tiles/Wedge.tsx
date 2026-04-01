import type { ComponentPropsWithoutRef } from 'react';
import { SVG_HEX_WEDGE_PATHS } from './SvgHexUtils';

export interface WedgeProps extends Omit<ComponentPropsWithoutRef<'path'>, 'd'> {
  segmentIndex: number;
}

export function Wedge({ segmentIndex, ...pathProps }: WedgeProps) {
  return <path d={SVG_HEX_WEDGE_PATHS[segmentIndex]} {...pathProps} />;
}
