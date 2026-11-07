import { applyMove, initialCube, invertMove, type Cubie, type Face, type Move } from '../cube';

export type Turn = { label: string; moves: Move[] };
export type ExperimentMode = 'sequence' | 'commutator' | 'conjugate';
export type StartMode = 'solved' | 'case';
export const MAX_TURNS = 240;

/** Explicit conventions: 2R = second slice; Rw/r = two-layer block; 3Rw = three-layer block.
 * M/E/S are the unique middle slice on odd cubes only, following L/D/F respectively. */
export function parseSequence(text: string, size: number): Turn[] {
 if (!Number.isInteger(size) || size < 2 || size > 11) throw new Error('Choose a cube size from 2 to 11.');
 const normalized = text.trim().replaceAll('′', "'").replaceAll('’', "'");
 if (!normalized) throw new Error('Enter at least one move.');
 const tokens = normalized.split(/\s+/);
 if (tokens.length > MAX_TURNS) throw new Error(`Use at most ${MAX_TURNS} moves.`);
 return tokens.map(token => {
  const match = /^(?:(\d+)?([UDLRFB])(w)?|([udlrfb])|([xyzMES]))(2'?|')?$/.exec(token);
  if (!match) throw new Error(`Unsupported move “${token}”. Separate moves with spaces; use the builder for brackets.`);
  const [,prefix,upper,wide,lower,special,suffix] = match;
  const turns: Move['turns'] = suffix?.startsWith('2') ? 2 : suffix === "'" ? -1 : 1;
  let face: Face;
  let layers: number[];
  if (special) {
   face = ({x:'R',y:'U',z:'F',M:'L',E:'D',S:'F'} as const)[special as 'x'|'y'|'z'|'M'|'E'|'S'];
   if ('MES'.includes(special)) {
    if (size % 2 === 0) throw new Error(`${special} needs a unique middle slice. On even cubes use explicit slices such as 2R.`);
    layers = [Math.floor(size / 2)];
   } else layers = Array.from({length:size},(_,i)=>i);
  } else {
   face = (upper || lower.toUpperCase()) as Face;
   if (wide || lower) {
    const width = prefix ? Number(prefix) : 2;
    if (width < 2 || width > size) throw new Error(`${token}: wide-turn width must be between 2 and ${size}.`);
    layers = Array.from({length:width},(_,i)=>i);
   } else {
    const depth = prefix ? Number(prefix) : 1;
    if (depth < 1 || depth > size) throw new Error(`${token}: slice depth must be between 1 and ${size}.`);
    layers = [depth - 1];
   }
  }
  return {label:token.replace(/2'$/, '2'),moves:layers.map(layer=>({face,layer,turns}))};
 });
}

export function inverseTurns(turns: Turn[]): Turn[] {
 return turns.slice().reverse().map(turn=>({
  label:turn.label.endsWith('2')?turn.label:turn.label.endsWith("'")?turn.label.slice(0,-1):turn.label+"'",
  moves:turn.moves.map(invertMove)
 }));
}
export function expandExperiment(a: string, b: string, mode: ExperimentMode, size: number): Turn[] {
 const first = parseSequence(a,size);
 if (mode === 'sequence') return first;
 const second = parseSequence(b,size);
 const turns = [...first,...second,...inverseTurns(first),...(mode === 'commutator'?inverseTurns(second):[])];
 if (turns.length > MAX_TURNS) throw new Error(`Expanded experiment exceeds ${MAX_TURNS} moves.`);
 return turns;
}
export const applyTurn = (cube: Cubie[], size: number, turn: Turn) => turn.moves.reduce((state,move)=>applyMove(state,size,move),cube);
export function experimentStates(size: number, turns: Turn[], start: StartMode): Cubie[][] {
 let cube = initialCube(size);
 if (start === 'case') cube = inverseTurns(turns).reduce((state,turn)=>applyTurn(state,size,turn),cube);
 const states = [cube];
 for (const turn of turns) states.push(cube=applyTurn(cube,size,turn));
 return states;
}

/** Track physical pieces, including indistinguishable same-color centers. */
export function changedPieces(before: Cubie[], after: Cubie[]) {
 const originals = new Map(before.map(c=>[c.id,c]));
 const counts = {corners:0,edges:0,centers:0};
 for (const cubie of after) {
  const original = originals.get(cubie.id)!;
  const changed = original.pos.some((v,i)=>v!==cubie.pos[i]) ||
   Object.keys(original.stickers).some(face=>original.stickers[face as Face]!==cubie.stickers[face as Face]);
  if (changed) {
   const count = Object.keys(cubie.stickers).length;
   counts[count===3?'corners':count===2?'edges':'centers']++;
  }
 }
 return counts;
}
