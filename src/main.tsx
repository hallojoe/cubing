import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import LearningPage from './learn/LearningPage';
import ProPage from './pro/ProPage';
import './style.css';

function Router(){
 const [hash,setHash]=useState(window.location.hash);
 useEffect(()=>{
  const update=()=>setHash(window.location.hash);
  window.addEventListener('hashchange',update);
  return()=>window.removeEventListener('hashchange',update);
 },[]);
 // A hash route works with GitHub Pages without server-side fallback rules.
 return hash.startsWith('#/pro')?<ProPage/>:hash.startsWith('#/learn')?<LearningPage/>:<App/>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><Router/></React.StrictMode>);

