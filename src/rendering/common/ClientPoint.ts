type ClientPointBrand = { readonly __brand: 'ClientPoint' };
export type ClientPoint = Readonly<{ x: number; y: number }> & ClientPointBrand;

export const ClientPoint = {
  xy(x: number, y: number): ClientPoint {
    return Object.freeze({ x, y }) as ClientPoint;
  },

  fromMouseEvent(e: Pick<MouseEvent, 'clientX' | 'clientY'>): ClientPoint {
    return Object.freeze({ x: e.clientX, y: e.clientY }) as ClientPoint;
  },
};

type ClientDeltaBrand = { readonly __brand: 'ClientDelta' };
export type ClientDelta = Readonly<{ x: number; y: number }> & ClientDeltaBrand;

export const ClientDelta = {
  xy(x: number, y: number): ClientDelta {
    return Object.freeze({ x, y }) as ClientDelta;
  },

  between(from: ClientPoint, to: ClientPoint): ClientDelta {
    return Object.freeze({ x: to.x - from.x, y: to.y - from.y }) as ClientDelta;
  },

  absolute(delta: ClientDelta): ClientDelta {
    return Object.freeze({ x: Math.abs(delta.x), y: Math.abs(delta.y) }) as ClientDelta;
  },
};
