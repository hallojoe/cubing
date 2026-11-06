import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { dragToMove } from './drag';
import { initialCube } from './cube';

const frontPiece=(size:number,x:number,y:number)=>initialCube(size).find(c=>c.pos[0]===x&&c.pos[1]===y&&c.pos[2]===size-1)!;
const camera=new THREE.Quaternion();

describe('directional drag turns',()=>{
 it('ignores taps and gestures shorter than the threshold',()=>{
  expect(dragToMove('F',frontPiece(3,1,2),3,4,4,camera)).toBeNull();
 });
 it('turns the touched row in opposite directions for left and right swipes',()=>{
  const piece=frontPiece(3,1,2);
  expect(dragToMove('F',piece,3,70,0,camera)).toEqual({face:'U',layer:0,turns:-1});
  expect(dragToMove('F',piece,3,-70,0,camera)).toEqual({face:'U',layer:0,turns:1});
 });
 it('vertical swipes rotate the touched column',()=>{
  const piece=frontPiece(5,1,3);
  expect(dragToMove('F',piece,5,0,-60,camera)).toEqual({face:'R',layer:3,turns:1});
  expect(dragToMove('F',piece,5,0,60,camera)).toEqual({face:'R',layer:3,turns:-1});
 });
 it('selects the specific inner layer on larger cubes',()=>{
  const piece=frontPiece(6,2,3);
  expect(dragToMove('F',piece,6,75,0,camera)?.layer).toBe(2);
  expect(dragToMove('F',piece,6,0,75,camera)?.layer).toBe(3);
 });
 it('uses the camera orientation to interpret the visible swipe',()=>{
  const piece=frontPiece(4,1,2);
  const rotatedCamera=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),Math.PI/2);
  // Rotating the camera rolls the on-screen horizontal axis; screen-right now
  // corresponds to an upward tangent rather than the default horizontal tangent.
  expect(dragToMove('F',piece,4,80,0,rotatedCamera)).toEqual({face:'R',layer:2,turns:1});
 });
});
