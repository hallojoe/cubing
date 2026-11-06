import * as THREE from 'three';
import { FACE_VECTORS, type Cubie, type Face, type Move } from './cube';

/**
 * Convert a sticker swipe into a turn of the row/column passing through that sticker.
 * The swipe is compared against the two tangent directions on the touched face,
 * projected into camera screen space. This works after the camera is orbited.
 */
export function dragToMove(
 face: Face,
 piece: Cubie,
 size: number,
 deltaX: number,
 deltaY: number,
 cameraQuaternion: THREE.Quaternion,
 cubeYaw = -.15
): Move | null {
 const distance = Math.hypot(deltaX, deltaY);
 if (distance < 14) return null;

 const normal = new THREE.Vector3(...FACE_VECTORS[face]);
 const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cameraQuaternion);
 const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cameraQuaternion);
 const yaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), cubeYaw);

 let chosen: THREE.Vector3 | null = null;
 let score = -Infinity;
 for (let dimension = 0; dimension < 3; dimension++) {
  if (Math.abs(normal.getComponent(dimension)) > .5) continue;
  const local = new THREE.Vector3().setComponent(dimension, 1);
  const world = local.clone().applyQuaternion(yaw);
  // Negative screen Y is upwards.
  const projected = new THREE.Vector2(world.dot(right), -world.dot(up));
  if (projected.lengthSq() < 1e-8) continue;
  projected.normalize();
  const alignment = (deltaX * projected.x + deltaY * projected.y) / distance;
  if (Math.abs(alignment) > score) {
   score = Math.abs(alignment);
   chosen = local.multiplyScalar(alignment >= 0 ? 1 : -1);
  }
 }
 if (!chosen) return null;

 // Positive physical rotation about axis = surface normal × finger movement.
 const rotation = normal.cross(chosen);
 const dimension = Math.abs(rotation.x) > .5 ? 0 : Math.abs(rotation.y) > .5 ? 1 : 2;
 const faces: [Face, Face, Face] = ['R', 'U', 'F'];
 const physicalDirection = Math.sign(rotation.getComponent(dimension));
 // Canonical positive-side faces use turns = -physical rotation direction.
 return {
  face: faces[dimension],
  layer: size - 1 - piece.pos[dimension],
  turns: physicalDirection === 1 ? -1 : 1
 };
}
