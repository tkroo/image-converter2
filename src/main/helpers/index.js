import { app, shell, BrowserWindow, dialog } from 'electron'
import { join } from 'path'
import Store from 'electron-store'
import schema from '../schema'
const store = new Store({ schema })

export const extraPath = 'foo'

export async function selectOutDir() {
  const { canceled, filePaths } = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
    properties: ['openDirectory']
  })
  if (!canceled) {
    store.set('outputDirectory', filePaths[0])
    return filePaths[0]
  } else {
    return getDefaultOutDir()
  }
}

export async function getDefaultOutDir() {
  try {
    const out = store.get('outputDirectory')
    if (out) {
      return out
    } else {
      const tmp = join(app.getPath('desktop'), extraPath)
      store.set('outputDirectory', tmp)
      return tmp
    }
  } catch (err) {
    console.log(`error: ${err}`)
  }
}

export async function openDirectory(event, path) {
  shell.openPath(path)
}

export async function getConfig() {
  return store.store
}

export async function setConfig(event, key, value) {
  store.set(key, value)
}

export async function initConfig() {
  await getDefaultOutDir()
  let tempObj = store.store
  store.store = tempObj
}

export function editConfig() {
  store.openInEditor()
}

export function resetFormatOptions() {
  store.reset('formatOptions')
}
