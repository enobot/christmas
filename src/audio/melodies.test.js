import { describe, expect, it } from 'vitest'
import { MUSIC_TIMELINE } from './engine.js'
import { CHORD_VOICING, JINGLE_BELLS, SILENT_NIGHT_BARS, SILENT_NIGHT_CHORDS, noteToFrequency } from './melodies.js'

describe('melody data', () => {
  it('fills every Silent Night bar with exactly six eighth notes (6/8 time)', () => {
    SILENT_NIGHT_BARS.forEach((bar, index) => {
      const length = bar.reduce((sum, [, eighths]) => sum + eighths, 0)
      expect(length, `bar ${index + 1}`).toBe(6)
    })
  })

  it('has one known chord for every bar', () => {
    expect(SILENT_NIGHT_CHORDS).toHaveLength(SILENT_NIGHT_BARS.length)
    for (const chord of SILENT_NIGHT_CHORDS) expect(CHORD_VOICING[chord]).toBeDefined()
  })

  it('plays the Jingle Bells phrase as four full bars of 4/4', () => {
    expect(JINGLE_BELLS.reduce((sum, [, quarters]) => sum + quarters, 0)).toBe(16)
  })

  it('converts note names to the right frequencies', () => {
    expect(noteToFrequency('A4')).toBeCloseTo(440, 5)
    expect(noteToFrequency('A5')).toBeCloseTo(880, 5)
    expect(noteToFrequency('C4')).toBeCloseTo(261.626, 2)
    expect(noteToFrequency('G#6')).toBeCloseTo(1661.22, 1)
    expect(noteToFrequency('C4', 12)).toBeCloseTo(noteToFrequency('C5'), 5)
  })

  it('rejects unknown note names instead of playing a wrong pitch', () => {
    expect(() => noteToFrequency('H2')).toThrow()
  })

  it('every note in the music can be converted to a frequency', () => {
    for (const bar of SILENT_NIGHT_BARS) {
      for (const [pitch] of bar) if (pitch !== 'rest') expect(Number.isFinite(noteToFrequency(pitch))).toBe(true)
    }
    for (const voicing of Object.values(CHORD_VOICING)) {
      for (const note of voicing) expect(Number.isFinite(noteToFrequency(note))).toBe(true)
    }
  })

  it('builds a sorted timeline that loops after the last bar', () => {
    const times = MUSIC_TIMELINE.events.map((event) => event.t)
    expect(times).toEqual([...times].sort((a, b) => a - b))
    expect(MUSIC_TIMELINE.length).toBeGreaterThan(SILENT_NIGHT_BARS.length * 6 - 1)
  })
})
