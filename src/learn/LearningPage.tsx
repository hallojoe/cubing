import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronLeft, ChevronRight, CornerDownRight, Play, RotateCcw, Sparkles } from 'lucide-react';
import { invertMove, type Move } from '../cube';
import { algorithmsForSize, applicabilityNote, buildLesson, type Algorithm } from './lesson';
import { StaticCubePreview, TeachingCube, type PlayingMove } from './CubeVisual';
import './learning.css';

const sizes=Array.from({length:10},(_,i)=>i+2);
const moveName=(move:Move)=>move.face+(move.turns===-1?'′':move.turns===2?'2':'');
const descriptions:Record<string,string>={
 U:'Turn the upper face clockwise.',
 D:'Turn the bottom face clockwise.',
 R:'Turn the right face clockwise.',
 L:'Turn the left face clockwise.',
 F:'Turn the front face clockwise.',
 B:'Turn the back face clockwise.'
};
const moveInstruction=(move:Move)=>{
 const base=descriptions[move.face];
 return move.turns===1?base:move.turns===-1?base.replace('clockwise','counterclockwise'):base.replace('clockwise','180 degrees');
};

export default function LearningPage(){
 const [phase,setPhase]=useState<0|1|2>(0);
 const [size,setSize]=useState(3);
 const [algorithmId,setAlgorithmId]=useState('right-trigger');
 const [position,setPosition]=useState(0);
 const [target,setTarget]=useState(0);
 const [playing,setPlaying]=useState<PlayingMove|null>(null);
 const animationId=useRef(0);
 const available=useMemo(()=>algorithmsForSize(size),[size]);
 const algorithm=available.find(a=>a.id===algorithmId)??available[0];
 const lesson=useMemo(()=>buildLesson(size,algorithm),[size,algorithm]);
 const steps=lesson.moves.length;
 const busy=playing!==null||target!==position;

 const configureSize=(next:number)=>{
  setSize(next);setAlgorithmId('right-trigger');setPosition(0);setTarget(0);setPlaying(null);
 };
 const configureAlgorithm=(next:Algorithm)=>{
  setAlgorithmId(next.id);setPosition(0);setTarget(0);setPlaying(null);
 };
 const begin=()=>{setPosition(0);setTarget(0);setPlaying(null);setPhase(2);};
 const backTo=(next:0|1)=>{setTarget(0);setPosition(0);setPlaying(null);setPhase(next);};
 const seek=(step:number)=>setTarget(Math.max(0,Math.min(steps,step)));

 useEffect(()=>{
  if(phase!==2||playing||target===position)return;
  const forward=target>position;
  const next=position+(forward?1:-1);
  const move=forward?lesson.moves[position]:invertMove(lesson.moves[position-1]);
  setPlaying({move,next,id:++animationId.current});
 },[phase,playing,target,position,lesson]);

 const complete=()=>{
  if(!playing)return;
  setPosition(playing.next);
  setPlaying(null);
 };

 return <div className="learning-app">
  <header className="learning-topbar">
   <a className="learning-logo" href="#/"><span className="learning-mark">▦</span> CUBING<span>.</span></a>
   <nav className="learning-nav" aria-label="Main navigation">
    <a href="#/">Simulator</a>
    <a href="#/learn" aria-current="page" className="current">Learning lab</a>
    <a href="#/pro">Pro lab</a>
   </nav>
   <div className="learning-top-note"><BookOpen size={16}/> GUIDED PRACTICE</div>
  </header>
  <main className="learning-content">
   <div className="learning-intro">
    <div className="learning-eyebrow"><span/> THE LEARNING LAB</div>
    <h1>Learn one move<br/><em>at a time.</em></h1>
    <p>Build muscle memory with a guided, visual walkthrough. Pick a puzzle, choose an algorithm, and explore every turn.</p>
   </div>
   <div className="learning-stepper" aria-label="Wizard progress">
    {(['Choose a cube','Pick an algorithm','Explore the moves'] as const).map((label,i)=>
     <div className={`learning-step ${phase===i?'active':phase>i?'completed':''}`} key={label} aria-current={phase===i?'step':undefined}>
      <span className="learning-step-number">{phase>i?<Check size={15}/>:String(i+1).padStart(2,'0')}</span>
      <span>{label}</span>
     </div>)}
   </div>
   {phase===0&&<section className="learning-selection">
    <div className="learning-section-heading"><span>01 / THE PUZZLE</span><h2>How many layers?</h2><p>Choose any cube from 2×2 to 11×11. All lesson moves are applied to that exact size.</p></div>
    <div className="learning-size-grid">{sizes.map(n=><button type="button" key={n} className={n===size?'selected':''} aria-pressed={n===size} onClick={()=>configureSize(n)}>
     <strong>{n}<span>×{n}</span></strong><small>{n}×{n}×{n} cube</small>{n===size&&<Check size={18} className="size-check"/>}
    </button>)}</div>
    <div className="learning-wizard-actions"><span>{size}×{size} selected · {size*size*6} stickers</span><button type="button" className="learning-primary" onClick={()=>setPhase(1)}>Choose an algorithm <ArrowRight size={17}/></button></div>
   </section>}
   {phase===1&&<section className="learning-selection">
    <div className="learning-section-heading"><span>02 / THE TECHNIQUE</span><h2>What will you learn?</h2><p>Pick a repeatable move sequence. These are technique drills—not an automatic solution for a scrambled cube.</p></div>
    <p className="learning-applicability" role="note">{applicabilityNote(algorithm,size)} {size===2&&'OLL Cross is hidden because this puzzle has no edges.'}</p>
    <div className="learning-algorithm-grid">{available.map(item=><button type="button" key={item.id} className={algorithm.id===item.id?'selected':''} aria-pressed={algorithm.id===item.id} onClick={()=>configureAlgorithm(item)}>
     <span className="algorithm-label">{item.level} <span>·</span> {item.notation.trim().split(/\s+/).length} moves</span>
     <strong>{item.title}</strong>
     <p>{item.description}</p>
     <code>{item.notation.replaceAll("'",'′')}</code>
     {algorithm.id===item.id&&<Check size={17} className="algorithm-check"/>}
    </button>)}</div>
    <div className="learning-wizard-actions"><button type="button" className="learning-secondary" onClick={()=>setPhase(0)}><ArrowLeft size={16}/> Change size</button><button type="button" className="learning-primary" onClick={begin}>Start walkthrough <ArrowRight size={17}/></button></div>
   </section>}
   {phase===2&&<div className="learning-workspace">
    <section className="learning-main-col">
     <div className="learning-lesson-title">
      <div><span className="learning-kicker">{size}×{size} · {algorithm.level}</span><h2>{algorithm.title}</h2><p>{algorithm.use}</p></div>
      <button className="learning-secondary" onClick={()=>backTo(1)}><ArrowLeft size={15}/> Change algorithm</button>
     </div>
     <p className="learning-applicability">{applicabilityNote(algorithm,size)} The walkthrough starts solved to demonstrate the effect, not from a case to solve.</p>
     <div className="learning-big-cube">
      <div className="learning-cube-caption"><span className="learning-pulse"/> TEACHING CUBE <small>DRAG TO ORBIT</small></div>
      <TeachingCube size={size} cubies={lesson.states[position]} playing={playing} onMoveFinished={complete}/>
      <div className="learning-cube-counter"><strong>{String(position).padStart(2,'0')}</strong> / {String(steps).padStart(2,'0')} moves complete {busy&&<span>· Animating toward {target}</span>}</div>
     </div>
     <div className="learning-playback">
      <button title="Go to start" aria-label="Go to start" disabled={position===0&&target===0} onClick={()=>seek(0)}><RotateCcw size={17}/></button>
      <button title="Previous move" aria-label="Previous move" onClick={()=>seek(Math.max(0,target-1))} disabled={target===0}><ChevronLeft size={20}/></button>
      <div className="learning-playback-progress"><div className="learning-progress-rail"><div style={{width:`${(position/steps)*100}%`}}/></div><span>{position===steps?'Algorithm complete':position===0?'Ready to begin':`Step ${position} completed`}</span></div>
      <button title="Next move" aria-label="Next move" onClick={()=>seek(Math.min(steps,target+1))} disabled={target===steps}><ChevronRight size={20}/></button>
      <button title="Go to last move" aria-label="Go to final move" onClick={()=>seek(steps)} disabled={target===steps}><Play size={16}/></button>
     </div>
     <div className="learning-coach"><Sparkles size={20}/><div><strong>Follow the movement</strong><p>Click any move card to animate the teaching cube to that step. Selecting an earlier card reverses the intervening turns. The snapshots stay static for comparison.</p></div></div>
    </section>
    <aside className="learning-moves-panel">
     <div className="learning-moves-header"><span>03 / MOVE BY MOVE</span><h3>The sequence</h3><p>{algorithm.notation.replaceAll("'",'′')}</p></div>
     <div className="learning-move-list">
      {lesson.moves.map((move,i)=><button type="button" className={`learning-move-card ${position===i+1?'current':''} ${target===i+1?'destination':''}`} key={i} onClick={()=>seek(i+1)} aria-label={`Go to move ${i+1}: ${moveName(move)}`} aria-current={position===i+1?'step':undefined}>
       <div className="learning-move-meta"><span className="learning-move-index">{String(i+1).padStart(2,'0')}</span><span className="learning-move-name">{moveName(move)}</span><span className="learning-move-text">{moveInstruction(move)}</span>{position>i&&<Check size={15} className="learning-move-done"/>}</div>
       <div className="learning-move-previews"><div><StaticCubePreview cubies={lesson.states[i]} size={size} label={`Before move ${i+1}`}/><span>BEFORE</span></div><CornerDownRight size={18} className="learning-transition"/><div><StaticCubePreview cubies={lesson.states[i+1]} size={size} label={`After move ${i+1}`}/><span>AFTER</span></div></div>
      </button>)}
     </div>
     <div className="learning-moves-footer"><span>{steps} moves in this algorithm</span><button onClick={()=>seek(0)}>Replay from start <RotateCcw size={14}/></button></div>
    </aside>
   </div>}
  </main>
  <footer className="learning-footer"><span>LEARN · PRACTICE · MASTER</span><a href="#/">Back to simulator <ArrowRight size={14}/></a></footer>
 </div>;
}

