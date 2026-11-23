import { motion } from 'motion/react'
import { Fragment, useEffect, useRef } from 'react'
import { COPY } from '../content/letter.js'
import { splitGraphemes, splitWords } from '../lib/graphemes.js'
import { PortalCanvas } from './EffectCanvases.jsx'

// Scene 5: a portal opens, the warm Christmas glow gives way to neon blue and
// purple, "I BELIEVE IN YOU, HUNNY ❤️" lights up, and Nate is taken to his
// portfolio. The link stays on screen in case the automatic redirect is
// blocked or he wants to go right away.

function BelieveMessage() {
  // "I BELIEVE IN YOU," on the first line and "HUNNY ❤️" on the second.
  const lines = COPY.believe.split(/(?<=,)\s+/)
  let index = 0
  return (
    <h2 className="believe" aria-label={COPY.believe}>
      {lines.map((line, lineIndex) => {
        const words = splitWords(line)
        return (
          <span key={lineIndex} className="believe-line" aria-hidden="true">
            {words.map((word, wordIndex) => (
              <Fragment key={wordIndex}>
                <span className="believe-word">
                  {splitGraphemes(word).map((char, i) => {
                    const delay = index * 0.055
                    index += 1
                    return (
                      <motion.span
                        key={i}
                        className={char.startsWith('❤') ? 'believe-char believe-heart' : 'believe-char'}
                        initial={{ opacity: 0, y: 24, scale: 0.6, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] }}
                      >
                        {char}
                      </motion.span>
                    )
                  })}
                </span>
                {wordIndex < words.length - 1 ? ' ' : null}
              </Fragment>
            ))}
          </span>
        )
      })}
    </h2>
  )
}

export function Portal({ phases, reduced, portfolioUrl, redirectInMs }) {
  const opened = phases.has('portal')
  const neon = phases.has('neon')
  const showMessage = phases.has('message')
  const showFallback = phases.has('fallback')
  const linkRef = useRef(null)

  useEffect(() => {
    if (showFallback) linkRef.current?.focus({ preventScroll: true })
  }, [showFallback])

  return (
    <div className="portal" data-neon={neon}>
      <motion.div
        className="portal-warm"
        initial={{ opacity: 0 }}
        animate={{ opacity: neon ? 0 : 1 }}
        transition={{ duration: neon ? 1.8 : 0.9 }}
      />
      <motion.div
        className="portal-neon"
        initial={{ opacity: 0 }}
        animate={{ opacity: neon ? 1 : 0 }}
        transition={{ duration: 1.8 }}
      >
        <div className="portal-grid" />
      </motion.div>

      <PortalCanvas neon={neon} reduced={reduced} />

      <div className="portal-ring-wrap" aria-hidden="true">
        <motion.div
          className="portal-ring portal-ring-warm"
          initial={{ scale: 0, opacity: 0 }}
          animate={opened ? { scale: 1, opacity: neon ? 0 : 1 } : { scale: 0, opacity: 0 }}
          transition={{ scale: { duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }, opacity: { duration: 1.2 } }}
        />
        <motion.div
          className="portal-ring portal-ring-neon"
          initial={{ scale: 0, opacity: 0 }}
          animate={opened ? { scale: neon ? 1.08 : 1, opacity: neon ? 1 : 0 } : { scale: 0, opacity: 0 }}
          transition={{ scale: { duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }, opacity: { duration: 1.6 } }}
        />
      </div>

      <div className="portal-content">
        {showMessage && <BelieveMessage />}
        <div className="portal-next" aria-live="polite">
          {showFallback && (
            <motion.div
              className="portal-next-inner"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="portal-status">{COPY.redirecting}</p>
              <div className="portal-progress" aria-hidden="true">
                <motion.div
                  className="portal-progress-fill"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: redirectInMs / 1000, ease: 'linear' }}
                />
              </div>
              <a ref={linkRef} className="neon-link" href={portfolioUrl}>
                {COPY.fallbackLink}
              </a>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
