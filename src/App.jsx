import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { useAudio } from './audio/useAudio.js'
import { Controls, Loader, SnowDrift, StarCursor } from './components/Chrome.jsx'
import { BurstCanvas, SnowCanvas } from './components/EffectCanvases.jsx'
import { GiftStage } from './components/Gift.jsx'
import { Landscape, SharedDefs } from './components/Landscape.jsx'
import { LetterScene } from './components/Letter.jsx'
import { NearTrees } from './components/NearTrees.jsx'
import { Portal } from './components/Portal.jsx'
import { Sky } from './components/Sky.jsx'
import { PORTFOLIO_URL, TIMINGS, isNavigableUrl } from './config.js'
import { useMotionPreference } from './hooks/useMotionPreference.js'
import { latestPhase, usePhaseClock } from './hooks/usePhaseClock.js'
import { useFinePointer } from './hooks/usePointerKind.js'
import { usePointerTracking } from './lib/pointer.js'
import { initialSceneState, sceneReducer } from './state/sceneMachine.js'

const ANNOUNCEMENTS = {
  night: 'A snowy Christmas night. A big present is waiting for you.',
  opening: 'The present is opening.',
  letter: 'A Christmas letter from Tracy.',
  portal: 'I believe in you, Hunny. Taking you to your portfolio.',
}

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

function defaultNavigate(url) {
  window.location.assign(url)
}

export default function App({ navigate = defaultNavigate, portfolioUrl = PORTFOLIO_URL }) {
  const [state, dispatch] = useReducer(sceneReducer, initialSceneState)
  const { scene, run, letterDone } = state
  const { reduced, toggle: toggleMotion } = useMotionPreference()
  const { engine, muted, toggleMuted } = useAudio()
  const finePointer = useFinePointer()
  usePointerTracking()

  const giftButtonRef = useRef(null)
  const lastJingle = useRef(0)
  const navigated = useRef(false)
  const [lightOrigin, setLightOrigin] = useState(null)

  // ── Scene 0: loading ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    const fontsReady = document.fonts?.ready ?? Promise.resolve()
    Promise.all([wait(TIMINGS.loaderMinimum), Promise.race([fontsReady, wait(3000)])]).then(() => {
      if (!cancelled) dispatch({ type: 'LOADED' })
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Keyboard users get focus moved to the present; mouse and touch users
  // don't, so no focus ring appears around it after a click.
  const keyboardUser = useRef(false)

  const enter = useCallback(
    (event) => {
      keyboardUser.current = event?.detail === 0 // 0 = activated with the keyboard
      engine.unlock() // this click is what lets the browser play sound
      dispatch({ type: 'ENTER' })
    },
    [engine],
  )

  // ── Scene 3: opening timeline ─────────────────────────────────────────────
  const openingSchedule = reduced ? TIMINGS.openingReduced : TIMINGS.opening
  const opening = usePhaseClock(openingSchedule, scene === 'opening')
  const openingStep = latestPhase(opening, openingSchedule)

  useEffect(() => {
    if (opening.has('letter')) dispatch({ type: 'SHOW_LETTER' })
  }, [opening])

  // Where the light pours out of the box, in screen pixels (for the burst
  // particles and the camera zoom).
  useEffect(() => {
    if (!opening.has('burst')) return
    const rect = giftButtonRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height * 0.423
    setLightOrigin((previous) =>
      previous && Math.abs(previous.x - x) < 1 && Math.abs(previous.y - y) < 1 ? previous : { x, y },
    )
  }, [opening])

  // ── Scene 5: portal timeline ──────────────────────────────────────────────
  const portalSchedule = reduced ? TIMINGS.portalReduced : TIMINGS.portal
  const portal = usePhaseClock(portalSchedule, scene === 'portal')

  useEffect(() => {
    if (!portal.has('redirect') || navigated.current) return
    navigated.current = true
    if (isNavigableUrl(portfolioUrl)) navigate(portfolioUrl)
    else console.warn('PORTFOLIO_URL in src/config.js is not a full https:// link:', portfolioUrl)
  }, [portal, navigate, portfolioUrl])

  useEffect(() => {
    if (scene !== 'portal') navigated.current = false
  }, [scene])

  // Coming back with the browser's Back button restores a frozen page; show
  // the finished letter rather than a portal stuck mid-animation.
  useEffect(() => {
    const onPageShow = (event) => {
      if (event.persisted) dispatch({ type: 'RESTORE' })
    }
    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [])

  // ── Sound follows the story ───────────────────────────────────────────────
  useEffect(() => {
    if (scene === 'night') engine.startMusic()
    else if (scene === 'opening') engine.swell()
    else if (scene === 'portal') engine.portal()
  }, [scene, run, engine])

  // Keyboard focus lands on the present whenever the night scene begins.
  useEffect(() => {
    if (scene === 'night' && keyboardUser.current) giftButtonRef.current?.focus({ preventScroll: true })
  }, [scene, run])

  const hoverJingle = useCallback(() => {
    const now = performance.now()
    if (now - lastJingle.current < 1500) return
    lastJingle.current = now
    engine.hoverJingle()
  }, [engine])

  const giftPhase =
    scene === 'opening' ? openingStep ?? 'shake' : scene === 'letter' || scene === 'portal' ? 'opened' : 'idle'
  const zoomed = (scene === 'opening' && opening.has('zoom')) || scene === 'letter' || scene === 'portal'
  const nightInteractive = scene === 'night'
  const showGift = scene !== 'loading' && scene !== 'welcome'
  const burstOn = (scene === 'opening' && opening.has('burst')) || scene === 'letter'
  const flashOn = (scene === 'opening' && opening.has('zoom')) || scene === 'letter'

  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <div className="app" data-scene={scene}>
        <SharedDefs />

        <motion.div
          className="world"
          style={{ transformOrigin: lightOrigin ? `${lightOrigin.x}px ${lightOrigin.y}px` : '50% 60%' }}
          initial={false}
          animate={{ scale: zoomed ? 2.3 : 1 }}
          transition={{ duration: zoomed ? 1.3 : 0.6, ease: [0.55, 0, 0.3, 1] }}
        >
          <Sky
            reduced={reduced}
            interactive={nightInteractive}
            onSecretStar={() => engine.twinkle()}
            onSanta={(seconds) => engine.santaBells(seconds)}
          />
          <Landscape />
          <NearTrees interactive={nightInteractive} onOrnament={() => engine.ornamentJingle()} />
          {showGift && (
            <GiftStage
              key={run}
              buttonRef={giftButtonRef}
              phase={giftPhase}
              reduced={reduced}
              interactive={nightInteractive}
              finePointer={finePointer}
              onOpen={() => dispatch({ type: 'OPEN_GIFT' })}
              onHover={hoverJingle}
            />
          )}
        </motion.div>

        <SnowCanvas reduced={reduced} />
        <SnowDrift reduced={reduced} />

        {burstOn && lightOrigin && !reduced && <BurstCanvas key={`burst-${run}`} origin={lightOrigin} />}

        {flashOn && (
          <motion.div
            key={`flash-${run}`}
            className="flash"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.92, 0] }}
            transition={{ duration: reduced ? 0.6 : 1.7, times: [0, 0.6, 1] }}
          />
        )}

        {(scene === 'letter' || scene === 'portal') && (
          <LetterScene
            key={`letter-${run}`}
            reduced={reduced}
            leaving={scene === 'portal'}
            done={letterDone}
            onDone={() => dispatch({ type: 'LETTER_DONE' })}
            onFuture={() => dispatch({ type: 'START_FUTURE' })}
          />
        )}

        {scene === 'portal' && (
          <Portal
            key={`portal-${run}`}
            phases={portal}
            reduced={reduced}
            portfolioUrl={portfolioUrl}
            redirectInMs={portalSchedule.redirect - portalSchedule.fallback}
          />
        )}

        {scene !== 'loading' && scene !== 'welcome' && (
          <Controls
            muted={muted}
            onToggleMuted={toggleMuted}
            reduced={reduced}
            onToggleMotion={toggleMotion}
            canReplay={scene === 'opening' || scene === 'letter' || scene === 'portal'}
            onReplay={(event) => {
              keyboardUser.current = event.detail === 0
              dispatch({ type: 'REPLAY' })
            }}
          />
        )}

        <AnimatePresence>
          {(scene === 'loading' || scene === 'welcome') && <Loader ready={scene === 'welcome'} onEnter={enter} />}
        </AnimatePresence>

        {finePointer && !reduced && <StarCursor neon={scene === 'portal'} />}

        <p className="sr-only" aria-live="polite">
          {ANNOUNCEMENTS[scene] ?? ''}
        </p>
      </div>
    </MotionConfig>
  )
}
