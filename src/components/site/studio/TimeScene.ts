import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { createNailGeometry } from './nailGeometry'

/** One satin ribbon connects the chapters; gel tips emerge as the story finds color. */
export class TimeScene {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(35, 1, .1, 40)
  private ribbon: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>
  private nails = new THREE.Group()
  private environment: THREE.WebGLRenderTarget
  private resizeObserver: ResizeObserver
  private intersection: IntersectionObserver
  private events = new AbortController()
  private raf = 0
  private visible = true
  private paused = false
  private reduced = false
  private progress = 0
  private time = 0
  private last = 0
  private mobile = false

  constructor(private canvas: HTMLCanvasElement, reduced: boolean) {
    this.reduced = reduced
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true, powerPreference:'low-power' })
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 761 ? 1.5 : 2))
    this.renderer.setClearColor(0xffffff, 0)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    const generator = new THREE.PMREMGenerator(this.renderer)
    const room = new RoomEnvironment()
    this.environment = generator.fromScene(room, .04)
    this.scene.environment = this.environment.texture
    this.scene.environmentIntensity = 1.1
    room.dispose()
    generator.dispose()
    this.camera.position.set(0, 0, 12)
    const light = new THREE.DirectionalLight('#fff4e9', 3)
    light.position.set(-3, 5, 5)
    this.scene.add(light, new THREE.HemisphereLight('#ffffff', '#8e566c', 2))

    // A twisted, open strip, with real curved normals and reflective satin material.
    const vertices: number[] = [], indices: number[] = []
    for (let i = 0; i <= 240; i++) {
      const t = i / 240, a = t * Math.PI * 2.05 - .55
      const width = Math.sin(t * Math.PI) * .22 + .035
      for (const side of [-1, 1]) {
        const twist = a * 1.4 + .3
        vertices.push(Math.cos(a) * (2.3 + side * width * Math.cos(twist)), Math.sin(a) * 1.48 + side * width * Math.sin(twist), Math.sin(a * 1.5) * .65 + side * width * Math.sin(twist + .7))
      }
      if (i < 240) { const j = i * 2; indices.push(j, j + 1, j + 2, j + 1, j + 3, j + 2) }
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()
    this.ribbon = new THREE.Mesh(geometry, new THREE.MeshPhysicalMaterial({ color:'#ddbeb4', metalness:.65, roughness:.27, clearcoat:1, clearcoatRoughness:.18, side:THREE.DoubleSide, iridescence:.25, transparent:true }))
    this.scene.add(this.ribbon)
    const nailGeometry = createNailGeometry({ length:1.8, width:.8, arch:.8, segU:56, segV:28 })
    for (const color of ['#772e46', '#cf8c9d', '#eee0d1']) {
      const mesh = new THREE.Mesh(nailGeometry, new THREE.MeshPhysicalMaterial({ color, metalness:.18, roughness:.19, clearcoat:1, clearcoatRoughness:.05, iridescence:.3, transparent:true, side:THREE.DoubleSide }))
      mesh.rotation.x = Math.PI * .5
      this.nails.add(mesh)
    }
    this.scene.add(this.nails)
    this.resizeObserver = new ResizeObserver(this.resize)
    this.resizeObserver.observe(canvas)
    this.intersection = new IntersectionObserver(([entry]) => { this.visible = entry.isIntersecting; this.last = 0; this.render() })
    this.intersection.observe(canvas)
    document.addEventListener('visibilitychange', this.wake, { signal:this.events.signal })
    this.resize()
  }

  setProgress(value: number) { this.progress = value; this.render() }
  setReduced(value: boolean) { this.reduced = value; this.render() }
  setPaused(value: boolean) { this.paused = value; this.render() }
  private wake = () => { this.last = 0; this.render() }
  private resize = () => {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight
    if (!w || !h) return
    this.mobile = w < 761
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.fov = this.mobile ? 47 : 35
    this.camera.updateProjectionMatrix()
    this.render()
  }
  private render = (now = performance.now()) => {
    cancelAnimationFrame(this.raf)
    if (!this.visible || document.hidden || this.reduced) return
    const p = this.progress
    const dt = this.last ? Math.min(.05, (now - this.last) / 1000) : 0
    this.last = now
    // The PAUSE chapter deliberately has almost no autonomous movement.
    if (!this.paused) this.time += dt * (p > .65 && p < 1.4 ? .12 : .5)
    const bob = Math.sin(this.time) * .06
    this.ribbon.position.set(this.mobile ? .65 : 2.3, (this.mobile ? -2.15 : .1) + bob, 0)
    this.ribbon.rotation.set(.3 + p * .13, -.3 + p * .18, -.55 + p * .38 + Math.sin(this.time * .4) * .025)
    this.ribbon.scale.setScalar(this.mobile ? .72 : 1.03)
    this.ribbon.material.opacity = Math.max(0, 1 - Math.max(0, p - 1.55) * 1.5)
    const reveal = THREE.MathUtils.smoothstep(p, .8, 1.65)
    this.nails.visible = reveal > 0 && p < 3.1
    this.nails.position.set(this.mobile ? -.4 : 1.6, this.mobile ? -2.35 : -.2, 0)
    this.nails.scale.setScalar(this.mobile ? .76 : 1)
    this.nails.children.forEach((object, i) => {
      const nail = object as THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>
      nail.position.set((i - 1) * .9, Math.sin(i * 2 + this.time * .4) * .12 + (i === 1 ? .3 : 0), i * .3)
      nail.rotation.set(Math.PI * .5 - .18, (i - 1) * .2, (i - 1) * -.3 + p * .08)
      nail.material.opacity = reveal * (1 - THREE.MathUtils.smoothstep(p, 2.4, 3))
    })
    this.renderer.render(this.scene, this.camera)
    if (!this.paused && p < 3) this.raf = requestAnimationFrame(this.render)
  }
  dispose() {
    cancelAnimationFrame(this.raf)
    this.events.abort()
    this.resizeObserver.disconnect()
    this.intersection.disconnect()
    const geometries = new Set<THREE.BufferGeometry>()
    this.scene.traverse(object => {
      if (object instanceof THREE.Mesh) {
        geometries.add(object.geometry)
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach(material => material.dispose())
      }
    })
    geometries.forEach(geometry => geometry.dispose())
    this.environment.dispose()
    this.renderer.dispose()
  }
}
