import fs from 'node:fs'
import sharp from 'sharp'
import path from 'path'

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

export async function handleFiles(event) {
  console.log('PRELOAD - handleFiles')
  const { acceptedFiles } = event.detail
  console.log(acceptedFiles)
  return acceptedFiles
}

export async function handleConversion(e) {
  if (e.detail) {
    files.accepted = []
    convertedFiles = []
    // const { acceptedFiles, fileRejections } = e.detail
    const { acceptedFiles } = e.detail
    files.accepted = [...files.accepted, ...acceptedFiles]
    // files.rejected = [...files.rejected, ...fileRejections]
    convertFiles(acceptedFiles, imageFormat, out_directory, use_append_string ? append_string : '')
  } else {
    // imageFormat = e.target.value
    // window.api.setConfig('defaultFormat', imageFormat)
    if (files.accepted.length) {
      convertedFiles = []
      convertFiles(files.accepted, imageFormat, out_directory, use_append_string ? append_string : '')
    }
  }
}

async function convertFiles(files, format, out_directory, append_string) {
  for (let i = 0; i < files.length; i++) {
    // eslint-disable-next-line no-undef
    const options = format_options.find((o) => o.format === format).options
    // eslint-disable-next-line no-undef
    const f = await convert(files[i], imageFormat, out_directory, append_string, options) // convert is defined in src/preload/index.js
    convertedFiles = [...convertedFiles, f]
  }
}

export const convert = async (buffer, filename, format, out_directory, append_string, options) => {
  console.log('CONVERT')
  console.log(filename)
  // let buffer = Buffer.from(await file.arrayBuffer())
  let filepath
  filename = filename.replace(re, append_string) + '.' + format
  if (!out_directory) {
    out_directory = process.argv.slice(-1)[0]
  }
  fs.mkdir(out_directory, { recursive: true }, (err) => {
    if (err) throw err
  })
  // filepath = path.join(out_directory, filename)
  filepath = checkFileExistenceAndIncrementFilename(path.join(out_directory, filename))

  return sharp(buffer)
    .toFormat(format, options)
    .toBuffer()
    .then((data) => {
      fs.writeFileSync(filepath, data, 'base64')
      filename = path.basename(filepath)
      return { filename, filepath, imageFormat: format }
    })
    .catch((err) => {
      console.log(`error: ${err}`)
    })
}
