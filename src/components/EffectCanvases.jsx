import { useCallback, useEffect, useRef } from 'react'
import { useCanvasScene } from '../hooks/useCanvasScene.js'
import { createBurstScene } from '../effects/burst.js'
import { createPortalScene } from '../effects/portal.js'
import { createSkyScene } from '../effects/sky.js'
import { createSnowScene } from '../effects/snow.js'

const isSmallScreen = () => window.innerWidth < 640

export function SkyCanvas({ reduced }) {
  const ref = useRef(null)
  const create = useCallback((ctx) => createSkyScene(ctx, { shootingStars: !reduced }), [reduced])
  useCanvasScene(ref, create, { animate: !reduced })
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />
}

export function SnowCanvas({ reduced }) {
  const ref = useRef(null)
  const create = useCallback((ctx) => createSnowScene(ctx), [])
  useCanvasScene(ref, create, { animate: !reduced })
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-40 h-full w-full" aria-hidden="true" />
}

export function BurstCanvas({ origin }) {
  const ref = useRef(null)
  const create = useCallback(
    (ctx) => createBurstScene(ctx, { origin, small: isSmallScreen() }),
    [origin],
  )
  useCanvasScene(ref, create, { active: origin !== null })
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-50 h-full w-full" aria-hidden="true" />
}

export function PortalCanvas({ neon, reduced }) {
  const ref = useRef(null)
  const neonStart = useRef(null)

  useEffect(() => {
    neonStart.current = neon ? performance.now() : null
  }, [neon])

  const create = useCallback(
    (ctx) => createPortalScene(ctx, { getNeonStart: () => neonStart.current, small: isSmallScreen() }),
    [],
  )
  useCanvasScene(ref, create, { animate: !reduced, active: !reduced })
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />
}
