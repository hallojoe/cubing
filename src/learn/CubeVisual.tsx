import { memo, useRef, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { FACE_AXES, FACES, type Cubie, type Face, type Move } from '../cube';

const COLORS: Record<Face,string> = {
 U:'#f8f8f2', D:'#e9c932', L:'#f08232', R:'#d64443', F:'#26a86e', B:'#3f74d3'
};
const normals: Record<Face,[number,number,number]> = {
 U:[0,1,0],D:[0,-1,0],L:[-1,0,0],R:[1,0,0],F:[0,0,1],B:[0,0,-1]
};
const rotations: Record<Face,[number,number,number]> = {
 U:[-Math.PI/2,0,0],D:[Math.PI/2,0,0],L:[0,-Math.PI/2,0],R:[0,Math.PI/2,0],F:[0,0,0],B:[0,Math.PI,0]
};
const bodyGeometry=new THREE.BoxGeometry(1,1,1);
const stickerGeometry=new THREE.PlaneGeometry(1,1);
const bodyMaterial=new THREE.MeshStandardMaterial({color:'#121e29',roughness:.55});
const stickerMaterials=FACES.reduce((map,face)=>{map[face]=new THREE.MeshStandardMaterial({color:COLORS[face],roughness:.4,side:THREE.DoubleSide});return map;},{} as Record<Face,THREE.MeshStandardMaterial>);

function CubieMesh({cubie,size}:{cubie:Cubie;size:number}){
 const unit=3.1/size;
 const center=cubie.pos.map(v=>(v-(size-1)/2)*unit) as [number,number,number];
 return <group position={center}>
  <mesh geometry={bodyGeometry} material={bodyMaterial} scale={[unit*.96,unit*.96,unit*.96]}/>
  {FACES.map(face=>{
   const sticker=cubie.stickers[face];
   if(!sticker)return null;
   const offset=normals[face].map(v=>v*unit*.489) as [number,number,number];
   return <mesh key={face} geometry={stickerGeometry} material={stickerMaterials[sticker]}
    position={offset} rotation={rotations[face]} scale={[unit*.84,unit*.84,1]}/>;
  })}
 </group>;
}

export type PlayingMove={move:Move;id:number;next:number;layers?:number[]};
function AnimatedLayer({move,done,children,speed=1}:{move:Move;done:()=>void;children:ReactNode;speed?:number}){
 const ref=useRef<THREE.Group>(null);
 const progress=useRef(0);
 const completed=useRef(false);
 const {axis,sign}=FACE_AXES[move.face];
 const target=(move.turns===2?2:-move.turns*sign)*Math.PI/2;
 const duration=(move.turns===2?.4:.3)/speed;
 useFrame((_,delta)=>{
  if(!ref.current||completed.current)return;
  progress.current=Math.min(1,progress.current+Math.min(delta,.05)/duration);
  const p=progress.current;
  ref.current.rotation[axis]=target*p*p*(3-2*p);
  if(p===1){completed.current=true;done();}
 });
 return <group ref={ref}>{children}</group>;
}
export function TeachingCube({cubies,size,playing,onMoveFinished,speed=1}:{cubies:Cubie[];size:number;playing:PlayingMove|null;onMoveFinished:()=>void;speed?:number}){
 const axis=playing?FACE_AXES[playing.move.face].axis:'x';
 const coordIndex={x:0,y:1,z:2}[axis];
 const coordinates=playing?(playing.layers??[playing.move.layer]).map(layer=>FACE_AXES[playing.move.face].sign===1?size-1-layer:layer):[];
 const still=playing?cubies.filter(c=>!coordinates.includes(c.pos[coordIndex])):cubies;
 const turning=playing?cubies.filter(c=>coordinates.includes(c.pos[coordIndex])):[];
 return <Canvas dpr={[1,1.6]} camera={{position:[5,4,6.7],fov:38}} gl={{antialias:true}}>
  <color attach="background" args={['#101a25']}/>
  <ambientLight intensity={1.75}/><directionalLight intensity={2.2} position={[4,7,6]}/>
  <group rotation={[0,-.15,0]}>
   {still.map(c=><CubieMesh key={c.id} cubie={c} size={size}/>)}
   {playing&&<AnimatedLayer key={playing.id} move={playing.move} done={onMoveFinished} speed={speed}>
    {turning.map(c=><CubieMesh key={c.id} cubie={c} size={size}/>)}
   </AnimatedLayer>}
  </group>
  <OrbitControls enablePan={false} minDistance={5} maxDistance={12}/>
 </Canvas>;
}

type Vertex=[number,number,number];
const project=([x,y,z]:Vertex):[number,number]=>[(x-z)*10,(x+z)*4.8-y*9.6];
const polygon=(corners:Vertex[])=>corners.map(v=>project(v).join(',')).join(' ');

/** Lightweight, noninteractive isometric 3D snapshot; no WebGL context per list row. */
export const StaticCubePreview=memo(function StaticCubePreview({cubies,size,label}:{cubies:Cubie[];size:number;label:string}){
 const cells=cubies.flatMap(c=>{
  const [x,y,z]=c.pos;
  const faces:{face:Face;corners:Vertex[]}[]=[];
  if(z===size-1)faces.push({face:'F',corners:[[x,y,size],[x+1,y,size],[x+1,y+1,size],[x,y+1,size]]});
  if(x===size-1)faces.push({face:'R',corners:[[size,y,z],[size,y,z+1],[size,y+1,z+1],[size,y+1,z]]});
  if(y===size-1)faces.push({face:'U',corners:[[x,size,z],[x+1,size,z],[x+1,size,z+1],[x,size,z+1]]});
  return faces.map(({face,corners})=>({key:c.id+face,points:polygon(corners),color:COLORS[c.stickers[face]??face],face}));
 });
 const border=4;
 return <svg className="learn-mini-cube" role="img" aria-label={label}
  viewBox={`${-size*10-border} ${-size*9.6-border} ${size*20+border*2} ${size*19.2+border*2}`}
  xmlns="http://www.w3.org/2000/svg">
  {cells.map(cell=><polygon key={cell.key} points={cell.points} fill={cell.color}
   stroke="#172431" strokeWidth={size>=8?1.1:1.4} strokeLinejoin="round"/>)}
 </svg>;
});

