import { Component } from 'react'
import { PORTFOLIO_URL } from '../config.js'
import { LETTER } from '../content/letter.js'

/**
 * A safety net. If anything unexpected breaks while the surprise is playing
 * (an old browser, a missing feature), Nate still gets the letter and the
 * link to his portfolio instead of a blank screen.
 */
export class SurpriseErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.error('The Christmas surprise hit an error and switched to the simple letter:', error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="fallback">
        <article className="fallback-letter">
          <h1>{LETTER.greeting}</h1>
          {LETTER.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p>
            {LETTER.closing}
            <br />
            {LETTER.signature}
          </p>
        </article>
        <a className="neon-link" href={PORTFOLIO_URL}>
          Go to your portfolio
        </a>
      </main>
    )
  }
}
