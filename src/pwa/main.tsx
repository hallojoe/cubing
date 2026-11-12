import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '../App';
import { startAppServices } from './services';
import '../style.css';

startAppServices();
createRoot(document.getElementById('root')!).render(<StrictMode><App standalone/></StrictMode>);
