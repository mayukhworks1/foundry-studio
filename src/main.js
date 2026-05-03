import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { initLenis }                             from './motion/lenis.js'
import { runLoader, runHeroReveal,
         setupScrollTriggers }                   from './motion/timeline.js'
import { initCursor }                            from './motion/cursor.js'
import { initMagnetic, initScramble,
         initCardTilt, applyVelocitySkew }       from './motion/effects.js'
import Experience                                from './webgl/Experience.js'

/* ---- 1. Register GSAP plugins ---- */
gsap.registerPlugin(ScrollTrigger)

/* ---- 2. WebGL experience ---- */
const canvas     = document.getElementById('canvas')
const experience = new Experience(canvas)

/* ---- 3. Smooth scroll ---- */
const lenis = initLenis()

/* ---- 4. Single ticker: Lenis + Three.js ---- */
gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
  experience.update()
})
gsap.ticker.lagSmoothing(500, 33)

/* ---- 4b. Velocity skew driven by scroll ---- */
lenis.on('scroll', ({ velocity }) => {
  applyVelocitySkew(velocity)
})

/* ---- 5. Custom cursor ---- */
initCursor()

/* ---- 6. Scroll animations ---- */
setupScrollTriggers(experience)

/* ---- 7. Interactive effects ---- */
initMagnetic()
initScramble()
initCardTilt()

/* ---- 7b. Newsletter signup ---- */
const newsletterForm = document.getElementById('footer-newsletter')
if (newsletterForm) {
  newsletterForm.addEventListener('submit', e => {
    e.preventDefault()
    const input = newsletterForm.querySelector('input[type="email"]')
    const btn   = newsletterForm.querySelector('.newsletter-btn')
    if (!input.value) return
    btn.textContent = 'Subscribed ✓'
    input.value = ''
    input.disabled = true
    setTimeout(() => {
      btn.textContent = 'Subscribe →'
      input.disabled = false
    }, 2400)
  })
}

/* ---- 8. Loader → hero reveal ---- */
runLoader(experience, () => {
  runHeroReveal(experience)
})

/* ---- 9. Protect content — disable right-click & DevTools shortcuts ---- */
;(function protectContent() {
  /* Disable right-click context menu */
  document.addEventListener('contextmenu', e => e.preventDefault())

  /* Block common DevTools keyboard shortcuts */
  document.addEventListener('keydown', e => {
    const K = e.key?.toUpperCase()
    if (
      e.key === 'F12' ||
      (e.ctrlKey  && e.shiftKey && ['I','J','C','K','E'].includes(K)) ||
      (e.metaKey  && e.altKey   && ['I','J','C'].includes(K)) ||   // macOS
      (e.ctrlKey  && K === 'U')                                    // view-source
    ) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, true)
})()
