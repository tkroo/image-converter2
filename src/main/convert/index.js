import fs from 'node:fs'
import path from 'path'
import sharp from 'sharp'
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

async function convert(file, format, out_directory, append_string, options) {
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
    return { filename, filepath, imageFormat: format, status: 'success' }
  } catch (err_1) {
    console.log(`error: ${err_1} - ${path.basename(filepath)}`)
    return { filename: path.basename(filepath), filepath:'./assets/error-icon-25239.png', imageFormat: 'png', status: 'error' }
  }
}

// export async function handleFiles(_, ...args) {
//   const fileList = args[0]
//   const options = myStore.get('formatOptions').find((o) => o.format === args[1]).options
//   const convertedFiles = []
//   for (let i = 0; i < fileList.length; i++) {
//     const data = await convert(fileList[i], args[1], args[2], args[3] ? args[3] : '', options)
//     convertedFiles.push(data)
//   }
//   return convertedFiles
// }

export async function handleFile(_, ...args) {
  const options = myStore.get('formatOptions').find((o) => o.format === args[1]).options
  return await convert(args[0], args[1], args[2], args[3] ? args[3] : '', options)
}
