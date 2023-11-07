import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import fs from 'node:fs'
import sharp from 'sharp'

let prefix = process.argv.slice(-1)[0] + '/imageconverter2'

export const convert = async (file, format, out_directory) => {
  const buffer = Buffer.from(await file.arrayBuffer())

  let filepath
  let re = /\.[^.]*$/gm
  let newname = file.name.replace(re, '_converted')
  let filename = `/${newname}.${format}`

  if (!out_directory) {
    fs.mkdir(prefix, { recursive: true }, (err) => {
      if (err) throw err
    })
    filepath = `${prefix}${filename}`
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
      selectDirectory: () => ipcRenderer.invoke('dialog:selectDirectory'),
      getDefaultDir: () => ipcRenderer.invoke('dialog:getDefaultDir')
    })
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
