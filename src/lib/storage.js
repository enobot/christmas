// Small wrappers around localStorage. Storage can be missing or throw (private
// windows, blocked site data), so every call is guarded and the surprise keeps
// working without it — the setting simply isn't remembered.

export function readSetting(key) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeSetting(key, value) {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
    // Storage unavailable: keep the in-memory setting only.
  }
}
