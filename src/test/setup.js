import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// jsdom (the test browser) has no canvas, media queries, ResizeObserver, or
// Web Audio. These stand-ins let components mount; nothing under test is
// mocked — the canvas effects simply skip drawing, exactly as they do in a
// real browser without canvas support.
HTMLCanvasElement.prototype.getContext = () => null

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  })
}

if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  window.localStorage.clear()
  delete document.documentElement.dataset.motion
})
