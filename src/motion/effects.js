import gsap from 'gsap'

/* ============================================================
   EFFECTS — Scramble · Magnetic · Velocity Skew
   ============================================================ */

// ---- TEXT SCRAMBLE ----
const GLYPHS = '!<>-_\\/[]{}—=+*^?#@$%&0123456789ABCDEF'

export function scrambleText(el, finalText, duration = 900, delay = 0) {
  const totalFrames = Math.round(duration / 16)
  let frame = 0

  const original = el.textContent
  el.setAttribute('aria-label', finalText || original)

  setTimeout(() => {
    const interval = setInterval(() => {
      const progress = frame / totalFrames

      el.textContent = [...finalText].map((char, i) => {
        if (char === ' ') return ' '
        if (i < Math.floor(progress * finalText.length)) return char
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      }).join('')

      frame++
      if (frame > totalFrames) {
        clearInterval(interval)
        el.textContent = finalText
      }
    }, 16)
  }, delay)
}

/** Attach scramble on hover to any element with [data-scramble] */
export function initScramble() {
  document.querySelectorAll('[data-scramble]').forEach(el => {
    const text = el.dataset.scramble || el.textContent
    el.addEventListener('mouseenter', () => scrambleText(el, text, 600))
  })
}

// ---- MAGNETIC BUTTONS ----
const MAGNET_STRENGTH = 0.36
const MAGNET_RADIUS   = 80   // px — distance to activate pull

export function initMagnetic() {
  document.querySelectorAll('[data-magnetic]').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const rect = btn.getBoundingClientRect()
      const cx   = rect.left + rect.width  / 2
      const cy   = rect.top  + rect.height / 2
      const dx   = e.clientX - cx
      const dy   = e.clientY - cy
      const dist = Math.hypot(dx, dy)

      if (dist < MAGNET_RADIUS) {
        gsap.to(btn, {
          x: dx * MAGNET_STRENGTH,
          y: dy * MAGNET_STRENGTH,
          duration: 0.4,
          ease: 'power3.out',
          overwrite: true,
        })
      }
    })

    btn.addEventListener('pointerleave', () => {
      gsap.to(btn, {
        x: 0, y: 0,
        duration: 0.75,
        ease: 'elastic.out(1, 0.4)',
        overwrite: true,
      })
    })
  })
}

// ---- VELOCITY SKEW (call from Lenis scroll event) ----
export function applyVelocitySkew(velocity) {
  const clamped = Math.max(-20, Math.min(20, velocity))

  gsap.to('[data-skew]', {
    skewY:    clamped * 0.045,
    duration: 0.55,
    ease:     'power3.out',
    overwrite: true,
  })

  /* Speed up marquee playback under heavy scroll */
  const track = document.querySelector('.marquee-track')
  if (track) {
    const speed = Math.abs(clamped)
    const dur   = Math.max(10, 28 - speed * 0.75)
    track.style.animationDuration = `${dur}s`
  }
}

// ---- WORK CARD 3D TILT ----
export function initCardTilt() {
  document.querySelectorAll('.work-card').forEach(card => {
    const visual = card.querySelector('.work-card-visual')
    if (!visual) return

    card.addEventListener('pointermove', e => {
      const rect  = card.getBoundingClientRect()
      const x     = (e.clientX - rect.left) / rect.width  - 0.5   // -0.5 → 0.5
      const y     = (e.clientY - rect.top)  / rect.height - 0.5

      gsap.to(card, {
        rotateX: -y * 6,
        rotateY:  x * 8,
        duration: 0.5,
        ease:     'power2.out',
        overwrite: true,
        transformPerspective: 800,
      })
    })

    card.addEventListener('pointerleave', () => {
      gsap.to(card, {
        rotateX: 0, rotateY: 0,
        duration: 0.7,
        ease:     'elastic.out(1, 0.5)',
        overwrite: true,
      })
    })
  })
}
