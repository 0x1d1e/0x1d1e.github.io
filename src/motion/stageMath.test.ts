import { expect, test } from 'vitest';
import {
  REST,
  TYPE,
  RUN_END,
  dissolve,
  scan,
  scrollOf,
  shownPage,
  stageHeight,
  toPosition,
  typedCommand,
  wipe,
} from './stageMath';

test('pages hold still at rest and the transition spans the middle', () => {
  expect(scan(0, 0)).toBe(0);
  expect(scan(REST, 0)).toBe(0);
  expect(scan(0.5, 0)).toBeCloseTo(0.5);
  expect(scan(1 - REST, 0)).toBe(1);
  expect(scan(1, 0)).toBe(1);
  expect(scan(1.5, 1)).toBeCloseTo(0.5); // relative to the page, not absolute
});

test('the command is typed first; the wipe only starts afterwards', () => {
  expect(wipe(0)).toBe(0);
  expect(wipe(TYPE)).toBe(0);
  expect(wipe(TYPE / 2)).toBe(0);
  expect(wipe(1)).toBe(1);
  expect(wipe((1 + TYPE) / 2)).toBeCloseTo(0.5);
});

test('typing follows scroll, forwards and backwards', () => {
  const cmd = 'cd ./what-we-build';
  expect(typedCommand(cmd, 0)).toBe('');
  expect(typedCommand(cmd, TYPE / 2)).toBe(cmd.slice(0, 9));
  expect(typedCommand(cmd, TYPE)).toBe(cmd);
  expect(typedCommand(cmd, 1)).toBe(cmd);
  expect(typedCommand(cmd, TYPE / 4)).toBe(cmd.slice(0, 5)); // scrolling back un-types
});

test('the command stays on the line until it has run, then the directory changes', () => {
  expect(RUN_END).toBeGreaterThan(TYPE); // fully typed before it runs
  expect(typedCommand('ls', RUN_END - 0.01)).toBe('ls');
});

test('the dissolve covers the screen at its midpoint, which is when the page swaps', () => {
  const n = 3;
  expect(dissolve(0, 0)).toBe(0);
  expect(shownPage(0, n)).toBe(0);
  expect(shownPage(0.3, n)).toBe(0); // typing: still the old page
  expect(shownPage(0.55, n)).toBe(0); // dissolving, not yet covered
  expect(shownPage(0.7, n)).toBe(1);
  expect(shownPage(1, n)).toBe(1);
  expect(shownPage(1.7, n)).toBe(2);
  expect(shownPage(2, n)).toBe(2);
});

test('a longer transition takes more scroll, and the others are unchanged', () => {
  const spans = [2.5, 1, 1];
  expect(stageHeight(spans)).toBe(5.5);
  expect(toPosition(0, spans)).toBe(0);
  expect(toPosition(2.5 / 4.5, spans)).toBeCloseTo(1); // end of the slow one
  expect(toPosition(1 / 4.5, spans)).toBeCloseTo(0.4); // 1 viewport in: 40% through it
  expect(toPosition(3.5 / 4.5, spans)).toBeCloseTo(2);
  expect(toPosition(1, spans)).toBe(3);
  expect(scrollOf(0, spans)).toBe(0);
  expect(scrollOf(1, spans)).toBe(2.5);
  expect(scrollOf(2, spans)).toBe(3.5);
});
