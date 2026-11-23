// ─────────────────────────────────────────────────────────────────────────────
// PORTFOLIO_URL — the one setting you will most likely change.
//
// At the end of the surprise, Nate is sent to this address. It must be the full
// link to his portfolio (starting with https://). If the portfolio moves — for
// example to his own GitHub account — paste the new link here and push.
// ─────────────────────────────────────────────────────────────────────────────
export const PORTFOLIO_URL = 'https://enobot.github.io/nate/'

/** True when `url` is an absolute http(s) link that is safe to navigate to. */
export function isNavigableUrl(url) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

// Scene timings in milliseconds, measured from the start of each scene.
// Slow a moment down or speed it up by changing a number here.
export const TIMINGS = {
  // Shortest time the "wrapping your present" loader stays up.
  loaderMinimum: 1400,

  // Opening the present (Scene 3). Each key is when that step begins.
  opening: { shake: 0, untie: 950, lid: 1750, burst: 2550, zoom: 3050, letter: 4250 },
  openingReduced: { shake: 0, untie: 0, lid: 150, burst: 300, zoom: 300, letter: 800 },

  // The letter (Scene 4).
  letter: { unfold: 800, write: 2000, perChar: 24, paragraphPause: 380 },
  letterReduced: { unfold: 0, write: 0, perChar: 0, paragraphPause: 0 },

  // The portal to the portfolio (Scene 5).
  portal: { portal: 650, neon: 1500, message: 2700, fallback: 4300, redirect: 8000 },
  portalReduced: { portal: 0, neon: 0, message: 200, fallback: 400, redirect: 6500 },

  // How often Santa flies by (first pass, then a random gap in this range).
  santaFirstPass: 7000,
  santaGap: [26000, 42000],
}
