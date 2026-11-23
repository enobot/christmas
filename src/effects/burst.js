import { rand } from '../lib/random.js'

// The burst of magic when the present opens: golden stars, hearts, and
// snowflakes fly out of the box, drift, and fade. The loop stops by itself
// once every particle is gone.

const KINDS = [
  { kind: 'star', weight: 0.38, colors: ['#f7d978', '#ffe9a8', '#fff6d8'] },
  { kind: 'heart', weight: 0.22, colors: ['#ff5a7a', '#ff8fa8', '#e8344f'] },
  { kind: 'flake', weight: 0.2, colors: ['#ffffff', '#e4efff'] },
  { kind: 'dot', weight: 0.2, colors: ['#ffd76b', '#fff1c2'] },
]

function pickKind() {
  let roll = Math.random()
  for (const entry of KINDS) {
    if (roll < entry.weight) return entry
    roll -= entry.weight
  }
  return KINDS[0]
}

function drawStar(ctx, size) {
  ctx.beginPath()
  for (let i = 0; i < 8; i += 1) {
    const radius = i % 2 === 0 ? size : size * 0.38
    const angle = (Math.PI / 4) * i - Math.PI / 2
    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
  }
  ctx.closePath()
  ctx.fill()
}

function drawHeart(ctx, size) {
  const s = size / 1.1
  ctx.beginPath()
  ctx.moveTo(0, s * 0.35)
  ctx.bezierCurveTo(-s * 1.1, -s * 0.35, -s * 0.55, -s * 1.1, 0, -s * 0.45)
  ctx.bezierCurveTo(s * 0.55, -s * 1.1, s * 1.1, -s * 0.35, 0, s * 0.35)
  ctx.fill()
}

function drawFlake(ctx, size) {
  ctx.lineWidth = Math.max(1, size * 0.16)
  ctx.lineCap = 'round'
  ctx.beginPath()
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 3) * i
    ctx.moveTo(0, 0)
    ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size)
  }
  ctx.stroke()
}

export function createBurstScene(ctx, { origin, small }) {
  const particles = []
  const total = small ? 90 : 160
  const trickleFor = 1600
  let started = 0
  let emitted = 0
  let width = 0
  let height = 0

  function emit(count, now) {
    for (let i = 0; i < count; i += 1) {
      const type = pickKind()
      // Mostly upward and outward, like light pouring out of the box.
      const angle = -Math.PI / 2 + rand(-1.25, 1.25)
      const speed = rand(220, 720)
      particles.push({
        kind: type.kind,
        color: type.colors[Math.floor(Math.random() * type.colors.length)],
        x: origin.x + rand(-30, 30),
        y: origin.y + rand(-8, 8),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: type.kind === 'dot' ? rand(1.2, 2.6) : rand(4, type.kind === 'heart' ? 11 : 9),
        rotation: rand(0, Math.PI * 2),
        spin: rand(-2.4, 2.4),
        born: now,
        life: rand(2200, 4200),
      })
      emitted += 1
    }
  }

  return {
    resize(w, h) {
      width = w
      height = h
    },

    frame(now, dt) {
      if (!started) {
        started = now
        emit(Math.round(total * 0.7), now)
      }
      if (now - started < trickleFor && emitted < total) emit(Math.min(3, total - emitted), now)

      ctx.clearRect(0, 0, width, height)
      const drag = Math.exp(-1.6 * dt)

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i]
        const age = now - p.born
        if (age > p.life) {
          particles.splice(i, 1)
          continue
        }
        p.vx *= drag
        p.vy = p.vy * drag + (p.kind === 'heart' ? -10 : 24) * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.rotation += p.spin * dt

        const progress = age / p.life
        ctx.globalAlpha = progress < 0.6 ? 1 : 1 - (progress - 0.6) / 0.4
        ctx.globalCompositeOperation = p.kind === 'flake' ? 'source-over' : 'lighter'
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.kind === 'heart' ? Math.sin(p.rotation) * 0.3 : p.rotation)
        ctx.fillStyle = p.color
        ctx.strokeStyle = p.color
        if (p.kind === 'star') drawStar(ctx, p.size)
        else if (p.kind === 'heart') drawHeart(ctx, p.size)
        else if (p.kind === 'flake') drawFlake(ctx, p.size)
        else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'

      // Keep running until everything has been emitted and has faded away.
      return particles.length > 0 || emitted < total
    },
  }
}
