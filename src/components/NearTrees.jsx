import { memo, useState } from 'react'
import { PineTree } from './PineTree.jsx'

// Two big lit pines framing the scene. The left one carries the clickable
// ornament that plays a jingle.

const TreeFrame = memo(function TreeFrame({ side }) {
  const mirrored = side === 'right'
  return (
    <svg viewBox="0 0 500 900" className="h-full w-full" aria-hidden="true" focusable="false">
      <g transform={mirrored ? 'translate(500 0) scale(-1 1)' : undefined}>
        <PineTree cx={410} base={905} height={540} width={300} tiers={5} seed={mirrored ? 11 : 3} lights />
        <PineTree cx={200} base={910} height={830} width={430} tiers={6} seed={mirrored ? 29 : 17} lights />
      </g>
    </svg>
  )
})

export function NearTrees({ onOrnament, interactive }) {
  const [swingKey, setSwingKey] = useState(0)

  const ring = () => {
    setSwingKey((key) => key + 1)
    onOrnament()
  }

  return (
    <>
      <div className="near-tree near-tree-left">
        <TreeFrame side="left" />
        <button
          type="button"
          className="ornament"
          onClick={ring}
          disabled={!interactive}
          aria-label="Ring the ornament"
        >
          <span key={swingKey} className={`ornament-swing ${swingKey ? 'is-ringing' : ''}`}>
            <svg viewBox="0 0 40 64" width="34" height="54" aria-hidden="true" focusable="false">
              <defs>
                <radialGradient id="bauble" cx="0.35" cy="0.35" r="0.75">
                  <stop offset="0" stopColor="#ffb3be" />
                  <stop offset="0.35" stopColor="#d7263d" />
                  <stop offset="1" stopColor="#5e0a17" />
                </radialGradient>
              </defs>
              <line x1="20" y1="0" x2="20" y2="20" stroke="#e2b648" strokeWidth="1.4" />
              <rect x="15" y="18" width="10" height="7" rx="1.5" fill="#e2b648" />
              <circle cx="20" cy="42" r="17" fill="url(#bauble)" />
              <path d="M 6 38 Q 20 46 34 38" stroke="#f7d978" strokeWidth="1.6" fill="none" opacity="0.85" />
              <ellipse cx="13" cy="34" rx="4" ry="6" fill="#fff" opacity="0.35" transform="rotate(25 13 34)" />
            </svg>
          </span>
        </button>
      </div>
      <div className="near-tree near-tree-right">
        <TreeFrame side="right" />
      </div>
    </>
  )
}
