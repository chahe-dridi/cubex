import { useRef, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Cubelet, smoother, useCubePositions } from './primitives.jsx'

// Which cubelet layer a given axis value sits in.
function layerOf(v) {
  return v > 0.5 ? 1 : v < -0.5 ? -1 : 0
}

// Map (faceNormal, cubelet position, screen drag delta) → { axis, layer, dir }.
// Picks whichever in-face rotation axis best matches the drag direction on
// screen, then the layer that cubelet belongs to.
function computeSlideMove(faceNormal, cubeletPos, dragDx, dragDy, camera) {
  const axes = ['x', 'y', 'z']
  const faceAxis = axes.reduce((best, ax) => (Math.abs(faceNormal[ax]) > Math.abs(faceNormal[best]) ? ax : best), 'x')

  const candidates = axes.filter(a => a !== faceAxis)
  const len = Math.sqrt(dragDx * dragDx + dragDy * dragDy)
  if (len < 1) return null

  const results = candidates.map(rotAxis => {
    const A = new THREE.Vector3(rotAxis === 'x' ? 1 : 0, rotAxis === 'y' ? 1 : 0, rotAxis === 'z' ? 1 : 0)
    const tangent = new THREE.Vector3().crossVectors(A, faceNormal.clone().normalize())
    const camT = tangent.clone().applyMatrix4(camera.matrixWorldInverse).normalize()
    const dot = (camT.x * dragDx + -camT.y * dragDy) / len
    return { rotAxis, dot }
  })

  const winner = results.reduce((a, b) => (Math.abs(a.dot) > Math.abs(b.dot) ? a : b))
  const layer = layerOf(cubeletPos[winner.rotAxis])
  return { axis: winner.rotAxis, layer, dir: winner.dot > 0 ? 1 : -1 }
}

// ══════════════════════════════════════════════════════════
// Interactive cube: drag a face to turn a slice, or feed moves through a
// queue ref (from external buttons). Auto-solves back to the start after
// `autoReturnAfter` seconds of idle. Renders inside a parent <Canvas>.
// ══════════════════════════════════════════════════════════
export function InteractiveCubeScene({ palette, queueRef, modeRef, autoReturnAfter = 4, idleSpin = 0.28 }) {
  const orbitRef = useRef() // outer wrapper; only the idle auto-spin touches this
  const cubeRef = useRef()
  const rotRef = useRef()
  const anim = useRef({ active: false, axis: 'y', start: 0, target: 0, elapsed: 0, duration: 0.3 })
  const dragRef = useRef(null)
  const spinAngle = useRef(0)
  const history = useRef([]) // moves applied so far (for auto-return)
  const idleTimer = useRef(0)
  const isReturning = useRef(false)
  const { camera } = useThree()

  const positions = useCubePositions()

  useFrame((_, delta) => {
    const a = anim.current
    const cube = cubeRef.current
    const rot = rotRef.current
    if (!cube || !rot) return

    // Dequeue next move.
    if (!a.active && queueRef.current.length > 0) {
      const move = queueRef.current.shift()
      const { axis, layer, dir } = move
      if (!isReturning.current) {
        history.current.push(move)
        idleTimer.current = 0
      }
      const all = cube.children.slice()
      const toRot =
        layer === null
          ? all
          : all.filter(c => {
              const v = c.position[axis]
              return layer === 0 ? Math.abs(v) < 0.5 : layer > 0 ? v > 0.5 : v < -0.5
            })
      toRot.forEach(c => rot.attach(c))
      anim.current = { active: true, axis, start: 0, target: (Math.PI / 2) * dir, elapsed: 0, duration: 0.42 }
    }

    // Tween the active move — smootherstep for a silky, jerk-free turn.
    if (a.active) {
      a.elapsed = Math.min(a.elapsed + delta, a.duration)
      const ease = smoother(a.elapsed / a.duration)
      rot.rotation[a.axis] = a.start + (a.target - a.start) * ease
      if (a.elapsed >= a.duration) {
        rot.rotation[a.axis] = a.target
        rot.children.slice().forEach(c => cube.attach(c))
        rot.rotation.set(0, 0, 0)
        a.active = false
        if (isReturning.current && queueRef.current.length === 0) {
          isReturning.current = false
          history.current = []
        }
      }
    }

    // Auto-return: after idle with scramble history, reverse every move.
    if (autoReturnAfter > 0 && !a.active && queueRef.current.length === 0 && history.current.length > 0 && !isReturning.current) {
      idleTimer.current += delta
      if (idleTimer.current >= autoReturnAfter) {
        isReturning.current = true
        idleTimer.current = 0
        const reversed = history.current
          .slice()
          .reverse()
          .map(m => ({ ...m, dir: -m.dir }))
        queueRef.current.push(...reversed)
      }
    }

    // Idle auto-spin — on the OUTER wrapper only, never on cubeRef.
    if (idleSpin > 0 && !a.active && queueRef.current.length === 0 && orbitRef.current) {
      spinAngle.current += delta * idleSpin
      orbitRef.current.rotation.y = spinAngle.current
    }
  })

  const onPointerDown = useCallback(
    e => {
      if (modeRef && modeRef.current !== 'move') return
      e.stopPropagation()
      const normalWorld = e.face.normal.clone().transformDirection(e.object.matrixWorld)
      dragRef.current = { startX: e.clientX, startY: e.clientY, normalWorld, cubeletPos: e.object.position.clone() }
    },
    [modeRef],
  )

  const onPointerUp = useCallback(
    e => {
      const drag = dragRef.current
      if (!drag) return
      dragRef.current = null
      const dx = e.clientX - drag.startX
      const dy = e.clientY - drag.startY
      if (Math.sqrt(dx * dx + dy * dy) < 12) return
      const move = computeSlideMove(drag.normalWorld, drag.cubeletPos, dx, dy, camera)
      if (move) queueRef.current.push(move)
    },
    [camera, queueRef],
  )

  return (
    <group ref={orbitRef}>
      <group ref={cubeRef} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        {positions.map(([x, y, z]) => (
          <Cubelet key={`${x + 1}${y + 1}${z + 1}`} px={x} py={y} pz={z} palette={palette} />
        ))}
      </group>
      <group ref={rotRef} />
    </group>
  )
}

// Rubik's-notation move groups, exported so consumers can build their own UI.
export const MOVE_GROUPS = [
  {
    id: 'y',
    label: 'Y · Layer',
    accent: '#f59e0b',
    pairs: [
      [{ n: 'U', axis: 'y', layer: 1, dir: -1 }, { n: "U'", axis: 'y', layer: 1, dir: 1 }],
      [{ n: 'E', axis: 'y', layer: 0, dir: 1 }, { n: "E'", axis: 'y', layer: 0, dir: -1 }],
      [{ n: 'D', axis: 'y', layer: -1, dir: 1 }, { n: "D'", axis: 'y', layer: -1, dir: -1 }],
    ],
  },
  {
    id: 'x',
    label: 'X · Column',
    accent: '#ef4444',
    pairs: [
      [{ n: 'R', axis: 'x', layer: 1, dir: -1 }, { n: "R'", axis: 'x', layer: 1, dir: 1 }],
      [{ n: 'M', axis: 'x', layer: 0, dir: 1 }, { n: "M'", axis: 'x', layer: 0, dir: -1 }],
      [{ n: 'L', axis: 'x', layer: -1, dir: 1 }, { n: "L'", axis: 'x', layer: -1, dir: -1 }],
    ],
  },
  {
    id: 'z',
    label: 'Z · Depth',
    accent: '#22c55e',
    pairs: [
      [{ n: 'F', axis: 'z', layer: 1, dir: -1 }, { n: "F'", axis: 'z', layer: 1, dir: 1 }],
      [{ n: 'S', axis: 'z', layer: 0, dir: -1 }, { n: "S'", axis: 'z', layer: 0, dir: 1 }],
      [{ n: 'B', axis: 'z', layer: -1, dir: 1 }, { n: "B'", axis: 'z', layer: -1, dir: -1 }],
    ],
  },
  {
    id: 'rot',
    label: 'Rotate · Whole',
    accent: '#a78bfa',
    pairs: [
      [{ n: 'x', axis: 'x', layer: null, dir: -1 }, { n: "x'", axis: 'x', layer: null, dir: 1 }],
      [{ n: 'y', axis: 'y', layer: null, dir: -1 }, { n: "y'", axis: 'y', layer: null, dir: 1 }],
      [{ n: 'z', axis: 'z', layer: null, dir: -1 }, { n: "z'", axis: 'z', layer: null, dir: 1 }],
    ],
  },
]
