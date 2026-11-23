import { useEffect, useState } from 'react'

const EMPTY = new Set()

/**
 * Runs a scene's timeline. `schedule` maps step names to start times in ms;
 * while `active` is true, each name is added to the returned Set when its time
 * arrives. Leaving the scene (active → false) cancels pending steps and resets.
 *
 * Scene changes are driven by these timers, never by "animation finished"
 * callbacks, so the story keeps moving even if an animation is skipped.
 */
export function usePhaseClock(schedule, active) {
  const [reached, setReached] = useState(EMPTY)

  useEffect(() => {
    if (!active) {
      setReached(EMPTY)
      return undefined
    }
    const timers = Object.entries(schedule).map(([name, at]) =>
      setTimeout(() => {
        setReached((previous) => {
          if (previous.has(name)) return previous
          const next = new Set(previous)
          next.add(name)
          return next
        })
      }, at),
    )
    return () => timers.forEach(clearTimeout)
  }, [schedule, active])

  return reached
}

/** The most recent step reached, following the order of `schedule`'s keys. */
export function latestPhase(reached, schedule, fallback = null) {
  let latest = fallback
  for (const name of Object.keys(schedule)) {
    if (reached.has(name)) latest = name
  }
  return latest
}
