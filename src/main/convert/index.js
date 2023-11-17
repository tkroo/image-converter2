// import { contextBridge, ipcRenderer } from 'electron'
// import { electronAPI } from '@electron-toolkit/preload'
import fs from 'node:fs'
import sharp from 'sharp'
import path from 'path'
import { myStore } from '../helpers'

const re = /\.[^.]*$/gm

function checkFileExistenceAndIncrementFilename(filepath) {
  // Check if file exists and increment the filename if it does.
  const dirname = path.dirname(filepath)
  const extname = path.extname(filepath)
  const filenameBase = path.basename(filepath, extname)
  let filenameNumber = 0
  while (fs.existsSync(filepath)) {
    filenameNumber++
    filepath = path.join(dirname, `${filenameBase}_${filenameNumber}${extname}`)
  }
  return filepath
}

// contextBridge.exposeInMainWorld('updateProgress', updateProgress)

export function updateProgress(c) {
  console.log('updateProgress: ', c)
  // electronAPI.ipcRenderer.send('update-progress', c)
  // const foo = ipcRenderer.invoke('update-progress', c)
  return c
}



export async function handleFiles(_, ...args) {
  let count = 0
  const options = myStore.get('formatOptions').find((o) => o.format === args[1]).options
  
  // return args[0].map((file) => {
    //   return convert(file, args[1], args[2], args[3] ? args[3] : '', options)
    // })
    
  const convertedFiles = []
  for (let i = 0; i < args[0].length; i++) {
    const converted = await convert(args[0][i], args[1], args[2], args[3] ? args[3] : '', options)
    count += 1
    // updateProgress(count)
    convertedFiles.push(converted)
    console.log(converted.filename, count)
  }
  console.log('finished')
  return convertedFiles
}

export async function convert(file, format, out_directory, append_string, options) {
  if (!out_directory) {
    out_directory = process.argv.slice(-1)[0]
  }
  fs.mkdir(out_directory, { recursive: true }, (err) => {
    if (err) throw err
  })

  let filename = path.basename(file).replace(re, append_string) + '.' + format
  let filepath = checkFileExistenceAndIncrementFilename(path.join(out_directory, filename))

  try {
    const data = await sharp(file)
      .toFormat(format, options)
      .toBuffer()
    fs.writeFileSync(filepath, data, 'base64')
    filename = path.basename(filepath)
    return { filename, filepath, imageFormat: format }
  } catch (err_1) {
    console.log(`error: ${err_1}`)
  }
}
