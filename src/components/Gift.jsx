import { motion, useAnimate } from 'motion/react'
import { forwardRef, useEffect, useState } from 'react'
import { COPY } from '../content/letter.js'
import { rand } from '../lib/random.js'

// The giant present. Its look comes entirely from the SVG below; its
// behaviour from `phase`:
//   idle  → floats, jiggles now and then, gets excited on hover
//   shake → shakes dramatically
//   untie → the bow flies off and the ribbon unwraps
//   lid   → the lid lifts and floats away
//   burst / zoom / opened → golden light pours out of the open box

const AFTER_UNTIE = ['untie', 'lid', 'burst', 'zoom', 'opened']
const AFTER_LID = ['lid', 'burst', 'zoom', 'opened']
const GLOWING = ['burst', 'zoom', 'opened']

const SPARKLES = Array.from({ length: 12 }, (_, i) => ({
  left: 30 + ((i * 37) % 40),
  top: 14 + ((i * 23) % 22),
  dx: ((i % 5) - 2) * 14,
  delay: (i * 0.37) % 2.8,
}))

const fillBox = { transformBox: 'fill-box' }

function GiftArt({ untied, lidOff, glowing }) {
  return (
    <svg viewBox="0 0 400 440" className="block h-full w-full overflow-visible" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="g-red" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#c2263c" />
          <stop offset="0.55" stopColor="#a3162b" />
          <stop offset="1" stopColor="#7a0f20" />
        </linearGradient>
        <linearGradient id="g-shade" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.72" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="g-lid-top" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#de4a62" />
          <stop offset="1" stopColor="#b01e35" />
        </linearGradient>
        <linearGradient id="g-lid-front" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#c62c43" />
          <stop offset="1" stopColor="#8d1326" />
        </linearGradient>
        <linearGradient id="g-gold" x1="0" x2="1">
          <stop offset="0" stopColor="#a8791f" />
          <stop offset="0.25" stopColor="#f2cf6a" />
          <stop offset="0.5" stopColor="#c99a35" />
          <stop offset="0.72" stopColor="#f7d978" />
          <stop offset="1" stopColor="#9c6f1b" />
        </linearGradient>
        <linearGradient id="g-gold-v" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#a8791f" />
          <stop offset="0.3" stopColor="#f7d978" />
          <stop offset="0.6" stopColor="#c99a35" />
          <stop offset="1" stopColor="#9c6f1b" />
        </linearGradient>
        <radialGradient id="g-bow" cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#fff1b8" />
          <stop offset="0.45" stopColor="#e2b648" />
          <stop offset="1" stopColor="#8d6215" />
        </radialGradient>
        <radialGradient id="g-inside" cx="0.5" cy="0.6" r="0.6">
          <stop offset="0" stopColor="#fffbe6" />
          <stop offset="0.45" stopColor="#ffd77a" />
          <stop offset="1" stopColor="#ff9f43" />
        </radialGradient>
        <pattern id="g-stars" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M14 10 L15 13 L18 14 L15 15 L14 18 L13 15 L10 14 L13 13 Z" fill="#f7d978" opacity="0.28" />
        </pattern>
      </defs>

      {/* Box body */}
      <g>
        <polygon points="74,178 326,178 342,194 58,194" fill="#3a0812" />
        <motion.polygon
          points="74,178 326,178 342,194 58,194"
          fill="url(#g-inside)"
          initial={false}
          animate={{ opacity: glowing ? 1 : 0 }}
          transition={{ duration: 0.6 }}
        />
        <rect x="58" y="192" width="284" height="228" rx="6" fill="url(#g-red)" />
        <rect x="58" y="192" width="284" height="228" rx="6" fill="url(#g-stars)" />
        <rect x="58" y="192" width="284" height="228" rx="6" fill="url(#g-shade)" />
        <motion.rect
          x="183" y="192" width="34" height="228" fill="url(#g-gold)"
          style={{ ...fillBox, transformOrigin: '50% 0%' }}
          initial={false}
          animate={untied ? { scaleY: 0, opacity: 0 } : { scaleY: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: untied ? 0.25 : 0, ease: 'easeIn' }}
        />
        <motion.rect
          x="58" y="290" width="284" height="32" fill="url(#g-gold-v)"
          style={{ ...fillBox, transformOrigin: '0% 50%' }}
          initial={false}
          animate={untied ? { scaleX: 0, opacity: 0 } : { scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: untied ? 0.35 : 0, ease: 'easeIn' }}
        />
      </g>

      {/* Lid */}
      <motion.g
        style={{ ...fillBox, transformOrigin: '50% 100%' }}
        initial={false}
        animate={
          lidOff
            ? { y: [0, -70, -320], x: [0, -12, -46], rotate: [0, -6, -20], opacity: [1, 1, 0] }
            : { y: 0, x: 0, rotate: 0, opacity: 1 }
        }
        transition={{ duration: lidOff ? 1.4 : 0, times: [0, 0.35, 1], ease: 'easeOut' }}
      >
        <rect x="58" y="202" width="284" height="9" fill="#28000a" opacity="0.35" />
        <polygon points="80,118 320,118 352,152 48,152" fill="url(#g-lid-top)" />
        <rect x="46" y="150" width="308" height="52" rx="6" fill="url(#g-lid-front)" />
        <rect x="46" y="150" width="308" height="4" rx="2" fill="#fff" opacity="0.16" />
        <motion.g initial={false} animate={{ opacity: untied ? 0 : 1 }} transition={{ duration: 0.5, delay: untied ? 0.1 : 0 }}>
          <polygon points="188,118 212,118 220,152 180,152" fill="url(#g-gold)" />
          <polygon points="68,131 332,131 340,139 60,139" fill="url(#g-gold-v)" />
          <rect x="181" y="150" width="38" height="52" fill="url(#g-gold)" />
        </motion.g>
      </motion.g>

      {/* Bow */}
      <motion.g
        style={{ ...fillBox, transformOrigin: '50% 70%' }}
        initial={false}
        animate={
          untied
            ? { scale: [1, 1.3, 0], rotate: [0, -12, 28], y: [0, -16, -80], opacity: [1, 1, 0] }
            : { scale: 1, rotate: 0, y: 0, opacity: 1 }
        }
        transition={{ duration: untied ? 0.85 : 0, ease: 'easeInOut' }}
      >
        <path d="M 194 128 C 182 152 170 172 154 196 L 170 200 C 181 180 192 158 204 132 Z" fill="url(#g-gold)" />
        <path d="M 206 128 C 218 152 230 172 246 196 L 230 200 C 219 180 208 158 196 132 Z" fill="url(#g-gold)" />
        <path d="M 200 124 C 150 58 92 70 106 114 C 116 144 170 134 200 124 Z" fill="url(#g-bow)" />
        <path d="M 196 122 C 160 86 124 88 128 110 C 134 128 168 128 196 122 Z" fill="#78500a" opacity="0.35" />
        <path d="M 200 124 C 250 58 308 70 294 114 C 284 144 230 134 200 124 Z" fill="url(#g-bow)" />
        <path d="M 204 122 C 240 86 276 88 272 110 C 266 128 232 128 204 122 Z" fill="#78500a" opacity="0.35" />
        <ellipse cx="200" cy="124" rx="19" ry="15" fill="url(#g-bow)" />
        <ellipse cx="194" cy="118" rx="7" ry="4" fill="#fff6d0" opacity="0.6" />
      </motion.g>
    </svg>
  )
}

export const Gift = forwardRef(function Gift({ phase, reduced, interactive, onOpen, onHover }, buttonRef) {
  const [scope, animate] = useAnimate()
  const [excited, setExcited] = useState(false)
  const untied = AFTER_UNTIE.includes(phase)
  const lidOff = AFTER_LID.includes(phase)
  const glowing = GLOWING.includes(phase)
  const idle = phase === 'idle'

  // Every few seconds, a little jiggle — something magical is inside.
  useEffect(() => {
    if (!idle || reduced || excited) return undefined
    let timer = 0
    const queue = () => {
      timer = window.setTimeout(() => {
        if (scope.current) {
          animate(
            scope.current,
            { rotate: [0, -4, 4, -3, 3, -1.5, 0], x: [0, -3, 3, -2, 2, 0, 0], y: [0, -8, 0, -4, 0, 0, 0] },
            { duration: 0.8, ease: 'easeInOut' },
          )
        }
        queue()
      }, rand(2600, 6000))
    }
    queue()
    return () => window.clearTimeout(timer)
  }, [idle, reduced, excited, animate, scope])

  // Excited wiggle while hovered.
  useEffect(() => {
    if (!idle || reduced || !excited || !scope.current) return undefined
    const element = scope.current
    const wiggle = animate(element, { rotate: [0, -3, 3, -3, 3, 0] }, { duration: 0.6, repeat: Infinity })
    return () => {
      wiggle.stop()
      animate(element, { rotate: 0, x: 0, y: 0 }, { duration: 0.2 })
    }
  }, [idle, reduced, excited, animate, scope])

  // The big dramatic shake right before it opens.
  useEffect(() => {
    if (phase !== 'shake' || reduced || !scope.current) return undefined
    const shake = animate(
      scope.current,
      {
        rotate: [0, -9, 9, -10, 10, -8, 8, -5, 5, 0],
        x: [0, -8, 8, -10, 10, -6, 6, -3, 3, 0],
        scale: [1, 1.04, 1.06, 1.08, 1.08, 1.06, 1.05, 1.03, 1.02, 1],
      },
      { duration: 0.9, ease: 'easeInOut' },
    )
    return () => shake.stop()
  }, [phase, reduced, animate, scope])

  const startExcitement = () => {
    if (!interactive) return
    setExcited(true)
    onHover?.()
  }

  return (
    <motion.div
      className={`gift ${excited && idle ? 'is-excited' : ''}`}
      animate={idle && !reduced ? { y: [0, -10, 0] } : { y: 0 }}
      transition={idle && !reduced ? { duration: 3.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
    >
      <div className="gift-halo" aria-hidden="true" />
      <div className="gift-shadow" aria-hidden="true" />
      {idle &&
        SPARKLES.map((sparkle, i) => (
          <span
            key={i}
            className="gift-sparkle"
            aria-hidden="true"
            style={{ left: `${sparkle.left}%`, top: `${sparkle.top}%`, '--dx': `${sparkle.dx}px`, animationDelay: `${sparkle.delay}s` }}
          />
        ))}
      <div ref={scope} className="gift-body">
        <button
          ref={buttonRef}
          type="button"
          className="gift-button"
          onClick={interactive ? onOpen : undefined}
          onPointerEnter={startExcitement}
          onPointerLeave={() => setExcited(false)}
          onFocus={() => interactive && setExcited(true)}
          onBlur={() => setExcited(false)}
          disabled={!interactive}
          aria-label="Open your present"
        >
          <GiftArt untied={untied} lidOff={lidOff} glowing={glowing} />
        </button>
        {glowing && (
          <div className="gift-light" aria-hidden="true">
            <motion.div
              className="gift-glow"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
            />
            <motion.div
              className="gift-rays"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            >
              <div className="gift-rays-spin" />
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  )
})

export function GiftStage({ phase, reduced, interactive, finePointer, onOpen, onHover, buttonRef }) {
  const idle = phase === 'idle'
  return (
    <div className="gift-stage">
      <motion.h1
        className="gift-message"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: idle ? 1 : 0, y: 0 }}
        transition={{ duration: idle ? 1.2 : 0.4, delay: idle ? 0.4 : 0 }}
      >
        {COPY.giftMessage}
      </motion.h1>
      <Gift ref={buttonRef} phase={phase} reduced={reduced} interactive={interactive} onOpen={onOpen} onHover={onHover} />
      <motion.p
        className="gift-caption"
        initial={{ opacity: 0 }}
        animate={{ opacity: idle ? 1 : 0 }}
        transition={{ duration: 0.6, delay: idle ? 1.2 : 0 }}
        aria-hidden={!idle}
      >
        {finePointer ? COPY.giftCaptionPointer : COPY.giftCaptionTouch}
      </motion.p>
    </div>
  )
}
