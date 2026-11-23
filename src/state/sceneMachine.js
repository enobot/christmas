// The surprise is a short story told in scenes. This reducer is the single
// source of truth for which scene is showing and which moves are allowed, so
// a stray double-click can never skip a scene or open the gift twice.
//
//   loading → welcome → night → opening → letter → portal → (redirect)
//                         ▲                    │        │
//                         └──── REPLAY ────────┴────────┘

export const SCENES = ['loading', 'welcome', 'night', 'opening', 'letter', 'portal']

export const initialSceneState = {
  scene: 'loading',
  letterDone: false,
  // Increments on every replay so scene components remount fresh.
  run: 0,
}

export function sceneReducer(state, action) {
  switch (action.type) {
    case 'LOADED':
      return state.scene === 'loading' ? { ...state, scene: 'welcome' } : state

    case 'ENTER':
      return state.scene === 'welcome' ? { ...state, scene: 'night' } : state

    case 'OPEN_GIFT':
      return state.scene === 'night' ? { ...state, scene: 'opening' } : state

    case 'SHOW_LETTER':
      return state.scene === 'opening' ? { ...state, scene: 'letter', letterDone: false } : state

    case 'LETTER_DONE':
      return state.scene === 'letter' ? { ...state, letterDone: true } : state

    case 'START_FUTURE':
      return state.scene === 'letter' && state.letterDone ? { ...state, scene: 'portal' } : state

    case 'REPLAY':
      return ['opening', 'letter', 'portal'].includes(state.scene)
        ? { scene: 'night', letterDone: false, run: state.run + 1 }
        : state

    // The browser restored this page from its back/forward cache (Nate pressed
    // Back on the portfolio). Show the finished letter instead of a frozen portal.
    case 'RESTORE':
      return state.scene === 'portal' ? { ...state, scene: 'letter', letterDone: true, run: state.run + 1 } : state

    default:
      return state
  }
}
