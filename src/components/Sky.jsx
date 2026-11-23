import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { COPY } from '../content/letter.js'
import { SkyCanvas } from './EffectCanvases.jsx'
import { SantaSleigh } from './SantaSleigh.jsx'

export function Moon() {
  return (
    <div className="moon" aria-hidden="true">
      <span className="moon-crater moon-crater-a" />
      <span className="moon-crater moon-crater-b" />
      <span className="moon-crater moon-crater-c" />
    </div>
  )
}

/** The hidden Easter egg: one star that twinkles a little brighter. */
export function SecretStar({ onFound, interactive }) {
  const [shown, setShown] = useState(false)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const reveal = () => {
    onFound()
    setShown(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setShown(false), 4500)
  }

  return (
    <div className="secret-star-wrap">
      <button
        type="button"
        className="secret-star"
        onClick={reveal}
        disabled={!interactive}
        aria-label="A star twinkling a little brighter than the rest"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
          <path d="M12 0 L14.2 9.8 L24 12 L14.2 14.2 L12 24 L9.8 14.2 L0 12 L9.8 9.8 Z" fill="#fff8e1" />
        </svg>
      </button>
      <div role="status" className="secret-star-status">
        <AnimatePresence>
          {shown && (
            <motion.p
              className="secret-star-bubble"
              initial={{ opacity: 0, y: 6, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.45 }}
            >
              {COPY.easterEgg}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export function Sky({ reduced, interactive, onSecretStar, onSanta }) {
  return (
    <div className="absolute inset-0">
      <div className="sky-gradient" aria-hidden="true" />
      <SkyCanvas reduced={reduced} />
      <Moon />
      <SantaSleigh active={interactive} reduced={reduced} onPass={onSanta} />
      <SecretStar onFound={onSecretStar} interactive={interactive} />
    </div>
  )
}
