import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// Two modes:
//   • `vite build`  → builds the library (dist/) from src/index.js
//   • `vite`/`dev`  → serves the interactive demo in example/
export default defineConfig(({ command }) => {
  if (command === 'build') {
    return {
      plugins: [react()],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.js'),
          name: 'Cubex',
          fileName: 'cubex',
          formats: ['es', 'umd'],
        },
        rollupOptions: {
          // Everything the consumer already has stays external.
          external: [
            'react',
            'react-dom',
            'react/jsx-runtime',
            'three',
            '@react-three/fiber',
            '@react-three/drei',
            'framer-motion',
          ],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              three: 'THREE',
              '@react-three/fiber': 'ReactThreeFiber',
              '@react-three/drei': 'Drei',
              'framer-motion': 'FramerMotion',
            },
          },
        },
      },
    }
  }

  return {
    plugins: [react()],
    root: 'example',
  }
})
