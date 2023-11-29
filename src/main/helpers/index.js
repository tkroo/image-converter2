import { app, shell, BrowserWindow, dialog } from 'electron'
import { join } from 'path'
import Store from 'electron-store'
import schema from '../schema'
export const myStore = new Store({ schema })

export const extraPath = 'imgConverter'
export const fallbackPath = join(app.getPath('temp'), extraPath)
export const appTmpDir = join(app.getPath('temp'), app.name)
export const thumbnailsDir = join(appTmpDir, 'thumbnails')

export async function selectOutDir() {
  const { canceled, filePaths } = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
    properties: ['openDirectory']
  })
  if (!canceled) {
    myStore.set('outputDirectory', filePaths[0])
    return filePaths[0]
  }
  return getDefaultOutDir()
}

function getDefaultOutDir() {
  try {
    const out = myStore.get('outputDirectory')
    if (out) { return out }
    const tmp = join(app.getPath('desktop'), extraPath)
    myStore.set('outputDirectory', tmp)
    return tmp
  } catch (err) {
    console.log(`error: ${err}`)
  }
}

export async function openDirectory(event, path) {
  shell.openPath(path)
}

export const configOps = {
  init: () => {
    const _ = getDefaultOutDir()
    myStore.store = { ...myStore.store }
  },
  get: () => myStore.store,
  set: (_, key, value) => myStore.set(key, value),
  reset: (_, key) => {
    if(typeof key === 'string') {
      myStore.reset(key)
    } else {
      myStore.clear()
    }
  },
  open: () => myStore.openInEditor()
}

export function getMainWindow() {
  const allWindows = BrowserWindow.getAllWindows()
  const win = allWindows[allWindows.length - 1]
  return win
}