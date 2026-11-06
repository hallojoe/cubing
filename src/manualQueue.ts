import type { Move } from './cube';

/**
 * Finish a manual turn. A solved cube must not execute buffered input from
 * the prior timed attempt; a future, explicit keypress may begin a new solve.
 */
export function takeNextManualSequence(queue: Move[][], solved: boolean): Move[] | null {
 if (solved) {
  queue.length = 0;
  return null;
 }
 return queue.shift() ?? null;
}
