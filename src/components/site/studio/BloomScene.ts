import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { createNailGeometry } from './nailGeometry'

/** A five-petal sculpture made from curved gel tips. No external model downloads. */
export class BloomScene {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(36, 1, 0.1, 40)
  private group = new THREE.Group()
  private petals: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>[] = []
  private pearl: THREE.Mesh
  private environment: THREE.WebGLRenderTarget
  private observer: ResizeObserver
  private intersection: IntersectionObserver
  private events = new AbortController()
  private raf = 0
  private visible = true
  private reduced = false
  private paused = false
  private progress = 0
  private target = new THREE.Vector2()
  private time = 0
  private last = 0

  constructor(private canvas: HTMLCanvasElement, reduced: boolean) {
    this.reduced = reduced
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' })
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 768 ? 1.5 : 2))
    this.renderer.setClearColor(0xffffff, 0)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05
    const room = new RoomEnvironment()
    const generator = new THREE.PMREMGenerator(this.renderer)
    this.environment = generator.fromScene(room, 0.035)
    this.scene.environment = this.environment.texture
    this.scene.environmentIntensity = 0.85
    generator.dispose()
    room.dispose()
    this.camera.position.set(0, 6.9, 3.6)
    this.camera.lookAt(0, 0.2, 0)
    this.scene.add(new THREE.HemisphereLight('#ffffff', '#6b465c', 1.1))
    const key = new THREE.DirectionalLight('#fff8f5', 3)
    key.position.set(-3, 6, 3)
    const rim = new THREE.DirectionalLight('#e3d8ff', 2.5)
    rim.position.set(4, 2, -3)
    this.scene.add(key, rim)

    const geometry = createNailGeometry({ length: 1.85, width: 0.88, arch: 0.85, thickness: 0.035, segU: 72, segV: 40 })
    const materials = [
      { color: '#e4b7bb', metalness: 0.12, roughness: 0.2, iridescence: 0.15 },
      { color: '#72243d', metalness: 0.16, roughness: 0.21, iridescence: 0 },
      { color: '#eee7e6', metalness: 0.68, roughness: 0.18, iridescence: 0.85 },
      { color: '#bc7c8d', metalness: 0.25, roughness: 0.23, iridescence: 0.3 },
      { color: '#f6e8db', metalness: 0.12, roughness: 0.26, iridescence: 0.35 },
    ]
    for (const values of materials) {
      const material = new THREE.MeshPhysicalMaterial({ ...values, clearcoat: 1, clearcoatRoughness: 0.045, iridescenceIOR: 1.35, iridescenceThicknessRange: [180, 420], side: THREE.DoubleSide })
      const mesh = new THREE.Mesh(geometry, material)
      this.petals.push(mesh)
      this.group.add(mesh)
    }
    this.pearl = new THREE.Mesh(new THREE.SphereGeometry(0.14, 32, 20), new THREE.MeshPhysicalMaterial({ color: '#e8d2c3', metalness: 0.8, roughness: 0.16, clearcoat: 1 }))
    this.pearl.position.y = 0.25
    this.group.add(this.pearl)
    this.scene.add(this.group)
    this.observer = new ResizeObserver(this.resize)
    this.observer.observe(canvas)
    this.intersection = new IntersectionObserver(([entry]) => { this.visible = entry.isIntersecting; this.last = 0; this.render() })
    this.intersection.observe(canvas)
    const options = { signal: this.events.signal }
    canvas.addEventListener('pointermove', (event) => {
      const rect = canvas.getBoundingClientRect()
      this.target.set((event.clientX - rect.left) / rect.width - 0.5, (event.clientY - rect.top) / rect.height - 0.5)
      this.render()
    }, options)
    canvas.addEventListener('pointerleave', () => { this.target.set(0, 0); this.render() }, options)
    document.addEventListener('visibilitychange', () => { this.last = 0; this.render() }, options)
    this.resize()
  }

  setProgress(value: number) { this.progress = value; this.render() }
  setReduced(value: boolean) { this.reduced = value; this.render() }
  setPaused(value: boolean) { this.paused = value; this.render() }

  private resize = () => {
    const width = this.canvas.clientWidth, height = this.canvas.clientHeight
    if (!width || !height) return
    this.renderer.setSize(width, height, false)
    this.camera.aspect = width / height
    this.camera.fov = width / height < 1 ? 42 / Math.max(0.45, width / height) : 36
    this.camera.updateProjectionMatrix()
    this.render()
  }

  private render = (now = performance.now()) => {
    cancelAnimationFrame(this.raf)
    if (!this.visible || document.hidden) return
    const dt = this.last ? Math.min((now - this.last) / 1000, 0.05) : 0
    this.last = now
    const moving = !this.reduced && !this.paused
    if (moving) this.time += dt
    const p = this.reduced ? 0 : this.progress
    this.group.scale.setScalar(1 - p * 0.1)
    this.petals.forEach((petal, i) => {
      const angle = i / 5 * Math.PI * 2 + 0.12
      const radius = 1.02 + Math.sin(p * Math.PI) * 0.35
      const fan = new THREE.Vector3((i - 2) * 0.78, 0.22, Math.abs(i - 2) * 0.12)
      petal.position.set(-Math.sin(angle) * radius, 0.06 + i * 0.025, -Math.cos(angle) * radius).lerp(fan, p)
      petal.position.y += moving ? Math.sin(this.time * 0.6 + i) * 0.035 : 0
      petal.rotation.set(-0.08 - p * 0.12, angle * (1 - p) - (i - 2) * 0.12 * p, Math.sin(angle) * 0.08 * (1 - p))
    })
    this.pearl.scale.setScalar(Math.max(0.001, 1 - p * 2))
    this.group.rotation.y = -0.18 + (moving ? Math.sin(this.time * 0.18) * 0.1 + this.target.x * 0.16 : 0)
    this.group.rotation.z = -0.16 * (1 - p)
    this.group.rotation.x = moving ? this.target.y * 0.08 : 0
    this.renderer.render(this.scene, this.camera)
    if (moving) this.raf = requestAnimationFrame(this.render)
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.events.abort()
    this.observer.disconnect()
    this.intersection.disconnect()
    const geometries = new Set<THREE.BufferGeometry>()
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        geometries.add(object.geometry)
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material) => material.dispose())
      }
    })
    geometries.forEach((geometry) => geometry.dispose())
    this.environment.dispose()
    this.renderer.dispose()
  }
}
