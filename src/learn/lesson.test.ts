import { describe, expect, it } from 'vitest';
import { ALGORITHMS, buildLesson, movesBetween, parseAlgorithm } from './lesson';
import { applyMove } from '../cube';

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
   for (const algorithm of ALGORITHMS.filter(item => item.minSize <= size)) {
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
  expect(() => buildLesson(2,ALGORITHMS.find(item=>item.id==='sune')!)).toThrow();
  expect(() => buildLesson(12,ALGORITHMS[0])).toThrow();
  expect(() => movesBetween([],0,1)).toThrow();
 });
});
