import { AnimatePresence, motion } from 'motion/react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { TIMINGS } from '../config.js'
import { COPY, LETTER } from '../content/letter.js'
import { usePhaseClock } from '../hooks/usePhaseClock.js'
import { splitGraphemes, splitWords } from '../lib/graphemes.js'

const SCHEDULE = { unfold: TIMINGS.letter.unfold, write: TIMINGS.letter.write }
const SCHEDULE_REDUCED = { unfold: TIMINGS.letterReduced.unfold, write: TIMINGS.letterReduced.write }

// Every block of the letter in reading order.
export function letterBlocks(letter = LETTER) {
  return [
    { kind: 'greeting', text: letter.greeting },
    ...letter.paragraphs.map((text) => ({ kind: 'paragraph', text })),
    { kind: 'closing', text: letter.closing },
    { kind: 'signature', text: letter.signature },
  ]
}

/** How long the handwriting takes, so the next button appears right as it ends. */
export function writingDuration({ perChar, paragraphPause }, letter = LETTER) {
  if (perChar === 0) return 0
  const blocks = letterBlocks(letter)
  // Count exactly what <Handwriting> animates: the characters of each word.
  const characters = blocks.reduce(
    (sum, block) => sum + splitWords(block.text).reduce((count, word) => count + splitGraphemes(word).length, 0),
    0,
  )
  return (characters - 1) * perChar + (blocks.length - 1) * paragraphPause + 450
}

const BLOCK_CLASS = {
  greeting: 'letter-greeting',
  paragraph: 'letter-p',
  closing: 'letter-closing',
  signature: 'letter-signature',
}

/**
 * The letter text, revealed one character at a time like ink from a pen.
 * When `animate` is false the text is shown as-is (used before writing starts
 * to reserve the letter's size, for reduced motion, and after skipping).
 */
function Handwriting({ animate, perChar, paragraphPause, hidden }) {
  let charIndex = 0
  return (
    <div aria-hidden="true" style={hidden ? { visibility: 'hidden' } : undefined}>
      {letterBlocks().map((block, blockIndex) => (
        <p key={blockIndex} className={BLOCK_CLASS[block.kind]}>
          {splitWords(block.text).map((word, wordIndex, words) => (
            <Fragment key={wordIndex}>
              <span className="hw-word">
                {splitGraphemes(word).map((grapheme, i) => {
                  const delay = charIndex * perChar + blockIndex * paragraphPause
                  charIndex += 1
                  return animate ? (
                    <span key={i} className="hw-char" style={{ animationDelay: `${delay}ms` }}>
                      {grapheme}
                    </span>
                  ) : (
                    <span key={i}>{grapheme}</span>
                  )
                })}
              </span>
              {wordIndex < words.length - 1 ? ' ' : null}
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  )
}

function WaxSeal({ size = 64 }) {
  return (
    <span className="wax-seal" style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" width={size * 0.46} height={size * 0.46} aria-hidden="true" focusable="false">
        <path d="M12 21 C 4 15 1.5 11 3.5 7 C 5.5 3.6 9.6 4 12 7.4 C 14.4 4 18.5 3.6 20.5 7 C 22.5 11 20 15 12 21 Z" fill="#6e0d1c" />
        <path d="M7 7.5 C 8 6.4 9.6 6.6 10.4 7.6" stroke="#ff8fa3" strokeWidth="1" fill="none" opacity="0.7" />
      </svg>
    </span>
  )
}

const FLOATING_HEARTS = Array.from({ length: 10 }, (_, i) => ({
  left: 6 + ((i * 41) % 88),
  size: 14 + ((i * 7) % 16),
  duration: 9 + ((i * 3) % 7),
  delay: (i * 1.3) % 9,
  drift: ((i % 5) - 2) * 18,
}))

const SPARKLES = Array.from({ length: 14 }, (_, i) => ({
  left: 4 + ((i * 29) % 92),
  top: 6 + ((i * 47) % 88),
  delay: (i * 0.53) % 3.2,
}))

function LetterAmbience() {
  return (
    <div className="letter-ambience" aria-hidden="true">
      {FLOATING_HEARTS.map((heart, i) => (
        <span
          key={i}
          className="float-heart"
          style={{
            left: `${heart.left}%`,
            fontSize: `${heart.size}px`,
            animationDuration: `${heart.duration}s`,
            animationDelay: `${heart.delay}s`,
            '--drift': `${heart.drift}px`,
          }}
        >
          ♥
        </span>
      ))}
      {SPARKLES.map((sparkle, i) => (
        <span
          key={i}
          className="letter-sparkle"
          style={{ left: `${sparkle.left}%`, top: `${sparkle.top}%`, animationDelay: `${sparkle.delay}s` }}
        />
      ))}
    </div>
  )
}

const EASE_OUT = [0.2, 0.8, 0.2, 1]

export function LetterScene({ reduced, leaving, done, onDone, onFuture }) {
  const timing = reduced ? TIMINGS.letterReduced : TIMINGS.letter
  const phases = usePhaseClock(reduced ? SCHEDULE_REDUCED : SCHEDULE, true)
  const unfolded = phases.has('unfold') && !leaving
  const writing = phases.has('write')
  const [skipped, setSkipped] = useState(false)
  const instant = reduced || skipped || done
  const regionRef = useRef(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  // Tell the app when the last word has been written.
  useEffect(() => {
    if (!writing || done) return undefined
    if (instant) {
      onDoneRef.current()
      return undefined
    }
    const timer = window.setTimeout(() => onDoneRef.current(), writingDuration(timing))
    return () => window.clearTimeout(timer)
  }, [writing, done, instant, timing])

  // Move keyboard and screen-reader focus to the letter when it arrives.
  useEffect(() => {
    regionRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div className="letter-scene">
      <motion.div
        className="letter-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: leaving ? 0 : 1 }}
        transition={{ duration: leaving ? 1.2 : 1.4 }}
      />
      {!leaving && <LetterAmbience />}
      <div className="letter-column">
        <motion.section
          ref={regionRef}
          tabIndex={-1}
          aria-labelledby="letter-title"
          className="letter-float"
          initial={{ opacity: 0, y: 140, scale: 0.3, rotate: -8 }}
          animate={
            leaving
              ? { opacity: 0, y: -30, scale: 0.12, rotate: 8 }
              : { opacity: 1, y: 0, scale: 1, rotate: 0 }
          }
          transition={leaving ? { duration: 0.8, delay: 0.6, ease: [0.6, 0, 0.8, 0.4] } : { duration: 0.95, ease: EASE_OUT }}
        >
          <div className="sr-only">
            <h2 id="letter-title">{LETTER.greeting}</h2>
            {LETTER.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p>
              {LETTER.closing} {LETTER.signature}
            </p>
          </div>

          <div className="letter">
            <div className="letter-paper" aria-hidden="true">
              <motion.div
                className="paper-shadow"
                initial={{ opacity: 0 }}
                animate={{ opacity: unfolded ? 1 : 0.4 }}
                transition={{ duration: 0.8 }}
              />
              <div className="paper-panel paper-mid" />
              <motion.div
                className="paper-panel paper-top"
                initial={{ rotateX: -176 }}
                animate={{ rotateX: unfolded ? 0 : -176 }}
                transition={{ duration: 0.9, ease: EASE_OUT, delay: leaving ? 0.25 : 0 }}
              >
                <div className="paper-face paper-front" />
                <div className="paper-face paper-back" />
              </motion.div>
              <motion.div
                className="paper-panel paper-bottom"
                initial={{ rotateX: 176 }}
                animate={{ rotateX: unfolded ? 0 : 176 }}
                transition={{ duration: 0.9, ease: EASE_OUT, delay: unfolded ? 0.35 : 0 }}
              >
                <div className="paper-face paper-front" />
                <div className="paper-face paper-back" />
              </motion.div>
              {/* The seal that closes the folded letter. With reduced motion the
                  letter never appears folded, so there is no seal to break. */}
              {!reduced && (
                <motion.div
                  className="seal-on-fold"
                  initial={{ opacity: 1, scale: 1 }}
                  animate={unfolded ? { opacity: 0, scale: 1.6 } : { opacity: 1, scale: 1 }}
                  transition={{ duration: 0.45 }}
                >
                  <WaxSeal size={64} />
                </motion.div>
              )}
            </div>

            <motion.div
              className="letter-body"
              initial={{ opacity: 0 }}
              animate={{ opacity: leaving ? 0 : 1 }}
              transition={{ duration: leaving ? 0.35 : 0.5, delay: leaving ? 0 : unfolded ? 0.6 : 0 }}
            >
              <motion.div
                className="letter-frame"
                initial={{ opacity: 0 }}
                animate={{ opacity: unfolded ? 1 : 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                aria-hidden="true"
              >
                <span className="frame-corner frame-corner-tl" />
                <span className="frame-corner frame-corner-tr" />
                <span className="frame-corner frame-corner-bl" />
                <span className="frame-corner frame-corner-br" />
              </motion.div>
              <Handwriting
                animate={writing && !instant}
                perChar={timing.perChar}
                paragraphPause={timing.paragraphPause}
                hidden={!writing}
              />
              <span className="seal-signature" aria-hidden="true">
                {done && <WaxSeal size={46} />}
              </span>
            </motion.div>
          </div>
        </motion.section>

        <div className="letter-actions">
          <AnimatePresence>
            {done && !leaving ? (
              <motion.button
                key="future"
                ref={(node) => node?.scrollIntoView?.({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' })}
                type="button"
                className="future-button"
                onClick={onFuture}
                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.7, ease: EASE_OUT }}
              >
                {COPY.futureButton}
              </motion.button>
            ) : writing && !done && !leaving ? (
              <motion.button
                key="skip"
                type="button"
                className="skip-writing"
                onClick={() => setSkipped(true)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: 1.5 }}
              >
                {COPY.skipWriting}
              </motion.button>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
