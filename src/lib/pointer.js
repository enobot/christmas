import { useEffect } from 'react'

// One shared, mutable pointer position read by the canvas effects every frame.
// Kept outside React state on purpose: updating state 60 times a second would
// re-render the whole scene for no visible benefit.
export const pointer = { x: -9999, y: -9999, active: false }

export function usePointerTracking() {
  useEffect(() => {
    const move = (event) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.active = true
    }
    const leave = (event) => {
      if (!event.relatedTarget) pointer.active = false
    }
    const blur = () => {
      pointer.active = false
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', move, { passive: true })
    window.addEventListener('mouseout', leave)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', move)
      window.removeEventListener('mouseout', leave)
      window.removeEventListener('blur', blur)
    }
  }, [])
}
