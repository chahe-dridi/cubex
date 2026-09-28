<div align="center">

# cubex

**A beautiful, self-solving 3D Rubik's Cube component for React.**

It scrambles and solves itself in an endless loop, tumbles gently in 3D, and — when you click it — opens a fullscreen playground where you can drag faces to turn them or drive it with Rubik's-notation buttons. Fully themeable, ~8&nbsp;kB gzipped, zero configuration to drop in.

[![npm](https://img.shields.io/npm/v/react-rubiks-cube?color=E05C28)](https://www.npmjs.com/package/react-rubiks-cube)
[![license](https://img.shields.io/github/license/chahe-dridi/cubex?color=00C9A7)](./LICENSE)
[![stars](https://img.shields.io/github/stars/chahe-dridi/cubex?style=social)](https://github.com/chahe-dridi/cubex/stargazers)

### [▶ Live demo](https://cubex-fawn-xi.vercel.app)

[Features](#features) · [Install](#install) · [Quick start](#quick-start) · [Props](#props) · [Theming](#theming) · [Advanced](#advanced)

**Like it? [⭐ Star the repo](https://github.com/chahe-dridi/cubex) — it genuinely helps others find it.**

</div>

---

## Features

- 🎲 **Self-solving** — realistic scramble → solve loop, with occasional flourishes and dual concurrent slice turns.
- 🖱️ **Interactive** — click to expand into a fullscreen overlay; drag a face to turn a slice, orbit to look around, or use the notation buttons (U, R, F, M, x/y/z…).
- 🎨 **Themeable** — ships with a warm `brand` palette and the `classic` Rubik's colours, or pass your own per-face colours.
- 🪶 **Light** — one shared geometry, pooled quaternions, no per-frame allocations. ~8&nbsp;kB gzipped, everything heavy stays a peer dependency.
- 🧩 **Composable** — use the one-line `<RubiksCube />`, or drop the underlying scenes into your own `<Canvas>`.
- 🔒 **TypeScript** — full typings included.

## Install

```bash
npm install react-rubiks-cube
```

> The package is published as **`react-rubiks-cube`**; the project/brand name is **cubex**. Import from `react-rubiks-cube`.

`cubex` relies on a few peers you probably already have in a react-three project. Install them if you don't:

```bash
npm install react react-dom three @react-three/fiber @react-three/drei framer-motion
```

> Installing straight from GitHub also works and builds automatically:
> ```bash
> npm install github:chahe-dridi/cubex
> ```

## Quick start

```jsx
import { RubiksCube } from 'react-rubiks-cube'

export default function App() {
  return <RubiksCube size={400} />
}
```

That's it — you get an auto-solving, tumbling cube that expands into an interactive playground on click. It renders its own `<Canvas>`, so it works anywhere in your app.

## Props

All props are optional.

| Prop             | Type                                   | Default          | Description                                                            |
| ---------------- | -------------------------------------- | ---------------- | ---------------------------------------------------------------------- |
| `size`           | `number \| string`                     | `400`            | Width in px (number) or any CSS size.                                  |
| `height`         | `number \| string`                     | `size`           | Height. Defaults to a square.                                          |
| `palette`        | `PaletteInput`                         | brand palette    | Colour override — see [Theming](#theming).                             |
| `accent`         | `string`                               | `'#E05C28'`      | Accent colour for the overlay's active mode toggle.                    |
| `autoplay`       | `boolean`                              | `true`           | Run the scramble → solve loop.                                         |
| `tumble`         | `boolean`                              | `true`           | Slowly tumble the whole cube in 3D.                                    |
| `interactive`    | `boolean`                              | `true`           | Click to open the fullscreen interactive overlay.                      |
| `scrollTilt`     | `boolean`                              | `false`          | Tilt the cube as the element scrolls through the viewport.             |
| `scale`          | `number`                               | `0.72`           | Cube scale inside the canvas.                                          |
| `cameraPosition` | `[number, number, number]`             | `[7, 6, 7]`      | Camera position.                                                       |
| `fov`            | `number`                               | `24`             | Camera field of view.                                                  |
| `background`     | `string`                               | `'transparent'`  | Canvas background (e.g. `'#0a0908'`).                                   |
| `ambient`        | `number`                               | `0.22`           | Ambient light intensity.                                               |
| `onExpand`       | `() => void`                           | —                | Called when the interactive overlay opens.                             |
| `className` / `style` | —                                 | —                | Applied to the wrapper `<div>`.                                        |

### Examples

```jsx
// A calm, non-interactive hero cube that reacts to scroll
<RubiksCube size="min(80vw, 460px)" interactive={false} scrollTilt />

// Classic Rubik's colours on a solid background
<RubiksCube palette={{ base: 'classic' }} background="#0a0908" accent="#009B48" />

// Static showpiece — no tumble, no autoplay
<RubiksCube tumble={false} autoplay={false} />
```

## Theming

A palette defines the six sticker faces (`right`, `left`, `up`, `down`, `front`, `back`) plus the `inner` body. Each entry is `{ color, roughness, metalness }`.

Pass a **partial** palette and it's merged over a base. Pick the base with `base: 'brand'` (default) or `base: 'classic'`:

```jsx
<RubiksCube
  palette={{
    base: 'classic',
    up:   { color: '#fafafa' },      // override just one face
    front:{ color: '#8b5cf6', roughness: 0.25 },
  }}
/>
```

You can also import the built-in palettes and helper directly:

```jsx
import { BRAND_PALETTE, CLASSIC_PALETTE, resolvePalette } from 'react-rubiks-cube'
```

## Advanced

Want the cube inside your own scene? Import the underlying pieces and render them in a `<Canvas>` you control.

```jsx
import { Canvas } from '@react-three/fiber'
import { AutoCubeScene, Lights, resolvePalette } from 'react-rubiks-cube'

const palette = resolvePalette({ base: 'classic' })

function Scene() {
  return (
    <Canvas flat camera={{ position: [7, 6, 7], fov: 24 }}>
      <Lights ambient={0.25} />
      <AutoCubeScene palette={palette} tumble autoplay />
    </Canvas>
  )
}
```

Building a custom control UI? `InteractiveCubeScene` reads moves from a queue ref, and `MOVE_GROUPS` gives you the full Rubik's-notation move set to render buttons from:

```jsx
import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { InteractiveCubeScene, MOVE_GROUPS, Lights, resolvePalette } from 'react-rubiks-cube'

function Playground() {
  const queue = useRef([])            // push { axis, layer, dir } to turn a slice
  const palette = resolvePalette()
  return (
    <>
      <Canvas flat camera={{ position: [5, 4, 5], fov: 34 }}>
        <Lights ambient={0.4} />
        <InteractiveCubeScene palette={palette} queueRef={queue} />
      </Canvas>
      <button onClick={() => queue.current.push({ axis: 'y', layer: 1, dir: -1 })}>U</button>
    </>
  )
}
```

### A move

```ts
{ axis: 'x' | 'y' | 'z', layer: -1 | 0 | 1 | null, dir: 1 | -1 }
```

`layer` selects which of the three slices along `axis` turns; `null` rotates the whole cube. `dir` is the turn direction.

## Local development

```bash
git clone https://github.com/chahe-dridi/cubex.git
cd cubex
npm install
npm run dev      # runs the interactive demo in example/
npm run build    # builds the library into dist/
```

## Roadmap & contributing

Contributions are very welcome — the repo has a set of scoped issues to pick from:

- 🟢 **Good first issues** — [more built-in palettes](https://github.com/chahe-dridi/cubex/issues/7), [`prefers-reduced-motion` support](https://github.com/chahe-dridi/cubex/issues/1), [a preview GIF](https://github.com/chahe-dridi/cubex/issues/3)
- ✨ **Features** — [imperative `scramble()`/`solve()` API](https://github.com/chahe-dridi/cubex/issues/4), [keyboard controls](https://github.com/chahe-dridi/cubex/issues/5), [NxN cubes](https://github.com/chahe-dridi/cubex/issues/6)

See all [open issues](https://github.com/chahe-dridi/cubex/issues). Grab one, comment to claim it, then follow the flow below.

### Branching model

| Branch    | Role                                                                 |
| --------- | ------------------------------------------------------------------- |
| `master`  | Stable / release branch. This is what npm publishes and what `npm install github:chahe-dridi/cubex` pulls. Never push straight to it. |
| `dev`     | Integration branch. All work lands here first and is tested together. |
| `feat/*`  | Your working branch, one per issue.                                 |

**All pull requests target `dev`, not `master`.** Once changes on `dev` are tested and stable, a maintainer merges `dev → master` and cuts a release.

```bash
# 1. Branch off dev
git checkout dev && git pull
git checkout -b feat/reduced-motion    # e.g. issue #1

# 2. Do the work, then push
git push -u origin feat/reduced-motion

# 3. Open a PR into dev
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide.

## Support

If cubex saved you some time or just made you smile:

- ⭐ **[Star it on GitHub](https://github.com/chahe-dridi/cubex)** — the single biggest thing that helps others discover it.
- 🐦 **Share it** — a quick post or link to the repo goes a long way.
- 🐛 **[Open an issue](https://github.com/chahe-dridi/cubex/issues)** for bugs or ideas, or send a PR.

Every star and share is genuinely appreciated. 🙏

## License

[MIT](./LICENSE) © chahe-dridi
