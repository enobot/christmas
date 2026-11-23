import {
  CHORD_VOICING,
  JINGLE_BELLS,
  SILENT_NIGHT_BARS,
  SILENT_NIGHT_CHORDS,
  noteToFrequency,
} from './melodies.js'

// Every sound in the surprise is synthesized here with the Web Audio API —
// a music-box "Silent Night", soft sleigh bells, and little chimes. Nothing is
// downloaded, so there are no audio files or licenses to worry about.
//
// Browsers only allow sound after the visitor interacts with the page, so the
// audio context is created in unlock(), which runs on Nate's first click.

const EIGHTH = 0.4 // seconds per eighth note (a slow, gentle 6/8)
const LOOKAHEAD = 0.3 // schedule notes this far ahead
const TICK_MS = 100
const MUSIC_LEVEL = 0.5
const LOOP_GAP = 6 // eighths of silence before the song repeats

function buildTimeline() {
  const events = []
  SILENT_NIGHT_BARS.forEach((bar, barIndex) => {
    const start = barIndex * 6
    events.push({ t: start, kind: 'bar', barIndex, chord: SILENT_NIGHT_CHORDS[barIndex] })
    let offset = 0
    for (const [pitch, length] of bar) {
      if (pitch !== 'rest') events.push({ t: start + offset, kind: 'melody', pitch, length })
      offset += length
    }
  })
  events.sort((a, b) => a.t - b.t || (a.kind === 'bar' ? -1 : 1))
  return { events, length: SILENT_NIGHT_BARS.length * 6 + LOOP_GAP }
}

export const MUSIC_TIMELINE = buildTimeline()

function makeImpulse(ctx, seconds, decay) {
  const length = Math.floor(ctx.sampleRate * seconds)
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate)
  for (let channel = 0; channel < 2; channel += 1) {
    const data = impulse.getChannelData(channel)
    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay
    }
  }
  return impulse
}

function makeNoise(ctx) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1
  return buffer
}

const between = (min, max) => min + Math.random() * (max - min)

export function createAudioEngine() {
  const AudioContextClass =
    typeof window !== 'undefined' ? window.AudioContext || window.webkitAudioContext : undefined

  let ctx = null
  let master = null
  let reverb = null
  let musicBus = null
  let sfxBus = null
  let noise = null
  let muted = false
  let wantMusic = false
  let musicTimer = 0
  let loopStart = 0
  let index = 0

  const ready = () => ctx !== null && !muted && ctx.state === 'running'

  function onVisibility() {
    if (!ctx) return
    if (document.hidden) ctx.suspend()
    else if (!muted) ctx.resume()
  }

  function build() {
    ctx = new AudioContextClass()
    master = ctx.createGain()
    master.gain.value = 0.85
    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -18
    compressor.ratio.value = 3
    master.connect(compressor).connect(ctx.destination)

    reverb = ctx.createConvolver()
    reverb.buffer = makeImpulse(ctx, 2.6, 2.4)
    const wet = ctx.createGain()
    wet.gain.value = 0.32
    reverb.connect(wet).connect(master)

    musicBus = ctx.createGain()
    musicBus.gain.value = 0.0001
    musicBus.connect(master)
    musicBus.connect(reverb)

    sfxBus = ctx.createGain()
    sfxBus.gain.value = 0.55
    sfxBus.connect(master)
    sfxBus.connect(reverb)

    noise = makeNoise(ctx)
    document.addEventListener('visibilitychange', onVisibility)
  }

  // ── Instruments ────────────────────────────────────────────────────────────

  // A music-box tine: a bright attack and a long ring. The overtone ratios are
  // those of a vibrating metal bar, which is what gives it the music-box sound.
  function musicBoxNote(frequency, when, length, velocity, bus = musicBus) {
    const out = ctx.createGain()
    const ring = Math.min(3.2, 1.1 + length * 0.6)
    out.gain.setValueAtTime(0.0001, when)
    out.gain.exponentialRampToValueAtTime(velocity, when + 0.006)
    out.gain.exponentialRampToValueAtTime(0.0001, when + ring)
    out.connect(bus)
    for (const [ratio, level, fade] of [
      [1, 1, ring],
      [2.756, 0.28, 0.4],
      [5.404, 0.09, 0.18],
    ]) {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = frequency * ratio
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(level, when)
      gain.gain.exponentialRampToValueAtTime(0.0001, when + fade)
      osc.connect(gain).connect(out)
      osc.start(when)
      osc.stop(when + ring + 0.05)
    }
  }

  // A soft, warm chord that breathes underneath the melody.
  function pad(notes, when, duration) {
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 900
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, when)
    gain.gain.linearRampToValueAtTime(0.05, when + 0.8)
    gain.gain.setValueAtTime(0.05, when + duration - 0.2)
    gain.gain.linearRampToValueAtTime(0.0001, when + duration + 1)
    filter.connect(gain).connect(musicBus)
    for (const note of notes) {
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = noteToFrequency(note, -12)
      osc.connect(filter)
      osc.start(when)
      osc.stop(when + duration + 1.1)
    }
  }

  // A shake of sleigh bells: a few quick, bright metallic hits.
  function sleighShake(when, intensity, bus = sfxBus) {
    for (let hit = 0; hit < 5; hit += 1) {
      const at = when + hit * between(0.025, 0.045)
      const source = ctx.createBufferSource()
      source.buffer = noise
      const band = ctx.createBiquadFilter()
      band.type = 'bandpass'
      band.frequency.value = between(5200, 8600)
      band.Q.value = 6
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.0001, at)
      gain.gain.exponentialRampToValueAtTime(intensity, at + 0.003)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.09)
      source.connect(band).connect(gain).connect(bus)
      source.start(at, Math.random() * 0.8)
      source.stop(at + 0.1)
    }
  }

  // A glassy bell made with simple FM synthesis.
  function bell(frequency, when, velocity, bus = sfxBus) {
    const carrier = ctx.createOscillator()
    carrier.frequency.value = frequency
    const modulator = ctx.createOscillator()
    modulator.frequency.value = frequency * 3.5
    const depth = ctx.createGain()
    depth.gain.setValueAtTime(frequency * 2.2, when)
    depth.gain.exponentialRampToValueAtTime(1, when + 1.2)
    modulator.connect(depth).connect(carrier.frequency)
    const amp = ctx.createGain()
    amp.gain.setValueAtTime(0.0001, when)
    amp.gain.exponentialRampToValueAtTime(velocity, when + 0.003)
    amp.gain.exponentialRampToValueAtTime(0.0001, when + 2.2)
    carrier.connect(amp).connect(bus)
    carrier.start(when)
    modulator.start(when)
    carrier.stop(when + 2.3)
    modulator.stop(when + 2.3)
  }

  // Filtered noise sweeping upward: the sound of magic rushing past.
  function whoosh(when, duration, from, to, level) {
    const source = ctx.createBufferSource()
    source.buffer = noise
    source.loop = true
    const band = ctx.createBiquadFilter()
    band.type = 'bandpass'
    band.Q.value = 1.2
    band.frequency.setValueAtTime(from, when)
    band.frequency.exponentialRampToValueAtTime(to, when + duration)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, when)
    gain.gain.linearRampToValueAtTime(level, when + duration * 0.6)
    gain.gain.linearRampToValueAtTime(0.0001, when + duration)
    source.connect(band).connect(gain).connect(sfxBus)
    source.start(when)
    source.stop(when + duration + 0.05)
  }

  // ── Music scheduling ───────────────────────────────────────────────────────

  function playEvent(event, when) {
    if (event.kind === 'melody') {
      // One octave up: music boxes live in the high register.
      musicBoxNote(noteToFrequency(event.pitch, 12), when, event.length * EIGHTH, 0.2)
      return
    }
    const [bass, third, fifth] = CHORD_VOICING[event.chord]
    musicBoxNote(noteToFrequency(bass), when, 3, 0.1)
    musicBoxNote(noteToFrequency(third), when + 3 * EIGHTH, 2, 0.06)
    musicBoxNote(noteToFrequency(fifth), when + 3 * EIGHTH, 2, 0.06)
    pad([bass, third, fifth], when, 6 * EIGHTH)
    if (event.barIndex % 2 === 0) {
      sleighShake(when, 0.035, musicBus)
      sleighShake(when + 3 * EIGHTH, 0.025, musicBus)
    }
  }

  function tick() {
    if (!ctx || ctx.state !== 'running') return
    const horizon = ctx.currentTime + LOOKAHEAD
    const { events, length } = MUSIC_TIMELINE
    for (let guard = 0; guard < 64; guard += 1) {
      const event = events[index]
      const when = loopStart + event.t * EIGHTH
      if (when > horizon) break
      if (when >= ctx.currentTime - 0.02) playEvent(event, when)
      index += 1
      if (index >= events.length) {
        index = 0
        loopStart += length * EIGHTH
      }
    }
  }

  function startMusic() {
    wantMusic = true
    if (!ctx) return
    const now = ctx.currentTime
    musicBus.gain.cancelScheduledValues(now)
    musicBus.gain.setValueAtTime(Math.max(musicBus.gain.value, 0.0001), now)
    musicBus.gain.linearRampToValueAtTime(MUSIC_LEVEL, now + 1.5)
    if (musicTimer) return
    loopStart = now + 0.25
    index = 0
    musicTimer = window.setInterval(tick, TICK_MS)
    tick()
  }

  function stopMusic(fadeSeconds = 2) {
    wantMusic = false
    if (!ctx) return
    const now = ctx.currentTime
    musicBus.gain.cancelScheduledValues(now)
    musicBus.gain.setValueAtTime(Math.max(musicBus.gain.value, 0.0001), now)
    musicBus.gain.linearRampToValueAtTime(0.0001, now + fadeSeconds)
    window.setTimeout(() => {
      if (!wantMusic && musicTimer) {
        window.clearInterval(musicTimer)
        musicTimer = 0
      }
    }, fadeSeconds * 1000 + 100)
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  return {
    supported: Boolean(AudioContextClass),

    /** Call from a click/tap handler: creates or wakes the audio context. */
    unlock() {
      if (!AudioContextClass) return
      if (!ctx || ctx.state === 'closed') build()
      if (!muted) ctx.resume()
      if (wantMusic) startMusic()
    },

    setMuted(value) {
      muted = value
      if (!ctx) return
      if (muted) ctx.suspend()
      else if (!document.hidden) ctx.resume()
    },

    startMusic,
    stopMusic,

    /** Soft chime when the pointer touches the present. */
    hoverJingle() {
      if (!ready()) return
      const now = ctx.currentTime
      ;['C6', 'E6', 'G6'].forEach((note, i) => bell(noteToFrequency(note), now + i * 0.07, 0.09))
      sleighShake(now, 0.06)
    },

    /** The ornament plays the start of the Jingle Bells chorus. */
    ornamentJingle() {
      if (!ready()) return
      let at = ctx.currentTime + 0.02
      for (const [note, quarters] of JINGLE_BELLS) {
        bell(noteToFrequency(note), at, 0.13)
        if (quarters >= 2) sleighShake(at, 0.05)
        at += quarters * 0.2
      }
    },

    /** Sparkly arpeggio for the hidden star. */
    twinkle() {
      if (!ready()) return
      const now = ctx.currentTime
      ;['B5', 'E6', 'G#6', 'B6'].forEach((note, i) => bell(noteToFrequency(note), now + i * 0.06, 0.08))
    },

    /** Faint sleigh bells while Santa crosses the sky. */
    santaBells(seconds) {
      if (!ready()) return
      const now = ctx.currentTime
      for (let t = 0; t < seconds; t += 0.22) {
        sleighShake(now + t, 0.004 + 0.03 * Math.sin((Math.PI * t) / seconds))
      }
    },

    /** The present opens: the music swells and the magic rushes out. */
    swell() {
      if (!ready()) return
      const now = ctx.currentTime
      musicBus.gain.cancelScheduledValues(now)
      musicBus.gain.setValueAtTime(Math.max(musicBus.gain.value, 0.0001), now)
      musicBus.gain.linearRampToValueAtTime(0.78, now + 1.4)
      musicBus.gain.linearRampToValueAtTime(MUSIC_LEVEL, now + 6)
      whoosh(now + 1.6, 1.8, 300, 5000, 0.12)
      ;['C6', 'E6', 'G6', 'C7', 'E7'].forEach((note, i) =>
        bell(noteToFrequency(note), now + 2.4 + i * 0.09, 0.1),
      )
    },

    /** The portal: Christmas fades out and something new hums in. */
    portal() {
      if (!ready()) return
      stopMusic(2.4)
      const now = ctx.currentTime
      whoosh(now, 2.6, 200, 7000, 0.18)
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(400, now + 1.4)
      filter.frequency.exponentialRampToValueAtTime(2600, now + 3.6)
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.0001, now + 1.4)
      gain.gain.linearRampToValueAtTime(0.05, now + 2.6)
      gain.gain.setValueAtTime(0.05, now + 6)
      gain.gain.linearRampToValueAtTime(0.0001, now + 8.5)
      filter.connect(gain).connect(sfxBus)
      for (const note of ['C4', 'G4', 'C5', 'E5', 'B5']) {
        for (const detune of [-6, 6]) {
          const osc = ctx.createOscillator()
          osc.type = 'sawtooth'
          osc.frequency.value = noteToFrequency(note)
          osc.detune.value = detune
          osc.connect(filter)
          osc.start(now + 1.4)
          osc.stop(now + 8.6)
        }
      }
      ;['E6', 'G6', 'B6', 'E7'].forEach((note, i) => bell(noteToFrequency(note), now + 2.7 + i * 0.08, 0.07))
    },

    dispose() {
      if (musicTimer) window.clearInterval(musicTimer)
      musicTimer = 0
      document.removeEventListener('visibilitychange', onVisibility)
      if (ctx && ctx.state !== 'closed') ctx.close()
      ctx = null
    },
  }
}
