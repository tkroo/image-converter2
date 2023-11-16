import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import convert from './convert'

// Custom APIs for renderer
const api = {
  openDirectory: (path) => ipcRenderer.invoke('dialog:openDirectory', path),
  selectOutDir: () => ipcRenderer.invoke('dialog:selectOutDir'),
  getConfig: () => ipcRenderer.invoke('dialog:getConfig'),
  setConfig: (key, value) => ipcRenderer.invoke('dialog:setConfig', key, value),
  resetConfig: () => ipcRenderer.invoke('dialog:resetConfig'),
  editConfig: () => ipcRenderer.invoke('dialog:editConfig')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('convert', convert)
  } catch (err) {
    console.log(`error: ${err}`)
  }
} else {
  //   window.electron = electronAPI
  //   // window.api = api
}
