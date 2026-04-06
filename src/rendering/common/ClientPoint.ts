type ClientPointBrand = { readonly __brand: 'ClientPoint' };
export type ClientPoint = Readonly<{ x: number; y: number }> & ClientPointBrand;

function createClientPoint(x: number, y: number): ClientPoint {
  return Object.freeze({ x, y }) as ClientPoint;
}

export const ClientPoint = {
  xy(x: number, y: number): ClientPoint {
    return createClientPoint(x, y);
  },

  fromMouseEvent(e: Pick<MouseEvent, 'clientX' | 'clientY'>): ClientPoint {
    return createClientPoint(e.clientX, e.clientY);
  },
};

type ClientDeltaBrand = { readonly __brand: 'ClientDelta' };
export type ClientDelta = Readonly<{ x: number; y: number; absolute(): ClientDelta }> &
  ClientDeltaBrand;

function createClientDelta(x: number, y: number): ClientDelta {
  const delta = Object.freeze({
    x,
    y,
    absolute(): ClientDelta {
      return createClientDelta(Math.abs(x), Math.abs(y));
    },
  });
  return delta as ClientDelta;
}

export const ClientDelta = {
  xy(x: number, y: number): ClientDelta {
    return createClientDelta(x, y);
  },

  between(from: ClientPoint, to: ClientPoint): ClientDelta {
    return createClientDelta(to.x - from.x, to.y - from.y);
  },
};
