import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);

// jsdom has no IntersectionObserver or matchMedia; Motion needs both.
class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
globalThis.IntersectionObserver ??=
  IO as unknown as typeof IntersectionObserver;
window.matchMedia ??= ((q: string) => ({
  matches: false,
  media: q,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent: () => false,
  onchange: null,
})) as unknown as typeof window.matchMedia;

// jsdom has no canvas; PixelField bails out when there is no 2d context.
HTMLCanvasElement.prototype.getContext = (() => null) as never;

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;
Object.defineProperty(document, 'fonts', {
  value: { load: () => Promise.resolve([]) },
  configurable: true,
});
