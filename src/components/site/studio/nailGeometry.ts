import * as THREE from 'three'

/*
 * Parametric almond press-on nail tip, built lying flat:
 *   x = across the nail, y = up (the C-curve arch), z = along the nail (base +z, tip -z).
 * uv.y runs 0 at the cuticle to 1 at the tip, which the gel "brush" reveal uses.
 */
export function createNailGeometry({
  length = 1,
  width = 0.42,
  arch = 0.42,
  thickness = 0.018,
  segU = 56,
  segV = 28,
} = {}) {
  const halfW = (u: number) => {
    // Straight-ish sides that taper into a soft almond point.
    if (u < 0.52) return (width / 2) * (0.88 + 0.12 * Math.sin((u / 0.52) * Math.PI * 0.5))
    const t = (u - 0.52) / 0.48
    return (width / 2) * Math.pow(Math.max(0, 1 - t * t), 0.72)
  }
  const point = (u: number, v: number, lower: boolean) => {
    const w = halfW(u)
    const x = v * w
    // Rounded cuticle: the base edge bows toward the finger.
    const zBase = -0.07 * (1 - v * v) * Math.pow(1 - u, 3)
    const z = length / 2 - u * length + zBase * -1
    const y = arch * (1 - v * v) * w - 0.06 * length * Math.pow(u - 0.4, 2) - 0.03 * Math.pow(1 - u, 4) - (lower ? thickness : 0)
    return [x, y, z] as const
  }

  const pos: number[] = []
  const uv: number[] = []
  const idx: number[] = []

  const grid = (lower: boolean) => {
    const start = pos.length / 3
    for (let i = 0; i <= segU; i++) {
      for (let j = 0; j <= segV; j++) {
        const u = i / segU
        const v = (j / segV) * 2 - 1
        pos.push(...point(u, v, lower))
        uv.push(j / segV, u)
      }
    }
    const row = segV + 1
    for (let i = 0; i < segU; i++) {
      for (let j = 0; j < segV; j++) {
        const a = start + i * row + j
        const b = a + row
        // Top faces up (+y), bottom faces down.
        if (lower) idx.push(a, b, a + 1, b, b + 1, a + 1)
        else idx.push(a, a + 1, b, b, a + 1, b + 1)
      }
    }
  }
  grid(false)
  grid(true)

  // Rim: a thin wall joining top and bottom along the sides and the cuticle edge.
  const rim = (samples: Array<[number, number]>, flip: boolean) => {
    const start = pos.length / 3
    for (const [u, v] of samples) {
      pos.push(...point(u, v, false))
      uv.push(v * 0.5 + 0.5, u)
      pos.push(...point(u, v, true))
      uv.push(v * 0.5 + 0.5, u)
    }
    for (let k = 0; k < samples.length - 1; k++) {
      const a = start + k * 2
      if (flip) idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
      else idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
  }
  const side = (v: number) => Array.from({ length: segU + 1 }, (_, i) => [i / segU, v] as [number, number])
  rim(side(-1), false)
  rim(side(1), true)
  rim(Array.from({ length: segV + 1 }, (_, j) => [0, (j / segV) * 2 - 1] as [number, number]), true)

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  geo.setIndex(idx)
  geo.computeVertexNormals()
  return geo
}

/* Organic ceramic trinket dish: a lathe profile squashed into a soft oval "pebble". */
export function createDishGeometry() {
  const profile = [
    [0, 0.0], [0.9, 0.0], [1.02, 0.012], [1.1, 0.045], [1.15, 0.1], [1.17, 0.16],
    [1.15, 0.2], [1.1, 0.215], [1.05, 0.2], [1.0, 0.13], [0.94, 0.085], [0.8, 0.07], [0, 0.07],
  ].map(([r, y]) => new THREE.Vector2(r, y))
  const geo = new THREE.LatheGeometry(profile, 128)
  const p = geo.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const z = p.getZ(i)
    const a = Math.atan2(z, x)
    const k = 1 + 0.06 * Math.sin(2 * a + 0.4) + 0.035 * Math.sin(3 * a + 1.3)
    p.setX(i, x * k * 1.5)
    p.setZ(i, z * k * 1.02)
  }
  geo.computeVertexNormals()
  return geo
}

/* Speckled stoneware texture, painted once on a canvas. */
export function createSpeckleTexture(size = 512) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  g.fillStyle = '#ddd2c3'
  g.fillRect(0, 0, size, size)
  let s = 11
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < 2600; i++) {
    const d = r() < 0.9 ? 0.6 + r() * 1.1 : 1.6 + r() * 1.6
    g.fillStyle = `rgba(${90 + r() * 40},${70 + r() * 30},${55 + r() * 25},${0.25 + r() * 0.45})`
    g.beginPath()
    g.arc(r() * size, r() * size, d, 0, Math.PI * 2)
    g.fill()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(3, 1)
  tex.anisotropy = 4
  return tex
}

/* Glitter flakes: a normal map of randomly tilted facets that catch the light. */
export function createGlitterNormalMap(size = 256) {
  const data = new Uint8Array(size * size * 4)
  let s = 7
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < size * size; i++) {
    data[i * 4] = 128
    data[i * 4 + 1] = 128
    data[i * 4 + 2] = 255
    data[i * 4 + 3] = 255
  }
  for (let f = 0; f < 2200; f++) {
    const cx = Math.floor(r() * size)
    const cy = Math.floor(r() * size)
    const nx = r() * 2 - 1
    const ny = r() * 2 - 1
    const rad = 1 + Math.floor(r() * 2)
    for (let dy = -rad; dy <= rad; dy++) {
      for (let dx = -rad; dx <= rad; dx++) {
        const x = (cx + dx + size) % size
        const y = (cy + dy + size) % size
        const o = (y * size + x) * 4
        data[o] = 128 + nx * 120
        data[o + 1] = 128 + ny * 120
        data[o + 2] = 190
      }
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(3, 6)
  tex.needsUpdate = true
  return tex
}
