import type { ClientDelta, ClientPoint } from './ClientPoint';

type ContainerPointBrand = { readonly __brand: 'ContainerPoint' };
export type ContainerPoint = Readonly<{ x: number; y: number }> & ContainerPointBrand;

export const ContainerPoint = {
  xy(x: number, y: number): ContainerPoint {
    return Object.freeze({ x, y }) as ContainerPoint;
  },

  fromClient(client: ClientPoint, elementRect: DOMRect): ContainerPoint {
    return Object.freeze({
      x: client.x - elementRect.left,
      y: client.y - elementRect.top,
    }) as ContainerPoint;
  },
};

type ContainerDeltaBrand = { readonly __brand: 'ContainerDelta' };
export type ContainerDelta = Readonly<{ x: number; y: number }> & ContainerDeltaBrand;

export const ContainerDelta = {
  fromClientDelta(delta: ClientDelta): ContainerDelta {
    return Object.freeze({ x: delta.x, y: delta.y }) as ContainerDelta;
  },
};
