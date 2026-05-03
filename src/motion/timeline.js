import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ============================================================
   HELPERS
   ============================================================ */

function splitToChars(el) {
  const text  = el.textContent
  el.innerHTML = ''
  el.setAttribute('aria-label', text)
  return [...text].map(char => {
    const outer = document.createElement('span')
    const inner = document.createElement('span')
    outer.className           = 'char-outer'
    inner.className           = 'char-inner'
    inner.style.display       = 'inline-block'
    inner.textContent         = char === ' ' ? ' ' : char
    outer.style.display       = 'inline-block'
    outer.style.overflow      = 'hidden'
    outer.style.verticalAlign = 'bottom'
    outer.appendChild(inner)
    el.appendChild(outer)
    return inner
  })
}

/* Shared ScrollTrigger defaults — reduces boilerplate & keeps config uniform */
const ST = (trigger, start = 'top 82%', extra = {}) => ({
  trigger,
  start,
  once: true,          // ← kill after play — no reverse, no wasted compute
  ...extra,
})

/* ============================================================
   LOADER
   ============================================================ */
export function runLoader(experience, onComplete) {
  const loaderNum = document.getElementById('loader-num')
  const loader    = document.getElementById('loader')

  if (reduced) {
    loader.style.display = 'none'
    experience.setUniform('uIntro', 1)
    onComplete?.()
    return
  }

  const obj = { count: 0 }
  gsap.to(obj, {
    count:    100,
    duration: 1.6,
    ease:     'power3.inOut',
    onUpdate()   { loaderNum.textContent = String(Math.round(obj.count)).padStart(2, '0') },
    onComplete() {
      gsap.timeline()
        .to(loaderNum, { y: '-110%', opacity: 0, duration: 0.45, ease: 'power3.in' })
        .to(loader,    { scaleY: 0, transformOrigin: 'top', duration: 0.65, ease: 'expo.in' }, '-=0.1')
        .call(() => { loader.style.display = 'none'; onComplete?.() })
    },
  })
}

/* ============================================================
   HERO REVEAL
   ============================================================ */
export function runHeroReveal(experience) {
  const tl = gsap.timeline()

  /* 1. Torus intro */
  tl.to({ value: 0 }, {
    value:    1,
    duration: 2.0,
    ease:     'expo.out',
    onUpdate() { experience.setUniform('uIntro', this.targets()[0].value) },
  }, 0)

  /* 2. Hero heading chars */
  const h1 = document.querySelector('.hero-left-text')
  if (h1 && !reduced) {
    const chars = splitToChars(h1)
    gsap.set(chars, { y: '105%' })
    tl.to(chars, { y: '0%', duration: 0.95, ease: 'expo.out', stagger: 0.035 }, 0.25)
  }

  /* 3. Accent word */
  const accent = document.querySelector('.hero-right-text .word > span')
  if (accent && !reduced) {
    tl.to(accent, { y: '0%', duration: 1.1, ease: 'expo.out' }, 0.5)
  }

  /* 4. Meta + tagline */
  tl.to('.hero-meta',              { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.8)
  tl.to('.hero-tagline',           { opacity: 1, duration: 0.01 }, 0.9)
  tl.to('.hero-tagline-word > span', {
    y: '0%', opacity: 0.55,
    duration: 0.75, ease: 'expo.out', stagger: 0.05,
  }, 0.95)

  /* 5. Nav */
  tl.fromTo('.nav',
    { y: -20, opacity: 0 },
    { y:   0, opacity: 1, duration: 0.75, ease: 'power3.out' }, 0.35
  )

  /* 6. Progress bar */
  tl.fromTo('.progress-bar',
    { scaleX: 0 },
    { scaleX: 1, duration: 0.55, ease: 'power2.out' }, 1.1
  )

  return tl
}

/* ============================================================
   SCROLL CHOREOGRAPHY
   ============================================================ */
export function setupScrollTriggers(experience) {

  /* ── Hero badge + scroll hint ── */
  gsap.to('.hero-badge',       { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 1.8 })
  gsap.to('.hero-scroll-hint', { opacity: 1,        duration: 1.0, ease: 'power2.out', delay: 2.4 })

  /* ── Page progress bar (scrubbed) ── */
  ScrollTrigger.create({
    trigger:  'body',
    start:    'top top',
    end:      'bottom bottom',
    scrub:    0.3,
    onUpdate(self) {
      document.querySelector('.progress-fill').style.width = `${self.progress * 100}%`
    },
  })

  /* ── Canvas fade into intro ── */
  ScrollTrigger.create({
    trigger: '.intro',
    start:   'top 88%',
    end:     'top 15%',
    scrub:   1.0,
    onUpdate(self) {
      const canvas = document.getElementById('canvas')
      if (canvas) canvas.style.opacity = 1 - self.progress
    },
  })

  /* ── Intro: words reveal — single trigger, staggered ── */
  if (!reduced) {
    const introSpans = document.querySelectorAll('.intro-word > span')
    gsap.fromTo(introSpans,
      { y: '100%', rotate: 2 },
      {
        y: '0%', rotate: 0,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.06,
        scrollTrigger: ST('.intro-inner', 'top 80%'),
      }
    )
  }

  /* ── Intro sub-label ── */
  gsap.fromTo('.intro-sub',
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: ST('.intro-sub') }
  )

  /* ── Intro primitives strip ── */
  gsap.fromTo('.intro-prim',
    { opacity: 0, y: 20 },
    {
      opacity: 1, y: 0,
      duration: 0.8, ease: 'expo.out',
      stagger: 0.08,
      scrollTrigger: ST('.intro-primitives', 'top 85%'),
    }
  )

  /* ── Intro blockquote ── */
  if (!reduced) {
    gsap.fromTo('.intro-blockquote',
      { opacity: 0, y: 20 },
      { opacity: 0.45, y: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: ST('.intro-quote', 'top 88%') }
    )
  }

  /* ── Stat counters — one trigger for the whole bar ── */
  const statItems = document.querySelectorAll('.stat-item')
  gsap.fromTo(statItems,
    { opacity: 0, y: 24 },
    {
      opacity: 1, y: 0,
      duration: 0.9, ease: 'expo.out',
      stagger: 0.10,
      scrollTrigger: ST('.stats', 'top 80%'),
    }
  )
  document.querySelectorAll('.stat-num[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target, 10)
    const suffix = el.dataset.suffix || ''
    const obj    = { val: 0 }
    gsap.to(obj, {
      val: target,
      duration: 2.2,
      ease: 'power3.out',
      scrollTrigger: ST('.stats', 'top 78%'),
      onUpdate() { el.textContent = Math.round(obj.val) + suffix },
    })
  })

  /* ── Work section ── */
  if (!reduced) {
    gsap.fromTo('.work-eyebrow',
      { opacity: 0, x: -14 },
      { opacity: 0.4, x: 0, duration: 0.75, ease: 'power3.out', scrollTrigger: ST('.work-header', 'top 84%') }
    )
    gsap.fromTo('.work-heading .word > span',
      { y: '105%' },
      {
        y: '0%', duration: 0.95, ease: 'expo.out', stagger: 0.07,
        scrollTrigger: ST('.work-header', 'top 82%'),
      }
    )

    /* Batch work cards — fires once per card, no reverse cost */
    ScrollTrigger.batch('.work-card', {
      start:    'top 88%',
      once:     true,
      onEnter:  batch => gsap.fromTo(batch,
        { opacity: 0, y: 44, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'expo.out', stagger: 0.12 }
      ),
    })
  }

  /* ── Chapters progress + floating label ── */
  const chapProgressBar  = document.querySelector('.chapters-progress-bar')
  const chapProgressFill = document.querySelector('.chapters-progress-fill')
  let chapLabel = document.querySelector('.chapter-label-pill')
  if (!chapLabel) {
    chapLabel = document.createElement('div')
    chapLabel.className = 'chapter-label-pill'
    document.body.appendChild(chapLabel)
  }
  const PANEL_NAMES = ['Design System', 'Asset Forge', 'Runtime Layer', 'Motion Director']

  ScrollTrigger.create({
    trigger: '.chapters',
    start:   'top top',
    end:     'bottom bottom',
    onEnter()     { chapProgressBar?.classList.add('is-active'); chapLabel?.classList.add('is-active') },
    onLeave()     { chapProgressBar?.classList.remove('is-active'); chapLabel?.classList.remove('is-active') },
    onEnterBack() { chapProgressBar?.classList.add('is-active'); chapLabel?.classList.add('is-active') },
    onLeaveBack() { chapProgressBar?.classList.remove('is-active'); chapLabel?.classList.remove('is-active') },
    onUpdate(self) {
      if (chapProgressFill) chapProgressFill.style.width = `${self.progress * 100}%`
      const idx = Math.min(Math.floor(self.progress * 4), 3)
      if (chapLabel) chapLabel.textContent = `0${idx + 1} / 04 — ${PANEL_NAMES[idx]}`
    },
  })

  /* ── Horizontal chapters scroll ── */
  const track      = document.querySelector('.chapters-track')
  const panels     = document.querySelectorAll('.panel')
  const PANEL_COUNT = panels.length

  gsap.set('.panel-right', { opacity: 0, y: 40 })

  const chaptersPin = ScrollTrigger.create({
    id:        'chapters',
    trigger:   '.chapters',
    start:     'top top',
    end:       'bottom bottom',
    scrub:     0.8,
    invalidateOnRefresh: true,         // layout-critical: must recalc on resize
    animation: gsap.to(track, {
      x:    () => -(window.innerWidth * (PANEL_COUNT - 1)),
      ease: 'none',
    }),
  })

  /* Panel right reveals via container animation */
  if (!reduced) {
    panels.forEach(panel => {
      const right    = panel.querySelector('.panel-right')
      if (!right) return
      const children = right.querySelectorAll('.panel-title, .panel-body, .cta-pill')
      gsap.set(children, { opacity: 0, y: 28 })

      ScrollTrigger.create({
        trigger:            panel,
        containerAnimation: chaptersPin,
        start:              'left 65%',
        end:                'left 20%',
        onEnter() {
          gsap.to(right,    { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' })
          gsap.to(children, { opacity: 1, y: 0, duration: 0.75, ease: 'expo.out', stagger: 0.1, delay: 0.1 })
        },
        onLeaveBack() {
          gsap.to(right,    { opacity: 0, y: 40, duration: 0.4, ease: 'power2.in' })
          gsap.to(children, { opacity: 0, y: 28, duration: 0.3, ease: 'power2.in' })
        },
      })
    })
  }

  /* ── Capabilities ── */
  if (!reduced) {
    gsap.fromTo(['.caps-eyebrow', '.caps-heading', '.caps-sub'],
      { opacity: 0, y: 22 },
      {
        opacity: 1, y: 0,
        duration: 0.9, ease: 'expo.out',
        stagger: 0.1,
        scrollTrigger: ST('.caps-header', 'top 82%'),
        onStart() {
          // re-apply opacity for eyebrow (it targets 0.4 not 1)
          gsap.set('.caps-eyebrow', { opacity: 0.4 })
        },
      }
    )

    ScrollTrigger.batch('.cap-card', {
      start:   'top 88%',
      once:    true,
      onEnter: batch => gsap.fromTo(batch,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.85, ease: 'expo.out', stagger: 0.07 }
      ),
    })
  }

  /* ── Process steps ── */
  if (!reduced) {
    gsap.fromTo(['.process-eyebrow', '.process-heading'],
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0,
        duration: 0.9, ease: 'expo.out',
        stagger: 0.12,
        scrollTrigger: ST('.process-header', 'top 82%'),
      }
    )

    document.querySelectorAll('.process-step').forEach(step => {
      const num  = step.querySelector('.step-num')
      const line = step.querySelector('.step-line')
      const body = step.querySelector('.step-body')
      const tags = step.querySelectorAll('.step-tag')

      const tl = gsap.timeline({ scrollTrigger: ST(step, 'top 82%') })
      tl.fromTo(num,  { opacity: 0, scale: 0.8 },             { opacity: 1, scale: 1, duration: 0.65, ease: 'expo.out' }, 0)
      tl.fromTo(body, { opacity: 0, y: 20 },                  { opacity: 1, y: 0,     duration: 0.75, ease: 'power3.out' }, 0.1)
      if (line) tl.fromTo(line, { scaleY: 0, transformOrigin: 'top' }, { scaleY: 1, duration: 1.1, ease: 'power2.inOut' }, 0.25)
      tl.fromTo(tags, { opacity: 0, x: -6 },                  { opacity: 0.6, x: 0, duration: 0.45, ease: 'power2.out', stagger: 0.05 }, 0.35)
    })
  }

  /* ── Testimonials ── */
  if (!reduced) {
    gsap.fromTo(['.testi-eyebrow', '.testi-heading'],
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0,
        duration: 0.9, ease: 'expo.out',
        stagger: 0.12,
        scrollTrigger: ST('.testi-header', 'top 82%'),
      }
    )

    ScrollTrigger.batch('.testi-card', {
      start:   'top 88%',
      once:    true,
      onEnter: batch => gsap.fromTo(batch,
        { opacity: 0, y: 36, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'expo.out', stagger: 0.10 }
      ),
    })
  }

  /* ── Press strip — single trigger, stagger ── */
  gsap.fromTo(['.press-label', '.press-item'],
    { opacity: 0, y: 10 },
    {
      opacity: 0.45, y: 0,
      duration: 0.55, ease: 'power2.out',
      stagger: 0.04,
      scrollTrigger: ST('.press', 'top 90%'),
    }
  )
  // press-label should be 0.4 opacity
  gsap.set('.press-label', { opacity: 0.4 })

  /* ── Footer ── */
  gsap.fromTo('.footer-col',
    { opacity: 0, y: 18 },
    {
      opacity: 1, y: 0,
      duration: 0.85, ease: 'power3.out',
      stagger: 0.07,
      scrollTrigger: ST('.footer-inner', 'top 90%'),
    }
  )

  /* ── Work card image parallax (scrubbed, GPU-friendly) ── */
  document.querySelectorAll('.work-card').forEach(card => {
    const img = card.querySelector('.work-card-img')
    if (!img || reduced) return
    gsap.fromTo(img,
      { y: -30 },
      {
        y: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start:   'top bottom',
          end:     'bottom top',
          scrub:   1.2,
        },
      }
    )
  })

  /* ── Why section ── */
  if (!reduced) {
    gsap.fromTo(['.why-eyebrow', '.why-heading .why-word > span'],
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0,
        duration: 1.0, ease: 'expo.out',
        stagger: 0.12,
        scrollTrigger: ST('.why-header', 'top 82%'),
      }
    )

    document.querySelectorAll('.why-item').forEach((item, i) => {
      gsap.fromTo(item,
        { opacity: 0, x: i % 2 === 0 ? -40 : 40 },
        {
          opacity: 1, x: 0,
          duration: 1.0, ease: 'expo.out',
          scrollTrigger: ST(item, 'top 84%'),
        }
      )
    })
  }

  /* ── CTA band ── */
  if (!reduced) {
    gsap.fromTo('.cta-band-eyebrow',
      { opacity: 0, y: 16 },
      { opacity: 0.4, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: ST('.cta-band', 'top 82%') }
    )

    const ctaLines = document.querySelectorAll('.cta-band-line > span')
    gsap.fromTo(ctaLines,
      { y: '110%' },
      {
        y: '0%',
        duration: 1.1, ease: 'expo.out',
        stagger: 0.15,
        scrollTrigger: ST('.cta-band-headline', 'top 85%'),
      }
    )

    gsap.fromTo(['.cta-band-sub', '.cta-band-actions'],
      { opacity: 0, y: 24 },
      {
        opacity: 1, y: 0,
        duration: 0.9, ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: ST('.cta-band-inner', 'top 78%'),
      }
    )
  }

  /* ── Stack section — stroke → fill on scroll ── */
  document.querySelectorAll('.stack-item').forEach(item => {
    ScrollTrigger.create({
      trigger:      item,
      start:        'top 76%',
      end:          'top 28%',
      onEnter()     { item.classList.add('is-on') },
      onLeaveBack() { item.classList.remove('is-on') },
    })
  })

  /* ── Outro reveal ── */
  if (!reduced) {
    /* Status + nav fade */
    gsap.fromTo(['.outro-status', '.outro-nav'],
      { opacity: 0, y: 18 },
      {
        opacity: 1, y: 0,
        duration: 0.75, ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: ST('.outro-top', 'top 85%'),
      }
    )

    /* Headline: clip upward reveal (same approach as CTA band) */
    const outroLines = document.querySelectorAll('.outro-headline-line > span')
    if (outroLines.length) {
      gsap.fromTo(outroLines,
        { y: '105%' },
        {
          y: '0%',
          duration: 1.15, ease: 'expo.out',
          stagger:  0.10,
          scrollTrigger: ST('.outro-headline', 'top 80%'),
        }
      )
    }

    /* Bottom CTA fade */
    gsap.fromTo(['.outro-bottom .cta-pill', '.outro-email'],
      { opacity: 0, y: 14 },
      {
        opacity: 1, y: 0,
        duration: 0.7, ease: 'power3.out',
        stagger: 0.10,
        scrollTrigger: ST('.outro-bottom', 'top 92%'),
      }
    )
  }

  /* ── Nav scrolled state — adds glassy dark bg after 80px ── */
  const navEl = document.querySelector('.nav')
  if (navEl) {
    ScrollTrigger.create({
      trigger:      'body',
      start:        'top -80px',
      onEnter()     { navEl.classList.add('is-scrolled') },
      onLeaveBack() { navEl.classList.remove('is-scrolled') },
    })
  }
}
