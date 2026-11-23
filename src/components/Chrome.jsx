import { motion } from 'motion/react'
import { Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { COPY } from '../content/letter.js'
import { pointer } from '../lib/pointer.js'
import { useCanvasScene } from '../hooks/useCanvasScene.js'

/** The loading screen, which becomes the "step inside" button when ready. */
export function Loader({ ready, onEnter }) {
  const buttonRef = useRef(null)

  useEffect(() => {
    if (ready) buttonRef.current?.focus({ preventScroll: true })
  }, [ready])

  return (
    <motion.div className="loader" exit={{ opacity: 0 }} transition={{ duration: 0.9 }}>
      <div className="loader-gift" aria-hidden="true">
        <span className="loader-box" />
        <span className="loader-lid" />
      </div>
      {ready ? (
        <motion.div
          className="loader-ready"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button ref={buttonRef} type="button" className="btn-warm" onClick={onEnter}>
            {COPY.enter}
          </button>
          <p className="loader-hint">🔊 {COPY.soundHint}</p>
        </motion.div>
      ) : (
        <p className="loader-text" role="status">
          {COPY.loading}
        </p>
      )}
    </motion.div>
  )
}

/** Sound, motion, and replay buttons in the top corner. */
export function Controls({ muted, onToggleMuted, reduced, onToggleMotion, canReplay, onReplay }) {
  return (
    <div className="controls">
      {canReplay && (
        <button type="button" className="control" onClick={onReplay} aria-label={COPY.replay}>
          <RotateCcw size={18} aria-hidden="true" />
          <span className="control-label">Replay</span>
        </button>
      )}
      <button
        type="button"
        className="control"
        onClick={onToggleMotion}
        aria-label={reduced ? 'Turn animations back on' : 'Reduce animations'}
        title={reduced ? 'Turn animations back on' : 'Reduce animations'}
      >
        {reduced ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
      </button>
      <button
        type="button"
        className="control"
        onClick={onToggleMuted}
        aria-label={muted ? 'Turn music on' : 'Turn music off'}
        title={muted ? 'Turn music on' : 'Turn music off'}
      >
        {muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
      </button>
    </div>
  )
}

/** Snow slowly piling up along the bottom of the screen. */
export function SnowDrift({ reduced }) {
  const [growing, setGrowing] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setGrowing(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <svg
      className={`snow-drift ${growing && !reduced ? 'is-growing' : ''} ${reduced ? 'is-still' : ''}`}
      viewBox="0 0 1600 120"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="drift" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f6f9ff" />
          <stop offset="1" stopColor="#d3dff5" />
        </linearGradient>
      </defs>
      <path
        d="M0 70 C 120 40, 260 60, 380 52 S 640 30, 780 48 S 1060 64, 1200 44 S 1460 36, 1600 56 L1600 120 L0 120 Z"
        fill="url(#drift)"
      />
    </svg>
  )
}

function createTrail(ctx, starRef, neonRef) {
  const sparks = []
  let width = 0
  let height = 0
  let lastX = null
  let lastY = null

  return {
    resize(w, h) {
      width = w
      height = h
    },
    frame(now, dt) {
      const star = starRef.current
      if (star) {
        star.style.transform = `translate(${pointer.x}px, ${pointer.y}px)`
        star.style.opacity = pointer.active ? '1' : '0'
      }
      if (pointer.active && lastX !== null) {
        const moved = Math.hypot(pointer.x - lastX, pointer.y - lastY)
        const count = Math.min(4, Math.floor(moved / 7))
        for (let i = 0; i < count; i += 1) {
          sparks.push({
            x: pointer.x + (Math.random() - 0.5) * 8,
            y: pointer.y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 30,
            vy: Math.random() * 30 + 10,
            born: now,
            life: 450 + Math.random() * 350,
            size: 0.8 + Math.random() * 1.8,
          })
        }
      }
      lastX = pointer.x
      lastY = pointer.y

      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'lighter'
      const colors = neonRef.current ? ['34,211,238', '168,85,247'] : ['255,225,150', '255,245,210']
      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const spark = sparks[i]
        const age = now - spark.born
        if (age > spark.life) {
          sparks.splice(i, 1)
          continue
        }
        spark.x += spark.vx * dt
        spark.y += spark.vy * dt
        const alpha = 1 - age / spark.life
        ctx.fillStyle = `rgba(${colors[i % 2]},${alpha})`
        ctx.beginPath()
        ctx.arc(spark.x, spark.y, spark.size * alpha + 0.3, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
    },
  }
}

/** A glowing star in place of the mouse cursor, trailing sparkles. */
export function StarCursor({ neon }) {
  const starRef = useRef(null)
  const canvasRef = useRef(null)
  const neonRef = useRef(neon)
  const [create] = useState(() => (ctx) => createTrail(ctx, starRef, neonRef))

  useEffect(() => {
    neonRef.current = neon
  }, [neon])

  useEffect(() => {
    document.documentElement.classList.add('has-star-cursor')
    return () => document.documentElement.classList.remove('has-star-cursor')
  }, [])

  useCanvasScene(canvasRef, create)

  return (
    <>
      <canvas ref={canvasRef} className="cursor-trail" aria-hidden="true" />
      <div ref={starRef} className={`star-cursor ${neon ? 'is-neon' : ''}`} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" focusable="false">
          <path d="M12 0 L14.6 9.4 L24 12 L14.6 14.6 L12 24 L9.4 14.6 L0 12 L9.4 9.4 Z" fill="currentColor" />
        </svg>
      </div>
    </>
  )
}
