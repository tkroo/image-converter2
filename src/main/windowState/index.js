import debounceFunction from 'debounce-fn'
import Store from 'electron-store'
const storage = new Store()


export function rememberWindowBounds(win) {
  win.on('resize', () => {debouncedSave(win)})
  win.on('move', () => {debouncedSave(win)})
}

export function getWindowBounds () {
  const w = 900
  const default_bounds = {
    x: 100,
    y: 100,
    width: w,
    height: Math.round(w / 1.618)
  }

  const bounds = storage.get('WinBounds')
  if (bounds) {
    return bounds
  } else {
    storage.set('WinBounds', default_bounds)
    return default_bounds
  }
}

function saveWindowBounds (bounds) {
  storage.set('WinBounds', bounds)
}

const debouncedSave = debounceFunction(
  (win) => {
    const bounds = win.getBounds()
    saveWindowBounds(bounds)
  }, {wait: 200}
)