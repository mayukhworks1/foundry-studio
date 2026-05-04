import * as THREE from 'three'
import vertexShader   from './shaders/torus.vert.glsl?raw'
import fragmentShader from './shaders/torus.frag.glsl?raw'

const R_MAJOR = 2.4
const R_MINOR = 0.95
const TWIST   = 6.0
const TWO_PI  = Math.PI * 2

export default class ParticleTorus {
  constructor(experience) {
    this.experience = experience
    this.scene      = experience.scene

    /* Particle count — tuned for 60fps across device tiers */
    const isMobile  = window.innerWidth < 768
    const lowEnd    = isMobile || navigator.hardwareConcurrency < 4
    this.RINGS      = isMobile ? 28  : (lowEnd ? 40  : 70)
    this.PER_RING   = isMobile ? 20  : (lowEnd ? 35  : 55)

    /* Smoothed mouse position */
    this.mouse       = new THREE.Vector2(0, 0)
    this.targetMouse = new THREE.Vector2(0, 0)

    this._buildGeometry()
    this._buildMaterial()
    this._buildMesh()
    this._bindMouseMove()
  }

  _buildGeometry() {
    const count     = this.RINGS * this.PER_RING
    const positions = new Float32Array(count * 3)
    const thetas    = new Float32Array(count)
    const phis      = new Float32Array(count)
    const rands     = new Float32Array(count)

    let i = 0
    for (let r = 0; r < this.RINGS; r++) {
      const theta = (r / this.RINGS) * TWO_PI
      for (let p = 0; p < this.PER_RING; p++) {
        const phi = (p / this.PER_RING) * TWO_PI
        const tw  = phi + theta * TWIST

        /* Store initial torus positions for Three.js bounding computations */
        positions[i * 3 + 0] = (R_MAJOR + R_MINOR * Math.cos(tw)) * Math.cos(theta)
        positions[i * 3 + 1] = R_MINOR * Math.sin(tw)
        positions[i * 3 + 2] = (R_MAJOR + R_MINOR * Math.cos(tw)) * Math.sin(theta)

        thetas[i] = theta
        phis[i]   = phi
        rands[i]  = Math.random()
        i++
      }
    }

    this.geometry = new THREE.BufferGeometry()
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    this.geometry.setAttribute('aTheta',   new THREE.BufferAttribute(thetas,    1))
    this.geometry.setAttribute('aPhi',     new THREE.BufferAttribute(phis,      1))
    this.geometry.setAttribute('aRand',    new THREE.BufferAttribute(rands,     1))
  }

  _buildMaterial() {
    /* Displacement map — falls back gracefully if asset not yet present */
    const loader        = new THREE.TextureLoader()
    const displacementMap = loader.load('/assets/displacement.png')

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime:        { value: 0 },
        uScroll:      { value: 0 },
        uPhase:       { value: 0 },
        uIntro:       { value: 0 },
        uMouse:       { value: new THREE.Vector2(0, 0) },
        uMap:         { value: displacementMap },
        uColor:       { value: new THREE.Color('#F2EEE5') },  /* cream base */
        uColorAccent: { value: new THREE.Color('#E0613A') },  /* coral accent */
        uColorGlow:   { value: new THREE.Color('#FFE5C8') },  /* warm glow tint */
      },
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    })
  }

  _buildMesh() {
    this.mesh = new THREE.Points(this.geometry, this.material)
    this.scene.add(this.mesh)
  }

  _bindMouseMove() {
    window.addEventListener('pointermove', (e) => {
      this.targetMouse.x =  (e.clientX / window.innerWidth)  * 2 - 1
      this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    })
  }

  setUniform(name, value) {
    this.material.uniforms[name].value = value
  }

  update(elapsedTime) {
    /* Smooth mouse with lerp 0.08 */
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.08
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.08

    this.material.uniforms.uTime.value  = elapsedTime
    this.material.uniforms.uMouse.value = this.mouse
  }

  dispose() {
    this.geometry.dispose()
    this.material.dispose()
  }
}
