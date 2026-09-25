// ── Palettes ──────────────────────────────────────────────
// A palette describes the six sticker faces plus the inner body.
// Faces map to axes: right (+x), left (-x), up (+y), down (-y),
// front (+z), back (-z). Each entry is { color, roughness, metalness }.
// metalness stays 0 by default — there is no environment map, so any
// metalness only deadens the diffuse colour. The plastic sheen comes from
// crisp specular highlights of the lights at low roughness.

// Warm editorial brand palette (the original cubex look): a "warm side /
// cool side" read rather than a random rainbow. Opposite faces hold the
// strongest contrast pairs.
export const BRAND_PALETTE = {
  right: { color: '#E05C28', roughness: 0.34, metalness: 0 }, // accent orange
  left:  { color: '#00C9A7', roughness: 0.34, metalness: 0 }, // mint teal
  up:    { color: '#EDE3D1', roughness: 0.44, metalness: 0 }, // ink cream
  down:  { color: '#C8963E', roughness: 0.36, metalness: 0 }, // gold
  front: { color: '#B23E22', roughness: 0.36, metalness: 0 }, // deep terracotta
  back:  { color: '#0B7A6E', roughness: 0.38, metalness: 0 }, // deep teal
  inner: { color: '#1C1A17', roughness: 0.82, metalness: 0 }, // dark body
}

// Classic Rubik's colours for a traditional look.
export const CLASSIC_PALETTE = {
  right: { color: '#B71234', roughness: 0.3, metalness: 0 },  // red
  left:  { color: '#FF5800', roughness: 0.3, metalness: 0 },  // orange
  up:    { color: '#FFFFFF', roughness: 0.4, metalness: 0 },  // white
  down:  { color: '#FFD500', roughness: 0.32, metalness: 0 }, // yellow
  front: { color: '#009B48', roughness: 0.32, metalness: 0 }, // green
  back:  { color: '#0046AD', roughness: 0.32, metalness: 0 }, // blue
  inner: { color: '#111111', roughness: 0.85, metalness: 0 }, // black body
}

// Face order used everywhere geometry is built. This is the order
// meshStandardMaterial slots map to on a BoxGeometry:
//   0 = +x (right), 1 = -x (left), 2 = +y (up),
//   3 = -y (down),  4 = +z (front), 5 = -z (back)
export const FACE_ORDER = ['right', 'left', 'up', 'down', 'front', 'back']

// Merge a user-supplied partial palette over a base, per-face.
export function resolvePalette(palette) {
  if (!palette) return BRAND_PALETTE
  const base = palette.base === 'classic' ? CLASSIC_PALETTE : BRAND_PALETTE
  const out = {}
  for (const key of [...FACE_ORDER, 'inner']) {
    out[key] = { ...base[key], ...(palette[key] || {}) }
  }
  return out
}
