import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  /**
   * Vercel serves the application from the domain root, so the base path is '/'.
   *
   * This differs from GitHub Pages, which serves from /<repository-name>/ and
   * would require base: '/estate-agent-spa/'. Getting this wrong is silent and
   * total: every asset resolves to the wrong path, the bundle 404s, and the
   * page renders blank with no error that names the cause.
   *
   * All image paths in properties.json are stored WITHOUT a leading slash and
   * resolved at render time through assetUrl(), which prefixes them with
   * import.meta.env.BASE_URL — so this one value is the only thing that needs
   * to change to move the application between hosts.
   */
  base: '/',

  build: {
    // Source maps let the browser map a production error back to the original
    // source. They cost a few hundred KB and make the deployed app debuggable.
    sourcemap: true,
  },
});