import type { ExperimentMode } from './engine';

export type Topic = {
 id: string; title: string; category: string; sizes: number[]; summary: string;
 prerequisite: string; concepts: {title:string;text:string}[]; drill: string;
 examples: {name:string;a:string;b?:string;mode?:ExperimentMode}[];
 sources: {label:string;url:string}[];
};
const all = [2,3,4,5,6,7,8,9,10,11];
const reduced = [3,4,5,6,7,8,9,10,11];
export const TOPICS: Topic[] = [
 {
  id:'commutators',title:'Commutators & conjugates',category:'Move theory',sizes:all,
  summary:'Construct an effect, undo the setup, and inspect what survives.',
  prerequisite:'Know inverses and face notation. The builder works on every supported size; the effect depends on the pieces present.',
  concepts:[
   {title:'Commutator [A, B]',text:'Execute A B A⁻¹ B⁻¹. If A and B commute, the result is the identity. Limited overlap can produce a useful local effect, but an arbitrary commutator is not necessarily a three-cycle.'},
   {title:'Conjugate [A: B]',text:'Execute A B A⁻¹. A is the setup and B is the operation. Undoing A relocates the effect of B. Changing the setup changes which pieces are affected.'},
   {title:'From theory to blindfolded solving',text:'For a three-cycle, track a buffer and two targets, then verify both permutation and orientation. A sequence that moves only three pieces can still orient them incorrectly. Compare the final state with the starting state before adopting it.'}
  ],
  drill:'Run the R/U commutator from solved and inspect the piece counts. Replace B with L: disjoint R and L turns cancel completely. Then use a conjugate to move an operation to another location.',
  examples:[{name:'Noncommuting R and U',a:'R',b:'U',mode:'commutator'},{name:'Disjoint turns: identity',a:'R',b:'L',mode:'commutator'},{name:'Relocate a trigger',a:'F',b:"R U R' U'",mode:'conjugate'}],
  sources:[{label:'Jaap Scherphuis · group theory and commutation',url:'https://www.jaapsch.net/puzzles/theory.htm'}]
 },
 {
  id:'pll',title:'PLL recognition & execution',category:'Last layer',sizes:reduced,
  summary:'Separate recognition, AUF, and execution; study exactly which pieces move.',
  prerequisite:'Last layer oriented and first two layers solved. On 4×4–11×11, centers must be solved, all edge groups paired, and reduction parity handled first.',
  concepts:[
   {title:'Recognize relationships',text:'Inspect matching side stickers, blocks and headlights instead of relying on a single face color. Orbit the case before playback and predict which pieces must exchange positions.'},
   {title:'AUF is part of the solve',text:'A U, U′ or U2 adjustment aligns the case before the algorithm or finishes the last layer afterward. An algorithm learned at one angle needs the same relative orientation in a solve.'},
   {title:'Choose by execution',text:'Compare grip changes, rotations and pauses as well as turn count. A shorter sequence is not automatically faster. Use slow playback to find chunks, then test finger tricks on a physical cube.'}
  ],
  drill:'Load the T permutation in case mode. Before revealing the final state, identify two exchanged corners and two exchanged edges (edge groups on larger cubes). Repeat with the U permutation and look for the three-edge cycle.',
  examples:[{name:'T permutation',a:"R U R' U' R' F R2 U' R' U' R U R' F'"},{name:'U permutation · R/U version',a:"R U' R U R U R U' R' U' R2"}],
  sources:[{label:'J Perm · PLL algorithms and cases',url:'https://jperm.net/algs/pll'}]
 },
 {
  id:'f2l',title:'F2L lookahead & preservation',category:'Efficiency',sizes:reduced,
  summary:'Plan an insertion while your eyes find the next pair.',
  prerequisite:'Comfortable with intuitive F2L and a solved cross. Larger cubes must already be reduced to edge groups and centers.',
  concepts:[
   {title:'Track a different pair',text:'Once the current insertion is known, stop watching it. Track one corner or edge of the next pair while executing slowly. Increase speed only when you can keep the next decision ready.'},
   {title:'Use empty slots deliberately',text:'An unsolved slot can provide temporary working space. A shortcut is useful only if it preserves the cross and every pair you have already solved. Inspect all faces rather than the front slot alone.'},
   {title:'Measure pauses, not just turns',text:'Practice short blocks at a steady pace. Note whether a rotation improves visibility enough to justify it. The lab demonstrates local effects; whole-solve lookahead still needs real scrambles.'}
  ],
  drill:'Load an insertion in case mode and identify its corner and edge. Step backward once to inspect how the pair is opened. Compare the two examples from solved; they have different starting cases, so they are not interchangeable solutions.',
  examples:[{name:'Right-slot insertion',a:"R U R'"},{name:'Sledgehammer insertion',a:"R' F R F'"}],
  sources:[{label:'J Perm · advanced F2L',url:'https://jperm.net/3x3/cfop/f2l'}]
 },
 {
  id:'cll',title:'2×2: CLL to EG',category:'Last layer',sizes:[2],
  summary:'Read corner relationships and understand the first-layer requirement.',
  prerequisite:'Solve a 2×2 layer reliably. CLL assumes a solved layer, not just a single-color face.',
  concepts:[
   {title:'Orientation is not permutation',text:'Sune and Anti-Sune can orient corners without finishing their positions. CLL combines both tasks, choosing a case from the visible corner relationships.'},
   {title:'Face versus layer',text:'A solved layer has correct side-color relationships as well as one solid face. If only the face is solved, a CLL algorithm may leave the bottom corners permuted.'},
   {title:'Why EG changes recognition',text:'EG extends recognition to the bottom-layer permutation. EG-1 uses an adjacent bottom-corner swap. Keep that requirement separate from the CLL case; the same top appearance alone is not enough.'}
  ],
  drill:'Study the Sune CLL example from its inverse-generated case: the bottom layer is solved and the full sequence solves this exact case. In your own solves, compare side stickers too—matching top orientation alone does not guarantee the same CLL case.',
  examples:[{name:'CLL Sune S1',a:"R U R' U R U2 R'"}],
  sources:[{label:'J Perm · CLL case library',url:'https://jperm.net/algs/2x2/cll'},{label:'J Perm · advanced 2×2 methods',url:'https://jperm.net/2x2/faster'}]
 },
 {
  id:'parity4',title:'4×4 PLL parity',category:'Big cubes',sizes:[4],
  summary:'See why an outer-turn-only solution cannot finish every reduced state.',
  prerequisite:'4×4 centers solved and edges paired. This exact slice-width recipe is restricted to 4×4.',
  concepts:[
   {title:'Reduction changes the picture',text:'Two paired edge groups can appear exchanged while the corners are unchanged. That apparent permutation cannot be produced using only 3×3 outer turns; inner-slice moves are needed.'},
   {title:'Read slice notation precisely',text:'2R means only the second layer from the right. Rw means the outer two right layers together. In this algorithm, Uw2 turns the top two layers by 180°. Confusing 2R and Rw changes the effect.'},
   {title:'Do not scale a recipe blindly',text:'Larger even cubes also need parity handling, but their wing orbits and required layer blocks must be considered. This 4×4 recipe is not offered as a universal 6×6–10×10 algorithm. OLL parity is a separate problem.'}
  ],
  drill:'From solved, run the six-turn sequence, then append U2 to align the corners. Centers return to solid colors and two opposite U edge groups exchange after that alignment. Compare both presets. A general solve may still need ordinary PLL and AUF.',
  examples:[{name:'4×4 PLL parity · inner slices',a:'2R2 U2 2R2 Uw2 2R2 Uw2'},{name:'Parity + U2 alignment',a:'2R2 U2 2R2 Uw2 2R2 Uw2 U2'}],
  sources:[{label:'J Perm · 4×4 PLL parity',url:'https://jperm.net/algs/4x4/pll'}]
 },
 {
  id:'reduction',title:'Reduction & edge orbits',category:'Big cubes',sizes:[4,5,6,7,8,9,10,11],
  summary:'Know when a large cube really behaves like a 3×3.',
  prerequisite:'Know centers, wings and paired edge groups. Examples here explore turns; they are not full center-building or edge-pairing solutions.',
  concepts:[
   {title:'The reduction invariant',text:'With each center a solid color in the correct scheme and every edge group fully paired, outer turns preserve those groups. Your 3×3 algorithms then act on the reduced puzzle.'},
   {title:'Odd and even are different',text:'Odd cubes have fixed middle centers and middle edge pieces. Even cubes do not. A fully reduced odd cube does not have 4×4-style PLL parity, but wing-pairing problems can still arise before reduction is complete.'},
   {title:'More layers, more orbits',text:'Wings at different distances from the middle belong to different orbits. Work orbit by orbit and restore displaced centers after slice work. A 5×5 last-edge procedure is not a size-independent recipe for every orbit of an 11×11.'}
  ],
  drill:'Compare R, Rw and 2R from solved. Inspect which centers and wings move, then run an outer-turn Sune. Notice how intact center colors and edge groups survive the outer-turn sequence.',
  examples:[{name:'Outer face only',a:'R'},{name:'Two-layer block',a:'Rw'},{name:'Single inner slice',a:'2R'},{name:'Reduced-stage Sune',a:"R U R' U R U2 R'"}],
  sources:[{label:'J Perm · 4×4 reduction prerequisites',url:'https://jperm.net/4x4'},{label:'J Perm · 5×5 reduction and edge pairing',url:'https://jperm.net/5x5'}]
 }
];
export const topicsForSize = (size: number) => TOPICS.filter(topic=>topic.sizes.includes(size));
