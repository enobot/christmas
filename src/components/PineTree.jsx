import { seededRandom } from '../lib/random.js'

const LIGHT_COLORS = ['#ffd36b', '#ff6b7f', '#8cc8ff', '#9dffbf', '#fff1c9']

/**
 * Geometry for a snowy pine tree, drawn as stacked tiers.
 * All numbers are in the parent SVG's coordinate units.
 */
export function pineGeometry({ cx, base, height, width, tiers = 5 }) {
  const trunkHeight = height * 0.07
  const tierHeight = (height - trunkHeight) / (tiers * 0.62 + 0.38)
  return {
    trunk: { x: cx - width * 0.05, y: base - trunkHeight - 4, w: width * 0.1, h: trunkHeight + 4 },
    tiers: Array.from({ length: tiers }, (_, i) => ({
      bottom: base - trunkHeight - i * tierHeight * 0.62,
      height: tierHeight,
      half: (width / 2) * (1 - i / (tiers + 0.6)),
    })),
  }
}

function tierPath(cx, { bottom: yb, height: th, half: hw }) {
  return [
    `M ${cx - hw} ${yb}`,
    `Q ${cx - hw * 0.45} ${yb - th * 0.42} ${cx} ${yb - th}`,
    `Q ${cx + hw * 0.45} ${yb - th * 0.42} ${cx + hw} ${yb}`,
    `Q ${cx + hw * 0.5} ${yb - th * 0.1} ${cx} ${yb + th * 0.05}`,
    `Q ${cx - hw * 0.5} ${yb - th * 0.1} ${cx - hw} ${yb} Z`,
  ].join(' ')
}

function snowCapPath(cx, { bottom: yb, height: th, half: hw }) {
  return [
    `M ${cx} ${yb - th}`,
    `Q ${cx + hw * 0.17} ${yb - th * 0.78} ${cx + hw * 0.38} ${yb - th * 0.6}`,
    `Q ${cx + hw * 0.25} ${yb - th * 0.5} ${cx + hw * 0.12} ${yb - th * 0.58}`,
    `Q ${cx} ${yb - th * 0.47} ${cx - hw * 0.12} ${yb - th * 0.58}`,
    `Q ${cx - hw * 0.25} ${yb - th * 0.5} ${cx - hw * 0.38} ${yb - th * 0.6}`,
    `Q ${cx - hw * 0.17} ${yb - th * 0.78} ${cx} ${yb - th} Z`,
  ].join(' ')
}

/** Positions of the string lights draped across each tier. */
export function lightPositions({ cx, tiers, seed }) {
  const random = seededRandom(seed)
  const lights = []
  tiers.forEach((tier, tierIndex) => {
    const count = Math.max(2, Math.round(tier.half / 30))
    for (let i = 0; i < count; i += 1) {
      const t = (i + 0.5) / count
      lights.push({
        x: cx - tier.half * 0.78 + tier.half * 1.5 * t,
        y: tier.bottom - tier.height * (0.1 + 0.28 * t) + Math.sin(t * Math.PI) * tier.height * 0.08,
        color: LIGHT_COLORS[(tierIndex * 3 + i) % LIGHT_COLORS.length],
        delay: (random() * 3).toFixed(2),
        duration: (2 + random() * 2.5).toFixed(2),
      })
    }
  })
  return lights
}

/**
 * A snowy pine. `tone` picks the fill gradients ('near' or 'far'), which the
 * parent SVG defines with matching ids. `lights` adds twinkling string lights.
 */
export function PineTree({ cx, base, height, width, tiers = 5, tone = 'near', lights = false, seed = 1 }) {
  const geometry = pineGeometry({ cx, base, height, width, tiers })
  const bulbs = lights ? lightPositions({ cx, tiers: geometry.tiers, seed }) : []
  const lightRadius = Math.max(4, width * 0.016)

  return (
    <g>
      <rect
        x={geometry.trunk.x}
        y={geometry.trunk.y}
        width={geometry.trunk.w}
        height={geometry.trunk.h}
        fill={tone === 'near' ? '#2b1d14' : '#0c1824'}
      />
      {geometry.tiers.map((tier, i) => (
        <g key={i}>
          <path d={tierPath(cx, tier)} fill={`url(#pine-${tone})`} />
          <path d={snowCapPath(cx, tier)} fill={`url(#snowcap-${tone})`} />
          <ellipse cx={cx - tier.half * 0.9} cy={tier.bottom - tier.height * 0.02} rx={tier.half * 0.13} ry={tier.height * 0.045} fill={`url(#snowcap-${tone})`} />
          <ellipse cx={cx + tier.half * 0.9} cy={tier.bottom - tier.height * 0.02} rx={tier.half * 0.13} ry={tier.height * 0.045} fill={`url(#snowcap-${tone})`} />
        </g>
      ))}
      {bulbs.map((bulb, i) => (
        <g key={i} className="tree-light" style={{ animationDelay: `${bulb.delay}s`, animationDuration: `${bulb.duration}s` }}>
          <circle cx={bulb.x} cy={bulb.y} r={lightRadius * 2} fill={bulb.color} opacity="0.18" />
          <circle cx={bulb.x} cy={bulb.y} r={lightRadius * 0.6} fill={bulb.color} />
        </g>
      ))}
    </g>
  )
}

/** Gradient definitions used by <PineTree>. Place once inside each SVG's <defs>. */
export function PineDefs() {
  return (
    <>
      <linearGradient id="pine-near" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#0b241d" />
        <stop offset="0.6" stopColor="#15392e" />
        <stop offset="1" stopColor="#1f4d3e" />
      </linearGradient>
      <linearGradient id="pine-far" x1="0" x2="1">
        <stop offset="0" stopColor="#0a1a26" />
        <stop offset="1" stopColor="#12283a" />
      </linearGradient>
      <linearGradient id="snowcap-near" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="#f4f8ff" />
        <stop offset="1" stopColor="#b9c9e6" />
      </linearGradient>
      <linearGradient id="snowcap-far" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="#9fb3d8" stopOpacity="0.85" />
        <stop offset="1" stopColor="#6d82ad" stopOpacity="0.7" />
      </linearGradient>
    </>
  )
}
