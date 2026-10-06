import { afterEach, expect, test } from 'vitest';
import { NO_POINTER, trackPointer } from './pointer';

let stop: (() => void) | undefined;
afterEach(() => stop?.());

function fire(
  type: string,
  init: PointerEventInit & { pointerType?: string } = {},
) {
  // jsdom lacks PointerEvent; MouseEvent carries clientX/Y, pointerType is attached by hand.
  const e = new MouseEvent(type, {
    clientX: init.clientX,
    clientY: init.clientY,
    bubbles: true,
  });
  Object.defineProperty(e, 'pointerType', {
    value: init.pointerType ?? 'mouse',
  });
  (type === 'pointerleave' ? document.documentElement : window).dispatchEvent(
    e,
  );
}

test('follows moves and presses', () => {
  const t = trackPointer();
  stop = t.stop;
  fire('pointermove', { clientX: 10, clientY: 20 });
  expect(t.p).toEqual({ x: 10, y: 20 });
  fire('pointerdown', { clientX: 30, clientY: 40, pointerType: 'touch' });
  expect(t.p).toEqual({ x: 30, y: 40 });
});

test('a lifted finger lets go; a mouse button release does not', () => {
  const t = trackPointer();
  stop = t.stop;
  fire('pointermove', { clientX: 5, clientY: 5, pointerType: 'touch' });
  fire('pointerup', { pointerType: 'touch' });
  expect(t.p).toEqual({ x: NO_POINTER, y: NO_POINTER });

  fire('pointermove', { clientX: 7, clientY: 7, pointerType: 'mouse' });
  fire('pointerup', { pointerType: 'mouse' });
  expect(t.p).toEqual({ x: 7, y: 7 });
});

test('the browser taking over a gesture (scroll) cancels it', () => {
  const t = trackPointer();
  stop = t.stop;
  fire('pointermove', { clientX: 5, clientY: 5, pointerType: 'touch' });
  fire('pointercancel', { pointerType: 'touch' });
  expect(t.p.x).toBe(NO_POINTER);
});

test('leaving the window clears it, and stop() detaches', () => {
  const t = trackPointer();
  fire('pointermove', { clientX: 9, clientY: 9 });
  fire('pointerleave');
  expect(t.p.x).toBe(NO_POINTER);
  t.stop();
  fire('pointermove', { clientX: 1, clientY: 1 });
  expect(t.p.x).toBe(NO_POINTER);
});
