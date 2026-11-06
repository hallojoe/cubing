import { describe, expect, it } from 'vitest';
import { applyMove, initialCube, isSolved, type Move } from './cube';
import { takeNextManualSequence } from './manualQueue';

const u: Move = { face: 'U', layer: 0, turns: 1 };
const uPrime: Move = { face: 'U', layer: 0, turns: -1 };
const r: Move = { face: 'R', layer: 0, turns: 1 };

describe('manual input queue at the end of a solve', () => {
 it('discards moves buffered behind the solving turn', () => {
  const scrambled = applyMove(initialCube(3), 3, u);
  const solved = applyMove(scrambled, 3, uPrime);
  expect(isSolved(solved, 3)).toBe(true);
  const queue: Move[][] = [[r], [u]];
  expect(takeNextManualSequence(queue, isSolved(solved, 3))).toBeNull();
  expect(queue).toEqual([]);
  expect(isSolved(solved, 3)).toBe(true);
 });
 it('continues buffered input while the puzzle remains unsolved', () => {
  const queue: Move[][] = [[u], [r]];
  expect(takeNextManualSequence(queue, false)).toEqual([u]);
  expect(queue).toEqual([[r]]);
 });
 it('allows a new independent solve after clearing the old buffer', () => {
  const queue: Move[][] = [[r]];
  expect(takeNextManualSequence(queue, true)).toBeNull();
  queue.push([u]);
  expect(takeNextManualSequence(queue, false)).toEqual([u]);
 });
});
