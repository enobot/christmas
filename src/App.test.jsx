import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import axe from 'axe-core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.jsx'
import { PORTFOLIO_URL, TIMINGS } from './config.js'
import { COPY, LETTER } from './content/letter.js'

// These tests drive the real app through the whole story. Reduced motion is
// switched on (the same setting a visitor can choose) so scenes advance on
// the short timings; the story logic is identical either way.

const advance = (ms) => act(() => vi.advanceTimersByTimeAsync(ms))

function useReducedMotion() {
  window.localStorage.setItem('nate-xmas:motion', 'reduced')
}

async function reachNight() {
  await advance(TIMINGS.loaderMinimum + 50)
  fireEvent.click(screen.getByRole('button', { name: COPY.enter }))
  await advance(50)
}

async function reachLetter() {
  await reachNight()
  fireEvent.click(screen.getByRole('button', { name: 'Open your present' }))
  await advance(TIMINGS.openingReduced.letter + 50)
  await advance(50)
}

async function reachPortal() {
  await reachLetter()
  fireEvent.click(screen.getByRole('button', { name: COPY.futureButton }))
  await advance(TIMINGS.portalReduced.fallback + 50)
}

describe('the Christmas surprise', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useReducedMotion()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows the loader first, then the button to step inside', async () => {
    render(<App navigate={vi.fn()} />)
    expect(screen.getByText(COPY.loading)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: COPY.enter })).not.toBeInTheDocument()
    await advance(TIMINGS.loaderMinimum + 50)
    expect(screen.getByRole('button', { name: COPY.enter })).toBeInTheDocument()
  })

  it('shows the present with its message and caption on the snowy night', async () => {
    render(<App navigate={vi.fn()} />)
    await reachNight()
    expect(screen.getByRole('heading', { level: 1, name: COPY.giftMessage })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open your present' })).toBeEnabled()
  })

  it('opens the present, reveals the full letter, then offers the future button', async () => {
    render(<App navigate={vi.fn()} />)
    await reachNight()
    const gift = screen.getByRole('button', { name: 'Open your present' })
    fireEvent.click(gift)
    expect(gift).toBeDisabled() // can't be opened twice
    expect(screen.queryByRole('heading', { name: LETTER.greeting })).not.toBeInTheDocument()

    await advance(TIMINGS.openingReduced.letter + 50)
    await advance(50)

    expect(screen.getByRole('heading', { level: 2, name: LETTER.greeting })).toBeInTheDocument()
    for (const paragraph of LETTER.paragraphs) expect(screen.getByText(paragraph)).toBeInTheDocument()
    expect(screen.getByText(`${LETTER.closing} ${LETTER.signature}`)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: COPY.futureButton })).toBeInTheDocument()
  })

  it('opens the portal, shows the message and a working link, then redirects once', async () => {
    const navigate = vi.fn()
    render(<App navigate={navigate} />)
    await reachPortal()

    expect(screen.getByRole('heading', { name: COPY.believe })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: COPY.fallbackLink })).toHaveAttribute('href', PORTFOLIO_URL)
    expect(navigate).not.toHaveBeenCalled()

    await advance(TIMINGS.portalReduced.redirect)
    expect(navigate).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledWith(PORTFOLIO_URL)

    await advance(10000)
    expect(navigate).toHaveBeenCalledTimes(1)
  })

  it('does not redirect if Nate presses Replay during the portal', async () => {
    const navigate = vi.fn()
    render(<App navigate={navigate} />)
    await reachPortal()

    fireEvent.click(screen.getByRole('button', { name: COPY.replay }))
    await advance(TIMINGS.portalReduced.redirect + 1000)

    expect(navigate).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Open your present' })).toBeEnabled()
    expect(screen.queryByRole('heading', { name: COPY.believe })).not.toBeInTheDocument()
  })

  it('can be replayed from the letter and opened again', async () => {
    render(<App navigate={vi.fn()} />)
    await reachLetter()
    fireEvent.click(screen.getByRole('button', { name: COPY.replay }))
    await advance(50)
    fireEvent.click(screen.getByRole('button', { name: 'Open your present' }))
    await advance(TIMINGS.openingReduced.letter + 100)
    expect(screen.getByRole('heading', { level: 2, name: LETTER.greeting })).toBeInTheDocument()
  })

  it('refuses to navigate to an unsafe portfolio link', async () => {
    const navigate = vi.fn()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<App navigate={navigate} portfolioUrl="javascript:alert(1)" />)
    await reachPortal()
    await advance(TIMINGS.portalReduced.redirect)
    expect(navigate).not.toHaveBeenCalled()
  })

  it('reveals the hidden star message', async () => {
    render(<App navigate={vi.fn()} />)
    await reachNight()
    fireEvent.click(screen.getByRole('button', { name: /twinkling a little brighter/i }))
    expect(screen.getByText(COPY.easterEgg)).toBeInTheDocument()
  })

  it('lets the ornament be rung on the night scene', async () => {
    render(<App navigate={vi.fn()} />)
    await reachNight()
    const ornament = screen.getByRole('button', { name: 'Ring the ornament' })
    expect(ornament).toBeEnabled()
    fireEvent.click(ornament) // no sound in the test browser; must not throw
  })

  it('toggles music and animation settings', async () => {
    render(<App navigate={vi.fn()} />)
    await reachNight()
    fireEvent.click(screen.getByRole('button', { name: 'Turn music off' }))
    expect(screen.getByRole('button', { name: 'Turn music on' })).toBeInTheDocument()
    expect(window.localStorage.getItem('nate-xmas:sound')).toBe('off')

    fireEvent.click(screen.getByRole('button', { name: 'Turn animations back on' }))
    expect(screen.getByRole('button', { name: 'Reduce animations' })).toBeInTheDocument()
    expect(document.documentElement.dataset.motion).toBe('full')
  })

  it('still works when the browser blocks storage', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage blocked')
    })
    render(<App navigate={vi.fn()} />)
    await reachNight()
    fireEvent.click(screen.getByRole('button', { name: 'Turn music off' }))
    expect(screen.getByRole('button', { name: 'Turn music on' })).toBeInTheDocument()
  })
})

describe('accessibility (axe)', () => {
  // jsdom cannot compute rendered colors, so the color-contrast rule is
  // checked in a real browser instead.
  const run = (node) => axe.run(node, { rules: { 'color-contrast': { enabled: false } } })

  beforeEach(() => {
    useReducedMotion()
  })

  it('has no detectable violations on the night scene, letter, or portal', async () => {
    const { container } = render(<App navigate={vi.fn()} />)
    const enter = await screen.findByRole('button', { name: COPY.enter }, { timeout: 4000 })
    fireEvent.click(enter)
    await screen.findByRole('button', { name: 'Open your present' })
    expect((await run(container)).violations).toEqual([])

    fireEvent.click(screen.getByRole('button', { name: 'Open your present' }))
    await screen.findByRole('button', { name: COPY.futureButton }, { timeout: 4000 })
    expect((await run(container)).violations).toEqual([])

    fireEvent.click(screen.getByRole('button', { name: COPY.futureButton }))
    await waitFor(() => screen.getByRole('link', { name: COPY.fallbackLink }), { timeout: 4000 })
    expect((await run(container)).violations).toEqual([])
  }, 20000)
})
