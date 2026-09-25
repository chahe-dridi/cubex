import type { CSSProperties, HTMLAttributes } from 'react'

export interface FaceMaterial {
  color: string
  roughness: number
  metalness: number
}

export interface Palette {
  right: FaceMaterial
  left: FaceMaterial
  up: FaceMaterial
  down: FaceMaterial
  front: FaceMaterial
  back: FaceMaterial
  inner: FaceMaterial
}

/** A partial palette. `base` selects which built-in palette to merge onto. */
export type PaletteInput = Partial<{
  base: 'brand' | 'classic'
  right: Partial<FaceMaterial>
  left: Partial<FaceMaterial>
  up: Partial<FaceMaterial>
  down: Partial<FaceMaterial>
  front: Partial<FaceMaterial>
  back: Partial<FaceMaterial>
  inner: Partial<FaceMaterial>
}>

export interface RubiksCubeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  /** Width in px (number) or any CSS size (string). Default 400. */
  size?: number | string
  /** Height. Defaults to `size` (square). */
  height?: number | string
  /** Palette override, merged onto the `brand` (default) or `classic` base. */
  palette?: PaletteInput
  /** Accent colour for the overlay's active mode toggle. Default '#E05C28'. */
  accent?: string
  /** Run the scramble → solve loop. Default true. */
  autoplay?: boolean
  /** Slowly tumble the whole cube. Default true. */
  tumble?: boolean
  /** Click to open the fullscreen interactive overlay. Default true. */
  interactive?: boolean
  /** Tilt the cube as the element scrolls through the viewport. Default false. */
  scrollTilt?: boolean
  /** Cube scale inside the canvas. Default 0.72. */
  scale?: number
  /** Camera position [x, y, z]. Default [7, 6, 7]. */
  cameraPosition?: [number, number, number]
  /** Camera field of view. Default 24. */
  fov?: number
  /** Canvas background. Default 'transparent'. */
  background?: string
  /** Ambient light intensity. Default 0.22. */
  ambient?: number
  style?: CSSProperties
  /** Called when the interactive overlay opens. */
  onExpand?: () => void
}

export declare function RubiksCube(props: RubiksCubeProps): JSX.Element
export default RubiksCube

export interface Move {
  axis: 'x' | 'y' | 'z'
  /** -1, 0, 1 for a layer; null for a whole-cube rotation. */
  layer: -1 | 0 | 1 | null
  dir: 1 | -1
}

export interface AutoCubeSceneProps {
  palette: Palette
  scrollRef?: { current: number } | null
  scale?: number
  tumble?: boolean
  autoplay?: boolean
}
export declare function AutoCubeScene(props: AutoCubeSceneProps): JSX.Element

export interface InteractiveCubeSceneProps {
  palette: Palette
  queueRef: { current: Move[] }
  modeRef?: { current: 'orbit' | 'move' }
  autoReturnAfter?: number
  idleSpin?: number
}
export declare function InteractiveCubeScene(props: InteractiveCubeSceneProps): JSX.Element

export interface CubeOverlayProps {
  onClose: () => void
  palette: Palette
  accent?: string
  cameraPosition?: [number, number, number]
  fov?: number
}
export declare function CubeOverlay(props: CubeOverlayProps): JSX.Element

export declare const MOVE_GROUPS: Array<{
  id: string
  label: string
  accent: string
  pairs: Array<Array<{ n: string } & Move>>
}>

export declare function Cubelet(props: { px: number; py: number; pz: number; palette: Palette }): JSX.Element
export declare function Lights(props: { ambient?: number }): JSX.Element
export declare function useCubePositions(): [number, number, number][]
export declare function smoother(t: number): number
export declare const CUBELET_GEO: import('three').BufferGeometry

export declare const BRAND_PALETTE: Palette
export declare const CLASSIC_PALETTE: Palette
export declare const FACE_ORDER: Array<keyof Palette>
export declare function resolvePalette(palette?: PaletteInput): Palette
