import { useEffect } from 'react'

/**
 * Drives a full-size <canvas> effect.
 *
 * `createScene(ctx)` returns { resize(width, height), frame(now, dt, width, height) }.
 * `frame` may return false to stop the loop (for one-shot effects).
 *
 * Handles the parts every effect needs: sharp rendering on high-DPI screens
 * (capped at 2× to protect battery and GPU), resizing, pausing while the tab is
 * hidden, and a single still frame when animation is turned off.
 */
export function useCanvasScene(canvasRef, createScene, { animate = true, active = true, maxDpr = 2 } = {}) {
  useEffect(() => {
    if (!active) return undefined
    const canvas = canvasRef.current
    const ctx = canvas?.getContext?.('2d')
    if (!ctx) return undefined

    const scene = createScene(ctx)
    let width = 0
    let height = 0
    let raf = 0
    let last = 0
    let running = false

    const draw = (now) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60
      last = now
      const keepGoing = scene.frame(now, dt, width, height)
      if (running && keepGoing !== false) raf = requestAnimationFrame(draw)
      else running = false
    }

    const start = () => {
      if (!animate || running) return
      running = true
      last = 0
      raf = requestAnimationFrame(draw)
    }

    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
      width = canvas.clientWidth || window.innerWidth
      height = canvas.clientHeight || window.innerHeight
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      scene.resize?.(width, height)
      if (!animate) scene.frame(performance.now(), 0, width, height)
    }

    resize()
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
    if (observer) observer.observe(canvas)
    else window.addEventListener('resize', resize)

    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVisibility)
    if (!document.hidden) start()

    return () => {
      stop()
      observer?.disconnect()
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
      scene.dispose?.()
    }
  }, [canvasRef, createScene, animate, active, maxDpr])
}
