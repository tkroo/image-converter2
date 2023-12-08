import { contextBridge, ipcRenderer } from 'electron'

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
  // showUpdateMessage: (callback) => ipcRenderer.on('showUpdateMessage', callback),
  sendUpDateInfo: (callback) => ipcRenderer.on('sendUpDateInfo', callback),
  sendUpDateDownloadProgress: (callback) => ipcRenderer.on('sendUpDateDownloadProgress', callback),
  checkForUpdates: (callback) => ipcRenderer.invoke('checkForUpdates', callback)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (err) {
    console.error(`error: ${err}`)
  }
} else {
  console.error('Window context isolation is disabled, set contextIsolation: true to enable it.')
}
