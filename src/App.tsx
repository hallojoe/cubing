import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, ThreeEvent, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { ArrowRight, Check, CircleHelp, Clock3, Grip, Layers3, Palette, RotateCcw, Shuffle, Sparkles, Square, TimerReset, Undo2, Zap } from 'lucide-react';
import { applyMove, FACE_AXES, FACES, initialCube, invertMove, isSolved, moveLabel, scrambleMoves, type Cubie, type Face, type Move } from './cube';

const SCHEMES = {
 Classic:{U:'#f7f7f3',D:'#f1d135',L:'#ed7c25',R:'#db3d3d',F:'#24a76a',B:'#2963ce'},
 Pastel:{U:'#f5eee8',D:'#f4cf88',L:'#f0a995',R:'#df8fb1',F:'#92c9ad',B:'#91abe2'},
 Neon:{U:'#eeeeff',D:'#eaff3a',L:'#ff8b2c',R:'#ff3d80',F:'#29e8ac',B:'#5a83ff'},
 Mono:{U:'#ffffff',D:'#999da5',L:'#686f7a',R:'#d8dadd',F:'#b8bec8',B:'#3c4556'}
};
type Scheme=keyof typeof SCHEMES;
type Style='filled'|'wireframe';
type InteractionMode='view'|'solve';
type AnimatedMove={move:Move;kind:'manual'|'undo'|'auto';id:number};
const normals:Record<Face,[number,number,number]>={U:[0,1,0],D:[0,-1,0],L:[-1,0,0],R:[1,0,0],F:[0,0,1],B:[0,0,-1]};
const orientations:Record<Face,[number,number,number]>={U:[-Math.PI/2,0,0],D:[Math.PI/2,0,0],L:[0,-Math.PI/2,0],R:[0,Math.PI/2,0],F:[0,0,0],B:[0,Math.PI,0]};
const formatTime=(ms:number)=>{const t=Math.floor(ms/1000);return `${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}.${String(Math.floor((ms%1000)/10)).padStart(2,'0')}`;};

function Piece({piece,size,scheme,style,mode,onTurn}:{piece:Cubie;size:number;scheme:Scheme;style:Style;mode:InteractionMode;onTurn:(face:Face,shift:boolean,alt:boolean)=>void}){
 const step=3.15/size;
 const position=piece.pos.map(c=>(c-(size-1)/2)*step) as [number,number,number];
 const handle=(face:Face,e:ThreeEvent<PointerEvent>)=>{if(mode!=='solve')return;e.stopPropagation();onTurn(face,e.nativeEvent.shiftKey,e.nativeEvent.altKey);};
 return <group position={position}>
  {style==='filled'?<RoundedBox args={[step*.965,step*.965,step*.965]} radius={Math.min(.065,step*.11)} smoothness={3}><meshStandardMaterial color="#111923" roughness={.53}/></RoundedBox>:<mesh><boxGeometry args={[step*.97,step*.97,step*.97]}/><meshBasicMaterial color="#506174" transparent opacity={.06} depthWrite={false}/></mesh>}
  {FACES.map(face=>{const sticker=piece.stickers[face];if(!sticker)return null;
   const offset=normals[face].map(v=>v*step*.491) as [number,number,number];
   return <group key={face} position={offset} rotation={orientations[face]}>
    <mesh onClick={e=>handle(face,e)}><planeGeometry args={[step*.83,step*.83]}/><meshStandardMaterial color={SCHEMES[scheme][sticker]} roughness={.36} side={THREE.DoubleSide} transparent={style==='wireframe'} opacity={style==='wireframe'?.25:1}/></mesh>
    {style==='wireframe'&&<lineSegments position={[0,0,.006]}><edgesGeometry args={[new THREE.PlaneGeometry(step*.88,step*.88)]}/><lineBasicMaterial color={SCHEMES[scheme][sticker]}/></lineSegments>}
   </group>;
  })}
 </group>;
}
function TurningLayer({move,onComplete,children}:{move:Move;onComplete:()=>void;children:ReactNode}){
 const pivot=useRef<THREE.Group>(null);
 const progress=useRef(0);
 const finished=useRef(false);
 const {axis,sign}=FACE_AXES[move.face];
 const target=(move.turns===2?2:-move.turns*sign)*Math.PI/2;
 const duration=move.turns===2?.34:.24;
 useFrame((_,delta)=>{
  if(!pivot.current||finished.current)return;
  progress.current=Math.min(1,progress.current+Math.min(delta,.05)/duration);
  const t=progress.current;
  const eased=t*t*(3-2*t);
  pivot.current.rotation[axis]=target*eased;
  if(t>=1){finished.current=true;onComplete();}
 });
 return <group ref={pivot}>{children}</group>;
}
function CubeScene({cubies,size,scheme,style,mode,onTurn,animation,onAnimationComplete}:{cubies:Cubie[];size:number;scheme:Scheme;style:Style;mode:InteractionMode;onTurn:(face:Face,shift:boolean,alt:boolean)=>void;animation:AnimatedMove|null;onAnimationComplete:()=>void}){
 const active=animation?.move;
 const axis=active?FACE_AXES[active.face].axis:'x';
 const index={x:0,y:1,z:2}[axis];
 const coordinate=active?(FACE_AXES[active.face].sign===1?size-1-active.layer:active.layer):-1;
 const fixed=active?cubies.filter(c=>c.pos[index]!==coordinate):cubies;
 const turning=active?cubies.filter(c=>c.pos[index]===coordinate):[];
 const renderPiece=(piece:Cubie)=><Piece key={piece.id} piece={piece} size={size} scheme={scheme} style={style} mode={mode} onTurn={onTurn}/>;
 return <Canvas dpr={[1,2]} camera={{position:[5.6,4.5,6.8],fov:38}} gl={{antialias:true}}>
  <color attach="background" args={['#101923']}/>
  <ambientLight intensity={2}/><directionalLight position={[4,8,6]} intensity={2.3}/><directionalLight position={[-5,-3,-6]} intensity={1} color="#9ebbe9"/>
  <group rotation={[0,-.15,0]}>{fixed.map(renderPiece)}{animation&&<TurningLayer key={animation.id} move={animation.move} onComplete={onAnimationComplete}>{turning.map(renderPiece)}</TurningLayer>}</group>
  <OrbitControls enabled={mode==='view'} enablePan={false} minDistance={5} maxDistance={13} enableDamping dampingFactor={.08}/>
 </Canvas>;
}
export default function App(){
 const [size,setSize]=useState(3);
 const [cubies,setCubies]=useState(()=>initialCube(3));
 const [style,setStyle]=useState<Style>('filled');
 const [mode,setMode]=useState<InteractionMode>('view');
 const [scheme,setScheme]=useState<Scheme>('Classic');
 const [layer,setLayer]=useState(0);
 const [history,setHistory]=useState<Move[]>([]);
 const [moves,setMoves]=useState(0);
 const [running,setRunning]=useState(false);
 const [elapsed,setElapsed]=useState(0);
 const [startedAt,setStartedAt]=useState<number|null>(null);
 const [busy,setBusy]=useState(false);
 const [animation,setAnimation]=useState<AnimatedMove|null>(null);
 const [notice,setNotice]=useState('Ready to twist?');
 const [showHelp,setShowHelp]=useState(false);
 const [lastScramble,setLastScramble]=useState('');
 const cubeRef=useRef(cubies),historyRef=useRef(history),busyRef=useRef(false);
 const activeRef=useRef<AnimatedMove|null>(null),autoQueueRef=useRef<Move[]>([]),animationIdRef=useRef(0);
 const solved=useMemo(()=>isSolved(cubies,size),[cubies,size]);
 useEffect(()=>{cubeRef.current=cubies;},[cubies]);
 useEffect(()=>{historyRef.current=history;},[history]);
 useEffect(()=>{if(!running||startedAt===null)return;const i=window.setInterval(()=>setElapsed(performance.now()-startedAt),33);return()=>window.clearInterval(i);},[running,startedAt]);

 const reset=(n=size)=>{
  if(busyRef.current)return;
  autoQueueRef.current=[];activeRef.current=null;setAnimation(null);
  const next=initialCube(n);cubeRef.current=next;historyRef.current=[];setCubies(next);setHistory([]);
  setMoves(0);setStartedAt(null);setRunning(false);setElapsed(0);setLastScramble('');setNotice('Cube reset. Ready to solve.');
 };
 const startAnimation=(move:Move,kind:AnimatedMove['kind'])=>{
  if(kind!=='auto'){if(busyRef.current)return;busyRef.current=true;setBusy(true);}
  const next={move,kind,id:++animationIdRef.current};
  activeRef.current=next;setAnimation(next);
 };
 const completeAnimation=()=>{
  const active=activeRef.current;
  if(!active)return;
  const {move,kind}=active;
  const next=applyMove(cubeRef.current,size,move);
  cubeRef.current=next;setCubies(next);
  const log=kind==='manual'?[...historyRef.current,move]:historyRef.current.slice(0,-1);
  historyRef.current=log;setHistory(log);
  const done=isSolved(next,size);
  if(kind!=='auto'){
   setMoves(n=>n+1);
   if(done){
    setRunning(false);
    setStartedAt(t=>{if(t!==null)setElapsed(performance.now()-t);return null;});
    setNotice('Solved! Beautiful work.');
   }else if(kind==='manual'){
    setNotice('Keep going — you’ve got this.');
   }
  }
  if(kind==='auto'&&autoQueueRef.current.length>0){
   const nextMove=autoQueueRef.current.shift()!;
   const following={move:nextMove,kind:'auto' as const,id:++animationIdRef.current};
   activeRef.current=following;setAnimation(following);
  }else{
   activeRef.current=null;setAnimation(null);autoQueueRef.current=[];
   busyRef.current=false;setBusy(false);
   if(kind==='auto')setNotice('Auto-solve complete!');
  }
 };
 const turn=(move:Move)=>{
  if(busyRef.current)return;
  if(!running&&startedAt===null){
   setRunning(true);setStartedAt(performance.now());
  }
  startAnimation(move,'manual');
 };
 const scramble=()=>{
  if(busyRef.current)return;
  const sequence=scrambleMoves(size);let next=initialCube(size);for(const move of sequence)next=applyMove(next,size,move);
  cubeRef.current=next;historyRef.current=sequence;setCubies(next);setHistory(sequence);
  setMoves(0);setStartedAt(null);setRunning(false);setElapsed(0);
  setLastScramble(sequence.map(moveLabel).join(' '));setNotice('Scrambled! The clock starts on your first move.');
 };
 const undo=()=>{
  if(busyRef.current||historyRef.current.length===0)return;
  startAnimation(invertMove(historyRef.current[historyRef.current.length-1]),'undo');
 };
 const autoSolve=()=>{
  if(busyRef.current||historyRef.current.length===0)return;
  const inverses=historyRef.current.slice().reverse().map(invertMove);
  busyRef.current=true;setBusy(true);setRunning(false);setStartedAt(null);
  setNotice('Rewinding your moves…');
  autoQueueRef.current=inverses.slice(1);
  startAnimation(inverses[0],'auto');
 };
 const handleTurn=(face:Face,shift:boolean,alt:boolean)=>turn({face,layer:Math.min(layer,size-1),turns:alt?2:shift?-1:1});
 return <div className="app">
  <header className="topbar"><div className="brand"><div className="brand-mark"><span/><span/><span/><span/></div><span>CUBING<span className="brand-dot">.</span></span></div><div className="top-center"><span className="live-dot"/> THE CUBE LAB <span className="edition">/ INTERACTIVE PLAYGROUND</span></div><button className="help-button" onClick={()=>setShowHelp(true)}><CircleHelp size={16}/> How to play</button></header>
  <main className="workspace">
   <section className="viewer-column">
    <div className="viewer-heading"><div className="eyebrow"><span className="eyebrow-line"/> THE PUZZLE</div><h1>Think outside<br/><em>the cube.</em></h1><p>A little twist. A lot of possibilities.</p></div>
    <div className="cube-stage"><div className="scene-glow"/><div className="stage-tag"><span className="live-dot"/> INTERACTIVE 3D</div>
     <div className="mode-switch" role="group" aria-label="Cube interaction mode"><button type="button" className={mode==='view'?'active':''} aria-pressed={mode==='view'} onClick={()=>setMode('view')}><RotateCcw size={15}/> Rotate view</button><button type="button" className={mode==='solve'?'active':''} aria-pressed={mode==='solve'} onClick={()=>setMode('solve')}><Grip size={15}/> Solve</button></div>
     <div className={`stage-cube mode-${mode}`}><CubeScene cubies={cubies} size={size} style={style} scheme={scheme} mode={mode} onTurn={handleTurn} animation={animation} onAnimationComplete={completeAnimation}/></div>
     <div className="stage-bottom"><span><Grip size={16}/>{mode==='view'?'DRAG TO ROTATE VIEW':'CLICK STICKERS TO TURN FACES'}</span><span>{mode==='view'?'SCROLL TO ZOOM +':'CAMERA LOCKED · SWITCH TO ROTATE VIEW'}</span></div></div>
    <div className="status-bar"><div className="status-icon">{solved?<Check size={18}/>:<Sparkles size={18}/>}</div><div><strong>{solved?'All sides aligned':'Puzzle in progress'}</strong><span>{notice}</span></div><span className="status-pill">{solved?'SOLVED':'UNSOLVED'}</span></div>
   </section>
   <aside className="sidebar">
    <div className="sidebar-intro"><div className="eyebrow"><span className="eyebrow-line"/> YOUR WORKSPACE</div><h2>Cube controls<span>.</span></h2><p>Every great solve starts with a single turn.</p></div>
    <div className="panel"><div className="panel-title"><span className="section-number">01</span><h3>Choose your cube</h3><Layers3 size={17}/></div>
     <div className="size-options">{[2,3,4,5,6].map(n=><button key={n} disabled={busy} className={size===n?'active':''} onClick={()=>{setSize(n);setLayer(0);reset(n);}}><strong>{n}×{n}</strong></button>)}</div>
     <div className="setting-foot"><span><span className="small-dot"/> {size} × {size} × {size} cube</span><span>{size*size*6} stickers</span></div>
    </div>
    <div className="panel"><div className="panel-title"><span className="section-number">02</span><h3>Solve session</h3><TimerReset size={17}/></div>
     <div className="stats"><div><div className="stat-label"><Clock3 size={13}/> TIME ELAPSED</div><div className="stat-value timer-value">{formatTime(elapsed)}</div></div><div className="stat-divider"/><div><div className="stat-label"><Zap size={13}/> MOVE COUNT</div><div className="stat-value">{String(moves).padStart(3,'0')}</div></div></div>
     <div className="session-buttons"><button className="primary-button" onClick={scramble} disabled={busy}><Shuffle size={17}/> Scramble cube</button><button className="secondary-button" onClick={()=>reset()} disabled={busy}><RotateCcw size={16}/> Reset</button></div>
     <button className="solve-button" onClick={autoSolve} disabled={busy||history.length===0}><Sparkles size={17}/>{busy?'Solving…':'Auto-solve'}<ArrowRight size={17}/></button><p className="subnote">Auto-solve reverses your recorded turns.</p>
    </div>
    <div className="panel"><div className="panel-title"><span className="section-number">03</span><h3>Make a move</h3><RotateCcw size={17}/></div>
     <div className="move-top"><span>Turn a face</span><button className="undo-button" disabled={busy||history.length===0} onClick={undo}><Undo2 size={15}/> Undo</button></div>
     <div className="face-grid">{FACES.map(face=><div key={face} className="face-control"><button disabled={busy} title={`Turn ${face} clockwise`} onClick={()=>handleTurn(face,false,false)}>{face}</button><button disabled={busy} className="face-inverse" title={`Reverse ${face}`} onClick={()=>handleTurn(face,true,false)}>′</button></div>)}</div>
     <div className="layer-control"><label htmlFor="layer">Layer depth <span>{layer===0?'Outer face':`Layer ${layer+1}`}</span></label><input id="layer" type="range" min={0} max={size-1} value={layer} onChange={e=>setLayer(Number(e.target.value))} disabled={busy}/></div>
     <p className="subnote">Face buttons work in either mode. Switch to Solve to click stickers. Shift reverses; Alt gives 180°.</p>
    </div>
    <div className="panel"><div className="panel-title"><span className="section-number">04</span><h3>Make it yours</h3><Palette size={17}/></div>
     <div className="appearance-label">APPEARANCE</div><div className="style-options"><button className={style==='filled'?'selected':''} onClick={()=>setStyle('filled')}><Square size={17} fill="currentColor"/> Filled</button><button className={style==='wireframe'?'selected':''} onClick={()=>setStyle('wireframe')}><Grip size={18}/> Wireframe</button></div>
     <div className="appearance-label palette-label">COLOR PALETTE</div><div className="scheme-options">{(Object.keys(SCHEMES) as Scheme[]).map(name=><button key={name} className={scheme===name?'selected':''} onClick={()=>setScheme(name)}><div className="swatches">{FACES.map(face=><span key={face} style={{background:SCHEMES[name][face]}}/>)}</div><span>{name}</span>{scheme===name&&<Check size={14}/>}</button>)}</div>
    </div>
    <footer className="side-footer">BUILT FOR CURIOUS MINDS <span>✳</span> KEEP TWISTING</footer>
   </aside>
  </main>
  {showHelp&&<div className="modal-backdrop" onClick={()=>setShowHelp(false)}><div className="help-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setShowHelp(false)}>×</button><div className="eyebrow">THE QUICK GUIDE</div><h2>Let's get twisting.</h2><p>Choose a cube size, scramble it, then solve using the face buttons or by clicking a colored sticker. The clock starts on your first solving move.</p><p>Use Rotate view mode to drag/orbit and scroll to zoom without changing the puzzle. Switch to Solve mode to click a sticker and turn its face; the camera is locked in this mode. Face buttons remain available in both modes. U (top), D (bottom), L (left), R (right), F (front), B (back). Prime (′) turns counter-clockwise; use layer depth for inner slices.</p><p>Shift-click a sticker to reverse and Alt-click for a half turn. Auto-solve reverses the session history and is not an arbitrary-state solver.</p>{lastScramble&&<div className="scramble-readout"><strong>Last scramble</strong><div>{lastScramble}</div></div>}<button className="primary-button" onClick={()=>setShowHelp(false)}>Got it <ArrowRight size={16}/></button></div></div>}
 </div>;
}
