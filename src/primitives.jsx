import { useMemo } from 'react'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { FACE_ORDER } from './palette.js'

// ── Shared geometry ───────────────────────────────────────
// One rounded-box geometry reused by all 27 cubelets. Module-level so it is
// created once per bundle, never per mount.
export const CUBELET_GEO = new RoundedBoxGeometry(0.95, 0.95, 0.95, 4, 0.045)

// Smootherstep (Perlin) — zero velocity AND acceleration at both ends, so
// every turn starts and stops with no perceptible jerk.
export const smoother = t => {
  t = Math.max(0, Math.min(1, t))
  return t * t * t * (t * (t * 6 - 15) + 10)
}

// One cubelet: outer faces get sticker materials, inner faces get the body.
export function Cubelet({ px, py, pz, palette }) {
  // Which of the 6 BoxGeometry face-slots are on the cube's outer surface.
  const outer = useMemo(
    () => [px === 1, px === -1, py === 1, py === -1, pz === 1, pz === -1],
    [px, py, pz],
  )
  return (
    <mesh position={[px, py, pz]} geometry={CUBELET_GEO}>
      {outer.map((isOuter, i) => {
        const m = isOuter ? palette[FACE_ORDER[i]] : palette.inner
        return (
          <meshStandardMaterial
            key={i}
            attach={`material-${i}`}
            color={m.color}
            roughness={m.roughness}
            metalness={m.metalness}
          />
        )
      })}
    </mesh>
  )
}

// Studio lighting tuned for flat (no tone-mapping) rendering: a warm key, a
// soft warm fill, a cool rim to carve edges out of a dark background, an
// ambient floor, and a warm front specular for the plastic sheen.
export function Lights({ ambient = 0.22 }) {
  return (
    <>
      <directionalLight position={[5, 8, 4]} intensity={2.4} color="#fff6ee" />
      <directionalLight position={[-5, -3, -4]} intensity={0.6} color="#ffe0cf" />
      <directionalLight position={[-4, 6, -6]} intensity={1.5} color="#cfe4ff" />
      <ambientLight intensity={ambient} />
      <pointLight position={[-1, 1, 5]} intensity={0.85} color="#fff5ee" distance={18} />
    </>
  )
}

// The 27 integer grid positions of a 3×3×3 cube.
export function useCubePositions() {
  return useMemo(() => {
    const list = []
    for (let x = -1; x <= 1; x++)
      for (let y = -1; y <= 1; y++)
        for (let z = -1; z <= 1; z++) list.push([x, y, z])
    return list
  }, [])
}
