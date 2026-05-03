/**
 * Lightweight text splitting — wraps each char in a span for animation.
 * Usage: splitChars('.hero-left-text') returns array of char spans.
 */
export function splitChars(selector) {
  const els = document.querySelectorAll(selector)
  const allChars = []

  els.forEach(el => {
    const original = el.innerHTML
    // Walk text nodes only, preserve HTML structure
    wrapCharsInEl(el, allChars)
  })

  return allChars
}

function wrapCharsInEl(el, collector) {
  el.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent
      if (!text.trim()) return
      const frag = document.createDocumentFragment()
      for (const char of text) {
        if (char === ' ') {
          frag.appendChild(document.createTextNode(' '))
        } else {
          const span = document.createElement('span')
          span.className = 'char'
          span.textContent = char
          span.style.display = 'inline-block'
          span.style.overflow = 'hidden'
          collector.push(span)
          frag.appendChild(span)
        }
      }
      node.replaceWith(frag)
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      wrapCharsInEl(node, collector)
    }
  })
}

/**
 * Split lines — wraps each line in a clip container for mask reveals.
 */
export function splitLines(selector) {
  const els = document.querySelectorAll(selector)
  els.forEach(el => {
    const words = el.textContent.split(' ')
    el.innerHTML = words
      .map(w => `<span class="line-word"><span class="line-inner">${w}</span></span>`)
      .join(' ')
  })
  return document.querySelectorAll(`${selector} .line-inner`)
}
