import { useRef, useEffect, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Lights } from './primitives.jsx'
import { AutoCubeScene } from './AutoCubeScene.jsx'
import { CubeOverlay } from './CubeOverlay.jsx'
import { resolvePalette } from './palette.js'

// ══════════════════════════════════════════════════════════
// <RubiksCube /> — the drop-in component.
//
// Renders a self-contained auto-solving 3D cube. Optionally click it to open a
// fullscreen interactive overlay (drag a face to turn, or use the buttons).
// ══════════════════════════════════════════════════════════
export function RubiksCube({
  size = 400,
  height,
  palette: paletteProp,
  accent = '#E05C28',
  autoplay = true,
  tumble = true,
  interactive = true,
  scrollTilt = false,
  scale = 0.72,
  cameraPosition = [7, 6, 7],
  fov = 24,
  background = 'transparent',
  ambient = 0.22,
  className,
  style,
  onExpand,
  ...rest
}) {
  const scrollRef = useRef(0)
  const wrapRef = useRef(null)
  const [expanded, setExpanded] = useState(false)

  const palette = resolvePalette(paletteProp)
  const w = typeof size === 'number' ? `${size}px` : size
  const h = height != null ? (typeof height === 'number' ? `${height}px` : height) : w

  // Optional scroll-driven tilt: 0..1 progress as the element scrolls up.
  useEffect(() => {
    if (!scrollTilt) return
    const el = wrapRef.current
    const update = () => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      scrollRef.current = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height) - 0.1))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [scrollTilt])

  // Lock body scroll while the overlay is open + close on Escape.
  useEffect(() => {
    if (!expanded) return
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    const onKey = e => e.key === 'Escape' && setExpanded(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
      window.removeEventListener('keydown', onKey)
    }
  }, [expanded])

  const open = useCallback(() => {
    setExpanded(true)
    onExpand?.()
  }, [onExpand])
  const close = useCallback(() => setExpanded(false), [])

  return (
    <>
      <div ref={wrapRef} className={className} style={{ position: 'relative', width: w, height: h, flexShrink: 0, ...style }} {...rest}>
        <Canvas flat camera={{ position: cameraPosition, fov }} gl={{ antialias: true, alpha: background === 'transparent' }} style={{ background }}>
          <Lights ambient={ambient} />
          <AutoCubeScene palette={palette} scrollRef={scrollTilt ? scrollRef : null} scale={scale} tumble={tumble} autoplay={autoplay} />
        </Canvas>

        {interactive && (
          <div
            style={{ position: 'absolute', inset: 0, cursor: 'pointer', zIndex: 1 }}
            onClick={open}
            role="button"
            aria-label="Explore cube"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && open()}
          />
        )}
      </div>

      {interactive && expanded && <CubeOverlay onClose={close} palette={palette} accent={accent} />}
    </>
  )
}

export default RubiksCube
