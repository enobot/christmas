import { describe, expect, it } from 'vitest'
import { initialSceneState, sceneReducer } from './sceneMachine.js'

const run = (actions, start = initialSceneState) => actions.reduce((state, type) => sceneReducer(state, { type }), start)

describe('scene machine', () => {
  it('walks through the whole story in order', () => {
    const steps = ['LOADED', 'ENTER', 'OPEN_GIFT', 'SHOW_LETTER', 'LETTER_DONE', 'START_FUTURE']
    const scenes = []
    steps.reduce((state, type) => {
      const next = sceneReducer(state, { type })
      scenes.push(next.scene)
      return next
    }, initialSceneState)
    expect(scenes).toEqual(['welcome', 'night', 'opening', 'letter', 'letter', 'portal'])
  })

  it('ignores moves that are not allowed from the current scene', () => {
    expect(sceneReducer(initialSceneState, { type: 'OPEN_GIFT' })).toBe(initialSceneState)
    const night = run(['LOADED', 'ENTER'])
    expect(sceneReducer(night, { type: 'START_FUTURE' })).toBe(night)
    expect(sceneReducer(night, { type: 'SHOW_LETTER' })).toBe(night)
  })

  it('opens the gift only once, even if clicked twice', () => {
    const opening = run(['LOADED', 'ENTER', 'OPEN_GIFT'])
    expect(sceneReducer(opening, { type: 'OPEN_GIFT' })).toBe(opening)
  })

  it('does not start the portal until the letter has finished', () => {
    const letter = run(['LOADED', 'ENTER', 'OPEN_GIFT', 'SHOW_LETTER'])
    expect(sceneReducer(letter, { type: 'START_FUTURE' }).scene).toBe('letter')
    expect(run(['LETTER_DONE', 'START_FUTURE'], letter).scene).toBe('portal')
  })

  it('replays from any scene after the gift opens, with a fresh run number', () => {
    for (const steps of [
      ['LOADED', 'ENTER', 'OPEN_GIFT'],
      ['LOADED', 'ENTER', 'OPEN_GIFT', 'SHOW_LETTER'],
      ['LOADED', 'ENTER', 'OPEN_GIFT', 'SHOW_LETTER', 'LETTER_DONE', 'START_FUTURE'],
    ]) {
      const before = run(steps)
      const after = sceneReducer(before, { type: 'REPLAY' })
      expect(after).toEqual({ scene: 'night', letterDone: false, run: before.run + 1 })
    }
  })

  it('cannot replay before the gift has been opened', () => {
    const night = run(['LOADED', 'ENTER'])
    expect(sceneReducer(night, { type: 'REPLAY' })).toBe(night)
  })

  it('restores the finished letter when the page comes back from the back/forward cache', () => {
    const portal = run(['LOADED', 'ENTER', 'OPEN_GIFT', 'SHOW_LETTER', 'LETTER_DONE', 'START_FUTURE'])
    const restored = sceneReducer(portal, { type: 'RESTORE' })
    expect(restored.scene).toBe('letter')
    expect(restored.letterDone).toBe(true)
    expect(restored.run).toBe(portal.run + 1)
  })
})
