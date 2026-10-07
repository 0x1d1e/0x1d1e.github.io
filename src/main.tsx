import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import '@fontsource-variable/inter/opsz.css';
import '@fontsource-variable/geist-mono';
import './styles/global.css';
import { App } from './App';

// A refresh of the home page starts at its first page, not wherever the scroll
// was left. Set before anything renders, so the browser never gets to restore it.
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
if (location.pathname.replace(/\/$/, '') === base)
  history.scrollRestoration = 'manual';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
