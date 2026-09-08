import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Convert direct path navigations to hash for HashRouter compatibility
(() => {
  const pathname = window.location.pathname;
  const search = window.location.search || '';
  const hash = window.location.hash || '';

  if (
    pathname &&
    pathname !== '/' &&
    pathname !== '/index.html' &&
    !pathname.endsWith('.html') &&
    !pathname.match(/\.[a-zA-Z0-9]+$/) &&
    (!hash || hash === '#/' || hash === '#')
  ) {
    let cleanPath = pathname;
    if (cleanPath.startsWith('/Vibe-Wale-Engineers')) {
      cleanPath = cleanPath.slice('/Vibe-Wale-Engineers'.length);
    }
    if (cleanPath && cleanPath !== '/') {
      window.location.replace(`/#${cleanPath}${search}`);
    }
  }
})();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
