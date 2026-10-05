import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import {
  createGlitterNormalMap,
  createNailGeometry,
} from './nailGeometry'

export type Finish = 'gloss' | 'matte' | 'glitter' | 'chrome'

type Nail = {
  mesh: THREE.Mesh
  mat: THREE.MeshPhysicalMaterial
  uniforms: { uFrom: { value: THREE.Color }; uTo: { value: THREE.Color }; uProgress: { value: number }; uLift: { value: number } }
  base: THREE.Vector3
  baseRot: number
  lift: number
  anim: { start: number } | null
}

const FINISHES: Record<Finish, Partial<THREE.MeshPhysicalMaterialParameters>> = {
  gloss: { roughness: 0.32, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, iridescence: 0, sheen: 0 },
  matte: { roughness: 0.78, metalness: 0, clearcoat: 0, clearcoatRoughness: 1, iridescence: 0, sheen: 0.6 },
  glitter: { roughness: 0.3, metalness: 0.45, clearcoat: 1, clearcoatRoughness: 0.02, iridescence: 0, sheen: 0 },
  chrome: { roughness: 0.12, metalness: 0.85, clearcoat: 1, clearcoatRoughness: 0.02, iridescence: 1, iridescenceIOR: 1.8, iridescenceThicknessRange: [180, 520], sheen: 0 },
}

// Contact-shadow strength on the light lavender vs dark plum backdrop.
const SHADOW_LIGHT = 0.12
const SHADOW_DARK = 0.22
const BACKDROP_FADE = 0.4

/**
 * Five floating gel tips, lit as a studio product photograph.
 * Colour changes sweep from cuticle to tip like a brush stroke.
 * Framework-free so the React wrapper stays thin and the module lazy-loads.
 */
export class NailScene {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50)
  private rig = new THREE.Group()
  private nails: Nail[] = []
  private glitter: THREE.Texture
  private raycaster = new THREE.Raycaster()
  private pointer = new THREE.Vector2(9, 9)
  private tilt = { x: 0, y: 0 }
  private spin = { angle: 0, velocity: 0, dragging: false, lastX: 0 }
  private hovered: Nail | null = null
  private timer = new THREE.Timer()
  private raf = 0
  private visible = true
  private io: IntersectionObserver
  private ro: ResizeObserver
  private reducedMotion: boolean
  private scrollProgress = 0
  private pointerEvents = new AbortController()
  private environmentTarget: THREE.WebGLRenderTarget
  private groundMat = new THREE.ShadowMaterial({ opacity: SHADOW_LIGHT })
  private shadowFade: { from: number; to: number; start: number } | null = null
  onHover?: (index: number | null) => void

  constructor(private canvas: HTMLCanvasElement, opts: { color: string; finish: Finish; reducedMotion: boolean; darkBackdrop?: boolean }) {
    this.reducedMotion = opts.reducedMotion
    const mobile = window.matchMedia('(max-width: 767px)').matches
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2))
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 0.85
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.VSMShadowMap

    const pmrem = new THREE.PMREMGenerator(this.renderer)
    const room = new RoomEnvironment()
    this.environmentTarget = pmrem.fromScene(room, 0.03)
    this.scene.environment = this.environmentTarget.texture
    room.dispose()
    this.scene.environmentIntensity = 0.65
    pmrem.dispose()

    this.camera.position.set(0, 5.5, 3.5)
    this.camera.zoom = 1.22
    this.camera.lookAt(0, 0.35, 0)

    // Warm window light from the upper left, like the salon's product shots.
    const key = new THREE.DirectionalLight('#ffffff', 2.4)
    key.position.set(-3, 5, 2)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 12 })
    key.shadow.bias = -0.0005
    key.shadow.normalBias = 0.02
    key.shadow.radius = 5
    key.shadow.blurSamples = 8
    this.scene.add(key, new THREE.HemisphereLight('#ffffff', '#746174', 0.7))
    const rimLight = new THREE.DirectionalLight('#ecdbed', 1.4)
    rimLight.position.set(3, 2, -3)
    this.scene.add(rimLight)

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20).rotateX(-Math.PI / 2), this.groundMat)
    this.groundMat.opacity = opts.darkBackdrop ? SHADOW_DARK : SHADOW_LIGHT
    ground.receiveShadow = true
    this.scene.add(ground)

    this.glitter = createGlitterNormalMap()
    const geo = createNailGeometry({ arch: 0.75, thickness: 0.025 })
    const color = new THREE.Color(opts.color)
    for (let i = 0; i < 5; i++) {
      const uniforms = {
        uFrom: { value: color.clone() },
        uTo: { value: color.clone() },
        uProgress: { value: 1.2 },
        uLift: { value: 0 },
      }
      const mat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, side: THREE.DoubleSide, sheenColor: new THREE.Color('#ffffff'), envMapIntensity: 0.9 })
      mat.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, uniforms)
        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', '#include <common>\nvarying vec2 vNailUv;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvNailUv = uv;')
        shader.fragmentShader = shader.fragmentShader
          .replace(
            '#include <common>',
            '#include <common>\nvarying vec2 vNailUv;\nuniform vec3 uFrom;\nuniform vec3 uTo;\nuniform float uProgress;\nuniform float uLift;',
          )
          .replace(
            '#include <color_fragment>',
            `#include <color_fragment>
            float wet = 1.0 - smoothstep(uProgress - 0.06, uProgress + 0.02, vNailUv.y);
            // Chrome powders read as a pale, reflective version of the base shade.
            diffuseColor.rgb *= mix(mix(uFrom, uTo, wet), vec3(1.0), uLift);`,
          )
      }
      const mesh = new THREE.Mesh(geo, mat)
      mesh.castShadow = true
      mesh.receiveShadow = true
      const x = (i - 2) * 0.56
      const base = new THREE.Vector3(x, 0.25 + 0.07 * (2 - Math.abs(i - 2)), 0.04 + 0.15 * Math.abs(i - 2) ** 1.4)
      const baseRot = -(i - 2) * 0.16
      const size = [0.84, 0.96, 1.06, 0.96, 0.8][i]
      mesh.scale.setScalar(size)
      mesh.position.copy(base)
      mesh.rotation.set(0, baseRot, 0)
      mesh.userData.index = i
      this.rig.add(mesh)
      this.nails.push({ mesh, mat, uniforms, base, baseRot, lift: 0, anim: null })
    }
    this.setFinish(opts.finish)

    this.rig.rotation.y = -0.12
    this.scene.add(this.rig)

    this.bindPointer()
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(canvas)
    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting
      if (this.visible) this.loop()
    })
    this.io.observe(canvas)
    // Resume after the tab has been in the background.
    document.addEventListener('visibilitychange', this.loop)
    this.resize()
    this.loop()
  }

  private resize() {
    const { clientWidth: w, clientHeight: h } = this.canvas
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    // Keep all five tips in frame on tall mobile canvases.
    this.camera.fov = w / h < 1.3 ? 34 / Math.max(0.55, w / h) : 28
    this.camera.zoom = w / h < 1.3 ? 1 : 1.22
    this.camera.updateProjectionMatrix()
  }

  private bindPointer() {
    const el = this.canvas
    const options = { signal: this.pointerEvents.signal }
    const toLocal = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      return { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1 }
    }
    el.addEventListener('pointermove', (e) => {
      const p = toLocal(e)
      this.pointer.set(p.x, p.y)
      if (this.spin.dragging) {
        const dx = e.clientX - this.spin.lastX
        this.spin.lastX = e.clientX
        this.spin.velocity = dx * 0.006
        this.spin.angle += dx * 0.006
      }
    }, options)
    el.addEventListener('pointerleave', () => {
      this.pointer.set(9, 9)
      this.spin.dragging = false
    }, options)
    el.addEventListener('pointerdown', (e) => {
      this.spin.dragging = true
      this.spin.lastX = e.clientX
      el.setPointerCapture(e.pointerId)
    }, options)
    const end = () => (this.spin.dragging = false)
    el.addEventListener('pointerup', end, options)
    el.addEventListener('pointercancel', end, options)
    // Page-level parallax: the whole set tilts gently toward the cursor.
    window.addEventListener('pointermove', this.onWindowPointer)
  }

  private onWindowPointer = (e: PointerEvent) => {
    if (this.reducedMotion) return
    this.tilt.x = (e.clientY / window.innerHeight - 0.5) * 0.12
    this.tilt.y = (e.clientX / window.innerWidth - 0.5) * 0.2
  }

  setColor(hex: string) {
    const to = new THREE.Color(hex)
    const now = this.timer.getElapsed()
    this.nails.forEach((n, i) => {
      // The previous target becomes the base coat the new colour is brushed over.
      n.uniforms.uFrom.value.copy(n.uniforms.uTo.value)
      n.uniforms.uTo.value.copy(to)
      n.uniforms.uProgress.value = this.reducedMotion ? 1.2 : -0.1
      n.anim = this.reducedMotion ? null : { start: now + i * 0.09 }
    })
  }

  /** Deepen the contact shadows to match the CSS backdrop behind the canvas. */
  setDarkBackdrop(dark: boolean) {
    const to = dark ? SHADOW_DARK : SHADOW_LIGHT
    if (this.reducedMotion) {
      this.groundMat.opacity = to
      this.shadowFade = null
      return
    }
    this.shadowFade = { from: this.groundMat.opacity, to, start: this.timer.getElapsed() }
  }

  setScrollProgress(progress: number) {
    this.scrollProgress = this.reducedMotion ? 0 : Math.max(0, Math.min(1, progress))
  }

  setFinish(finish: Finish) {
    for (const n of this.nails) {
      n.mat.setValues(FINISHES[finish])
      n.mat.normalMap = finish === 'glitter' ? this.glitter : null
      n.mat.normalScale.set(0.55, 0.55)
      n.uniforms.uLift.value = finish === 'chrome' ? 0.12 : 0
      n.mat.needsUpdate = true
    }
  }

  private loop = () => {
    cancelAnimationFrame(this.raf)
    if (!this.visible || document.hidden) return
    this.raf = requestAnimationFrame(this.loop)
    this.timer.update()
    const dt = Math.min(this.timer.getDelta(), 0.05)
    const t = this.timer.getElapsed()

    // Spin with inertia, then settle back to the hero angle.
    if (!this.spin.dragging) {
      this.spin.angle += this.spin.velocity
      this.spin.velocity *= 0.92
      this.spin.angle += (0 - this.spin.angle) * (1 - Math.exp(-dt * 1.2))
    }
    const idle = this.reducedMotion ? 0 : Math.sin(t * 0.4) * 0.05
    const k = 1 - Math.exp(-dt * 4)
    this.rig.rotation.y += (-0.12 + this.scrollProgress * 0.55 + this.spin.angle + idle + this.tilt.y - this.rig.rotation.y) * k
    this.rig.rotation.x += (this.tilt.x - this.rig.rotation.x) * k

    // Hover: the tip under the cursor lifts off the dish.
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const hit = this.raycaster.intersectObjects(this.nails.map((n) => n.mesh), false)[0]
    const hovered = hit ? this.nails.find((n) => n.mesh === hit.object) ?? null : null
    if (hovered !== this.hovered) {
      this.hovered = hovered
      this.canvas.style.cursor = hovered ? 'pointer' : 'grab'
      this.onHover?.(hovered ? this.nails.indexOf(hovered) : null)
    }

    this.nails.forEach((n, i) => {
      const target = n === this.hovered ? 1 : 0
      n.lift += (target - n.lift) * (1 - Math.exp(-dt * 8))
      const bob = this.reducedMotion ? 0 : Math.sin(t * 1.3 + i * 0.8) * 0.006
      const spread = this.scrollProgress
      n.mesh.position.set(n.base.x * (1 + spread * 0.18), n.base.y + n.lift * 0.22 + bob + spread * (0.35 + (2 - Math.abs(i - 2)) * 0.13), n.base.z - n.lift * 0.08)
      n.mesh.rotation.set(-n.lift * 0.45 - spread * 0.18, n.baseRot + spread * (i - 2) * 0.1, n.lift * 0.08 * (i - 2))

      if (n.anim) {
        const p = (t - n.anim.start) / 0.75
        if (p >= 0) n.uniforms.uProgress.value = -0.1 + Math.min(1, 1 - Math.pow(1 - Math.max(0, p), 3)) * 1.3
        if (p >= 1) {
          n.uniforms.uProgress.value = 1.2
          n.anim = null
        }
      }
    })

    if (this.shadowFade) {
      const p = Math.min(1, (t - this.shadowFade.start) / BACKDROP_FADE)
      this.groundMat.opacity = this.shadowFade.from + (this.shadowFade.to - this.shadowFade.from) * p
      if (p >= 1) this.shadowFade = null
    }

    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.pointerEvents.abort()
    window.removeEventListener('pointermove', this.onWindowPointer)
    document.removeEventListener('visibilitychange', this.loop)
    this.io.disconnect()
    this.ro.disconnect()
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh
      m.geometry?.dispose()
      const mat = m.material as THREE.Material | undefined
      mat?.dispose()
    })
    this.glitter.dispose()
    this.environmentTarget.dispose()
    this.renderer.dispose()
  }
}
