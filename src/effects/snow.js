import { pointer } from '../lib/pointer.js'
import { clamp, rand } from '../lib/random.js'

// Falling snow in three depth layers: many small, slow flakes far away and a
// few big, fast ones close to the "camera". Flakes near the cursor (or a
// finger) are gently pushed aside.

const LAYERS = [
  { share: 0.55, radius: [0.8, 1.6], speed: [14, 26], alpha: [0.35, 0.6], sway: [6, 14] },
  { share: 0.33, radius: [1.6, 2.6], speed: [26, 44], alpha: [0.55, 0.8], sway: [10, 22] },
  { share: 0.12, radius: [2.8, 4.4], speed: [48, 72], alpha: [0.7, 0.95], sway: [16, 30] },
]

const PUSH_RADIUS = 110

/** How many flakes to draw for a screen size: more on big screens, never too many. */
export function snowflakeCount(width, height) {
  return Math.round(clamp((width * height) / 6500, 50, 300))
}

function makeSprite() {
  const size = 64
  const sprite = document.createElement('canvas')
  sprite.width = size
  sprite.height = size
  const ctx = sprite.getContext('2d')
  if (!ctx) return null
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.28, 'rgba(240,246,255,0.85)')
  gradient.addColorStop(1, 'rgba(220,232,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return sprite
}

export function createSnowScene(ctx) {
  const sprite = makeSprite()
  let flakes = []
  let width = 0
  let height = 0

  function makeFlake(anywhere) {
    const roll = Math.random()
    const depth = roll < LAYERS[0].share ? 0 : roll < LAYERS[0].share + LAYERS[1].share ? 1 : 2
    const layer = LAYERS[depth]
    return {
      depth,
      x: rand(0, width),
      y: anywhere ? rand(-height * 0.05, height) : rand(-40, -6),
      r: rand(...layer.radius),
      vy: rand(...layer.speed),
      alpha: rand(...layer.alpha),
      sway: rand(...layer.sway),
      phase: rand(0, Math.PI * 2),
      swaySpeed: rand(0.4, 1.1),
      pushX: 0,
      pushY: 0,
    }
  }

  return {
    resize(w, h) {
      width = w
      height = h
      const target = snowflakeCount(w, h)
      if (flakes.length > target) flakes = flakes.slice(0, target)
      while (flakes.length < target) flakes.push(makeFlake(true))
    },

    frame(now, dt) {
      ctx.clearRect(0, 0, width, height)
      const t = now / 1000
      const wind = Math.sin(t * 0.13) * 12 + Math.sin(t * 0.051) * 8

      for (const flake of flakes) {
        if (dt > 0) {
          flake.phase += flake.swaySpeed * dt
          if (pointer.active) {
            const dx = flake.x - pointer.x
            const dy = flake.y - pointer.y
            const distanceSq = dx * dx + dy * dy
            if (distanceSq < PUSH_RADIUS * PUSH_RADIUS && distanceSq > 0.01) {
              const distance = Math.sqrt(distanceSq)
              const push = (1 - distance / PUSH_RADIUS) * 520 * (0.6 + flake.depth * 0.3) * dt
              flake.pushX += (dx / distance) * push
              flake.pushY += (dy / distance) * push * 0.5
            }
          }
          const damping = Math.exp(-2.2 * dt)
          flake.pushX *= damping
          flake.pushY *= damping
          flake.x += (wind * (0.5 + flake.depth * 0.4) + Math.sin(flake.phase) * flake.sway + flake.pushX) * dt
          flake.y += (flake.vy + flake.pushY) * dt
          if (flake.y > height + 8) Object.assign(flake, makeFlake(false))
          if (flake.x < -10) flake.x += width + 20
          else if (flake.x > width + 10) flake.x -= width + 20
        }

        ctx.globalAlpha = flake.alpha
        if (sprite) {
          const size = flake.r * 4
          ctx.drawImage(sprite, flake.x - size / 2, flake.y - size / 2, size, size)
        } else {
          ctx.beginPath()
          ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2)
          ctx.fillStyle = '#fff'
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
    },
  }
}
