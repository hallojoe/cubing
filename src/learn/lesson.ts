import { applyMove, initialCube, invertMove, type Cubie, type Face, type Move } from '../cube';

export type Algorithm = {
 id: string;
 title: string;
 level: 'Beginner' | 'Intermediate';
 description: string;
 use: string;
 minSize: number;
 maxSize?: number;
 purpose?: 'trigger' | 'corners' | 'edges';
 notation: string;
};

export const ALGORITHMS: Algorithm[] = [
 { id: 'right-trigger', title: 'Right trigger', level: 'Beginner', description: 'A basic three-turn building block used throughout layer-by-layer methods.', use: 'Practice a smooth right-hand sequence.', minSize: 2, notation: "R U R'" },
 { id: 'left-trigger', title: 'Left trigger', level: 'Beginner', description: 'The mirrored three-turn building block for left-hand solving.', use: 'Practice left-hand finger tricks.', minSize: 2, notation: "L' U' L" },
 { id: 'sexy-move', title: 'Sexy move', level: 'Beginner', description: 'A common four-move trigger. Repeating it six times restores a 3×3 cube.', use: 'Learn an essential move pattern.', minSize: 2, notation: "R U R' U'" },
 { id: 'sledgehammer', title: 'Sledgehammer', level: 'Beginner', description: 'A four-move trigger used in F2L and other methods.', use: 'Practice the R′ F R F′ pattern.', minSize: 2, notation: "R' F R F'" },
 { id: 'sune', title: 'Sune', level: 'Intermediate', description: 'Last-layer corner orientation for 2×2, 3×3, and reduced larger cubes.', use: 'Orient the matching Sune corner case; this does not solve every last-layer case or finish permutation.', minSize: 2, purpose: 'corners', notation: "R U R' U R U2 R'" },
 { id: 'anti-sune', title: 'Anti-Sune', level: 'Intermediate', description: 'The complementary corner-orientation pattern, including on 2×2.', use: 'Orient the matching Anti-Sune case; compare its direction changes with Sune.', minSize: 2, purpose: 'corners', notation: "R U2 R' U' R U' R'" },
 { id: 'oll-cross', title: 'OLL cross', level: 'Intermediate', description: 'Last-layer edge orientation for 3×3 and reduced larger cubes. Not a 2×2 technique.', use: 'For the line case, hold the line horizontally on U. Other edge patterns need setup or additional applications; this is not a parity fix.', minSize: 3, purpose: 'edges', notation: "F R U R' U' F'" }
];

/** Applicability is about the teaching purpose, not just whether turns are legal. */
export function isAlgorithmApplicable(algorithm: Algorithm, size: number): boolean {
 return Number.isInteger(size) && size >= 2 && size <= 11 && size >= algorithm.minSize && size <= (algorithm.maxSize ?? 11);
}

export const algorithmsForSize = (size: number) => ALGORITHMS.filter(a => isAlgorithmApplicable(a, size));

export function applicabilityNote(algorithm: Algorithm, size: number): string {
 if (!isAlgorithmApplicable(algorithm, size)) return 'This technique is not applicable to this cube size.';
 if (size >= 4) return 'For solving: first solve all centers in the correct color scheme and pair every edge group. These outer turns then act like 3×3 moves. They do not build centers, pair edges, or fix parity. Trigger drills can be practiced before reduction.';
 if (size === 2) return algorithm.purpose === 'corners'
  ? '2×2 has only corners. Match the corner-orientation case; permutation may still remain.'
  : 'Valid as a corner / finger-trick drill. A 2×2 has no edges, centers, or F2L edge–corner pairs.';
 return 'Use the matching case and orientation. Triggers are building blocks; none of these sequences is a complete solve method.';
}

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
 if (!isAlgorithmApplicable(algorithm, size)) {
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

