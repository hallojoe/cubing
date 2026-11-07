import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, FlaskConical, Pause, Play, RotateCcw } from 'lucide-react';
import { FACES, isSolved, type Cubie, type Face } from '../cube';
import { StaticCubePreview, TeachingCube, type PlayingMove } from '../learn/CubeVisual';
import { changedPieces, expandExperiment, experimentStates, inverseTurns, type ExperimentMode, type StartMode } from './engine';
import { topicsForSize, type Topic } from './topics';
import '../learn/learning.css';
import './pro.css';

const sizes=Array.from({length:10},(_,i)=>i+2);
const colors: Record<Face,string>={U:'#f8f8f2',D:'#e9c932',L:'#f08232',R:'#d64443',F:'#26a86e',B:'#3f74d3'};
function FaceNet({cube,size}:{cube:Cubie[];size:number}) {
 return <div className="pro-net" aria-label="All six faces in fixed notation orientation">
  {FACES.map(face=>{
   const cells=cube.filter(c=>c.stickers[face]).map(c=>{
    const [x,y,z]=c.pos;
    const [col,row]=({U:[x,z],D:[x,size-1-z],F:[x,size-1-y],B:[size-1-x,size-1-y],R:[size-1-z,size-1-y],L:[z,size-1-y]})[face];
    return {col,row,color:c.stickers[face]!};
   });
   return <div key={face} className={`pro-net-face face-${face}`}><span>{face}</span><svg viewBox={`0 0 ${size*10} ${size*10}`} role="img" aria-label={`${face} face`}>
    {cells.map(c=><rect key={`${c.col}-${c.row}`} x={c.col*10+.5} y={c.row*10+.5} width="9" height="9" rx=".7" fill={colors[c.color]}><title>{c.color} sticker</title></rect>)}
   </svg></div>;
  })}
 </div>;
}

function Experiment({topic,size}:{topic:Topic;size:number}) {
 const first=topic.examples[0];
 const [a,setA]=useState(first.a);
 const [b,setB]=useState(first.b??'U');
 const [mode,setMode]=useState<ExperimentMode>(first.mode??'sequence');
 const [start,setStart]=useState<StartMode>('case');
 const [position,setPosition]=useState(0);
 const [target,setTarget]=useState(0);
 const [playing,setPlaying]=useState<PlayingMove|null>(null);
 const [speed,setSpeed]=useState(1);
 const [revision,setRevision]=useState(0);
 const [loadedName,setLoadedName]=useState(first.name);
 const animationId=useRef(0);
 const result=useMemo(()=>{
  try {
   const turns=expandExperiment(a,b,mode,size);
   return {turns,states:experimentStates(size,turns,start),error:null};
  } catch(error) {return {turns:[],states:[],error:error instanceof Error?error.message:'Invalid sequence.'};}
 },[a,b,mode,size,start]);
 const reset=()=>{setPlaying(null);setPosition(0);setTarget(0);setRevision(r=>r+1);};
 const edit=(update:()=>void)=>{reset();setLoadedName('Custom experiment');update();};
 const load=(example:Topic['examples'][number])=>{
  reset();setLoadedName(example.name);setA(example.a);setB(example.b??'U');setMode(example.mode??'sequence');
 };
 useEffect(()=>{
  if(playing||position===target||result.error)return;
  const forward=target>position;
  const turn=forward?result.turns[position]:inverseTurns([result.turns[position-1]])[0];
  setPlaying({move:turn.moves[0],layers:turn.moves.map(m=>m.layer),next:position+(forward?1:-1),id:++animationId.current});
 },[position,target,playing,result]);
 const complete=()=>{if(playing){setPosition(playing.next);setPlaying(null);}};
 const busy=!!playing||target!==position;
 const stop=()=>setTarget(playing?.next??position);
 const steps=result.turns.length;
 const cube=result.states[position];
 const counts=useMemo(()=>cube?changedPieces(result.states[0],cube):null,[cube,result]);
 const seek=(next:number)=>setTarget(Math.max(0,Math.min(steps,next)));
 return <section className="pro-experiment" aria-labelledby="experiment-title">
  <div className="pro-section-label"><FlaskConical size={16}/> INTERACTIVE WORKBENCH <span>2 / EXPERIMENT</span></div>
  <div className="pro-experiment-heading"><h2 id="experiment-title">Test the idea.</h2><span>{size}×{size} puzzle</span></div>
  <div className="pro-examples">{topic.examples.map(example=><button key={example.name} className={loadedName===example.name?'selected':''} onClick={()=>load(example)}>{example.name}</button>)}</div>
  <div className="pro-editor">
   <label>Construction<select value={mode} onChange={e=>edit(()=>setMode(e.target.value as ExperimentMode))}>
    <option value="sequence">Sequence</option><option value="commutator">Commutator [A, B]</option><option value="conjugate">Conjugate [A: B]</option>
   </select></label>
   <label>Start state<select value={start} onChange={e=>{reset();setStart(e.target.value as StartMode);}}>
    <option value="case">Case → solved</option><option value="solved">Solved → effect</option>
   </select></label>
   <label className="pro-sequence-label">{mode==='sequence'?'Algorithm':'A · setup / first sequence'}<textarea spellCheck={false} value={a} onChange={e=>edit(()=>setA(e.target.value))} aria-describedby="pro-notation"/></label>
   {mode!=='sequence'&&<label className="pro-sequence-label">B · second sequence<textarea spellCheck={false} value={b} onChange={e=>edit(()=>setB(e.target.value))}/></label>}
  </div>
  <details className="pro-notation" id="pro-notation"><summary>Notation & conventions</summary><p>Space-separated U D L R F B, prime (′ or '), and 2. Rw or r = two-layer wide turn; 3Rw = three layers; 2R = only the second slice. x y z rotate the whole cube. M E S use the unique middle slice on odd cubes, following L D F respectively. On even cubes use numbered slices. Use the construction selector for brackets; nested notation and repetitions are not parsed. Limit: 240 expanded turns.</p></details>
  {result.error?<div className="pro-error" role="alert">{result.error}</div>:<>
   <div className="pro-expanded"><span>{mode==='commutator'?'A B A⁻¹ B⁻¹':mode==='conjugate'?'A B A⁻¹':'EXPANDED SEQUENCE'}</span><code>{result.turns.map(t=>t.label).join(' ')}</code></div>
   <p className="pro-caption">{start==='case'?'The inverse of your sequence generates this exact case. Playback solves that constructed case; it is not a solver for arbitrary scrambles.':'Starting solved makes the sequence’s net effect visible. Track what moves and what is restored.'}</p>
   <div className="pro-visual-grid">
    <div className="pro-cube"><div className="pro-cube-label">{loadedName}<span>DRAG TO ORBIT</span></div>
     <TeachingCube key={revision} size={size} cubies={cube} playing={playing} onMoveFinished={complete} speed={speed}/>
     <span className="pro-state-badge">{isSolved(cube,size)?'Solved colors':`State ${position}`} · {position} / {steps}</span>
    </div>
    <div className="pro-inspector"><h3>Inspect every face</h3><FaceNet cube={cube} size={size}/><p>Fixed notation frame; orbiting the 3D view does not change move labels. U is white in the initial solved state.</p>
     <div className="pro-piece-counts">{counts&&Object.entries(counts).map(([label,count])=><div key={label}><strong>{count}</strong><span>{label}</span></div>)}</div>
     <p>Pieces changed since the start. Tracks identity and orientation, including same-color centers; whole-cube rotations count as changes.</p>
    </div>
   </div>
   <div className="pro-transport">
    <button onClick={()=>seek(0)} disabled={!position&&!busy} aria-label="Return to start"><RotateCcw size={17}/></button>
    <button onClick={()=>seek(target-1)} disabled={target===0} aria-label="Previous move"><ChevronLeft size={20}/></button>
    <button className="pro-play" onClick={()=>busy?stop():seek(steps)} disabled={!busy&&position===steps} aria-label={busy?'Pause after current move':'Play to end'}>{busy?<Pause size={17}/>:<Play size={17}/>}</button>
    <button onClick={()=>seek(target+1)} disabled={target===steps} aria-label="Next move"><ChevronRight size={20}/></button>
    <label className="pro-scrubber"><span>Move {position} of {steps}{busy?` · toward ${target}`:''}</span><input type="range" min="0" max={steps} value={target} aria-label="Seek to move" onChange={e=>seek(Number(e.target.value))}/></label>
    <label>Speed<select value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select></label>
   </div>
   <div className="pro-turns" aria-label="Expanded moves">{result.turns.map((turn,i)=><button key={i} onClick={()=>seek(i+1)} aria-label={`Go to move ${i+1}: ${turn.label}`} aria-current={position===i+1?'step':undefined} className={position===i+1?'current':target===i+1?'destination':''}><small>{i+1}</small>{turn.label.replaceAll("'",'′')}</button>)}</div>
   <div className="pro-endpoints"><div><StaticCubePreview size={size} cubies={result.states[0]} label="Experiment starting state"/><span>START</span></div><span>→</span><div><StaticCubePreview size={size} cubies={result.states[steps]} label="Experiment final state"/><span>FINISH</span></div><p>{steps} notation turns · {result.turns.filter(t=>/^[xyz]/.test(t.label)).length} cube rotations<br/>Counts include half turns as one and wide turns as one. This is not a competition move metric.</p></div>
  </>}
 </section>;
}

export default function ProPage() {
 const [size,setSize]=useState(3);
 const [topicId,setTopicId]=useState('commutators');
 const available=useMemo(()=>topicsForSize(size),[size]);
 const topic=available.find(t=>t.id===topicId)??available[0];
 const changeSize=(next:number)=>{setSize(next);if(!topicsForSize(next).some(t=>t.id===topicId))setTopicId('commutators');};
 return <div className="learning-app pro-app">
  <header className="learning-topbar"><a className="learning-logo" href="#/"><span className="learning-mark">▦</span>CUBING<span>.</span></a>
   <nav className="learning-nav" aria-label="Main navigation"><a href="#/">Simulator</a><a href="#/learn">Learning lab</a><a className="current" href="#/pro" aria-current="page">Pro lab</a></nav>
   <span className="learning-top-note"><FlaskConical size={16}/> BEYOND THE SOLVE</span>
  </header>
  <main className="pro-content">
   <div className="pro-hero"><div><div className="learning-eyebrow"><span/> THE PRO LAB</div><h1>Understand the <em>why.</em></h1><p>Explore the structure behind your solves. Study a concept, build an experiment, and follow the pieces.</p></div><label className="pro-size">Your puzzle<select value={size} onChange={e=>changeSize(Number(e.target.value))}>{sizes.map(n=><option key={n} value={n}>{n}×{n}×{n}</option>)}</select><span>Topics adapt to cube size</span></label></div>
   <div className="pro-layout">
    <aside className="pro-topics" aria-label="Advanced topics"><div className="pro-section-label">1 / CHOOSE A TOPIC</div>{available.map((item,i)=><button key={item.id} onClick={()=>setTopicId(item.id)} aria-pressed={topic.id===item.id} className={topic.id===item.id?'selected':''}><span className="pro-topic-number">0{i+1}</span><span><small>{item.category}</small><strong>{item.title}</strong></span><ChevronRight size={15}/></button>)}<p>Only relevant topics are shown. The 4×4 parity recipe stays on 4×4; CLL / EG stays on 2×2.</p><a href="#/learn">Need a refresher? Visit the learning lab →</a></aside>
    <div className="pro-main">
     <section className="pro-lesson" aria-labelledby="topic-title"><div className="pro-section-label">{topic.category} <span>{topic.sizes.length===1?`${topic.sizes[0]}×${topic.sizes[0]} ONLY`:`${topic.sizes[0]}×${topic.sizes[0]}–11×11`}</span></div><h2 id="topic-title">{topic.title}</h2><p className="pro-summary">{topic.summary}</p><div className="pro-prerequisite"><strong>Before you start</strong><p>{topic.prerequisite}</p></div>
      <div className="pro-concepts">{topic.concepts.map((concept,i)=><article key={concept.title}><span>0{i+1}</span><h3>{concept.title}</h3><p>{concept.text}</p></article>)}</div>
      <div className="pro-drill"><strong>Try this investigation</strong><p>{topic.drill}</p></div>
      <div className="pro-sources"><span>GO DEEPER</span>{topic.sources.map(source=><a href={source.url} target="_blank" rel="noreferrer" key={source.url}>{source.label}<ArrowUpRight size={14}/></a>)}</div>
     </section>
     <Experiment key={`${size}-${topic.id}`} topic={topic} size={size}/>
    </div>
   </div>
  </main>
  <footer className="learning-footer"><span>OBSERVE · QUESTION · EXPERIMENT</span><a href="#/learn">Back to learning lab →</a></footer>
 </div>;
}
