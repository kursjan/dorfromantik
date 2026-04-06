import type { ClientDelta, ClientPoint } from './ClientPoint';

type ContainerPointBrand = { readonly __brand: 'ContainerPoint' };
export type ContainerPoint = Readonly<{ x: number; y: number }> & ContainerPointBrand;

function createContainerPoint(x: number, y: number): ContainerPoint {
  return Object.freeze({ x, y }) as ContainerPoint;
}

export const ContainerPoint = {
  xy(x: number, y: number): ContainerPoint {
    return createContainerPoint(x, y);
  },

  fromClientInElement(client: ClientPoint, elementRect: DOMRect): ContainerPoint {
    return createContainerPoint(client.x - elementRect.left, client.y - elementRect.top);
  },
};

type ContainerDeltaBrand = { readonly __brand: 'ContainerDelta' };
export type ContainerDelta = Readonly<{ x: number; y: number }> & ContainerDeltaBrand;

function createContainerDelta(x: number, y: number): ContainerDelta {
  return Object.freeze({ x, y }) as ContainerDelta;
}

export const ContainerDelta = {
  fromClientDelta(delta: ClientDelta): ContainerDelta {
    return createContainerDelta(delta.x, delta.y);
  },
};
