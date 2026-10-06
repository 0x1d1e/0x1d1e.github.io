import { expect, test } from 'vitest';
import { REST, TYPE, RUN_END, scan, typedCommand, wipe } from './stageMath';

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
