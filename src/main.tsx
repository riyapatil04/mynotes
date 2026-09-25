import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Apply theme before React renders to prevent flash
(function applyInitialTheme() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = (indexedDB as any);
    // We can't easily read IndexedDB synchronously, so use localStorage as a fast theme cache
    const cached = localStorage.getItem('ppt-theme') ?? 'system';
    const root = document.documentElement;
    if (cached === 'dark') {
      root.classList.add('dark');
    } else if (cached === 'system') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      }
    }
    void raw; // suppress unused warning
  } catch {
    // ignore
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
