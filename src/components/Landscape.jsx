import { memo } from 'react'
import { seededRandom } from '../lib/random.js'
import { PineDefs, PineTree } from './PineTree.jsx'

// The far distance: rolling snowy hills, a row of small pines, and a little
// cabin with warm windows. Drawn once in a 1600×900 box that scales to cover
// the screen while keeping the bottom edge anchored.

const farHill = (x) => 612 + 18 * Math.sin(x / 260) + 10 * Math.sin(x / 97 + 1.3)
const midHill = (x) => 708 + 22 * Math.sin(x / 330 + 2.1) + 9 * Math.sin(x / 120)

function hillPath(fn) {
  let d = `M 0 ${fn(0).toFixed(1)}`
  for (let x = 20; x <= 1600; x += 20) d += ` L ${x} ${fn(x).toFixed(1)}`
  return `${d} L 1600 900 L 0 900 Z`
}

const FAR_TREES = (() => {
  const random = seededRandom(7)
  const trees = []
  for (let x = 10; x < 1600; x += 26 + random() * 30) {
    const height = 38 + random() * 58
    trees.push({ x, base: farHill(x) + 8, height, width: height * 0.62 })
  }
  return trees
})()

const MID_TREES = [
  { x: 250, h: 130 },
  { x: 520, h: 96 },
  { x: 1120, h: 118 },
  { x: 1340, h: 150 },
]

/** Gradients shared by every SVG on the page (referenced by id). */
export function SharedDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <PineDefs />
        <linearGradient id="hill-far" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#2c4378" />
          <stop offset="1" stopColor="#16244b" />
        </linearGradient>
        <linearGradient id="hill-mid" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7186bd" />
          <stop offset="1" stopColor="#34497d" />
        </linearGradient>
        <linearGradient id="ground" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#b9c8e8" />
          <stop offset="1" stopColor="#e6eefc" />
        </linearGradient>
        <radialGradient id="window-glow">
          <stop offset="0" stopColor="#ffcf7a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ff9f43" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  )
}

function Cabin({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="0" cy="-26" r="70" fill="url(#window-glow)" opacity="0.55" />
      <rect x="-46" y="-48" width="92" height="50" fill="#2a1f2e" />
      <rect x="22" y="-88" width="12" height="28" fill="#2a1f2e" />
      <path d="M -58 -44 L 0 -86 L 58 -44 Z" fill="#3a2b38" />
      <path d="M -60 -44 L 0 -90 L 60 -44 L 52 -40 L 0 -78 L -52 -40 Z" fill="#e8f0ff" />
      <rect x="-32" y="-34" width="16" height="16" fill="#ffc764" />
      <rect x="14" y="-34" width="16" height="16" fill="#ffc764" />
      <rect x="-8" y="-28" width="16" height="30" fill="#4a3226" />
    </g>
  )
}

export const Landscape = memo(function Landscape() {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      <path d={hillPath(farHill)} fill="url(#hill-far)" />
      {FAR_TREES.map((tree, i) => (
        <PineTree key={i} cx={tree.x} base={tree.base} height={tree.height} width={tree.width} tiers={3} tone="far" />
      ))}
      <path d={hillPath(midHill)} fill="url(#hill-mid)" />
      <Cabin x={420} y={midHill(420) + 6} />
      {MID_TREES.map((tree, i) => (
        <PineTree key={i} cx={tree.x} base={midHill(tree.x) + 10} height={tree.h} width={tree.h * 0.6} tiers={4} tone="far" />
      ))}
      <path d="M 0 800 C 400 768, 1200 776, 1600 790 L 1600 900 L 0 900 Z" fill="url(#ground)" />
    </svg>
  )
})
