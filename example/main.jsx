import React from 'react'
import { createRoot } from 'react-dom/client'
// Import straight from source so the demo always reflects the latest code.
import { RubiksCube } from '../src/index.js'

function Demo() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px 120px' }}>
      <header style={{ textAlign: 'center', marginBottom: 56 }}>
        <h1 style={{ fontSize: 'clamp(40px, 9vw, 84px)', fontWeight: 800, letterSpacing: '-0.04em' }}>
          cube<span style={{ color: '#E05C28' }}>x</span>
        </h1>
        <p style={{ opacity: 0.6, marginTop: 12, fontSize: 18 }}>
          A self-solving 3D Rubik's Cube for React. Click a cube to play with it.
        </p>
      </header>

      <section style={{ display: 'flex', flexWrap: 'wrap', gap: 48, justifyContent: 'center', alignItems: 'center' }}>
        <figure style={{ textAlign: 'center' }}>
          <RubiksCube size={360} />
          <figcaption style={{ opacity: 0.5, marginTop: 8 }}>Default (brand palette)</figcaption>
        </figure>

        <figure style={{ textAlign: 'center' }}>
          <RubiksCube size={360} palette={{ base: 'classic' }} accent="#009B48" />
          <figcaption style={{ opacity: 0.5, marginTop: 8 }}>Classic Rubik's palette</figcaption>
        </figure>

        <figure style={{ textAlign: 'center' }}>
          <RubiksCube
            size={360}
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
          <figcaption style={{ opacity: 0.5, marginTop: 8 }}>Custom palette, no tumble</figcaption>
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
