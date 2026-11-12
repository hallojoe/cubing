import { describe, expect, it } from 'vitest';
import { applyMove, initialCube, invertMove } from '../cube';
import { notationMoves } from '../keyboard';
import { firstFrame, turnFrame } from './recorder';

describe('session frames', () => {
  for (const size of [2, 3, 4, 11]) {
    it(`replays grouped turns and undo from the actual ${size}×${size} scramble`, () => {
      const start = applyMove(initialCube(size), size, { face: 'U', turns: 1, layer: 0 });
      const moves = notationMoves('Rw', size);
      const after = moves.reduce((cube, m) => applyMove(cube, size, m), start);
      const undo = moves.map(invertMove).reverse();
      const restored = undo.reduce((cube, m) => applyMove(cube, size, m), after);
      const frames = [firstFrame(start, true), turnFrame(after, moves, 'manual', 'Rw'), turnFrame(restored, undo, 'undo')];
      expect(frames[0].label).toBe('Scrambled');
      expect(frames[1].label).toBe('Rw');
      expect(frames[2].cube).toEqual(start);
      for (let i = 1; i < frames.length; i++) {
        expect(frames[i].turns.reduce((cube, m) => applyMove(cube, size, m), frames[i-1].cube)).toEqual(frames[i].cube);
      }
    });
  }
});
