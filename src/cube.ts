export type Axis = 'x' | 'y' | 'z';
export type Face = 'U' | 'D' | 'L' | 'R' | 'F' | 'B';
export type Move = { face: Face; layer: number; turns: 1 | -1 | 2 };
export type Vec3 = [number, number, number];
export type Cubie = { id: string; pos: Vec3; stickers: Partial<Record<Face, Face>> };
export const FACES: Face[] = ['U','D','L','R','F','B'];
export const FACE_AXES: Record<Face,{axis:Axis;sign:1|-1}> = {
 U:{axis:'y',sign:1},D:{axis:'y',sign:-1},
 R:{axis:'x',sign:1},L:{axis:'x',sign:-1},
 F:{axis:'z',sign:1},B:{axis:'z',sign:-1}
};
export const FACE_VECTORS: Record<Face,Vec3> = {
 U:[0,1,0],D:[0,-1,0],R:[1,0,0],L:[-1,0,0],F:[0,0,1],B:[0,0,-1]
};
const VECTOR_FACES = new Map(Object.entries(FACE_VECTORS).map(([f,v])=>[v.join(','),f as Face]));
export function initialCube(size:number):Cubie[] {
 if(!Number.isInteger(size)||size<2||size>11) throw new Error('Cube size must be 2–11');
 const cubies:Cubie[]=[];
 for(let x=0;x<size;x++) for(let y=0;y<size;y++) for(let z=0;z<size;z++){
  if(x!==0&&x!==size-1&&y!==0&&y!==size-1&&z!==0&&z!==size-1)continue;
  const stickers:Partial<Record<Face,Face>>={};
  if(x===0)stickers.L='L';if(x===size-1)stickers.R='R';
  if(y===0)stickers.D='D';if(y===size-1)stickers.U='U';
  if(z===0)stickers.B='B';if(z===size-1)stickers.F='F';
  cubies.push({id:`${x}-${y}-${z}`,pos:[x,y,z],stickers});
 }
 return cubies;
}
function rotateVector([x,y,z]:Vec3,axis:Axis,direction:1|-1):Vec3{
 if(axis==='x')return[x,-direction*z,direction*y];
 if(axis==='y')return[direction*z,y,-direction*x];
 return[-direction*y,direction*x,z];
}
export function applyMove(cubies:Cubie[],size:number,move:Move):Cubie[]{
 const {axis,sign}=FACE_AXES[move.face];
 if(!Number.isInteger(move.layer)||move.layer<0||move.layer>=size)throw new Error('Invalid layer');
 const dimension={x:0,y:1,z:2}[axis];
 const layerCoordinate=sign===1?size-1-move.layer:move.layer;
 const quarterTurns=move.turns===2?2:1;
 const direction:1|-1=move.turns===2?1:(-move.turns*sign) as 1|-1;
 return cubies.map(cubie=>{
  if(cubie.pos[dimension]!==layerCoordinate)return cubie;
  let centered:Vec3=cubie.pos.map(value=>2*value-(size-1)) as Vec3;
  let stickers={...cubie.stickers};
  for(let i=0;i<quarterTurns;i++){
   centered=rotateVector(centered,axis,direction);
   const next:Partial<Record<Face,Face>>={};
   for(const [face,color] of Object.entries(stickers)){
    const newFace=VECTOR_FACES.get(rotateVector(FACE_VECTORS[face as Face],axis,direction).join(','));
    if(!newFace)throw new Error('Invalid orientation');
    next[newFace]=color;
   }
   stickers=next;
  }
  return{...cubie,pos:centered.map(value=>(value+size-1)/2) as Vec3,stickers};
 });
}
export function isSolved(cubies:Cubie[],size:number):boolean{
 return FACES.every(face=>{
  const{axis,sign}=FACE_AXES[face];const dimension={x:0,y:1,z:2}[axis];
  const coord=sign===1?size-1:0;
  const colors=cubies.filter(c=>c.pos[dimension]===coord).map(c=>c.stickers[face]);
  return colors.length===size*size&&colors.every(color=>color!==undefined&&color===colors[0]);
 });
}
export const invertMove=(move:Move):Move=>({...move,turns:move.turns===2?2:move.turns===1?-1:1});
export const moveLabel=(move:Move):string=>`${move.layer?move.layer+1:''}${move.face}${move.turns===-1?'′':move.turns===2?'2':''}`;
export function scrambleMoves(size:number,count=size*10+10):Move[]{
 const moves:Move[]=[];
 for(let i=0;i<count;i++){
  const face=FACES[Math.floor(Math.random()*FACES.length)];
  const layer=Math.floor(Math.random()*Math.ceil(size/2));
  const turns=([1,-1,2] as const)[Math.floor(Math.random()*3)];
  if(moves.length&&FACE_AXES[moves[moves.length-1].face].axis===FACE_AXES[face].axis){i--;continue;}
  moves.push({face,layer,turns});
 }
 return moves;
}
