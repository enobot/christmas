import { describe, expect, it } from 'vitest'
import { splitGraphemes, splitWords } from './graphemes.js'

describe('splitGraphemes', () => {
  it('keeps a ❤️ heart (two code points) together as one character', () => {
    expect(splitGraphemes('LOVE ❤️')).toEqual(['L', 'O', 'V', 'E', ' ', '❤️'])
  })

  it('keeps emoji outside the basic plane together', () => {
    expect(splitGraphemes('🎮!')).toEqual(['🎮', '!'])
  })

  it('round-trips the original text', () => {
    const text = "I can't wait ❤️🎮"
    expect(splitGraphemes(text).join('')).toBe(text)
  })
})

describe('splitWords', () => {
  it('attaches an emoji to the word before it', () => {
    expect(splitWords('MY LOVE ❤️')).toEqual(['MY', 'LOVE ❤️'])
  })

  it('leaves a leading emoji as its own word', () => {
    expect(splitWords('❤️ hi')).toEqual(['❤️', 'hi'])
  })

  it('splits plain sentences on spaces', () => {
    expect(splitWords('I love you!')).toEqual(['I', 'love', 'you!'])
  })
})
