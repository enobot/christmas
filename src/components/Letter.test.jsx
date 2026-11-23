import { act, fireEvent, render, screen } from '@testing-library/react'
import { MotionConfig } from 'motion/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TIMINGS } from '../config.js'
import { COPY, LETTER } from '../content/letter.js'
import { LetterScene, letterBlocks, writingDuration } from './Letter.jsx'

const advance = (ms) => act(() => vi.advanceTimersByTimeAsync(ms))

function renderLetter(props) {
  return render(
    <MotionConfig reducedMotion="never">
      <LetterScene reduced={false} leaving={false} done={false} onDone={vi.fn()} onFuture={vi.fn()} {...props} />
    </MotionConfig>,
  )
}

describe('the handwritten letter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('writes every character of the letter, in order', async () => {
    const { container } = renderLetter()
    await advance(TIMINGS.letter.write + 10)
    const written = [...container.querySelectorAll('.hw-char')].map((node) => node.textContent).join('')
    const expected = letterBlocks()
      .map((block) => block.text.replaceAll(' ', ''))
      .join('')
    expect(written.replaceAll(' ', '')).toBe(expected)
  })

  it('reports it is finished exactly when the last character is written', async () => {
    const onDone = vi.fn()
    renderLetter({ onDone })
    await advance(TIMINGS.letter.write + 10)
    const duration = writingDuration(TIMINGS.letter)
    await advance(duration - 50)
    expect(onDone).not.toHaveBeenCalled()
    await advance(100)
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('times the writing from the same characters it animates', async () => {
    const { container } = renderLetter()
    await advance(TIMINGS.letter.write + 10)
    const characters = container.querySelectorAll('.hw-char').length
    const { perChar, paragraphPause } = TIMINGS.letter
    const expected = (characters - 1) * perChar + (letterBlocks().length - 1) * paragraphPause + 450
    expect(writingDuration(TIMINGS.letter)).toBe(expected)
  })

  it('lets Nate skip straight to the whole letter', async () => {
    const onDone = vi.fn()
    renderLetter({ onDone })
    await advance(TIMINGS.letter.write + 2000)
    fireEvent.click(screen.getByRole('button', { name: COPY.skipWriting }))
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('offers the future button once done', async () => {
    const onFuture = vi.fn()
    renderLetter({ done: true, onFuture })
    fireEvent.click(screen.getByRole('button', { name: COPY.futureButton }))
    expect(onFuture).toHaveBeenCalledTimes(1)
  })

  it('gives screen readers the letter as plain text', () => {
    renderLetter()
    expect(screen.getByRole('heading', { name: LETTER.greeting })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: LETTER.greeting })).toBeInTheDocument()
  })
})

describe('with reduced motion', () => {
  it('shows the letter without the fold seal covering the text', () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <LetterScene reduced leaving={false} done={false} onDone={vi.fn()} onFuture={vi.fn()} />
      </MotionConfig>,
    )
    expect(container.querySelector('.seal-on-fold')).toBeNull()
  })
})

describe('writingDuration', () => {
  it('is zero when animations are reduced', () => {
    expect(writingDuration(TIMINGS.letterReduced)).toBe(0)
  })
})
