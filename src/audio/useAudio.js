import { useCallback, useEffect, useRef, useState } from 'react'
import { readSetting, writeSetting } from '../lib/storage.js'
import { createAudioEngine } from './engine.js'

const STORAGE_KEY = 'nate-xmas:sound'

/** Owns the audio engine for the app's lifetime plus the on/off setting. */
export function useAudio() {
  const engineRef = useRef(null)
  if (engineRef.current === null) engineRef.current = createAudioEngine()

  const [muted, setMuted] = useState(() => readSetting(STORAGE_KEY) === 'off')

  useEffect(() => {
    engineRef.current.setMuted(muted)
  }, [muted])

  useEffect(() => {
    const engine = engineRef.current
    return () => engine.dispose()
  }, [])

  const toggleMuted = useCallback(() => {
    const next = !muted
    setMuted(next)
    writeSetting(STORAGE_KEY, next ? 'off' : 'on')
    // Turning sound on is itself a click, so the browser allows audio to start.
    if (!next) engineRef.current.unlock()
  }, [muted])

  return { engine: engineRef.current, muted, toggleMuted }
}
