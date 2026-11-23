import { useCallback, useEffect, useState } from 'react'
import { readSetting, writeSetting } from '../lib/storage.js'

const QUERY = '(prefers-reduced-motion: reduce)'
const STORAGE_KEY = 'nate-xmas:motion'

function systemPrefersReduced() {
  return typeof window !== 'undefined' && window.matchMedia?.(QUERY).matches === true
}

/**
 * Reduced motion follows the operating-system setting by default, and the
 * on-screen toggle can override it either way. The override is remembered.
 */
export function useMotionPreference() {
  const [osReduced, setOsReduced] = useState(systemPrefersReduced)
  const [override, setOverride] = useState(() => {
    const saved = readSetting(STORAGE_KEY)
    return saved === 'reduced' || saved === 'full' ? saved : null
  })

  useEffect(() => {
    const query = window.matchMedia?.(QUERY)
    if (!query?.addEventListener) return undefined
    const onChange = (event) => setOsReduced(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const reduced = override ? override === 'reduced' : osReduced

  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full'
  }, [reduced])

  const toggle = useCallback(() => {
    const next = reduced ? 'full' : 'reduced'
    setOverride(next)
    writeSetting(STORAGE_KEY, next)
  }, [reduced])

  return { reduced, toggle }
}
