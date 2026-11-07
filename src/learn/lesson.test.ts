import { describe, expect, it } from 'vitest';
import { ALGORITHMS, algorithmsForSize, buildLesson, movesBetween, parseAlgorithm } from './lesson';
import { applyMove, FACES, initialCube, isSolved } from '../cube';

const signature = (cube: ReturnType<typeof applyMove>) =>
 cube.map(c => [c.id, c.pos.join(','), JSON.stringify(c.stickers)]).sort((a,b) => a[0].localeCompare(b[0]));

describe('learning wizard algorithms', () => {
 it('parses clockwise, prime and half turns', () => {
  expect(parseAlgorithm("R U' F2")).toEqual([
   {face:'R', layer:0, turns:1},
   {face:'U', layer:0, turns:-1},
   {face:'F', layer:0, turns:2}
  ]);
  expect(() => parseAlgorithm('M')).toThrow();
 });
 for (const size of [2,3,4,5,6,7,8,9,10,11]) {
  it(`builds exact states and navigates backward for ${size}×${size}`, () => {
   for (const algorithm of algorithmsForSize(size)) {
    const { moves, states } = buildLesson(size, algorithm);
    expect(states).toHaveLength(moves.length + 1);
    for (let i = 0; i < moves.length; i++) {
     expect(signature(applyMove(states[i], size, moves[i]))).toEqual(signature(states[i + 1]));
    }
    for (const [from,to] of [[0,moves.length],[moves.length,0],[1,Math.min(4,moves.length)]]) {
     const arrived=movesBetween(moves,from,to).reduce((cube,move)=>applyMove(cube,size,move),states[from]);
     expect(signature(arrived)).toEqual(signature(states[to]));
    }
   }
  });
 }
 it('rejects unsupported size/algorithm combinations', () => {
  expect(() => buildLesson(2,ALGORITHMS.find(item=>item.id==='oll-cross')!)).toThrow();
  expect(() => buildLesson(12,ALGORITHMS[0])).toThrow();
  expect(() => movesBetween([],0,1)).toThrow();
 });
});


// Verify purpose and reduction invariants, not just mechanically valid rotations.
describe('algorithm applicability audit',()=>{
 it('includes corner orientation on 2×2 but excludes edge orientation',()=>{
  expect(algorithmsForSize(2).map(a=>a.id)).toEqual(['right-trigger','left-trigger','sexy-move','sledgehammer','sune','anti-sune']);
 });
 for(const size of [2,3,4,5,6,7,8,9,10,11]){
  it(`preserves reduced groups and corner effects on size ${size}`,()=>{
   for(const alg of algorithmsForSize(size)){
    const cube=buildLesson(size,alg).states.at(-1)!;
    const corners=cube.filter(c=>Object.keys(c.stickers).length===3);
    const reference=buildLesson(3,alg).states.at(-1)!.filter(c=>Object.keys(c.stickers).length===3);
    const project=(items:typeof cube,n:number)=>items.map(c=>[c.id.split('-').map(Number).map(v=>v/(n-1)),c.pos.map(v=>v/(n-1)),FACES.map(f=>c.stickers[f]??'')]);
    expect(project(corners,size)).toEqual(project(reference,3));
    if(size>=4){
     for(const c of cube.filter(c=>Object.keys(c.stickers).length===1)){
      for(const [face,color] of Object.entries(c.stickers))expect(color).toBe(face);
     }
     const edges=cube.filter(c=>Object.keys(c.stickers).length===2);
     const groups=new Map<string,typeof edges>();
     for(const c of edges){const key=FACES.filter(f=>c.stickers[f]).join('');groups.set(key,[...(groups.get(key)??[]),c]);}
     expect(groups.size).toBe(12);
     for(const group of groups.values()){
      expect(group).toHaveLength(size-2);
      for(const c of group)expect(c.stickers).toEqual(group[0].stickers);
     }
    }
   }
   const sexy=parseAlgorithm("R U R' U'");
   let cube=initialCube(size);
   for(let i=0;i<6;i++)for(const move of sexy)cube=applyMove(cube,size,move);
   expect(isSolved(cube,size)).toBe(true);
  });
 }
});
