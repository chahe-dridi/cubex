import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Cubelet, smoother, useCubePositions } from './primitives.jsx'

// ── Move helpers ──────────────────────────────────────────
const AXES = ['x', 'y', 'z']
const randDir = () => (Math.random() < 0.5 ? 1 : -1)

// One random legal move, avoiding an immediate inverse of the last move (which
// would read like an undo). Mostly quarter turns, occasionally a half turn.
function randMove(last) {
  for (let i = 0; i < 8; i++) {
    const axis = AXES[(Math.random() * 3) | 0]
    const layer = [-1, 0, 1][(Math.random() * 3) | 0]
    const dir = randDir()
    const quarter = Math.random() < 0.82 ? 1 : 2
    if (last && last.axis === axis && last.layer === layer && last.dir === -dir && last.quarter === quarter) continue
    return { axis, layer, dir, quarter }
  }
  return { axis: 'y', layer: 1, dir: 1, quarter: 1 }
}

// Cubelets in the given layer of the given axis (null layer = all cubelets).
function layerChildren(children, axis, layer) {
  if (layer === null) return children
  return children.filter(c => {
    const v = c.position[axis]
    return layer === 0 ? Math.abs(v) < 0.5 : layer > 0 ? v > 0.5 : v < -0.5
  })
}

// Reusable quaternions — never re-allocated per frame.
const _dq = new THREE.Quaternion()
const _pq1 = new THREE.Quaternion()
const _pq2 = new THREE.Quaternion()
const _pq3 = new THREE.Quaternion()

// Three fixed precession axes, chosen incommensurate so the whole-cube tumble
// never visibly repeats within a practical viewing window.
const PREC1 = new THREE.Vector3(0.58, 0.77, -0.27).normalize()
const PREC2 = new THREE.Vector3(-0.41, 0.35, 0.84).normalize()
const PREC3 = new THREE.Vector3(0.22, -0.62, 0.75).normalize()

// Build one scramble "step":
//   • ~16% a 360° double-spin flourish (identity → not recorded)
//   • ~38% two parallel layers of the SAME axis turning together
//   • else a single quarter/half turn
// `record` is what must be reversed later to solve (null for the flourish).
function buildScrambleStep(prev) {
  const roll = Math.random()
  if (roll < 0.16) {
    const move = { axis: AXES[(Math.random() * 3) | 0], layer: [-1, 0, 1][(Math.random() * 3) | 0], dir: randDir(), quarter: 4 }
    return { moves: [move], record: null }
  }
  if (roll < 0.54) {
    const axis = AXES[(Math.random() * 3) | 0]
    const ls = [-1, 0, 1]
    const i1 = (Math.random() * 3) | 0
    let i2 = (Math.random() * 3) | 0
    while (i2 === i1) i2 = (Math.random() * 3) | 0
    const moves = [i1, i2].map(i => ({ axis, layer: ls[i], dir: randDir(), quarter: Math.random() < 0.25 ? 2 : 1 }))
    return { moves, record: moves }
  }
  const move = randMove(prev)
  return { moves: [move], record: [move] }
}

// Re-parent a layer's cubelets onto a rotation pivot and arm its tween. Each
// slice gets its own duration so two concurrent turns finish at different times.
function startSlot(slot, rotEl, cube, move) {
  layerChildren(cube.children.slice(), move.axis, move.layer).forEach(c => rotEl.attach(c))
  slot.ref = rotEl
  slot.axis = move.axis
  slot.target = (Math.PI / 2) * move.dir * move.quarter
  slot.elapsed = 0
  slot.duration = 0.42 * move.quarter + 0.16 + Math.random() * 0.3
  slot.active = true
}

// ══════════════════════════════════════════════════════════
// Auto-playing cube: whole-cube tumble + scramble→solve loop.
// Renders inside a parent <Canvas>. `scrollRef` is an optional ref holding a
// 0..1 scroll progress used to tilt the cube.
// ══════════════════════════════════════════════════════════
export function AutoCubeScene({ palette, scrollRef, scale = 0.72, tumble = true, autoplay = true }) {
  const tiltRef = useRef() // outermost: scroll tilt only
  const pivotRef = useRef() // whole-cube tumble + bob + scale
  const cubeRef = useRef() // holds the 27 cubelets at integer grid positions
  const rotRefA = useRef() // rotation pivot for slice A
  const rotRefB = useRef() // rotation pivot for slice B (concurrent turns)

  const spinDir = useRef(new THREE.Vector3(0.3, 0.88, 0.36).normalize())
  const slots = useRef([
    { active: false, ref: null, axis: 'y', target: 0, elapsed: 0, duration: 0 },
    { active: false, ref: null, axis: 'y', target: 0, elapsed: 0, duration: 0 },
  ])
  // Player state machine: scramble a handful of moves, then solve back, forever.
  const P = useRef({ phase: 'scramble', history: [], remaining: 7, idle: 1.0, prevMove: null })

  const positions = useCubePositions()

  useFrame((state, delta) => {
    if (!pivotRef.current || !tiltRef.current || !cubeRef.current || !rotRefA.current || !rotRefB.current) return
    const t = state.clock.elapsedTime
    const cube = cubeRef.current
    const m = P.current
    const S = slots.current

    // ── Whole-cube tumble on the PARENT pivot (cancels out of slice maths) ──
    if (tumble) {
      _pq1.setFromAxisAngle(PREC1, 0.2 * delta)
      _pq2.setFromAxisAngle(PREC2, 0.125 * delta)
      _pq3.setFromAxisAngle(PREC3, 0.075 * delta)
      spinDir.current.applyQuaternion(_pq1).applyQuaternion(_pq2).applyQuaternion(_pq3).normalize()

      const swell = Math.sin(t * 0.11) * 0.5 + Math.sin(t * 0.047 + 1.3) * 0.3 + Math.sin(t * 0.19 + 0.6) * 0.18
      const speed = 0.72 + swell * 0.34
      _dq.setFromAxisAngle(spinDir.current, speed * delta)
      pivotRef.current.quaternion.premultiply(_dq)
      pivotRef.current.position.y = Math.sin(t * 0.6) * 0.09
    }

    // ── Scroll tilt on the outer wrapper ──
    if (scrollRef) {
      const sp = scrollRef.current || 0
      const tiltK = 1 - Math.pow(0.05, delta)
      tiltRef.current.rotation.x = THREE.MathUtils.lerp(tiltRef.current.rotation.x, sp * -0.36, tiltK)
    }

    // ── Auto slice player: scramble → solve loop, 1 or 2 turns at a time ──
    const busy = S[0].active || S[1].active
    if (autoplay && !busy) {
      m.idle -= delta
      if (m.idle <= 0) {
        let moves
        if (m.phase === 'scramble') {
          const step = buildScrambleStep(m.prevMove)
          moves = step.moves
          if (step.record) m.history.push(step.record)
          if (m.history.length >= m.remaining) m.phase = 'solve'
        } else {
          const step = m.history.pop()
          moves = step.map(mm => ({ axis: mm.axis, layer: mm.layer, dir: -mm.dir, quarter: mm.quarter }))
        }
        m.prevMove = moves[moves.length - 1]
        startSlot(S[0], rotRefA.current, cube, moves[0])
        if (moves[1]) startSlot(S[1], rotRefB.current, cube, moves[1])
      }
    }

    // Advance each active slot independently (desynced finish).
    for (const s of S) {
      if (!s.active) continue
      s.elapsed = Math.min(s.elapsed + delta, s.duration)
      s.ref.rotation[s.axis] = s.target * smoother(s.elapsed / s.duration)
      if (s.elapsed >= s.duration) {
        s.ref.rotation[s.axis] = s.target
        s.ref.children.slice().forEach(c => cube.attach(c))
        s.ref.rotation.set(0, 0, 0)
        s.active = false
      }
    }

    // Step just completed → schedule the next.
    if (busy && !S[0].active && !S[1].active) {
      if (m.phase === 'solve' && m.history.length === 0) {
        m.phase = 'scramble'
        m.remaining = 7 + ((Math.random() * 6) | 0)
        m.idle = 1.8 + Math.random() * 1.5 // linger on the solved cube
      } else {
        m.idle = 0.12 + Math.random() * 0.4 // brief pause between turns
      }
    }
  })

  return (
    <group ref={tiltRef}>
      <group ref={pivotRef} scale={[scale, scale, scale]}>
        <group ref={cubeRef}>
          {positions.map(([x, y, z]) => (
            <Cubelet key={`${x + 1}${y + 1}${z + 1}`} px={x} py={y} pz={z} palette={palette} />
          ))}
        </group>
        <group ref={rotRefA} />
        <group ref={rotRefB} />
      </group>
    </group>
  )
}
