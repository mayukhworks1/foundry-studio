import Lenis from 'lenis'
import gsap   from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* easeOutExpo — matches the brief spec */
function easeOutExpo(x) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
}

let lenis = null

export function initLenis() {
  lenis = new Lenis({
    duration: 1.15,
    easing:   easeOutExpo,
    smoothWheel: true,
  })

  /* Bridge Lenis scroll events into ScrollTrigger */
  lenis.on('scroll', ScrollTrigger.update)

  return lenis
}

export function getLenis() {
  return lenis
}
