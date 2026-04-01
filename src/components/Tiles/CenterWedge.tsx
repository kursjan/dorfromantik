import type { ComponentPropsWithoutRef } from 'react';

export type CenterWedgeProps = ComponentPropsWithoutRef<'path'>;

export function CenterWedge({ d, ...pathProps }: CenterWedgeProps) {
  return <path d={d} {...pathProps} />;
}
