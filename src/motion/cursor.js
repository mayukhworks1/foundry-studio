/**
 * Foundry Studio — Premium custom cursor
 * Uses existing .cursor-dot + .cursor-ring DOM elements from HTML.
 * No new elements are created — avoids the "stuck top-left" duplicate bug.
 */
export function initCursor() {
  /* Skip on touch devices */
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches
  if (isTouchDevice) return

  /* ── Grab the elements already in HTML ── */
  const dot  = document.querySelector('.cursor-dot')
  const ring = document.querySelector('.cursor-ring')
  if (!dot || !ring) return

  /* ── State ── */
  let mouseX    = -200          // start off-screen
  let mouseY    = -200
  let ringX     = -200
  let ringY     = -200
  let isVisible = false
  let isHovering = false
  let rafId

  /* ── Initially hidden; reveal on first pointer move ── */
  dot.style.opacity  = '0'
  ring.style.opacity = '0'

  const show = () => {
    if (!isVisible) {
      isVisible = true
      dot.style.opacity  = '1'
      ring.style.opacity = '1'
    }
  }
  const hide = () => {
    isVisible = false
    dot.style.opacity  = '0'
    ring.style.opacity = '0'
  }

  document.addEventListener('mouseleave', hide)
  document.addEventListener('mouseenter', show)

  /* ── Track raw pointer position ── */
  window.addEventListener('pointermove', (e) => {
    mouseX = e.clientX
    mouseY = e.clientY
    show()
  })

  /* ── Click pulse ── */
  window.addEventListener('mousedown', () => {
    dot.classList.add('cursor-dot--click')
    ring.classList.add('cursor-ring--click')
  })
  window.addEventListener('mouseup', () => {
    dot.classList.remove('cursor-dot--click')
    ring.classList.remove('cursor-ring--click')
  })

  /* ── Hover detection — interactive elements attract the ring ── */
  const interactives = 'a, button, .cta-pill, .stack-item, .nav-mark, [data-magnetic]'
  const cardTargets  = '.work-card, .cap-card, .testi-card'

  document.addEventListener('pointerover', (e) => {
    if (e.target.closest(interactives) || e.target.closest(cardTargets)) {
      isHovering = true

      if (e.target.closest(cardTargets)) {
        ring.classList.add('cursor-ring--card')
        dot.classList.add('cursor-dot--card')
      } else {
        ring.classList.add('cursor-ring--hover')
        dot.classList.add('cursor-dot--hover')
      }
    }
  })

  document.addEventListener('pointerout', (e) => {
    if (e.target.closest(interactives) || e.target.closest(cardTargets)) {
      isHovering = false
      ring.classList.remove('cursor-ring--hover', 'cursor-ring--card')
      dot.classList.remove('cursor-dot--hover',  'cursor-dot--card')
    }
  })

  /* ── Animation loop ── */
  function tick() {
    /* Lerp ring toward dot position */
    const ease = isHovering ? 0.14 : 0.10
    ringX += (mouseX - ringX) * ease
    ringY += (mouseY - ringY) * ease

    /*
     * translate(calc(Xpx - 50%), calc(Ypx - 50%)) perfectly centres each
     * element on the cursor because `%` inside translate() refers to the
     * element's own width/height, not its parent.
     * translateZ(0) keeps GPU compositing active.
     */
    dot.style.transform  =
      `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%)) translateZ(0)`
    ring.style.transform =
      `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%)) translateZ(0)`

    rafId = requestAnimationFrame(tick)
  }

  tick()

  return () => cancelAnimationFrame(rafId)
}
