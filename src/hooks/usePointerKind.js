import { useEffect, useState } from 'react'

const FINE = '(hover: hover) and (pointer: fine)'

/** True on devices with a mouse or trackpad; false on phones and tablets. */
export function useFinePointer() {
  const [fine, setFine] = useState(() => window.matchMedia?.(FINE).matches === true)

  useEffect(() => {
    const query = window.matchMedia?.(FINE)
    if (!query?.addEventListener) return undefined
    const onChange = (event) => setFine(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return fine
}
