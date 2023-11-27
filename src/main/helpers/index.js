import { app, shell, BrowserWindow, dialog } from 'electron'
import { join } from 'path'
import Store from 'electron-store'
import schema from '../schema'
const store = new Store({ schema })

export const extraPath = 'imgConverter'
export const fallbackPath = join(app.getPath('temp'), extraPath)
export const appTmpDir = join(app.getPath('temp'), app.name)
export const thumbnailsDir = join(appTmpDir, 'thumbnails')

export const myStore = store

export async function selectOutDir() {
  const { canceled, filePaths } = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
    properties: ['openDirectory']
  })
  if (!canceled) {
    store.set('outputDirectory', filePaths[0])
    return filePaths[0]
  }
  return getDefaultOutDir()
}

function getDefaultOutDir() {
  try {
    const out = store.get('outputDirectory');
    if (out) {
      return out
    }
    const tmp = join(app.getPath('desktop'), extraPath);
    store.set('outputDirectory', tmp)
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
    store.store = { ...store.store }
  },
  get: () => store.store,
  set: (_, key, value) => store.set(key, value),
  reset: (_, key) => {
    if(typeof key === 'string') {
      store.reset(key)
    } else {
      store.clear()
    }
  },
  open: () => store.openInEditor()
}