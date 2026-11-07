import { describe, expect, it } from 'vitest';
import { FACES, initialCube, isSolved, type Cubie, type Face } from '../cube';
import { applyTurn, changedPieces, expandExperiment, experimentStates, inverseTurns, parseSequence } from './engine';
import { TOPICS, topicsForSize } from './topics';
const signature=(cube:Cubie[])=>cube.map(c=>({id:c.id,pos:c.pos,stickers:FACES.map(f=>c.stickers[f]??'')}));
const run=(text:string,size:number)=>parseSequence(text,size).reduce((c,t)=>applyTurn(c,size,t),initialCube(size));

describe('pro notation and construction',()=>{
 it('distinguishes inner slices, wide turns and rotations',()=>{
  expect(parseSequence('2R Rw 3Rw r x',5).map(t=>t.moves.map(m=>m.layer))).toEqual([[1],[0,1],[0,1,2],[0,1],[0,1,2,3,4]]);
  expect(signature(run('Rw',5))).toEqual(signature(run('R 2R',5)));
  expect(signature(run('x',3))).toEqual(signature(run("R M' L'",3)));
  expect(signature(run('y',3))).toEqual(signature(run("U E' D'",3)));
  expect(signature(run('z',3))).toEqual(signature(run("F S B'",3)));
  expect(signature(run('R2′',3))).toEqual(signature(run('R2',3)));
 });
 it('rejects ambiguous or unavailable notation',()=>{
  for(const [text,size] of [['M',2],['E',4],['S',6],['4Rw',3],['0R',3],['1Rw',3],['12R',11],['R3',3],['[R,U]',3],['',3],['R',12]] as const){
   expect(()=>parseSequence(text,size)).toThrow();
  }
  expect(()=>expandExperiment('R '.repeat(100),'U '.repeat(100),'commutator',3)).toThrow();
 });
 it('expands commutators and conjugates with correct inverses',()=>{
  expect(expandExperiment('R U','F2','commutator',3).map(t=>t.label).join(' ')).toBe("R U F2 U' R' F2");
  expect(expandExperiment('R U','F2','conjugate',3).map(t=>t.label).join(' ')).toBe("R U F2 U' R'");
  expect(signature(run('R L R\' L\'',3))).toEqual(signature(initialCube(3)));
 });
 for(const size of [2,3,4,5,6,7,8,9,10,11]){
  it(`reverses grouped turns and constructed cases on ${size}×${size}`,()=>{
   const turns=parseSequence("R U' F2 Rw 2R' x y2 z'",size);
   const states=experimentStates(size,turns,'solved');
   expect(signature(inverseTurns(turns).reduce((c,t)=>applyTurn(c,size,t),states.at(-1)!))).toEqual(signature(initialCube(size)));
   expect(isSolved(experimentStates(size,turns,'case').at(-1)!,size)).toBe(true);
   for(const topic of topicsForSize(size))for(const ex of topic.examples){
    const steps=expandExperiment(ex.a,ex.b??'',ex.mode??'sequence',size);
    expect(isSolved(experimentStates(size,steps,'case').at(-1)!,size)).toBe(true);
   }
  });
 }
 it('filters size-specific topics without inventing wider parity applicability',()=>{
  expect(topicsForSize(2).map(t=>t.id)).toEqual(['commutators','cll']);
  for(const size of [3,5,6,7,8,9,10,11])expect(topicsForSize(size).some(t=>t.id==='parity4')).toBe(false);
  expect(topicsForSize(4).some(t=>t.id==='parity4')).toBe(true);
 });
 it('verifies the PLL effects rather than only inverse cancellation',()=>{
  const examples=TOPICS.find(t=>t.id==='pll')!.examples;
  expect(changedPieces(initialCube(3),run(examples[0].a,3))).toEqual({corners:2,edges:2,centers:0});
  expect(changedPieces(initialCube(3),run(examples[1].a,3))).toEqual({corners:0,edges:3,centers:0});
 });
 it('verifies 4×4 parity swaps two opposite U edge groups and preserves center colors',()=>{
  const cube=run(TOPICS.find(t=>t.id==='parity4')!.examples[0].a + ' U2',4);
  const initial=initialCube(4);
  expect(changedPieces(initial.filter(c=>Object.keys(c.stickers).length===3),cube.filter(c=>Object.keys(c.stickers).length===3)).corners).toBe(0);
  for(const c of cube.filter(c=>Object.keys(c.stickers).length===1)){
   for(const [face,color] of Object.entries(c.stickers))expect(color).toBe(face);
  }
  const changed=cube.filter(c=>Object.keys(c.stickers).length===2&&JSON.stringify(c.pos)!==JSON.stringify(initial.find(o=>o.id===c.id)!.pos));
  expect(changed).toHaveLength(4);
  for(const c of changed){expect(c.pos[1]).toBe(3);expect(c.stickers.U).toBe('U');}
  // Each edge location is still a consistently colored pair after the algorithm.
  for(const faces of [['U','F'],['U','R'],['U','B'],['U','L']] as Face[][]){
   const group=cube.filter(c=>Object.keys(c.stickers).length===2&&faces.every(f=>c.stickers[f]));
   expect(group).toHaveLength(2);
   expect(group[0].stickers).toEqual(group[1].stickers);
  }
 });
});
