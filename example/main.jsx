import React from 'react'
import { createRoot } from 'react-dom/client'
// Import straight from source so the demo always reflects the latest code.
import { RubiksCube } from '../src/index.js'

// Cube size is capped by viewport WIDTH (so three fit in one row) and by
// viewport HEIGHT (so header + cubes fit one screen without scrolling).
const CUBE = 'min(27vw, 40vh, 300px)'

function Demo() {
  return (
    <div className="stage">
      <header style={{ textAlign: 'center' }}>
        <h1>
          cube<span style={{ color: '#E05C28' }}>x</span>
        </h1>
        <p>A self-solving 3D Rubik's Cube for React. Click a cube to play with it.</p>
      </header>

      <section className="row">
        <figure>
          <RubiksCube size={CUBE} />
          <figcaption>Default (brand palette)</figcaption>
        </figure>

        <figure>
          <RubiksCube size={CUBE} palette={{ base: 'classic' }} accent="#009B48" />
          <figcaption>Classic Rubik's palette</figcaption>
        </figure>

        <figure>
          <RubiksCube
            size={CUBE}
            tumble={false}
            palette={{
              right: { color: '#7c3aed' },
              left: { color: '#2563eb' },
              up: { color: '#f472b6' },
              down: { color: '#22d3ee' },
              front: { color: '#a855f7' },
              back: { color: '#4f46e5' },
            }}
            accent="#7c3aed"
          />
          <figcaption>Custom palette, no tumble</figcaption>
        </figure>
      </section>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Demo />
  </React.StrictMode>,
)
