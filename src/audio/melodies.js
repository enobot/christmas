// Melodies for the synthesized music. Both songs are in the public domain:
//   • "Silent Night" — Franz Xaver Gruber, 1818
//   • "Jingle Bells" — James Lord Pierpont, 1857
// The arrangement and every sound are generated in the browser (see engine.js),
// so no recordings are used.

// Silent Night in C major, 6/8 time. Each bar holds 6 eighth notes.
// Each note is [pitch, length in eighth notes]; 'rest' is silence.
export const SILENT_NIGHT_BARS = [
  [['G4', 3], ['A4', 1], ['G4', 2]],
  [['E4', 6]],
  [['G4', 3], ['A4', 1], ['G4', 2]],
  [['E4', 6]],
  [['D5', 4], ['D5', 2]],
  [['B4', 6]],
  [['C5', 4], ['C5', 2]],
  [['G4', 6]],
  [['A4', 4], ['A4', 2]],
  [['C5', 3], ['B4', 1], ['A4', 2]],
  [['G4', 3], ['A4', 1], ['G4', 2]],
  [['E4', 6]],
  [['A4', 4], ['A4', 2]],
  [['C5', 3], ['B4', 1], ['A4', 2]],
  [['G4', 3], ['A4', 1], ['G4', 2]],
  [['E4', 6]],
  [['D5', 4], ['D5', 2]],
  [['F5', 3], ['D5', 1], ['B4', 2]],
  [['C5', 6]],
  [['E5', 6]],
  [['C5', 3], ['G4', 1], ['E4', 2]],
  [['G4', 3], ['F4', 1], ['D4', 2]],
  [['C4', 6]],
  [['rest', 6]],
]

// One chord per bar, used for the soft accompaniment.
export const SILENT_NIGHT_CHORDS = [
  'C', 'C', 'C', 'C', 'G', 'G', 'C', 'C', 'F', 'F', 'C', 'C',
  'F', 'F', 'C', 'C', 'G', 'G7', 'C', 'C', 'C', 'G7', 'C', 'C',
]

// Bass note, then the two upper chord tones, for each chord.
export const CHORD_VOICING = {
  C: ['C4', 'E4', 'G4'],
  G: ['G3', 'B3', 'D4'],
  G7: ['G3', 'B3', 'F4'],
  F: ['F3', 'A3', 'C4'],
}

// The opening of the Jingle Bells chorus. [pitch, length in quarter notes]
export const JINGLE_BELLS = [
  ['E5', 1], ['E5', 1], ['E5', 2],
  ['E5', 1], ['E5', 1], ['E5', 2],
  ['E5', 1], ['G5', 1], ['C5', 1.5], ['D5', 0.5],
  ['E5', 4],
]

const SEMITONES = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 }

/** 'A4' → 440, 'C#5' → 554.37 … (equal temperament, A4 = 440 Hz). */
export function noteToFrequency(note, transpose = 0) {
  const match = /^([A-G])([#b]?)(-?\d)$/.exec(note)
  if (!match) throw new Error(`Unknown note: ${note}`)
  const [, letter, accidental, octave] = match
  const shift = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0
  const semitones = SEMITONES[letter] + shift + (Number(octave) - 4) * 12 + transpose
  return 440 * 2 ** (semitones / 12)
}
