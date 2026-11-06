import {describe,it,expect} from 'vitest';
import {keyboardMoves,notationMoves} from './keyboard';
import {applyMove,initialCube,invertMove,isSolved} from './cube';

describe('csTimer keyboard',()=>{
 it('matches the standard finger-trick QWERTY layout',()=>{
  expect(keyboardMoves('KeyJ',3)).toEqual([{face:'U',layer:0,turns:1}]);
  expect(keyboardMoves('KeyF',3)).toEqual([{face:'U',layer:0,turns:-1}]);
  expect(keyboardMoves('KeyI',3)).toEqual([{face:'R',layer:0,turns:1}]);
  expect(keyboardMoves('KeyK',3)).toEqual([{face:'R',layer:0,turns:-1}]);
  expect(keyboardMoves('KeyH',3)).toEqual([{face:'F',layer:0,turns:1}]);
  expect(keyboardMoves('KeyG',3)).toEqual([{face:'F',layer:0,turns:-1}]);
  expect(keyboardMoves('KeyW',3)).toEqual([{face:'B',layer:0,turns:1}]);
  expect(keyboardMoves('KeyO',3)).toEqual([{face:'B',layer:0,turns:-1}]);
 });
 it('keeps wide turns two layers deep for sizes 2 through 11',()=>{
  for(const size of [2,3,6,11]){
   expect(notationMoves('Rw',size)).toEqual([{face:'R',layer:0,turns:1},{face:'R',layer:1,turns:1}]);
  }
 });
 it('targets central slice(s) for odd and even cubes',()=>{
  expect(notationMoves('M',3)).toEqual([{face:'R',layer:1,turns:-1}]);
  expect(notationMoves("M'",4)).toEqual([{face:'R',layer:1,turns:1},{face:'R',layer:2,turns:1}]);
  expect(notationMoves('E',11)).toEqual([{face:'U',layer:5,turns:-1}]);
 });
 it('rotates all layers for whole-cube turns',()=>{
  expect(notationMoves('x',11)).toHaveLength(11);
  expect(notationMoves("y'",6)).toHaveLength(6);
  expect(notationMoves('z',2)).toHaveLength(2);
 });
 it('can undo compound keyboard moves on all cube sizes',()=>{
  for(const size of [2,3,4,5,6,7,8,9,10,11]){
   const base=initialCube(size);
   let cube=base;
   for(const code of ['KeyJ','KeyU','KeyX','KeyY','KeyB','Digit0']){
    const moves=keyboardMoves(code,size)!;
    for(const move of moves)cube=applyMove(cube,size,move);
    for(const move of moves.slice().reverse().map(invertMove))cube=applyMove(cube,size,move);
   }
   expect(isSolved(cube,size)).toBe(true);
   expect(cube).toEqual(base);
  }
 });
 it('ignores unmapped keys',()=>{
  expect(keyboardMoves('Space',3)).toBeNull();
  expect(keyboardMoves('Escape',3)).toBeNull();
 });
});
