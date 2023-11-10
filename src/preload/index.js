import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import fs from 'node:fs'
import sharp from 'sharp'

let basePath = process.argv.slice(-1)[0]

export const convert = async (file, format, out_directory, append_string) => {
  const buffer = Buffer.from(await file.arrayBuffer())

  let filepath
  let re = /\.[^.]*$/gm
  let newname = file.name.replace(re, append_string)
  let filename = `/${newname}.${format}`

  if (!out_directory) {
    fs.mkdir(basePath, { recursive: true }, (err) => {
      if (err) throw err
    })
    filepath = `${basePath}${filename}`
  } else {
    fs.mkdir(out_directory, { recursive: true }, (err) => {
      if (err) throw err
    })
    filepath = `${out_directory}${filename}`
  }

  return sharp(buffer)
    .toFormat(format)
    .toBuffer()
    .then((data) => {
      fs.writeFileSync(filepath, data, 'base64')
      return { filename, filepath, imageFormat: format }
    })
    .catch((err) => {
      console.log(`error: ${err}`)
    })
}

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('convert', convert)
    contextBridge.exposeInMainWorld('electronAPI', {
      selectOutDir: () => ipcRenderer.invoke('dialog:selectOutDir'),
      openDirectory: (path) => ipcRenderer.invoke('dialog:openDirectory', path),
      getConfig: () => ipcRenderer.invoke('dialog:getConfig'),
      setConfig: (key, value) => ipcRenderer.invoke('dialog:setConfig', key, value)
    })
  } catch (err) {
    console.log(`error: ${err}`)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
