import { describe, expect, it } from 'vitest'
import { COPY, LETTER } from './letter.js'

// Guards the exact wording Tracy asked for, so an accidental edit is caught.
describe('the Christmas letter', () => {
  it('has the exact greeting, paragraphs, and signature', () => {
    expect(LETTER.greeting).toBe('MERRY CHRISTMAS MY LOVE ❤️')
    expect(LETTER.paragraphs).toEqual([
      'I made you your very own portfolio to help you find a job and kick-start your career!',
      "Now all you have to do is keep building your skills, practice those interviews, and show everyone what I already know you're capable of. ❤️",
      'I love you!',
      'I believe in youuuuuuuu! ❤️',
      "I can't wait to see all the amazing things you'll accomplish. I'll always be cheering you on.",
    ])
    expect(LETTER.closing).toBe('Love,')
    expect(LETTER.signature).toBe('Tracy')
  })

  it('no longer contains the replaced interview sentence', () => {
    const text = [LETTER.greeting, ...LETTER.paragraphs].join(' ')
    expect(text).not.toMatch(/remember or learn what to say in interviews/i)
  })

  it('uses the requested button, portal, and Easter egg wording', () => {
    expect(COPY.futureButton).toBe('Your Future Starts Here ❤️🎮')
    expect(COPY.believe).toBe('I BELIEVE IN YOU, HUNNY ❤️')
    expect(COPY.easterEgg).toBe('Tracy believes in you ❤️')
    expect(COPY.giftMessage).toBe('Hunny, I made something special for you... ❤️')
    expect(COPY.giftCaptionPointer).toBe('Click to open your present!')
  })
})
