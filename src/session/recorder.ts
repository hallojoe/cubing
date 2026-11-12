import { moveLabel, type Cubie, type Move } from '../cube';

export type TurnKind = 'manual' | 'undo' | 'auto';
export type Frame = { cube: Cubie[]; label: string; turns: Move[] };

export function firstFrame(cube: Cubie[], scrambled = false): Frame {
  return { cube, label: scrambled ? 'Scrambled' : 'Start', turns: [] };
}

// Cube states are immutable and share untouched pieces between frames. Keep the
// input notation too: a wide move or cube rotation gets a single replay frame.
export function turnFrame(cube: Cubie[], turns: Move[], kind: TurnKind, notation?: string): Frame {
  const prefix = kind === 'undo' ? 'Undo ' : kind === 'auto' ? 'Auto ' : '';
  const label = notation?.replace("'", '′') ?? turns.map(moveLabel).join(' + ');
  return { cube, turns, label: prefix + label };
}
