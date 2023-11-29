import { contextBridge, ipcRenderer } from 'electron'
// import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  openDirectory: (path) => ipcRenderer.invoke('openDirectory', path),
  selectOutDir: () => ipcRenderer.invoke('selectOutDir'),
  handleFile: (...args) => ipcRenderer.invoke('handleFile', ...args),
  createDirectories: (path) => ipcRenderer.invoke('createDirectories', path),
  configOps: {
    init: () => ipcRenderer.invoke('configOps.init'),
    get: (key) => ipcRenderer.invoke('configOps.get', key),
    set: (key, value) => ipcRenderer.invoke('configOps.set', key, value),
    reset: (key) => ipcRenderer.invoke('configOps.reset', key),
    open: () => ipcRenderer.invoke('configOps.open'),
  },
  showUpdateMessage: (callback) => ipcRenderer.on('showUpdateMessage', callback)
}


// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    // contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (err) {
    console.log(`error: ${err}`)
  }
} else {
  // window.electron = electronAPI
  window.api = api
}
