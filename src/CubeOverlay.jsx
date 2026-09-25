import { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import { Lights } from './primitives.jsx'
import { InteractiveCubeScene, MOVE_GROUPS } from './InteractiveCubeScene.jsx'

// Small reusable move button with a hover colour accent.
function MoveBtn({ label, accent, onClick }) {
  const [hov, setHov] = useState(false)
  const isPrime = label.includes("'")
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1,
        border: `1px solid ${hov ? accent : 'rgba(255,255,255,0.08)'}`,
        background: hov ? `${accent}22` : 'rgba(255,255,255,0.03)',
        color: hov ? '#fff' : 'rgba(240,235,226,0.65)',
        borderRadius: 6,
        padding: '5px 0',
        fontSize: 11,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: "'DM Mono', monospace",
        transition: 'all 0.12s',
        textAlign: 'center',
        letterSpacing: isPrime ? '-0.02em' : '0.04em',
      }}
    >
      {label}
    </motion.button>
  )
}

// ══════════════════════════════════════════════════════════
// Fullscreen interactive overlay: a large drag-to-turn cube plus a control
// panel of Rubik's-notation buttons. Rendered into document.body via a portal.
// ══════════════════════════════════════════════════════════
export function CubeOverlay({ onClose, palette, accent = '#E05C28', cameraPosition = [5, 4, 5], fov = 34 }) {
  const [mode, setMode] = useState('orbit')
  const modeRef = useRef('orbit')
  const queueRef = useRef([])

  const changeMode = useCallback(m => {
    modeRef.current = m
    setMode(m)
  }, [])
  const pushMove = useCallback(move => queueRef.current.push(move), [])

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="cube-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(7, 6, 5, 0.65)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
          fontFamily: 'system-ui, sans-serif',
        }}
        onClick={e => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 20,
            right: 22,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            color: 'rgba(255,255,255,0.35)',
            borderRadius: 9,
            width: 36,
            height: 36,
            fontSize: 18,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >
          ×
        </button>

        {/* 3-D canvas */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 180 }}
          style={{
            width: 'min(460px, 78vw)',
            height: 'min(460px, 78vw)',
            flexShrink: 0,
            borderRadius: 20,
            cursor: mode === 'move' ? 'crosshair' : 'grab',
            overflow: 'hidden',
          }}
        >
          <Canvas flat camera={{ position: cameraPosition, fov }} gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }}>
            <Lights ambient={0.4} />
            <InteractiveCubeScene palette={palette} queueRef={queueRef} modeRef={modeRef} />
            <OrbitControls enabled={mode === 'orbit'} autoRotate={false} enablePan={false} enableZoom={false} dampingFactor={0.08} enableDamping rotateSpeed={0.65} />
          </Canvas>
        </motion.div>

        {/* Control panel */}
        <motion.div
          initial={{ x: 44, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 44, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 180, delay: 0.06 }}
          style={{
            width: 196,
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', marginBottom: 10 }}>Controls</p>
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.35)', borderRadius: 9, padding: 3, gap: 2 }}>
              {[
                { id: 'orbit', icon: '⟳', label: 'Orbit' },
                { id: 'move', icon: '✦', label: 'Move' },
              ].map(({ id, icon, label }) => (
                <button
                  key={id}
                  onClick={() => changeMode(id)}
                  style={{
                    flex: 1,
                    border: 'none',
                    borderRadius: 7,
                    padding: '6px 0',
                    fontSize: 10.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    transition: 'all 0.15s',
                    background: mode === id ? accent : 'transparent',
                    color: mode === id ? '#fff' : 'rgba(255,255,255,0.35)',
                  }}
                >
                  <span style={{ fontSize: 11 }}>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
            <p style={{ marginTop: 8, fontSize: 9.5, lineHeight: 1.45, color: 'rgba(255,255,255,0.2)' }}>
              {mode === 'orbit' ? 'Drag to orbit · buttons to move' : 'Swipe a face to rotate · or use buttons'}
            </p>
          </div>

          {MOVE_GROUPS.map(({ id, label, accent: groupAccent, pairs }, gi) => (
            <div key={id} style={{ borderBottom: gi < MOVE_GROUPS.length - 1 ? '1px solid rgba(255,255,255,0.045)' : 'none', padding: '8px 10px 9px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: groupAccent, flexShrink: 0, opacity: 0.85 }} />
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>{label}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {pairs.map(([cw, ccw], pi) => (
                  <div key={pi} style={{ display: 'flex', gap: 3 }}>
                    {[cw, ccw].map(({ n, axis, layer, dir }) => (
                      <MoveBtn key={n} label={n} accent={groupAccent} onClick={() => pushMove({ axis, layer, dir })} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ padding: '8px 14px 12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', lineHeight: 1.5, letterSpacing: '0.04em' }}>
              Notation: prime (′) = counter-clockwise
              <br />
              U=Up D=Down R=Right L=Left
              <br />
              F=Front B=Back M=Mid E=Eq S=Std
              <br />
              x/y/z = whole-cube rotation
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}
