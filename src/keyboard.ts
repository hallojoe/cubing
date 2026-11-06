import { type Face, type Move } from './cube';

/** csTimer default QWERTY virtual-cube layout, keyed by physical keyboard position. */
export const CSTIMER_KEYS: Record<string, string> = {
 KeyQ:"z'",KeyW:'B',KeyE:"L'",KeyR:"Lw'",KeyT:'x',KeyY:'x',
 KeyU:'Rw',KeyI:'R',KeyO:"B'",KeyP:'z',
 KeyA:"y'",KeyS:'D',KeyD:'L',KeyF:"U'",KeyG:"F'",KeyH:'F',
 KeyJ:'U',KeyK:"R'",KeyL:"D'",Semicolon:'y',
 KeyZ:'Dw',KeyX:"M'",KeyC:"Uw'",KeyV:'Lw',KeyB:"x'",
 KeyN:"x'",KeyM:"Rw'",Comma:'Uw',Period:"M'",Slash:"Dw'",
 Digit1:"S'",Digit2:'E',Digit5:'M',Digit6:'M',Digit9:"E'",Digit0:'S'
};

const faces = ['U','D','L','R','F','B'] as const;
const isFace = (value:string):value is Face => faces.some(face=>face===value);

/**
 * Expand virtual-cube notation into primitive slice turns.
 * A single physical key is one user move, even when it affects multiple layers.
 * Wide moves turn two layers; M/E/S turn the central layer(s); x/y/z turn all layers.
 */
export function notationMoves(notation:string,size:number):Move[] {
 if(!Number.isInteger(size)||size<2||size>11)throw new Error('Unsupported cube size');
 const inverse=notation.endsWith("'");
 const token=inverse?notation.slice(0,-1):notation;
 const turns:1|-1=inverse?-1:1;
 if(isFace(token))return[{face:token,layer:0,turns}];
 const wide=token.match(/^([UDLRFB])w$/);
 if(wide){
  const face=wide[1] as Face;
  return Array.from({length:Math.min(size,2)},(_,layer)=>({face,layer,turns}));
 }
 const axes:Record<string,Face>={x:'R',y:'U',z:'F',M:'R',E:'U',S:'F'};
 const face=axes[token];
 if(!face)return[];
 const direction:1|-1=token==='M'||token==='E'?-turns as 1|-1:turns;
 if('xyz'.includes(token)){
  return Array.from({length:size},(_,layer)=>({face,layer,turns:direction}));
 }
 const centers=size%2===0?[size/2-1,size/2]:[Math.floor(size/2)];
 return centers.map(layer=>({face,layer,turns:direction}));
}

export function keyboardMoves(code:string,size:number):Move[]|null {
 const notation=CSTIMER_KEYS[code];
 return notation?notationMoves(notation,size):null;
}
