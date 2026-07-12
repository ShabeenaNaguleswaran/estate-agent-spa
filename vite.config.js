import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Required for GitHub Pages: assets resolve under /<repo-name>/
  base: '/estate-agent-spa/',
});