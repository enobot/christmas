import { describe, expect, it } from 'vitest'
import { PORTFOLIO_URL, TIMINGS, isNavigableUrl } from './config.js'

describe('config', () => {
  it('points at the portfolio with a full https link', () => {
    expect(isNavigableUrl(PORTFOLIO_URL)).toBe(true)
    expect(new URL(PORTFOLIO_URL).protocol).toBe('https:')
  })

  it('does not point back at the Christmas site itself', () => {
    expect(new URL(PORTFOLIO_URL).pathname).not.toMatch(/christmas/i)
  })

  it('rejects links that are unsafe or incomplete', () => {
    for (const bad of ['', 'enobot.github.io/nate', 'javascript:alert(1)', 'data:text/html,hi', 'not a url']) {
      expect(isNavigableUrl(bad)).toBe(false)
    }
  })

  it('keeps every timeline in chronological order', () => {
    for (const schedule of [TIMINGS.opening, TIMINGS.openingReduced, TIMINGS.portal, TIMINGS.portalReduced]) {
      const times = Object.values(schedule)
      expect(times).toEqual([...times].sort((a, b) => a - b))
    }
  })

  it('leaves time to read the message before redirecting', () => {
    expect(TIMINGS.portal.redirect - TIMINGS.portal.message).toBeGreaterThanOrEqual(4000)
    expect(TIMINGS.portalReduced.redirect - TIMINGS.portalReduced.message).toBeGreaterThanOrEqual(4000)
  })
})
