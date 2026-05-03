import * as THREE from 'three'
import ParticleTorus from './ParticleTorus.js'

/* Singleton — Bruno Simon pattern */
let instance = null

export default class Experience {
  constructor(canvas) {
    if (instance) return instance
    instance = this

    this.canvas = canvas

    this.sizes = {
      width:      window.innerWidth,
      height:     window.innerHeight,
      pixelRatio: Math.min(window.devicePixelRatio, 1.5),
    }

    this.clock = new THREE.Clock()

    this._setScene()
    this._setCamera()
    this._setRenderer()
    this._setParticleTorus()
    this._setResize()
  }

  _setScene() {
    this.scene = new THREE.Scene()
  }

  _setCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    )
    this.camera.position.z = 12
    this.scene.add(this.camera)
  }

  _setRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas:    this.canvas,
      antialias: true,
      alpha:     true,
    })
    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.renderer.setPixelRatio(this.sizes.pixelRatio)
    this.renderer.setClearColor(0x000000, 0) /* transparent background */
  }

  _setParticleTorus() {
    this.particleTorus = new ParticleTorus(this)
  }

  _setResize() {
    let rafId = null

    window.addEventListener('resize', () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        this.sizes.width      = window.innerWidth
        this.sizes.height     = window.innerHeight
        this.sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

        this.camera.aspect = this.sizes.width / this.sizes.height
        this.camera.updateProjectionMatrix()

        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(this.sizes.pixelRatio)
      })
    })
  }

  /* Called every frame from the GSAP ticker */
  update() {
    const elapsed = this.clock.getElapsedTime()
    this.particleTorus.update(elapsed)
    this.renderer.render(this.scene, this.camera)
  }

  /* Expose uniform setter for GSAP tweens */
  setUniform(name, value) {
    this.particleTorus.setUniform(name, value)
  }

  destroy() {
    this.particleTorus.dispose()
    this.renderer.dispose()
    instance = null
  }
}
