import { applyMove, initialCube, invertMove, type Cubie, type Face, type Move } from '../cube';

export type Algorithm = {
 id: string;
 title: string;
 level: 'Beginner' | 'Intermediate';
 description: string;
 use: string;
 minSize: number;
 notation: string;
};

export const ALGORITHMS: Algorithm[] = [
 { id: 'right-trigger', title: 'Right trigger', level: 'Beginner', description: 'A basic three-turn building block used throughout layer-by-layer methods.', use: 'Practice a smooth right-hand sequence.', minSize: 2, notation: "R U R'" },
 { id: 'left-trigger', title: 'Left trigger', level: 'Beginner', description: 'The mirrored three-turn building block for left-hand solving.', use: 'Practice left-hand finger tricks.', minSize: 2, notation: "L' U' L" },
 { id: 'sexy-move', title: 'Sexy move', level: 'Beginner', description: 'A common four-move trigger. Repeating it six times restores a 3×3 cube.', use: 'Learn an essential move pattern.', minSize: 2, notation: "R U R' U'" },
 { id: 'sledgehammer', title: 'Sledgehammer', level: 'Beginner', description: 'A four-move trigger used in F2L and other methods.', use: 'Practice the R′ F R F′ pattern.', minSize: 2, notation: "R' F R F'" },
 { id: 'sune', title: 'Sune', level: 'Intermediate', description: 'A seven-move last-layer orientation algorithm for 3×3 solving.', use: 'Study the Sune pattern step by step.', minSize: 3, notation: "R U R' U R U2 R'" },
 { id: 'anti-sune', title: 'Anti-Sune', level: 'Intermediate', description: 'The complementary last-layer orientation pattern.', use: 'Compare with Sune and learn its direction changes.', minSize: 3, notation: "R U2 R' U' R U' R'" },
 { id: 'oll-cross', title: 'OLL cross', level: 'Intermediate', description: 'A common last-layer edge-orientation algorithm.', use: 'Learn the F R U R′ U′ F′ sequence.', minSize: 3, notation: "F R U R' U' F'" }
];

export type Lesson = {
 algorithm: Algorithm;
 moves: Move[];
 states: Cubie[][];
};

export function parseAlgorithm(notation: string): Move[] {
 return notation.trim().split(/\s+/).map(token => {
  const match = /^([UDLRFB])(2|')?$/.exec(token);
  if (!match) throw new Error('Unsupported move: ' + token);
  return { face: match[1] as Face, layer: 0, turns: match[2] === '2' ? 2 : match[2] === "'" ? -1 : 1 };
 });
}

export function buildLesson(size: number, algorithm: Algorithm): Lesson {
 if (!Number.isInteger(size) || size < 2 || size > 11 || size < algorithm.minSize) {
  throw new Error('Unsupported algorithm/cube-size combination');
 }
 const moves = parseAlgorithm(algorithm.notation);
 const states: Cubie[][] = [initialCube(size)];
 for (const move of moves) states.push(applyMove(states[states.length - 1], size, move));
 return { algorithm, moves, states };
}

/** From an exact lesson state to another, including backward playback. */
export function movesBetween(moves: Move[], from: number, to: number): Move[] {
 if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0 || from > moves.length || to > moves.length) {
  throw new Error('Invalid lesson step');
 }
 return from < to ? moves.slice(from, to) : moves.slice(to, from).reverse().map(invertMove);
}
