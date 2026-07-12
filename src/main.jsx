import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Self-hosted fonts — bundled by Vite, served from our own origin.
// This keeps the Content Security Policy (Commit 18) at `default-src 'self'`
// with no third-party font exceptions.
import '@fontsource/archivo/400.css';
import '@fontsource/archivo/500.css';
import '@fontsource/archivo/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';

// Design tokens must load before any stylesheet that consumes them.
import './styles/variables.css';
import './styles/global.css';

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);