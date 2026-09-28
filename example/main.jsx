import React from 'react'
import { createRoot } from 'react-dom/client'
// Import straight from source so the demo always reflects the latest code.
import { RubiksCube } from '../src/index.js'

// Each cube scales with the viewport so all three fit on one screen (no scroll)
// — handy for recording. Falls back to wrapping on narrow/portrait screens.
const CUBE = 'min(26vw, 300px)'

function Demo() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'clamp(16px, 3vh, 40px)',
        padding: '24px 20px',
      }}
    >
      <header style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(36px, 7vw, 72px)', fontWeight: 800, letterSpacing: '-0.04em', margin: 0 }}>
          cube<span style={{ color: '#E05C28' }}>x</span>
        </h1>
        <p style={{ opacity: 0.6, marginTop: 8, fontSize: 'clamp(14px, 1.6vw, 18px)' }}>
          A self-solving 3D Rubik's Cube for React. Click a cube to play with it.
        </p>
      </header>

      <section
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'clamp(16px, 3vw, 44px)',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <figure style={{ textAlign: 'center', margin: 0 }}>
          <RubiksCube size={CUBE} />
          <figcaption style={{ opacity: 0.5, marginTop: 6, fontSize: 14 }}>Default (brand palette)</figcaption>
        </figure>

        <figure style={{ textAlign: 'center', margin: 0 }}>
          <RubiksCube size={CUBE} palette={{ base: 'classic' }} accent="#009B48" />
          <figcaption style={{ opacity: 0.5, marginTop: 6, fontSize: 14 }}>Classic Rubik's palette</figcaption>
        </figure>

        <figure style={{ textAlign: 'center', margin: 0 }}>
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
          <figcaption style={{ opacity: 0.5, marginTop: 6, fontSize: 14 }}>Custom palette, no tumble</figcaption>
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
