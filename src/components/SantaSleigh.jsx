import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { TIMINGS } from '../config.js'
import { rand } from '../lib/random.js'

const FLIGHT_SECONDS = 16

function Reindeer({ x, y, delay }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="reindeer-bob" style={{ animationDelay: `${delay}s` }}>
        <ellipse cx="0" cy="0" rx="14" ry="6" />
        <path d="M 9 -3 L 17 -12 L 22 -12 L 24.5 -9.5 L 19 -8 L 13 1 Z" />
        <path d="M 18 -12 L 15 -20 M 16 -17 L 12 -19 M 20.5 -12 L 21.5 -20 M 21 -17 L 25 -19" fill="none" strokeWidth="1.3" />
        <path d="M 9 4 L 16 10 M 6 4 L 12 11 M -9 3 L -18 7 M -12 3 L -20 4" fill="none" strokeWidth="2" />
        <path d="M -14 -2 L -18 -5" fill="none" strokeWidth="2" />
      </g>
    </g>
  )
}

function SantaShape() {
  return (
    <svg viewBox="-6 -28 300 70" className="h-auto w-full" aria-hidden="true" focusable="false">
      <g fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* Sleigh, Santa, and his sack */}
        <circle cx="10" cy="0" r="9" />
        <circle cx="26" cy="-2" r="8.5" />
        <circle cx="33" cy="-14" r="5" />
        <path d="M 29 -17 L 38 -17 L 45 -25 Z" />
        <circle cx="46" cy="-25" r="2" />
        <path d="M 0 6 L 52 6 Q 58 6 58 12 L 58 18 L 6 18 Q 0 18 0 12 Z" />
        <path d="M -2 26 L 56 26 Q 66 26 66 18" fill="none" strokeWidth="2" />
        <path d="M 10 18 L 8 26 M 46 18 L 44 26" fill="none" strokeWidth="1.6" />
        {/* Reins */}
        <path d="M 40 -4 Q 120 -14 236 -6" fill="none" strokeWidth="0.8" opacity="0.8" />
        <Reindeer x={110} y={0} delay={0} />
        <Reindeer x={150} y={-4} delay={0.15} />
        <Reindeer x={190} y={-1} delay={0.3} />
        <Reindeer x={230} y={-5} delay={0.45} />
      </g>
    </svg>
  )
}

/** Santa and his reindeer glide across the sky every half minute or so. */
export function SantaSleigh({ active, reduced, onPass }) {
  const [flight, setFlight] = useState(0)
  const onPassRef = useRef(onPass)
  onPassRef.current = onPass

  useEffect(() => {
    if (!active || reduced) return undefined
    let timer = 0
    const schedule = (delay) => {
      timer = window.setTimeout(() => {
        setFlight((count) => count + 1)
        onPassRef.current?.(FLIGHT_SECONDS)
        schedule(rand(...TIMINGS.santaGap))
      }, delay)
    }
    schedule(TIMINGS.santaFirstPass)
    return () => window.clearTimeout(timer)
  }, [active, reduced])

  if (reduced || flight === 0) return null

  return (
    <motion.div
      key={flight}
      className="santa"
      initial={{ x: '-30vw', y: '20vh' }}
      animate={{ x: '125vw', y: ['20vh', '7vh', '13vh'] }}
      transition={{
        x: { duration: FLIGHT_SECONDS, ease: 'linear' },
        y: { duration: FLIGHT_SECONDS, ease: 'easeInOut', times: [0, 0.55, 1] },
      }}
      aria-hidden="true"
    >
      <SantaShape />
      <span className="santa-trail" />
    </motion.div>
  )
}
