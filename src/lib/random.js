// Seeded random numbers, so the trees, lights, and stars are placed the same
// way every time the page loads (and in tests).
export function seededRandom(seed) {
  let a = seed >>> 0
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const rand = (min, max) => min + Math.random() * (max - min)

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export const lerp = (a, b, t) => a + (b - a) * t
