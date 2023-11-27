import { contextBridge, ipcRenderer } from 'electron'
// import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  openDirectory: (path) => ipcRenderer.invoke('dialog:openDirectory', path),
  selectOutDir: () => ipcRenderer.invoke('dialog:selectOutDir'),
  handleFile: (_,...args) => ipcRenderer.invoke('dialog:handleFile', _, ...args),
  createDirectories: (path) => ipcRenderer.invoke('dialog:createDirectories', path),
  configOps: {
    get: (key) => ipcRenderer.invoke('dialog:configOps.get', key),
    set: (key, value) => ipcRenderer.invoke('dialog:configOps.set', key, value),
    reset: (key) => ipcRenderer.invoke('dialog:configOps.reset', key),
    open: () => ipcRenderer.invoke('dialog:configOps.open'),
    init: () => ipcRenderer.invoke('dialog:configOps.init'),
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
