import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InputManager, type InputCallbacks } from './InputManager';

describe('InputManager', () => {
  let canvas: HTMLCanvasElement;
  let callbacks: InputCallbacks;
  let inputManager: InputManager;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    callbacks = {
      onPan: vi.fn(),
      onZoom: vi.fn(),
      onHover: vi.fn(),
      onResize: vi.fn(),
    };
    inputManager = new InputManager(canvas, callbacks);
  });

  it('attaches event listeners on initialization', () => {
    // We can't easily check internal listeners, but we can check behavior
    expect(canvas.style.cursor).toBe('grab');
  });

  it('handles mouse drag for panning', () => {
    // 1. Mouse Down
    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100 }));
    
    // 2. Mouse Move (Drag)
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 110, clientY: 105 }));
    
    expect(callbacks.onPan).toHaveBeenCalledWith(10, 5); // 110-100, 105-100
    
    // 3. Mouse Up
    canvas.dispatchEvent(new MouseEvent('mouseup'));
    
    // 4. Mouse Move (No Drag)
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 120, clientY: 120 }));
    
    expect(callbacks.onPan).toHaveBeenCalledTimes(1); // Should not have been called again
  });

  it('handles wheel for zooming', () => {
    const wheelEvent = new WheelEvent('wheel', { deltaY: -100 });
    vi.spyOn(wheelEvent, 'preventDefault');
    
    canvas.dispatchEvent(wheelEvent);
    
    expect(callbacks.onZoom).toHaveBeenCalledWith(-100);
    expect(wheelEvent.preventDefault).toHaveBeenCalled();
  });

  it('handles hover events', () => {
    // Mock getBoundingClientRect
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      left: 10,
      top: 10,
      width: 100,
      height: 100,
      x: 10,
      y: 10,
      bottom: 110,
      right: 110,
      toJSON: () => {}
    });

    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 60, clientY: 60 }));
    
    // 60 - 10 = 50
    expect(callbacks.onHover).toHaveBeenCalledWith(50, 50);
  });

  it('stops dragging on mouse leave', () => {
    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100 }));
    canvas.dispatchEvent(new MouseEvent('mouseleave'));
    
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 110, clientY: 110 }));
    
    expect(callbacks.onPan).not.toHaveBeenCalled();
  });

  it('detaches listeners on destroy', () => {
    const removeSpy = vi.spyOn(canvas, 'removeEventListener');
    inputManager.destroy();
    
    expect(removeSpy).toHaveBeenCalledWith('wheel', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function));
  });
});
