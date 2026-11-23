import { clamp, lerp, rand } from '../lib/random.js'

// The portal vortex: sparkles spiral toward the center. Once `getNeonStart()`
// returns a time, their colors shift from Christmas gold and red to the neon
// blue and purple of Nate's portfolio over NEON_SHIFT milliseconds.

const NEON_SHIFT = 1800
const WARM = [
  [247, 217, 120],
  [255, 122, 140],
]
const NEON = [
  [34, 211, 238],
  [168, 85, 247],
]

export function mixColor(from, to, t) {
  return [0, 1, 2].map((i) => Math.round(lerp(from[i], to[i], t)))
}

export function createPortalScene(ctx, { getNeonStart, small }) {
  const count = small ? 140 : 240
  let particles = []
  let width = 0
  let height = 0
  let maxRadius = 0

  function spawn(anywhere) {
    return {
      angle: rand(0, Math.PI * 2),
      radius: anywhere ? rand(20, maxRadius) : rand(maxRadius * 0.7, maxRadius),
      spin: rand(0.6, 1.6),
      pull: rand(0.18, 0.42),
      size: rand(0.8, 2.6),
      palette: Math.random() < 0.5 ? 0 : 1,
    }
  }

  return {
    resize(w, h) {
      width = w
      height = h
      maxRadius = Math.hypot(w, h) * 0.55
      particles = Array.from({ length: count }, () => spawn(true))
    },

    frame(now, dt) {
      // Fade the previous frame instead of clearing it, leaving soft trails.
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = dt > 0 ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,1)'
      ctx.fillRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'lighter'

      const neonStart = getNeonStart()
      const shift = neonStart === null ? 0 : clamp((now - neonStart) / NEON_SHIFT, 0, 1)
      const cx = width / 2
      const cy = height / 2

      for (const p of particles) {
        if (dt > 0) {
          // Closer to the center = faster spin, like water down a drain.
          p.angle += p.spin * dt * (1 + 160 / (p.radius + 40))
          p.radius -= p.radius * p.pull * dt
          if (p.radius < 8) Object.assign(p, spawn(false))
        }
        const [r, g, b] = mixColor(WARM[p.palette], NEON[p.palette], shift)
        const x = cx + Math.cos(p.angle) * p.radius
        const y = cy + Math.sin(p.angle) * p.radius * 0.82
        ctx.fillStyle = `rgba(${r},${g},${b},0.9)`
        ctx.beginPath()
        ctx.arc(x, y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
    },
  }
}
