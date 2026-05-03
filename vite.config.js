import { defineConfig } from 'vite'

export default defineConfig({
  assetsInclude: ['**/*.glsl'],
  server: {
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          gsap:  ['gsap'],
          lenis: ['lenis'],
        },
      },
    },
  },
})
