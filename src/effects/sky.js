import { clamp, rand } from '../lib/random.js'

// Twinkling stars and the occasional shooting star.

const STAR_COLORS = ['255,255,255', '255,240,214', '214,228,255']

export function createSkyScene(ctx, { shootingStars = true } = {}) {
  let stars = []
  let width = 0
  let height = 0
  let shooting = null
  let nextShot = 0

  function scheduleShot(now) {
    nextShot = now + rand(5000, 12000)
  }

  return {
    resize(w, h) {
      width = w
      height = h
      const count = Math.round(clamp((w * h) / 4500, 70, 280))
      stars = Array.from({ length: count }, () => {
        const bright = Math.random() < 0.06
        return {
          x: rand(0, w),
          // Squaring-ish the random value puts more stars high in the sky.
          y: h * 0.68 * Math.random() ** 1.4,
          r: bright ? rand(1.3, 1.9) : rand(0.35, 1.2),
          base: rand(0.35, 0.85),
          amp: rand(0.15, 0.4),
          speed: rand(0.6, 2.2),
          phase: rand(0, Math.PI * 2),
          color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
          bright,
        }
      })
    },

    frame(now) {
      ctx.clearRect(0, 0, width, height)
      const t = now / 1000

      for (const star of stars) {
        const alpha = clamp(star.base + Math.sin(t * star.speed + star.phase) * star.amp, 0.08, 1)
        ctx.fillStyle = `rgba(${star.color},${alpha})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fill()
        if (star.bright) {
          // A soft cross-shaped glint on the brightest stars.
          ctx.strokeStyle = `rgba(${star.color},${alpha * 0.35})`
          ctx.lineWidth = 0.6
          ctx.beginPath()
          ctx.moveTo(star.x - star.r * 4, star.y)
          ctx.lineTo(star.x + star.r * 4, star.y)
          ctx.moveTo(star.x, star.y - star.r * 4)
          ctx.lineTo(star.x, star.y + star.r * 4)
          ctx.stroke()
        }
      }

      if (!shootingStars) return
      if (!nextShot) scheduleShot(now)
      if (!shooting && now >= nextShot) {
        const leftward = Math.random() < 0.5
        const angle = leftward ? rand(Math.PI * 0.8, Math.PI * 0.9) : rand(Math.PI * 0.1, Math.PI * 0.2)
        shooting = {
          x: rand(width * 0.15, width * 0.85),
          y: rand(height * 0.04, height * 0.28),
          vx: Math.cos(angle) * 900,
          vy: Math.sin(angle) * 900,
          born: now,
          life: 900,
        }
      }
      if (shooting) {
        const age = now - shooting.born
        if (age > shooting.life) {
          shooting = null
          scheduleShot(now)
          return
        }
        const progress = age / shooting.life
        const headX = shooting.x + (shooting.vx * age) / 1000
        const headY = shooting.y + (shooting.vy * age) / 1000
        const tailX = headX - shooting.vx * 0.16
        const tailY = headY - shooting.vy * 0.16
        const fade = Math.sin(Math.PI * progress)
        const gradient = ctx.createLinearGradient(headX, headY, tailX, tailY)
        gradient.addColorStop(0, `rgba(255,250,235,${0.95 * fade})`)
        gradient.addColorStop(1, 'rgba(255,250,235,0)')
        ctx.strokeStyle = gradient
        ctx.lineWidth = 1.6
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(headX, headY)
        ctx.lineTo(tailX, tailY)
        ctx.stroke()
      }
    },
  }
}
