import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Builds the interactive demo in example/ into a static site (example-dist/).
// Used for hosting the live demo (e.g. on Vercel). The library build lives in
// vite.config.js; this one is kept separate so `npm run build` stays the lib.
export default defineConfig({
  plugins: [react()],
  root: 'example',
  base: './',
  build: {
    outDir: '../example-dist',
    emptyOutDir: true,
  },
})
