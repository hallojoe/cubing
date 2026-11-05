import { describe, it, expect } from 'vitest';
import { applyMove, initialCube, invertMove, isSolved, scrambleMoves, FACES, type Move } from './cube';
const signature=(cube:ReturnType<typeof initialCube>)=>cube.map(c=>`${c.id}:${c.pos.join(',')}:${Object.entries(c.stickers).sort().join('/')}`).sort();
describe('cube model',()=>{
 for(const n of [2,3,4,5,6]){
  it(`${n}x${n}: four turns restore exact state`,()=>{
   const base=initialCube(n);
   for(const face of FACES)for(let layer=0;layer<n;layer++){
    let cube=base;for(let i=0;i<4;i++)cube=applyMove(cube,n,{face,layer,turns:1});
    expect(signature(cube)).toEqual(signature(base));
   }
  });
  it(`${n}x${n}: inverse scramble solves`,()=>{
   const scramble=scrambleMoves(n,75);let cube=initialCube(n);
   for(const move of scramble)cube=applyMove(cube,n,move);
   for(const move of scramble.slice().reverse().map(invertMove))cube=applyMove(cube,n,move);
   expect(isSolved(cube,n)).toBe(true);
   expect(signature(cube)).toEqual(signature(initialCube(n)));
  });
  it(`${n}x${n}: layer turns work`,()=>{
   const move:Move={face:'R',layer:n-1,turns:1};
   expect(isSolved(applyMove(initialCube(n),n,move),n)).toBe(false);
  });
 }
});